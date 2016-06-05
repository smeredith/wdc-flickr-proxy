(function () {

    // Get a set of image metadata from the server via the WDC proxy.
    function getImageMetadata(lastPage) {
        var metadataList = [];

        // We aks for a page of metadata at a time, where a page is some number
        // of records as configured in the proxy.
        var page = lastPage + 1;

        // We ask our proxy for the metadata instead of asking Flickr directly
        // so the proxy can sign the request with the token we pass to it.
        // We can't sign the request on the client because it requires the token
        // plus an API secret, which must not be made available to the client.
        var xhr = $.ajax({
            url: "flickr_people_getphotos",
            type: "GET",
            data: {
                page: page.toString(),
                user_id: tableau.username,
                token: tableau.password,
                extras: "description,date_taken,geo,views,url_o", //,license,date_upload,original_format,icon_server,last_update,media,path_alias,url_sq,url_t,url_s,url_q,url_m,url_n,url_z,url_c,url_l",
            },
            dataType: 'json',
            async: false,
            success: function (data) {

                if (data.photos && data.photos.page <= data.photos.pages) {
                    var photos = data.photos.photo;
                    for (i = 0; i < photos.length; ++i) {
                        var photo = photos[i];

                        // Make one row per photo.
                        var entry = {};
                        entry.photoid = photo.id;
                        entry.title = photo.title;
                        entry.description_content = photo.description._content;
                        entry.latitude = photo.latitude;
                        entry.longitude = photo.longitude;
                        entry.datetaken = photo.datetaken;
                        entry.views = photo.views;
                        entry.url_o = photo.url_o;
                        entry.height_o = photo.height_o;
                        entry.width_o = photo.width_o;

                        metadataList.push(entry);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                tableau.log(xhr.responseText + "\n" + thrownError);
                tableau.abortWithError("Error getting metadata from flickr.");
            }
        });

        return metadataList;
    }

    // Get a set of tags from the server via the WDC proxy.
    function getTags(lastPage) {
        var tagList = [];

        // We aks for a page of metadata at a time, where a page is some number
        // of records as configured in the proxy.
        var page = lastPage + 1;

        // We ask our proxy for the metadata instead of asking Flickr directly
        // so the proxy can sign the request with the token we pass to it.
        // We can't sign the request on the client because it requires the token
        // plus an API secret, which must not be made available to the client.
        var xhr = $.ajax({
            url: "flickr_people_getphotos",
            type: "GET",
            data: {
                page: page.toString(),
                user_id: tableau.username,
                token: tableau.password,
                extras: "tags",
            },
            dataType: 'json',
            async: false,
            success: function (data) {

                if (data.photos && data.photos.page <= data.photos.pages) {
                    var photos = data.photos.photo;
                    for (i = 0; i < photos.length; ++i) {
                        var photo = photos[i];

                        // Make one row per tag.
                        var tags = photo.tags.split(" ");
                        for (e = 0; e < tags.length; ++e) {
                            if (tags[e].length > 0) {
                                var entry = {};
                                entry.photoid = photo.id;
                                entry.tag = tags[e];

                                tagList.push(entry);
                            }
                        }
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                tableau.log(xhr.responseText + "\n" + thrownError);
                tableau.abortWithError("Error getting tags from flickr.");
            }
        });

        return tagList;
    }

    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
        // Tell tableau about the fields and their types.
        // Return everything the Flickr API returns.
        // The id is close to the field as it comes from the Flickr API.
        // The aliases are little better.
        var metadata = [
        { id : "photoid", alias : "photo id", dataType : tableau.dataTypeEnum.string },
        { id : "title", alias : "title", dataType : tableau.dataTypeEnum.string },
        { id : "description_content", alias : "description", dataType : tableau.dataTypeEnum.string },
        { id : "latitude", alias : "latitude", dataType : tableau.dataTypeEnum.float },
        { id : "longitude", alias : "longitude", dataType : tableau.dataTypeEnum.float },
        { id : "datetaken", alias : "date taken", dataType : tableau.dataTypeEnum.datetime },
        { id : "views", alias : "view count", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.measure },
        { id : "url_o", alias : "URL original", dataType : tableau.dataTypeEnum.string },
        { id : "height_o", alias : "URL original height", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "width_o", alias : "URL original width", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        ];

        var tags = [
        { id : "photoid", alias : "photo id", dataType : tableau.dataTypeEnum.string },
        { id : "tag", alias : "tag", dataType : tableau.dataTypeEnum.string },
        ];

        var metadataTableInfo = {
            id : "flickrmetadata",
            alias : "Flickr Metadata",
            columns : metadata
        };

        var tagsTableInfo = {
            id : "flickrtags",
            alias : "Flickr Tags",
            columns : tags
        };

        schemaCallback([metadataTableInfo, tagsTableInfo]);
    };

    myConnector.getData = function (table, doneCallback) {

        if (tableau.password.length == 0 || !isTokenValid()) {
            tableau.abortForAuth();
        }

        tableau.log(table.tableInfo.id);
        var lastPage = 0;
        var moreData = true;
        while (moreData) {
            var data;
            if (table.tableInfo.id == "flickrmetadata") {
                data = getImageMetadata(lastPage);
            } else {
                data = getTags(lastPage);
            }
            lastPage++;
            if (data.length == 0) {
                moreData = false;
            } else {
                table.appendRows(data);
            }
        }
        doneCallback();
    };

    // Ask the proxy for the flickr URL to use for sign-in UI. The URL needs a
    // request token as part of that URL, so the proxy gets that as part of this
    // call.
    function getOauthUrl() {
        var oauthUrl = "";

        var xhr = $.ajax({
            url: "oauthurl",
            type: "GET",
            dataType: 'text',
            async: false,
            success: function (data) {
                oauthUrl = data;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                tableau.log(xhr.responseText + "\n" + thrownError);
                tableau.abortWithError("Error getting metadata from flickr.");
            }
        });
        return oauthUrl;
    }

    function parseQueryParams(url) {
        var regex = /[?&]([^=#]+)=([^&#]*)/g,
            params = {},
            match;

        while(match = regex.exec(url)) {
            params[match[1]] = match[2];
        }

        return params;
    }

    // Exchanges a request token for an access token and return it.
    function getAccessToken(requestToken) {

        var accessToken;

        tableau.log("getAccessToken()");

        var xhr = $.ajax({
            url: "accesstoken",
            type: "GET",
            dataType: 'text',
            async: false,
            data: requestToken,
            success: function (data) {
                accessToken = parseQueryParams(data);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                tableau.log(xhr.responseText + "\n" + thrownError);
                tableau.abortWithError("Error getting metadata from flickr.");
            }
        });

        return accessToken;
    }

    function isTokenValid() {
        var valid = false;

        tableau.log("isTokenValid()");

        var xhr = $.ajax({
            url: "istokenvalid",
            type: "GET",
            dataType: 'text',
            async: false,
            data: {
                token: tableau.password,
            },
            success: function (data) {
                valid = (data == "ok");
            },
            error: function (xhr, ajaxOptions, thrownError) {
                tableau.log(xhr.responseText + "\n" + thrownError);
                tableau.abortWithError("Error validating flickr credentials.");
            }
        });

        return valid;
    }

    myConnector.init = function (initCallback) {

        tableau.authType = tableau.authTypeEnum.custom;
        tableau.connectionName="Flickr Photo Metadata";

        tableau.log("phase: " + tableau.phase);

        if (tableau.phase == tableau.phaseEnum.gatherDataPhase) {

            // If we don't have a valid token stored in password, we need to
            // re-authenticate.
            if (tableau.password.length == 0 || !isTokenValid()) {
                tableau.log("gatherDataPhase abortForAuth()");
                tableau.abortForAuth();
            }
        }

        initCallback();

        if (tableau.phase == tableau.phaseEnum.authPhase || tableau.phase == tableau.phaseEnum.interactivePhase) {
            var accessToken = tableau.password;
            if (accessToken && (accessToken.length > 0)) {
                // If we have an access token, we are done with auth.
                tableau.log("have access token; calling submit()");
                tableau.submit();
            } else {
                // If we have this cookie, then we are being called back after
                // the sign-in page and we need to exchange a request
                // token for an access token.
                tableau.log("no access token");
                var oauthTokenSecret = Cookies.get("oauth_token_secret");
                if (oauthTokenSecret && (oauthTokenSecret.length > 0)) {
                    // If redirected here from the oauth sign-in page, there will be an
                    // oauth_token query param on our URL.
                    tableau.log("found cookie; calling getAccessToken()");
                    var params = parseQueryParams(window.location.href);
                    var accessToken = getAccessToken(params);
                    var token = {
                        public: accessToken.oauth_token,
                        secret: accessToken.oauth_token_secret,
                    };

                    tableau.username = decodeURIComponent(accessToken.user_nsid);
                    tableau.password = JSON.stringify(token);
                    tableau.submit();
                } else {
                    // We don't have an access token and we aren't being called
                    // back from sign-in page, we need to navigate to the
                    // sign-in page.
                    tableau.log("did not find cookie; redirecting to sign-in page");
                    var oauthUrl = getOauthUrl();
                    window.location.href = oauthUrl;
                }
            }
        }
    };

    tableau.registerConnector(myConnector);

})();

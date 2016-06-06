(function () {

    var perPage = 500;  // Tunable number of records to return per request.

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
            url: "forward",
            type: "GET",
            dataType: 'json',
            async: false,
            data: {
                token: tableau.password,
                passThroughParams: {
                    method: "flickr.people.getphotos",
                    extras: "description,date_taken,geo,views,url_o,url_q",
                    user_id: tableau.username,
                    page: page,
                    per_page: perPage,
                    // privacy_filter: 1,    // for debugging, to limit the  number of results
                }
            },
            success: function (data) {
                tableau.log("got page " + data.photos.page + " of " + data.photos.pages);
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
                        entry.url_q = photo.url_q;
                        entry.height_q = photo.height_q;
                        entry.width_q = photo.width_q;
                        entry.ispublic = photo.ispublic == 1;
                        entry.isfriend = photo.isfriend == 1;
                        entry.isfamily = photo.isfamily == 1;

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
            url: "forward",
            type: "GET",
            dataType: 'json',
            async: false,
            data: {
                token: tableau.password,
                passThroughParams: {
                    method: "flickr.people.getphotos",
                    extras: "tags",
                    user_id: tableau.username,
                    page: page,
                    per_page: perPage,
                    // privacy_filter: 1,    // for debugging, to limit the  number of results
                }
            },
            success: function (data) {
                tableau.log("got page " + data.photos.page + " of " + data.photos.pages);
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
        { id : "url_q", alias : "URL square", dataType : tableau.dataTypeEnum.string },
        { id : "height_q", alias : "URL square height", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "width_q", alias : "URL square width", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "ispublic", alias : "is public", dataType : tableau.dataTypeEnum.bool },
        { id : "isfriend", alias : "is friend", dataType : tableau.dataTypeEnum.bool },
        { id : "isfamily", alias : "is family", dataType : tableau.dataTypeEnum.bool },
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

        if (tableau.password.length == 0 || !isLoggedIn()) {
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
            data: {
                port: location.port,
            },
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

    function isLoggedIn() {
        var valid = false;

        var xhr = $.ajax({
            url: "forward",
            type: "GET",
            dataType: 'json',
            async: false,
            data: {
                token: tableau.password,
                passThroughParams: {
                    method: "flickr.test.login",
                }
            },
            success: function (data) {
                valid = data.stat == "ok";
            },
            error: function (xhr, ajaxOptions, thrownError) {
                tableau.log(xhr.responseText + "\n" + thrownError);
                tableau.abortWithError("Error validating flickr credentials.");
            }
        });

        tableau.log("isLoggedIn() returning " + valid);
        return valid;
    }

    myConnector.init = function (initCallback) {

        tableau.authType = tableau.authTypeEnum.custom;
        tableau.connectionName="Flickr Photo Metadata";

        tableau.log("phase: " + tableau.phase);

        if (tableau.phase == tableau.phaseEnum.gatherDataPhase) {

            // If we don't have a valid token stored in password, we need to
            // re-authenticate.
            if (tableau.password.length == 0 || !isLoggedIn()) {
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

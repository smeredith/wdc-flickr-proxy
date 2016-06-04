(function () {

    // Get a set of image metadata from the server via the WDC proxy.
    function getImageMetadata(lastPage) {
        var imageList = [];

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
            },
            dataType: 'json',
            async: false,
            success: function (data) {

                if (data.photos && data.photos.page <= data.photos.pages) {
                    var photos = data.photos.photo;
                    for (i = 0; i < photos.length; ++i) {
                        var photo = photos[i];

                        // Make one row per tag. If a photo has no tags or one tag, it
                        // will get one row in the results. If a photo has multiple tags,
                        // it will get multiple rows: one per tag. This is to
                        // allow for easy tag analysis in Tableau.
                        var tags = photo.tags.split(" ");
                        var entriesToCreateThisPhoto = tags.length;
                        if (entriesToCreateThisPhoto == 0) {
                            entriesToCreateThisPhoto = 1;
                        }

                        for (e = 0; e < entriesToCreateThisPhoto; ++e) {
                            var entry = {};
                            entry.photoid = photo.id;
                            entry.title = photo.title;
                            entry.description_content = photo.description._content;
                            entry.latitude = photo.latitude;
                            entry.longitude = photo.longitude;
                            entry.datetaken = photo.datetaken;
                            entry.views = photo.views;

                            if (e < tags.length) {
                                entry.tag = tags[e];
                            }

                            imageList.push(entry);
                        }
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                tableau.log(xhr.responseText + "\n" + thrownError);
                tableau.abortWithError("Error getting metadata from flickr.");
            }
        });

        return imageList;
    }

    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
        // Tell tableau about the fields and their types.
        // Return everything the Flickr API returns.
        // The id is close to the field as it comes from the Flickr API.
        // The aliases are little better.
        var cols = [
        { id : "photoid", alias : "photo id", dataType : tableau.dataTypeEnum.string },
        { id : "tag", alias : "tag", dataType : tableau.dataTypeEnum.string },
        { id : "title", alias : "title", dataType : tableau.dataTypeEnum.string },
        { id : "description_content", alias : "description", dataType : tableau.dataTypeEnum.string },
        { id : "latitude", alias : "latitude", dataType : tableau.dataTypeEnum.float },
        { id : "longitude", alias : "longitude", dataType : tableau.dataTypeEnum.float },
        { id : "datetaken", alias : "date taken", dataType : tableau.dataTypeEnum.datetime },
        { id : "views", alias : "view count", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.measure },
        ];

        var tableInfo = {
            id : "flickrmetadata",
            alias : "Flickr Metadata",
            columns : cols
        };

        schemaCallback([tableInfo]);
    };

    myConnector.getData = function (table, doneCallback) {

        if (tableau.password.length == 0 || !isTokenValid()) {
            tableau.abortForAuth();
        }

        var lastPage = 0;
        var moreData = true;
        while (moreData) {
            var data = getImageMetadata(lastPage);
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
        initCallback();

        if (tableau.phase == tableau.phaseEnum.gatherDataPhase) {

            // If we don't have a valid token stored in password, we need to
            // re-authenticate.
            if (tableau.password.length == 0 || !isTokenValid()) {
                tableau.abortForAuth();
            }
        }

        if (tableau.phase == tableau.phaseEnum.authPhase || tableau.phase == tableau.phaseEnum.interactivePhase) {
            var params = parseQueryParams(window.location.href);

            // If redirected here from the oauth sign-in page, there will be an
            // oauth_token query param on our URL.
            var requestToken = params.oauth_token;
            var hasRequestToken = requestToken && (requestToken.length > 0);

            // Sometimes Tableau calls us with the oauth_token query params. But
            // the only time this cookie is set is after the sign-in is
            // complete.
            var oauthTokenSecret = Cookies.get("oauth_token_secret");
            var isRedirected = oauthTokenSecret && (oauthTokenSecret.length > 0);

            if (hasRequestToken && isRedirected) {
                var accessToken = getAccessToken(params);

                var token = {
                    public: accessToken.oauth_token,
                    secret: accessToken.oauth_token_secret,
                };

                tableau.username = decodeURIComponent(accessToken.user_nsid);
                tableau.password = JSON.stringify(token);

                tableau.submit();
            } else {
                // Navigate to the sign-in page.
                var oauthUrl = getOauthUrl();
                console.log(oauthUrl);
                window.location.href = oauthUrl;
            }
        }
    };

    tableau.registerConnector(myConnector);

})();

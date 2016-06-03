(function () {

    // This object represent one returned row.
    function getNewEntry() {
        var entry = {
            photoid: "",
            tag: "",
            title: "",
            description_content: "",
            ispublic: false,
            isfriend: false,
            isfamily: false,
            datetaken: "",
            datetakengranularity: 0,
            datetakenunknown: false,
            dateupload: "",
            license: 0,
            lastupdate: "",
            latitude: 0,
            longitude: 0,
            accuracy: 0,
            context: 0,
            place_id: "",
            woeid: "",
            geo_is_family: false,
            geo_is_friend: false,
            geo_is_contact: false,
            geo_is_public: false,
            views: 0,
            media: "",
            media_status: "",
            url_sq: "",
            height_sq: 0,
            width_sq: 0,
            url_t: "",
            height_t: 0,
            width_t: 0,
            url_s: "",
            height_s: 0,
            width_s: 0,
            url_q: "",
            height_q: 0,
            width_q: 0,
            url_m: "",
            height_m: 0,
            width_m: 0,
            url_n: "",
            height_n: 0,
            width_n: 0,
            url_z: "",
            height_z: 0,
            width_z: 0,
            url_c: "",
            height_c: 0,
            width_c: 0,
            url_l: "",
            height_l: 0,
            width_l: 0,
            url_o: "",
            height_o: 0,
            width_o: 0,
            owner: "",
            server: "",
            secret: "",
            originalsecret: "",
            farm: 0,
            originalformat: "",
            iconserver: "",
            iconfarm: "",
            pathalias: "",
        };
        return entry;
    };

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

                if (data.photos) {
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
                            var entry = getNewEntry();
                            entry.photoid = photo.id;
                            entry.title = photo.title;
                            entry.description_content = photo.description._content;
                            entry.ispublic = photo.ispublic == 1;
                            entry.isfriend = photo.isfriend == 1;
                            entry.isfamily = photo.isfamily == 1;
                            entry.datetaken = photo.datetaken;
                            entry.datetakengranularity = photo.datetakengranularity;
                            entry.datetakenunknown = photo.datetakenunknown == 1;
                            entry.dateupload = photo.dateupload;
                            entry.license = photo.license;
                            entry.lastupdate = photo.lastupdate;
                            entry.latitude = photo.latitude;
                            entry.longitude = photo.longitude;
                            entry.accuracy = photo.accuracy;
                            entry.context = photo.context;
                            entry.place_id = photo.place_id;
                            entry.woeid = photo.woeid;
                            entry.geo_is_family = photo.geo_is_family == 1;
                            entry.geo_is_friend = photo.geo_is_friend == 1;
                            entry.geo_is_contact = photo.geo_is_contact == 1;
                            entry.geo_is_public = photo.geo_is_public == 1;
                            entry.views = photo.views;
                            entry.media = photo.media;
                            entry.media_status = photo.media_status;
                            entry.url_sq = photo.url_sq;
                            entry.height_sq = photo.height_sq;
                            entry.width_sq = photo.width_sq;
                            entry.url_t = photo.url_t;
                            entry.height_t = photo.height_t;
                            entry.width_t = photo.width_t;
                            entry.url_s = photo.url_s;
                            entry.height_s = photo.height_s;
                            entry.width_s = photo.width_s;
                            entry.url_q = photo.url_q;
                            entry.height_q = photo.height_q;
                            entry.width_q = photo.width_q;
                            entry.url_m = photo.url_m;
                            entry.height_m = photo.height_m;
                            entry.width_m = photo.width_m;
                            entry.url_n = photo.url_n;
                            entry.height_n = photo.height_n;
                            entry.width_n = photo.width_n;
                            entry.url_z = photo.url_z;
                            entry.height_z = photo.height_z;
                            entry.width_z = photo.width_z;
                            entry.url_c = photo.url_c;
                            entry.height_c = photo.height_c;
                            entry.width_c = photo.width_c;
                            entry.url_l = photo.url_l;
                            entry.height_l = photo.height_l;
                            entry.width_l = photo.width_l;
                            entry.url_o = photo.url_o;
                            entry.height_o = photo.height_o;
                            entry.width_o = photo.width_o;
                            entry.owner = photo.owner;
                            entry.server = photo.server;
                            entry.secret = photo.secret;
                            entry.originalsecret = photo.originalsecret;
                            entry.farm = photo.farm;
                            entry.originalformat = photo.originalformat;
                            entry.iconserver = photo.iconserver;
                            entry.iconfarm = photo.iconfarm;
                            entry.pathalias = photo.pathalias;

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
        { id : "ispublic", alias : "is public", dataType : tableau.dataTypeEnum.bool },
        { id : "isfriend", alias : "is friend", dataType : tableau.dataTypeEnum.bool },
        { id : "isfamily", alias : "is family", dataType : tableau.dataTypeEnum.bool },
        { id : "datetaken", alias : "date taken", dataType : tableau.dataTypeEnum.datetime },
        { id : "datetakengranularity", alias : "date taken granularity", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "datetakenunknown", alias : "is date taken unknown", dataType : tableau.dataTypeEnum.bool },
        { id : "dateupload", alias : "date uploaded", dataType : tableau.dataTypeEnum.string },
        { id : "license", alias : "license", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "lastupdate", alias : "last update", dataType : tableau.dataTypeEnum.string },
        { id : "latitude", alias : "latitude", dataType : tableau.dataTypeEnum.float },
        { id : "longitude", alias : "longitude", dataType : tableau.dataTypeEnum.float },
        { id : "accuracy", alias : "accuracy", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "context", alias : "context", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "place_id", alias : "place id", dataType : tableau.dataTypeEnum.string },
        { id : "woeid", alias : "woe id", dataType : tableau.dataTypeEnum.string },
        { id : "geo_is_family", alias : "geo is family", dataType : tableau.dataTypeEnum.bool },
        { id : "geo_is_friend", alias : "geo is friend", dataType : tableau.dataTypeEnum.bool },
        { id : "geo_is_contact", alias : "geo is contact", dataType : tableau.dataTypeEnum.bool },
        { id : "geo_is_public", alias : "geo is public", dataType : tableau.dataTypeEnum.bool },
        { id : "views", alias : "view count", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "media", alias : "media", dataType : tableau.dataTypeEnum.string },
        { id : "media_status", alias : "media status", dataType : tableau.dataTypeEnum.string },
        { id : "url_sq", alias : "URL sq 75x75", dataType : tableau.dataTypeEnum.string },
        { id : "height_sq", alias : "URL sq height", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "width_sq", alias : "URL sq width", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "url_t", alias : "URL t 75x100", dataType : tableau.dataTypeEnum.string },
        { id : "height_t", alias : "URL t height", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "width_t", alias : "URL t width", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "url_s", alias : "URL s 180x240", dataType : tableau.dataTypeEnum.string },
        { id : "height_s", alias : "URL s height", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "width_s", alias : "URL s width", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "url_q", alias : "URL q 150x150", dataType : tableau.dataTypeEnum.string },
        { id : "height_q", alias : "URL q height", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "width_q", alias : "URL q width", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "url_m", alias : "URL m 375x500", dataType : tableau.dataTypeEnum.string },
        { id : "height_m", alias : "URL m height", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "width_m", alias : "URL m width", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "url_n", alias : "URL n 240x320", dataType : tableau.dataTypeEnum.string },
        { id : "height_n", alias : "URL n height", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "width_n", alias : "URL n width", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "url_z", alias : "URL z 480x640", dataType : tableau.dataTypeEnum.string },
        { id : "height_z", alias : "URL z height", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "width_z", alias : "URL z width", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "url_c", alias : "URL c 600x800", dataType : tableau.dataTypeEnum.string },
        { id : "height_c", alias : "URL c height", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "width_c", alias : "URL c width", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "url_l", alias : "URL l 768x1024", dataType : tableau.dataTypeEnum.string },
        { id : "height_l", alias : "URL l height", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "width_l", alias : "URL l width", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "url_o", alias : "URL original", dataType : tableau.dataTypeEnum.string },
        { id : "height_o", alias : "URL original height", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "width_o", alias : "URL original width", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "owner", alias : "owner", dataType : tableau.dataTypeEnum.string },
        { id : "server", alias : "server", dataType : tableau.dataTypeEnum.string },
        { id : "secret", alias : "secret", dataType : tableau.dataTypeEnum.string },
        { id : "originalsecret", alias : "original secret", dataType : tableau.dataTypeEnum.string },
        { id : "farm", alias : "farm", dataType : tableau.dataTypeEnum.int, columnRole : tableau.columnRoleEnum.dimension },
        { id : "originalformat", alias : "original format", dataType : tableau.dataTypeEnum.string },
        { id : "iconserver", alias : "icon server", dataType : tableau.dataTypeEnum.string },
        { id : "iconfarm", alias : "icon farm", dataType : tableau.dataTypeEnum.string },
        { id : "pathalias", alias : "path alias", dataType : tableau.dataTypeEnum.string },
        ];

        var tableInfo = {
            id : "flickrmetadata",
            alias : "Flickr metadata",
            columns : cols
        };

        schemaCallback([tableInfo]);
    };

    myConnector.getData = function (table, doneCallback) {

        if (tableau.password.length == 0 || !isTokenValid()) {
            tableau.abortForAuth();
        }

        // Limit for debugging...
        var maxPages = 2;

        var lastPage = 0;
        var moreData = true;
        while (moreData) {
            var data = getImageMetadata(lastPage);
            lastPage++;
            if (data.length == 0 || lastPage >= maxPages) {
                moreData = false;
            }

            table.appendRows(data);
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

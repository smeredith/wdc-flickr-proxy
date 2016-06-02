(function () {

    //
    // Use the Flickr API
    //
    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    function getNewEntry() {
        var entry = {
            photoid: "",
            tag: "",
            owner: "",
            server: "",
            secret: "",
            originalsecret: "",
            farm: 0,
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
            originalformat: "",
            iconserver: "",
            iconfarm: "",
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
            pathalias: "",
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
            width_o: 0
        };
        return entry;
    };

    function getImages(lastPage) {
        var imageList = [];

        // This is the number of results to ask for in a single response.
        // The maximum Flickr supports is 500.
        var pageSize = 5;
        var page = lastPage + 1;

        var xhr = $.ajax({
            url: "http://localhost:3333/flickr_people_getPhotos",
            type: "GET",
            data: {
                per_page: pageSize.toString(),
                page: page.toString(),
            },
            dataType: 'json',
            async: false,
            success: function (data) {
                if (data.photos) {
                    var photos = data.photos.photo;
                    var i;
                    for (i = 0; i < photos.length; ++i) {
                        var photo = photos[i];

                        // Make one row per tag. If a photo has no tags or one tag, it
                        // will get one row in the results. If a photo has multiple tags,
                        // it will get multiple rows: one per tag.
                        var tags = photo.tags.split(" ");
                        var entriesToCreateThisPhoto = tags.length;
                        if (entriesToCreateThisPhoto == 0) {
                            entriesToCreateThisPhoto = 1;
                        }

                        var e;
                        for (e = 0; e < entriesToCreateThisPhoto; ++e) {

                            var entry = getNewEntry();
                            entry.photoid = photo.id;
                            entry.owner = photo.owner;
                            entry.server = photo.server;
                            entry.secret = photo.secret;
                            entry.originalsecret = photo.originalsecret;
                            entry.farm = photo.farm;
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
                            entry.originalformat = photo.originalformat;
                            entry.iconserver = photo.iconserver;
                            entry.iconfarm = photo.iconfarm;
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
                            entry.pathalias = photo.pathalias;
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

        var entry = getNewEntry();
        imageList.push(entry);
        return imageList;
    }

    //
    // Tableau connector
    //

    var myConnector = tableau.makeConnector();

    myConnector.getSchema = function (schemaCallback) {
        // Tell tableau about the fields and their types.
        // Return everything the Flickr API returns.
        // The id is close to the field as it comes from the Flickr API.
        var cols = [
        { id : "photoid", alias : "photo id", dataType : tableau.dataTypeEnum.string },
        { id : "tag", alias : "tag", dataType : tableau.dataTypeEnum.string },
        { id : "owner", alias : "owner", dataType : tableau.dataTypeEnum.string },
        { id : "secret", alias : "secret", dataType : tableau.dataTypeEnum.string },
        { id : "originalsecret", alias : "original secret", dataType : tableau.dataTypeEnum.string },
        { id : "farm", alias : "farm", dataType : tableau.dataTypeEnum.int },
        { id : "title", alias : "title", dataType : tableau.dataTypeEnum.string },
        { id : "description_content", alias : "description", dataType : tableau.dataTypeEnum.string },
        { id : "ispublic", alias : "is public", dataType : tableau.dataTypeEnum.bool },
        { id : "isfriend", alias : "is friend", dataType : tableau.dataTypeEnum.bool },
        { id : "isfamily", alias : "is family", dataType : tableau.dataTypeEnum.bool },
        { id : "datetaken", alias : "date taken", dataType : tableau.dataTypeEnum.datetime },
        { id : "datetakengranularity", alias : "date taken granularity", dataType : tableau.dataTypeEnum.int },
        { id : "datetakenunknown", alias : "is date taken unknown", dataType : tableau.dataTypeEnum.bool },
        { id : "dateupload", alias : "date uploaded", dataType : tableau.dataTypeEnum.string },
        { id : "license", alias : "license", dataType : tableau.dataTypeEnum.int },
        { id : "originalformat", alias : "original format", dataType : tableau.dataTypeEnum.string },
        { id : "iconserver", alias : "icon server", dataType : tableau.dataTypeEnum.string },
        { id : "iconfarm", alias : "icon farm", dataType : tableau.dataTypeEnum.string },
        { id : "lastupdate", alias : "last update", dataType : tableau.dataTypeEnum.string },
        { id : "latitude", alias : "latitude", dataType : tableau.dataTypeEnum.float },
        { id : "longitude", alias : "longitude", dataType : tableau.dataTypeEnum.float },
        { id : "accuracy", alias : "accuracy", dataType : tableau.dataTypeEnum.int },
        { id : "context", alias : "context", dataType : tableau.dataTypeEnum.int },
        { id : "place_id", alias : "place id", dataType : tableau.dataTypeEnum.string },
        { id : "woeid", alias : "woe id", dataType : tableau.dataTypeEnum.string },
        { id : "geo_is_family", alias : "geo is family", dataType : tableau.dataTypeEnum.bool },
        { id : "geo_is_friend", alias : "geo is friend", dataType : tableau.dataTypeEnum.bool },
        { id : "geo_is_contact", alias : "geo is contact", dataType : tableau.dataTypeEnum.bool },
        { id : "geo_is_public", alias : "geo is public", dataType : tableau.dataTypeEnum.bool },
        { id : "views", alias : "view count", dataType : tableau.dataTypeEnum.int },
        { id : "media", alias : "media", dataType : tableau.dataTypeEnum.string },
        { id : "media_status", alias : "media status", dataType : tableau.dataTypeEnum.string },
        { id : "pathalias", alias : "path alias", dataType : tableau.dataTypeEnum.string },
        { id : "url_sq", alias : "sq URL", dataType : tableau.dataTypeEnum.string },
        { id : "height_sq", alias : "sq height", dataType : tableau.dataTypeEnum.int },
        { id : "width_sq", alias : "sq width", dataType : tableau.dataTypeEnum.int },
        { id : "url_t", alias : "t URL", dataType : tableau.dataTypeEnum.string },
        { id : "height_t", alias : "t height", dataType : tableau.dataTypeEnum.int },
        { id : "width_t", alias : "t width", dataType : tableau.dataTypeEnum.int },
        { id : "url_s", alias : "s URL", dataType : tableau.dataTypeEnum.string },
        { id : "height_s", alias : "s height", dataType : tableau.dataTypeEnum.int },
        { id : "width_s", alias : "s width", dataType : tableau.dataTypeEnum.int },
        { id : "url_q", alias : "q square URL", dataType : tableau.dataTypeEnum.string },
        { id : "height_q", alias : "q square height", dataType : tableau.dataTypeEnum.int },
        { id : "width_q", alias : "q square width", dataType : tableau.dataTypeEnum.int },
        { id : "url_m", alias : "m URL", dataType : tableau.dataTypeEnum.string },
        { id : "height_m", alias : "m height", dataType : tableau.dataTypeEnum.int },
        { id : "width_m", alias : "m width", dataType : tableau.dataTypeEnum.int },
        { id : "url_n", alias : "n URL", dataType : tableau.dataTypeEnum.string },
        { id : "height_n", alias : "n height", dataType : tableau.dataTypeEnum.int },
        { id : "width_n", alias : "n width", dataType : tableau.dataTypeEnum.int },
        { id : "url_z", alias : "z URL", dataType : tableau.dataTypeEnum.string },
        { id : "height_z", alias : "z height", dataType : tableau.dataTypeEnum.int },
        { id : "width_z", alias : "z width", dataType : tableau.dataTypeEnum.int },
        { id : "url_c", alias : "c URL", dataType : tableau.dataTypeEnum.string },
        { id : "height_c", alias : "c height", dataType : tableau.dataTypeEnum.int },
        { id : "width_c", alias : "c width", dataType : tableau.dataTypeEnum.int },
        { id : "url_l", alias : "l URL", dataType : tableau.dataTypeEnum.string },
        { id : "height_l", alias : "l height", dataType : tableau.dataTypeEnum.int },
        { id : "width_l", alias : "l width", dataType : tableau.dataTypeEnum.int },
        { id : "url_o", alias : "original URL", dataType : tableau.dataTypeEnum.string },
        { id : "height_o", alias : "original height", dataType : tableau.dataTypeEnum.int },
        { id : "width_o", alias : "original width", dataType : tableau.dataTypeEnum.int },
        ];

    var tableInfo = {
        id : "flickrmetadata",
        alias : "Flickr metadata",
        columns : cols
    };

    schemaCallback([tableInfo]);
};

myConnector.getData = function (table, doneCallback) {

    // Limit for debugging...
    var maxPages = 2;

    var lastPage = 0;
    var moreData = true;
    while (moreData) {
        var data = getImages(lastPage);
        lastPage++;
        if (data.length == 0 || lastPage >= maxPages) {
            moreData = false;
        }

        table.appendRows(data);
    }
    doneCallback();
};

myConnector.init = function (initCallback) {

    // Auth is handled by the proxy so the client doesn't need to know about it.
    tableau.authType = tableau.authTypeEnum.none;
    tableau.connectionName="Flickr WDC";
    initCallback();

    if (tableau.phase == tableau.phaseEnum.interactivePhase || tableau.phase == tableau.phaseEnum.authPhase) {
        tableau.submit();
    }
};

tableau.registerConnector(myConnector);

})();



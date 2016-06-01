(function () {

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
    var maxPages = 10;

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

    tableau.authType = tableau.authTypeEnum.custom;
    tableau.connectionName="Flickr WDC";
    initCallback();

    if (tableau.phase == tableau.phaseEnum.interactivePhase) {
    }
};

tableau.registerConnector(myConnector);

//
// Use the Flickr API
//

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
    return imageList;
}

})();



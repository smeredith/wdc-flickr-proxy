# wdc-flickr-proxy

This is a Tableau Web Data Connector for Flickr.
It supports OAUTH to log in.
It retrieves metadata for all your personal photos.

## Setup

This repo is set up to work as a nodejs app.
I have tested it as localhost on Windows and OSX and via Heroku.
Some environment variables are required.

### Required Environment Variables

`FLICKR_WDC_HOSTPATH` the base URL (just the protocol and hostname) of your proxy service.
For example, `https://wdc-flickr-proxy.herokuapp.com`.

`PORT` the port the above server is listening on.
For Heroku, you don't need to set this as it will be defined by the system.
For localhost, you can omit if the port is 80.

`FLICKR_WDC_API_KEY` the API key you get from Flickr.

`FLICKR_WDC_API_SECRET` the API secret you get from Flickr.

## Data Returned

Two tables are returned.

The first table, `flickrmetadata`, contains one row per photo.
It contains columns for photo metadata like title, description, date taken, etc.
The second table, `flickrtags`, contains one row per tag.
This table has two columns: `photo id` and `tag`.
There may be multiple rows per photo if the photo contains more than one tag.
If a photo has no tags, it won't appear in the table at all.
Both tables contain the `photo id` field, which can be used to join them.

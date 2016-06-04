# wdc-flickr-proxy

This is a Tableau Web Data Connector for Flickr.
It supports OAUTH to log in.
It retrieves metadata for all your personal photos.

## Setup

This repo is set up to work as a nodejs app.
I have tested it as localhost and via Heroku.
Some environment variables are required.

### Required Environment Variables

`FLICKR_WDC_HOSTPATH` the base URL of your proxy service.
For example, `https://wdc-flickr-proxy.herokuapp.com`.

`FLICKR_WDC_API_KEY` the API key you get from Flickr.

`FLICKR_WDC_API_SECRET` the API secret you get from Flickr.

### Optional Environment Variables

`FLICKR_WDC_PAGESIZE` the number of records to get from Flickr with each HTTP request.
The maximum is 500.
The default is 100 if not specified.
This is intended to be a tuning mechanism to balance number of calls to appendTable() with size of each response.

`FLICKR_WDC_PAGELIMIT` the maximum number of HTTP requests to make for this query.
This is useful if you are debugging the WDC and don't want to wait for all the data every time.
If not specified, all the data is returned.

## Data Returned

This WDC is intended for tag analysis.
As such, if there are multiple tags on a image, there will be multiple rows returned for image, each with a different value in the tag column and all other columns the same.
So the number of rows returned will be more than the number of images.

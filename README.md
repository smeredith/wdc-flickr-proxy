# Tableau Web Data Connector for Flickr

This is a Tableau Web Data Connector for Flickr.
A [Web Data Connector](https://www.tableau.com/web-data-connector) is a component that is used to give [Tableau](https://www.tableau.com) access to data on the web that is exposed via an API.

This Web Data Connector is used to extract photo metadata from your personal photo collection on Flickr.
It requires that you log in with your Flickr credentials.

## What You Can Do With It

You can analyze your photo metadata in a number of ways using Tableau.
Here are a few simple examples:

You can see which day of the week is your most photographed day.

![day of week graph](images/day-of-week.png)

You can create a tag cloud of all your tags.
Clicking a tag opens the browser to Flickr with search results from your collection for that tag.

![tag cloud](images/tag-cloud.png)

For more precision, you can create a histogram of tag use frequency.

![tag histogram](images/tag-histogram.png)

You can create a map with a dot for each photo and display a photo when you roll over its dot on the map.

![map](images/map.png)

## How to Use It

To use the Web Data Connector, create a new Web Data Connector data source in Tableau and enter `https://wdc-flickr-proxy.herokuapp.com/flickr.html`.
You will be directed to Flickr's sign-in page where you will be asked to log in and give the Web Data Connector read-only access to your photos.
Once you have logged in, Tableau will immediately pull in the metadata for your photo collection.
This may take a while depending on the size of your collection.
Tableau doesn't give you any indication of time remaining--you only see a spinner to show that something is happening.

### Data Returned

Two tables are returned.

The first table, `flickrmetadata`, contains one row per photo.
It contains columns for photo metadata like title, description, date taken, etc.
The second table, `flickrtags`, contains one row per tag.
This table has two columns: `photo id` and `tag`.
There may be multiple rows per photo if the photo contains more than one tag.
If a photo has no tags, it won't appear in the table at all.
Both tables contain the `photo id` field, which can be used to join them.

## Source Code Technical Details

This repo contains the source for the Web Data Connector.
It is set up to work as a nodejs app.
I have tested it as localhost on Windows and OSX and via Heroku.
Some environment variables are required if you want to run an instance of the server yourself.

### Required Environment Variables

`FLICKR_WDC_HOSTPATH` the base URL (just the protocol and hostname) of your proxy service.
For example, `https://wdc-flickr-proxy.herokuapp.com`.

`PORT` the port the above server is listening on.
For Heroku, you don't need to set this as it will be defined by the system.
For localhost, you can omit if the port is 80.
That will work for Windows, but not for Mac.

`FLICKR_WDC_API_KEY` the API key you get from Flickr.

`FLICKR_WDC_API_SECRET` the API secret you get from Flickr.

See [this link](https://www.flickr.com/services/api/misc.api_keys.html) for how to get these keys from Flickr.
Note that these are only required if you want to run your own server.
You can use the Web Data Connector with normal Flickr login credentials.

### Why a Server is Required

There are two reasons why a server component is necessary for this WDC: single origin policy and security of the developer API key and secret.

#### Single Origin Policy

The web browser control embedded in Tableau enforces the "Single Origin Policy."
This is a security measure that ensures that AJAX requests can only be made to the domain where the running Javascript came from.
For example, if a Web Data Connector was downloaded from example.com, it cannot make AJAX requests to flickr.com.
Well technically, it can make the request, but the response will be blocked by the browser control.

There are generally two solutions to this problem, and they both require server cooperation.
(And Flickr does not cooperate.)
First, the server could use JSONP.
Flickr supports JSONP for all it's normal API calls, but not for OAUTH.
Second, the server could set a header to allow this to work: `Access-Control-Allow-Origin`.
Flickr does not support this either.
It is possible to stand up a single-purpose CORS proxy for this.
It's sole functionality is to add the `Access-Control-Allow-Origin` header to all responses coming from Flickr.

For more information on this topic, see [this Tableau documentation](https://onlinehelp.tableau.com/current/api/wdc/en-us/WDC/wdc_cors.htm).

#### Securing the Developer API Key and Secret

The Flickr API requires that all authenticated API calls be signed with both the OAUTH access token and the Flickr developer API key and API secret.
If this signing were done in the client Javascript, it would be trivial for anyone to capture the API key and secret.
By forwarding the Flickr API calls to the server component of the WDC to do the signing, the API key and secret remain safe as they are never transferred to the client.

### Authentication with Flickr

The most complex part of the WDC is working with Flickr OAUTH authentication.
For details on how that works, see [this link](https://www.flickr.com/services/api/auth.oauth.html).

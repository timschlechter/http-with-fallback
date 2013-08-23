# $http with fallback [![Build Status](https://travis-ci.org/TimSchlechter/http-with-fallback.png?branch=master)](https://travis-ci.org/TimSchlechter/http-with-fallback)
AngularJS [$http](http://docs.angularjs.org/api/ng.$http) compatible factory which provides a fallback to the last successful response for failing GET requests.

### The goal
Always recieve status 20x on HTTP GET requests.

### Usage
Default usage:
<pre>httpWithFallback.get('/someurl.json');</pre>

Config options:
<pre>httpWithFallback.get('/someurl.json', { dontStore: true, fallbackData: { 'key': 'value' } });</pre>

- *dontStore*: when true, don't store succesful 200 requests in the local storage for future fallback (default: false)
- *fallbackData*: whenever a GET request fails, and there is no stored response, the promise will resolve with this data. When everything fails and there is no fallbackData given, the promise will reject with the original response. fallbackData data will never be stored in the local storage as a future fallback response.

### When you might want to use this
When you're building an AngularJS application with offline support, like a PhoneGap app for example.

### What about the browser cache?
What about all those JSON services responding with no-caching headers?

### How it works
Whenever a GET request performed by http-with-fallback responds with:
- status 200: the response is stored in the local storage
- status 20x, 30x: just resolve the promise with the given response
- status 40x, 50x: it looks for a successful response in the local storage. When found, resolve the promise with this response. If none found, and the _fallbackData_ config value is set, resolve the promise with a response containing this data.

If the browser has no local storage support, every get() is just passed on to [$http](http://docs.angularjs.org/api/ng.$http).

### Why?
I got inspired by [this podcast](http://javascriptjabber.com/069-jsj-the-application-cache-with-jake-archibald/) in which [Jake Archibald](http://jakearchibald.com/) tells about the Application Cache and the problems he has with it. One thing I particularly don't like is the cache-first approach.
http-with-fallback is an experiment to see if I can deal with the offline scenario in a convenient way in AngularJS applications by wrapping some stuff around [$http](http://docs.angularjs.org/api/ng.$http).
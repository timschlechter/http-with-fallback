# $http with fallback [![Build Status](https://travis-ci.org/timschlechter/http-with-fallback.png?branch=master)](https://travis-ci.org/TimSchlechter/http-with-fallback)
AngularJS [$http](http://docs.angularjs.org/api/ng.$http) compatible factory which can provide a fallback for failing GET requests.

### The goal
Always recieve status 20x on HTTP GET requests.

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

### Usage
#### Default usage
<pre>httpWithFallback.get('/someurl.json')</pre>

#### Config options
There are two optional config options (next to all $http's normal config options): _fallback_ and _dontUserStorage_.

<pre>httpWithFallback.get('/someurl.json', { fallback: { 'key': 'value' }, dontStoreFallback: true });</pre>

- *fallback*: whenever a GET request fails, and there is no stored response, the promise will resolve with this data. When everything fails and there is no fallback given, the promise will reject with the original response.
- *dontStoreFallback*: when true, don't store succesful 200 OK responses in the local storage for future fallback (default: false)

When a fallback occurs, an extra property _isFallback_ will be added to the response:

<pre>httpWithFallback.get('/someurl.json')
                .then(function(response) {
                  // response.isFallback will be true when it's a fallback response
                })</pre>

_or_

<pre>httpWithFallback.get('/someurl.json')
                .success(data, status, header, config, isFallback) {
                  // isFallback will be true when it's a fallback response
                })</pre>

### Build
<pre>npm install
grunt</pre>

### Test
_With Karma:_
<pre>karma start --browser Chrome</pre>
_Testrunner page:_
<pre>http://your_checkout_location/test/</pre>

### Why?
I got inspired by [this podcast](http://javascriptjabber.com/069-jsj-the-application-cache-with-jake-archibald/) in which [Jake Archibald](http://jakearchibald.com/) tells about the Application Cache and the problems he has with it. One thing I particularly don't like is the cache-first approach.
http-with-fallback is an experiment to see if I can deal with the offline scenario in a convenient way in AngularJS applications by wrapping some stuff around [$http](http://docs.angularjs.org/api/ng.$http).

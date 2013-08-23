AngularJS [$http](http://docs.angularjs.org/api/ng.$http) compatible factory which provides a fallback to the last successful response for failing GET requests.

## The goal
Always recieve status 20x on HTTP GET request.

## When you might want to use this
When you're building an AngularJS application with offline support, like a PhoneGap app for example.

## When *NOT* to use this
To perform HTTP GET requests which require authentication/autorisation. Seriously, don't...

## How it works
Whenever a GET request performed by http-with-fallback responds with:
- status 200: the response is stored in the local storage
- status 20x, 30x: just resolve the promise with the given response
- status 40x, 50x: it looks for a successful response in the local storage. When found, resolve the promise with this response 

If the browser has no local storage support, every get() is just passed on to [$http](http://docs.angularjs.org/api/ng.$http).

## Why?
I got inspired by this podcast in which [Jake Archibald](http://jakearchibald.com/) tells about the Application Cache and the problems he has with it. One thing I particularly didn't like is the cache-first approach.
http-with-fallback is an experiment to see if I can deal with the offline scenario in a convenient way in AngularJS applications by wrapping some stuff around [$http](http://docs.angularjs.org/api/ng.$http).
AngularJS [$http](http://docs.angularjs.org/api/ng.$http) compatible factory which provides a fallback to the last successful response for failing GET requests.

## The goal
Always recieve status 20x on HTTP GET request.

## When you might use this
When you're building an AngularJS applications with offline support, like a PhoneGap app for example.

## When *NOT* to use this
To perform HTTP GET requests which require authentication/autorisation. Seriously, don't...

## Why?
I got inspired by this podcast in which [Jake Archibald](http://jakearchibald.com/) tells about the Application Cache and the problems he has with it. One thing I particularly didn't like is the cache-first approach.
http-with-fallback is an experiment to see if I can deal with the offline scenario in a convenient way in AngularJS applications by wrapping some stuff around [$http](http://docs.angularjs.org/api/ng.$http).
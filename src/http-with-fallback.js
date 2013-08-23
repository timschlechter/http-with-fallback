(function(global) {
  'use strict';

  angular.module('http-with-fallback', [])
    .factory('httpWithFallback', ['$http', '$q', function($http, $q) {

      // Clients without local storage will just use $http
      if (!global.localStorage)
        return $http;

      // Constructor function, using $http as prototype
      function CachingHttp() { }
      CachingHttp.prototype = $http;
      CachingHttp.prototype.constructor = CachingHttp;

      var cachingHttp = new CachingHttp(),
          localStorage = global.localStorage;

      /**
       * Override $http.get to catch the promise.error
       */
      cachingHttp.get = function(url, config) {
        var deferred = $q.defer(),
            promise = deferred.promise;

        // Decorate promise with success and error functions to be compatible with the promise returned by $http.get
        promise.success = function(fn) {
          promise.then(function(response) {
            fn(response.data, response.status, response.headers, config);
          });
          return promise;
        };

        promise.error = function(fn) {
          promise.then(null, function(response) {
            fn(response.data, response.status, response.headers, config);
          });
          return promise;
        };

        // Delegate get to $http
        $http.get(url, config)
             .then( 
                /* success */
                function(response) {
                  deferred.resolve(response);

                  // Store in local storage when status === 200
                  if (response.status === 200) {
                    var data = response.data;
                    if (typeof data === "object")
                      data = JSON.stringify(response.data);

                    localStorage.setItem(url, data);
                  }
                },
                /* error */
                function(response) {
                  // Try to retrieve from local storage
                  var cachedData = localStorage.getItem(url);
                  if (!cachedData) {
                    // Not in local storage, resolve with original error response
                    deferred.reject(response)
                    return;
                  }

                  // parse as JSON
                  if (/^[\],:{}\s]*$/.test(cachedData.replace(/\\["\\\/bfnrtu]/g, '@')
                                                     .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                                                     .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                    cachedData = JSON.parse(cachedData);
                  }

                  // Data was successfully retrieved from local storage, resolve with status 200
                  deferred.resolve({
                    data: cachedData,
                    status: 200
                  });
                }
        );

        return promise;
      };

      return cachingHttp;
    }]);
}(this));
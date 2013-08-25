(function(global) {
  'use strict';

  angular.module('http-with-fallback', [])
    .factory('httpWithFallback', ['$http', '$q', function($http, $q) {
      // Clients without local storage will just use $http
      if (!global.localStorage)
        return $http;

      // Constructor function, using $http as prototype
      function HttpWithFallback() { }
      HttpWithFallback.prototype = $http;
      HttpWithFallback.prototype.constructor = HttpWithFallback;

      var httpWithFallback = new HttpWithFallback(),
          localStorage = global.localStorage;

      /**
       * Override $http.get to catch the promise.error
       */
      httpWithFallback.get = function(url, config) {
        var deferred = $q.defer(),
            promise = deferred.promise;

        // Decorate promise with success and error functions to be compatible with the promise returned by $http.get
        promise.success = function(fn) {
          promise.then(function(response) {
            fn(response.data, response.status, response.headers, config, response.isFallback);
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
                    localStorage.setItem(url, JSON.stringify({
                                                data: response.data,
                                                status: response.status,
                                                config: response.config,
                                                headers: response.headers(),
                                                isFallback: true
                                              }));
                  }
                },
                /* error */
                function(response) {
                  // Try to retrieve from local storage
                  var storedResponse = localStorage.getItem(url);
                  if (storedResponse) {
                    // Data was successfully retrieved from local storage, resolve with status 200
                    storedResponse = JSON.parse(storedResponse);
                    var headers = storedResponse.headers;
                    storedResponse.headers = function() { return headers; };
                    deferred.resolve(storedResponse);
                    return;
                  }

                  // Try config.fallback
                  if (response.config.fallback) {
                    deferred.resolve({
                      data: config.fallback,
                      status: 200,
                      headers: response.headers,
                      config: response.config,
                      isFallback: true
                    });
                    return;
                  }

                  // Reject with original error response
                  deferred.reject(response);
                }
        );

        return promise;
      };

      return httpWithFallback;
    }]);
}(this));
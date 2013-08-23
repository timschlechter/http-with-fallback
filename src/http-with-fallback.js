(function(global) {
  'use strict';

  angular.module('http-with-fallback', [])
    .factory('httpWithFallback', ['$http', '$q', function($http, $q) {
      return $http;
    }]);
}(this));
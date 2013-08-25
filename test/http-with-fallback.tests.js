describe("http-with-fallback", function() {
  var httpWithFallback,
      $httpBackend,
      $q,
      async = new AsyncSpec(this);

  beforeEach(function() {
    module('http-with-fallback');
    
    inject(function($injector) {
      httpWithFallback = $injector.get('httpWithFallback');
      $httpBackend = $injector.get('$httpBackend');
      $q = $injector.get('$q');
    });

    for (var key in localStorage) {
      localStorage.removeItem(key);
    }
  });

  /**
   * Helper function to register test cases
   */
  function createTestcase(description, testcase) {
    // When multiple success callbacks are defined, create a single testcase for each of them
    if (testcase.success && !_.isFunction(testcase.success)) {
      describe(description, function() {
        _.each(testcase.success, function(value, key) {
          var clone = _.cloneDeep(testcase);
          clone.success = value;
          createTestcase(key, clone)
        });
      });
      return;
    }
    // When multiple error callbacks are defined, create a single testcase for each of them
    if (testcase.error && !_.isFunction(testcase.error)) {
      _.each(testcase.error, function(value, key) {
        var clone = _.cloneDeep(testcase);
        clone.error = value;
        createTestcase(key, clone)
      });
      return;
    }

    var SOME_URL = '/some';

    function performRequests(count, deferred, response) {
      if (count === 0) {
        if (response.status > 400)
          deferred.reject(response);
        else
          deferred.resolve(response);

        return;
      }

      return httpWithFallback.get(SOME_URL)
              .then(
                function(response) { return performRequests(count-1, deferred, response); },
                function(response) { return performRequests(count-1, deferred, response); }
              );
    }

    async.it(description, function(done) {
      // arrange $httpBackend
      var requestCount = 0;

      $httpBackend.when('GET', SOME_URL).respond(
        function(method, url, data, headers) {
          var response = testcase.responses[requestCount];
          requestCount++;
          return [response.status, response.data, response.headers];
        });
      
      var deferred = $q.defer(),
          act = performRequests(testcase.responses.length, deferred);

      // Assert
      deferred.promise
      .then(
        function(response) {
          if (testcase.success)
            testcase.success(response.data, response.status, response.headers, response.config, response.isFallback);
          else
            expect("success").toBe("not invoked"); 
        },
        function(response) {
          if (testcase.error)
            testcase.error(response.data, response.status, response.headers, response.config, response.isFallback);
          else
            expect("error").toBe("not invoked");
        })
      .then(done, done);

      // Flush pending requests, making the req-promise resolve
      $httpBackend.flush();      
    });
  }  

  describe("default usage", function() {

    createTestcase("GET returning status 500 reject with error response",  { 
      responses: [
        { status: 500 }
      ],
      error: function(data, status) {
        expect(status).toEqual(500);
      }
    });

    createTestcase("GET returning status 500 after a 200", {
      responses: [
        { status: 200, data: { "key": "value" } }, 
        { status: 500                           }
      ],
      success : {
        "should resolve successful with data from the first 200 request": 
          function(data) {

            expect(data).toEqual({ "key": "value" });
          },
        "response.isFallback should be true":
          function(data, status, headers, config, isFallback) {
            expect(isFallback).toBe(true);
          }        
      }
    });    
  })
});
describe("http-with-fallback", function() {
  var httpWithFallback,
      $httpBackend,
      async = new AsyncSpec(this);

  beforeEach(function() {
    module('http-with-fallback');
    
    inject(function($injector) {
      httpWithFallback = $injector.get('httpWithFallback');
      $httpBackend = $injector.get('$httpBackend');
    });

    for (var key in localStorage) {
      localStorage.removeItem(key);
    }
  });

  /**
   * Helper function to register test cases
   */
  function createTestcase(description, testcase) {
    var SOME_URL = '/some';
    function performRequests(count, data, status, headers, config) {
      if (count === 0)
        return { data: data, status: status, headers: headers, config: config };

      return httpWithFallback.get(SOME_URL)
              .success(function(data, status, headers, config) {
                return performRequests(count-1, data, status, headers, config);
              })
              .error(function(data, status, headers, config) {
                return performRequests(count-1, data, status, headers, config);
              });
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
      
      var act = performRequests(testcase.responses.length);

      // Assert
      if (testcase.success) {
        act.success(testcase.success);
      } else {
        act.success(function() { expect("success").toBe("not invoked"); });
      }

      if (testcase.error) {
        act.error(testcase.error);
      } else {
        act.error(function() { expect("error").toBe("not invoked"); });
      }

      act.then(done, done);

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

    createTestcase("GET returning status 500 after a 200 should resolve successful with last recieved data", {
      responses: [
        { status: 200, data: { "key": "value" } }, 
        { status: 500                           }
      ],
      success: function(data) {
        expect(data).toEqual({ "key": "value" });
      }
    });

    
  })
});
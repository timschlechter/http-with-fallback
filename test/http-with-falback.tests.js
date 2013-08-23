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
  });

  async.it("GET returning status 500 after a 200 should resolve successful with last recieved data", function(done) {
    // arrange: $httpBackend: first request returns 200, seconde request return 500
    var reqCount = 0,
        responseData = { "key": "value" };    
    $httpBackend.when('GET', '/test.json').respond(
      function(method, url, data, headers) {
        if (reqCount++ === 0) {
          return [200, responseData, {}];
        } else {
          return [500, '', {}];
        }
      });

    // act: perform two GET requests to the same url
    var req = httpWithFallback.get('/test.json')
          .then(function() {
            return httpWithFallback.get('/test.json');
          });

    // assert: promise should resolve successful with data
    req.then(
      function(response) {
        expect(response.data).toEqual(responseData);
        done();  
      },
      function(error) {
        expect('this line of code').not.toBe('hit');
      }); 

    // Flush pending requests, making the req-promise resolve
    $httpBackend.flush();
    
  });
})
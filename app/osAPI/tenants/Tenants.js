angular.module('osAPI.tenants', [])
  .service('Tenants', function($http, $q, $localStorage, $rootScope) {
    var service = {
      list: list
    };

    var requestedAt, requestPromise;

    return service;

    function list() {
      if (requestedAt && requestPromise) {
        var secSinceRequested = moment().diff(requestedAt, 'seconds');
        if (secSinceRequested <= 7) {
          return requestPromise;
        }
      }
      return uncached();
    };

    function uncached() {
      requestedAt = moment();
      requestPromise = $http.get('http://192.168.122.183:5000/v2.0/tenants')
        .then(function(response) {
          return response.data.tenants;
        }, function(response) {
          requestedAt = null;
          return $q.reject(new Error('Could not get tenant list'));
        });
      return requestPromise;
    }
  });

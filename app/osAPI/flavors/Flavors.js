angular.module('osFlavors', [])
  .service('Flavors', function($http) {
    return { get: get }

    function get(tenantId) {
      return $http.get('http://192.168.122.183:8774/v2.1/' + tenantId + '/flavors/detail')
        .then(function(response) {
          return response.data.flavors;
        });
    }
});

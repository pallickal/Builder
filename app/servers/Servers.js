angular.module('servers', ['tenants'])
  .service('Servers', function($http, $q) {
    return {
      list: list
    };

    function list(tenantId) {
      return $http.get('http://192.168.122.183:8774/v2.1/' + tenantId + '/servers')
        .then(function(response) {
          return response.data.servers;
        }, function(response) {
          return $q.reject(new Error('Could not get server list for tenant ' + tenantId));
        });
    };
  });

angular.module('servers', ['tenants'])
  .service('Server', function($http, $q) {
    return { get: get };

    function get(tenantId, serverId) {
      return $http.get('http://192.168.122.183:8774/v2.1/' + tenantId + '/servers/' + serverId)
        .then(function(response) {
          return response.data.server;
        }, function(response) {
          return $q.reject(new Error('Could not get server list for tenant ' + tenantId));
        });
    }

  });

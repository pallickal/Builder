angular.module('osServers')
  .service('Server', function($http, $q) {
    return {
      get: get,
      create: create
    };

    function get(tenantId, serverId) {
      return $http.get('http://192.168.122.183:8774/v2.1/' + tenantId + '/servers/' + serverId)
        .then(function(response) {
          return response.data.server;
        }, function(response) {
          return $q.reject(new Error('Could not get server list for tenant ' + tenantId));
        });
    }

    function create(tenantId, server) {
      var data = {
        "server": {
          "name": server.name,
          "imageRef": server.imageId,
          "flavorRef": server.flavorId,
        }
      }

      return $http.post('http://192.168.122.183:8774/v2.1/' + tenantId + '/servers', data)
        .then(function(response) {
          return response.data.server;
        });
    }
  });

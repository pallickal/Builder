angular.module('osAPI.Servers', [])
  .service('Servers', function($http, $q, Server) {
    return { get: get };

    function get(tenantId) {
      return $http.get('http://192.168.122.183:8774/v2.1/' + tenantId + '/servers')
        .then(function(response) {
          return stitchServerDetails(tenantId, response.data.servers);
        }, function(response) {
          return $q.reject(new Error('Could not get servers for tenant ' + tenantId));
        });
    }

    function stitchServerDetails(tenantId, servers) {

      function indexOfServer(servers, serverId) {
        function isServerId(element, index, array) {
          if (element.id == serverId) return true;
        }
        return servers.indexOf(servers.find(isServerId));
      }

      var detailPromises = [];
      for (var i = 0; i < servers.length; i++) {
        var promise = Server.get(tenantId, servers[i].id)
          .then(function(data) {
            var i = indexOfServer(servers, data.id);
            if (i >= 0) servers[i]['detail'] = data;
          });
        detailPromises.push(promise);
      }

      return $q.all(detailPromises).then(function() {
        return servers;
      });
    }
  });

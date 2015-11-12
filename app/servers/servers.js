angular.module('servers', ['tenants'])
  .service('serversService', function($http, $q) {
    return {
      list: list
    };

    function list(tenantId) {
      return $http.get('http://192.168.122.183:8774/v2.1/' + tenantId + '/servers')
        .then(function(response) {
          return response.data;
        }, function(response) {
          return $q.reject(new Error('Could not get server list for tenant ' + tenantId));
        });
    };
  })
  .controller('serversCtrl', function($scope, $stateParams, $state,
  tenantsService, serversService) {
    $scope.servers = {};
    $scope.sortField = 'name';
    $scope.reverse = false;

    $scope.$on('tenants:currentTenant:updated', function (event, tenantId) {
      if (tenantId != $stateParams.tenantId) {
        $state.go('app.servers', { tenantId: tenantId });
      }
    });

    function refreshServers(tenantId) {
      serversService.list(tenantId)
        .then(function(data) {
          $scope.servers = data;
        }, function(error) {
          console.log(error.stack);
          $state.go('login');
        });
    }

    if (tenantsService.currentTenantId() != $stateParams.tenantId) {
      tenantsService.setCurrentTenantId($stateParams.tenantId);
    }
    refreshServers($stateParams.tenantId);
  });

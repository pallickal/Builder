angular.module('servers')
.controller('serversCtrl', function($scope, $stateParams, $state, Tenants,
  Servers) {
  $scope.servers = [];
  $scope.sortField = 'name';
  $scope.reverse = false;

  $scope.$on('tenants:currentTenant:updated', function (event, tenantId) {
    if (tenantId != $stateParams.tenantId) {
      $state.go('app.servers', { tenantId: tenantId });
    }
  });

  if (Tenants.currentTenantId() != $stateParams.tenantId) {
    Tenants.setCurrentTenantId($stateParams.tenantId);
  }

  Servers.get($stateParams.tenantId)
    .then(function(servers) {
      $scope.servers = servers;
    }, function(error) {
      console.log(error.stack);
      $state.go('login');
    });
});

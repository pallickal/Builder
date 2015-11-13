angular.module('servers')
.controller('serversCtrl', function($scope, $stateParams, $state,
Tenants, Servers) {
  $scope.servers = {};
  $scope.sortField = 'name';
  $scope.reverse = false;

  $scope.$on('tenants:currentTenant:updated', function (event, tenantId) {
    if (tenantId != $stateParams.tenantId) {
      $state.go('app.servers', { tenantId: tenantId });
    }
  });

  function refreshServers(tenantId) {
    Servers.list(tenantId)
      .then(function(data) {
        $scope.servers = data;
      }, function(error) {
        console.log(error.stack);
        $state.go('login');
      });
  }

  if (Tenants.currentTenantId() != $stateParams.tenantId) {
    Tenants.setCurrentTenantId($stateParams.tenantId);
  }
  refreshServers($stateParams.tenantId);
});

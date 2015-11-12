angular.module('sidebar', ['tenants'])
  .controller('sidebarCtrl', function($scope, $state, tenantsService) {
    $scope.$on('tenants:currentTenant:updated', function (event, tenantId) {
      $scope.currentTenantId = tenantId;
    });
  });

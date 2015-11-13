angular.module('sidebar', ['tenants'])
  .controller('sidebarCtrl', function($scope, $state, Tenants) {
    $scope.$on('tenants:currentTenant:updated', function (event, tenantId) {
      $scope.currentTenantId = tenantId;
    });
  });

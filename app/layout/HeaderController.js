angular.module('builderApp.header', [])
  .controller('HeaderController', function($scope, $state, Tenants, User) {
    $scope.$on('tenants:currentTenant:updated', function (event, tenantId) {
      $scope.currentTenantId = tenantId;
    });

    $scope.switchTenant = function() {
      Tenants.setCurrentTenantId($scope.currentTenantId);
    };

    $scope.signOut = User.signOut;

    Tenants.list()
      .then(function(data) {
        $scope.currentTenantId = $scope.currentTenantId ||
          Tenants.currentTenantId();
        $scope.tenants = data;
      }, function(error) {
        console.log(error.stack);
        User.signOut();
      });
  });

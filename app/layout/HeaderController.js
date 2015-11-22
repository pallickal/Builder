angular.module('builderApp.header', [])
  .controller('HeaderController', function($scope, $state, $stateParams,
    Tenants, User) {
    $scope.signOut = User.signOut;

    $scope.switchTenant = function() {
      Tenants.setCurrentTenantId($scope.currentTenantId);
    };

    $scope.$on('tenants:currentTenant:updated', function (event, tenantId) {
      $scope.currentTenantId = tenantId;
    });

    $scope.$on('tenants:currentTenant:invalid', function(event, tenantId) {
      if ($state.params.tenantId) {
        Tenants.setCurrentTenantId($state.params.tenantId);
      } else {
        Tenants.list()
          .then(function(data) {
            Tenants.setCurrentTenantId(data[0].id);
          }, function(error) {
            console.log(error.stack);
            User.signOut();
          });
      }
    });

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

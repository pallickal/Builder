angular.module('builderApp.header', [])
  .controller('HeaderController', function($scope, $state, Tenants, User) {
    $scope.$on('tenants:currentTenant:updated', function (event, tenantId) {
      $scope.currentTenantId = tenantId;
    });

    $scope.switchTenant = function() {
      Tenants.setCurrentTenantId($scope.currentTenantId);
    };

    $scope.signOut = function() {
      User.signOut();
      $state.go('login');
    }

    Tenants.list()
      .then(function(data) {
        $scope.currentTenantId = $scope.currentTenantId ||
          Tenants.currentTenantId();
        $scope.tenants = data;
      }, function(error) {
        console.log(error.stack);
        $state.go('login');
      });
  });

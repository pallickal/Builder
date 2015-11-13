angular.module('header', ['tenants'])
  .controller('headerCtrl', function($scope, $state, Tenants,
  userService) {
    $scope.$on('tenants:currentTenant:updated', function (event, tenantId) {
      $scope.currentTenantId = tenantId;
    });

    $scope.switchTenant = function() {
      Tenants.setCurrentTenantId($scope.currentTenantId);
    };

    $scope.signOut = function() {
      userService.signOut();
      $state.go('login');
    }

    Tenants.list()
      .then(function(data) {
        $scope.tenants = data;
      }, function(error) {
        console.log(error.stack);
        $state.go('login');
      });
  });

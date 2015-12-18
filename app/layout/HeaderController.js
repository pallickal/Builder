angular.module('builderApp.header', [])
  .controller('HeaderController', function($scope, $state, $stateParams,
    User, Tenants, CurrentTenant) {
    $scope.signOut = User.signOut;
    var lastValidTenantId;
    $scope.currentTenantId = CurrentTenant.id();

    Tenants.list()
      .then(function(data) {
        console.log('HeadersController - Tenants.list() success - $scope.currentTenantId = ' + $scope.currentTenantId + '\nCurrentTenant.id() = ' + CurrentTenant.id());
        $scope.tenants = data;
      }, function(error) {
        console.log(error.stack);
        User.signOut();
      });

    $scope.switchTenant = function() {
      CurrentTenant.setId($scope.currentTenantId)
        .then(function(tenantId) {
          console.log('HeadersController:switchTenant - setId -> then - tenantId = ' + tenantId);
          $scope.currentTenantId = tenantId;
        });
    };

    $scope.$on('tenants:currentTenant:updated', function (event, tenantId) {
      console.log('HeadersController - $scope.on tenants:currentTenant:updated');
      $scope.currentTenantId = tenantId;
      lastValidTenantId = $scope.currentTenantId;
    });

    CurrentTenant.onErrorCallbackChain.add({
      name: 'HeadersController',
      before: 'builder',
      callback: function() {
        console.log('$HeadersController - onErrorCallbackChain callback #1 - First trying validating lastValidTenantId = ' + lastValidTenantId);
        return CurrentTenant.setIdWithoutErrorCallbacks(lastValidTenantId);
      }
    });

    $scope.$on('$destroy', function() {
      CurrentTenant.onErrorCallbackChain.remove('HeadersController');
    });
  });

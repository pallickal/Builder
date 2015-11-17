angular.module('sidebar', ['tenants'])
  .controller('sidebarController', function($scope, $state, Tenants) {
    $scope.currentTenantId = Tenants.currentTenantId();
    $scope.tabs = [
      {
        title:'Projects',
        state:'app.tenants'
      },
      {
        title:'Servers',
        state:'app.servers',
        stateParams: { tenantId: $scope.currentTenantId }
      }
    ];
    var tenantIdParamStates = ['app.servers'];
    $scope.$state = $state;

    function syncActiveTabToState() {
      for (var i = 0; i < $scope.tabs.length; i++) {
        $scope.tabs[i].active = (
          $state.includes($scope.tabs[i].state) ? true : false
        );
      }
    }

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams,
      fromState, fromParams) {
      if (fromState.name != toState.name) syncActiveTabToState();
    });

    $scope.$watch('currentTenantId', function(currentTenantId) {
      for (var i = 0; i < $scope.tabs.length; i++) {
        if (tenantIdParamStates.indexOf($scope.tabs[i].state) >= 0) {
          $scope.tabs[i].stateParams.tenantId = currentTenantId;
        }
      }
    });

    $scope.$on('tenants:currentTenant:updated', function (event, tenantId) {
      $scope.currentTenantId = tenantId;
    });
  });

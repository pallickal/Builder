angular.module('builderApp.sidebar', [])
  .controller('SidebarController', function($scope, $state, CurrentTenant) {
    $scope.currentTenantId = CurrentTenant.id();
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

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams,
      fromState, fromParams) {
      if (fromState.name != toState.name) setActiveTabFromCurrentState();
    });

    function setActiveTabFromCurrentState() {
      for (var i = 0; i < $scope.tabs.length; i++) {
        $scope.tabs[i].active = (
          $state.includes($scope.tabs[i].state) ? true : false
        );
      }
    }

    $scope.$on('tenants:currentTenant:updated', function (event, tenantId) {
      $scope.currentTenantId = tenantId;
      updateTabsWithCurrentTenantId();
    });

    function updateTabsWithCurrentTenantId() {
      for (var i = 0; i < $scope.tabs.length; i++) {
        if (tenantIdParamStates.indexOf($scope.tabs[i].state) >= 0) {
          $scope.tabs[i].stateParams.tenantId = $scope.currentTenantId;
        }
      }
    }
  });

angular.module('builderApp.servers', [])
.controller('ServersController', function($scope, $stateParams, $state, Tenants,
  Servers, Server, Flavors, Images) {
  $scope.sortField = 'name';
  $scope.reverse = false;
  $scope.newServer = {};

  $scope.createServer = function() {
    Server.create($stateParams.tenantId, $scope.newServer)
      .then(function(server) {
        $scope.createdServer = server;
        refreshServers();
      }, function(error) {
        console.log(error);
      });
  }

  function refreshServers() {
    Servers.get($stateParams.tenantId)
      .then(function(servers) {
        $scope.servers = servers;
      }, function(error) {
        console.log(error.stack);
        $state.go('login');
      });
  }

  $scope.$on('tenants:currentTenant:updated', function (event, tenantId) {
    if (tenantId != $stateParams.tenantId) {
      $state.go('app.servers', { tenantId: tenantId });
    }
  });

  if (Tenants.currentTenantId() != $stateParams.tenantId) {
    Tenants.setCurrentTenantId($stateParams.tenantId);
  }

  refreshServers();
  Flavors.get($stateParams.tenantId)
    .then(function(flavors) {
      $scope.flavors = flavors;
      console.log(JSON.stringify($scope.flavors, null, '  '));
    }, function(error) {
      console.log(error);
    });
  Images.get()
    .then(function(images) {
      $scope.images = images;
      console.log(JSON.stringify($scope.images, null, '  '));
    }, function(error) {
      console.log(error);
    });
});

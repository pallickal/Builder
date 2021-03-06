angular.module('builderApp.servers', [])
.controller('ServersController', function($scope, $stateParams, $state, Tenants,
  User, Servers, Server, Flavors, Images) {
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

  $scope.onlyBootableImages = function(image) {
    return (image.disk_format != 'ari' && image.disk_format !='aki');
  }

  function refreshServers() {
    Servers.get($stateParams.tenantId)
      .then(function(servers) {
        $scope.servers = servers;
      }, function(error) {
        console.log(error.stack);
        User.signOut();
      });
  }

  $scope.$on('tenants:currentTenant:updated', function (event, tenantId) {
    if (tenantId != $stateParams.tenantId) {
      $state.go('app.servers', { tenantId: tenantId });
    }
  });

  refreshServers();
  Flavors.get($stateParams.tenantId)
    .then(function(flavors) {
      $scope.flavors = flavors;
    }, function(error) {
      console.log(error);
    });
  Images.get()
    .then(function(images) {
      $scope.images = images;
    }, function(error) {
      console.log(error);
    });
});

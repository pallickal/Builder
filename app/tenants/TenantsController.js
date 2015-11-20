angular.module('builderApp.tenants', [])
  .controller('TenantsController', function($scope, $http, $state, Tenants,
    User) {
    $scope.tenants = [];
    $scope.sortField = 'name';
    $scope.reverse = false;

    Tenants.list()
      .then(function(data) {
        $scope.tenants = data;
      }, function(error) {
        console.log(error.stack);
        User.signOut();
      });
  });

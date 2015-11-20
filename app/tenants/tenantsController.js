angular.module('builderApp.tenants', [])
  .controller('tenantsController', function($scope, $http, $state, Tenants) {
    $scope.tenants = [];
    $scope.sortField = 'name';
    $scope.reverse = false;

    Tenants.list()
      .then(function(data) {
        $scope.tenants = data;
      }, function(error) {
        console.log(error.stack);
        $state.go('login');
      });
  });

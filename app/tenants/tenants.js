angular.module('tenants', [])
  .service('tenantsService', function($http, $q, sessionService) {
    return {
      list: list
    };

    function list() {
      return $http.get('http://192.168.122.183:5000/v2.0/tenants')
        .then(function(response){
          return response.data;
        }, function(response) {
          return $q.reject(new Error('Could not get tenant list'));
        });
    };
  })
  .controller('tenantsCtrl', function($scope, $http, $state, tenantsService) {
    $scope.tenants = [];
    $scope.sortField = 'name';
    $scope.reverse = false;

    tenantsService.list()
      .then(function(data) {
        $scope.tenants = data;
      }, function(error) {
        console.log(error.stack);
        $state.go('login');
      });
  });

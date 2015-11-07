angular.module('tenants', [])
  .service('tenantsService', function($http, $q, $window, sessionService) {
    return {
      list: list
    };

    function list() {
      return sessionService.withToken()
        .then(function(token) {
          return $http.get('http://192.168.122.183:5000/v2.0/tenants')
            .then(function(response){
              console.log('tenantsService:list common $http headers in tenantsService: \n', $http.defaults.headers.common)
              console.log('tenantsService:list Response:\n' + JSON.stringify(response, null, '  '));
              return response.data;
            }, function(response) {
              return $q.reject(new Error('Could not get tenant list'));
            });
        });
    };
  })
  .controller('tenantsCtrl', function($scope, $http, $window, tenantsService){
    $scope.tenants = [];
    $scope.sortField = 'name';
    $scope.reverse = false;

    tenantsService.list()
      .then(function(data) {
        console.log('tenantsCtrl - Tenant list response:\n' + JSON.stringify(data, null, '  '));
        $scope.tenants = data;
      }, function(error) {
        console.log(error.stack);
        $window.location.href = '#/login';
      });
  });

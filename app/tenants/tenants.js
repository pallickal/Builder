angular.module('tenants', [])
  .factory('tenantsFactory', function($http, $q, $window, sessionFactory) {
    return {
      list: list
    };

    function list() {
      return sessionFactory.withToken()
        .then(function(token_id) {
          return $http.get('http://192.168.122.183:5000/v2.0/tenants')
            .then(function(response){
              console.log('tenantsFactory:list common $http headers in tenantsFactory: \n', $http.defaults.headers.common)
              console.log('tenantsFactory:list Response:\n' + JSON.stringify(response, null, '  '));
              return response.data;
            }, function(response) {
              return $q.reject(new Error('Could not get tenant list'));
            });
        });
    };
  })
  .controller('tenantsCtrl', function($scope, $http, $window, tenantsFactory){
    $scope.tenants = [];
    $scope.sortField = 'name';
    $scope.reverse = false;

    tenantsFactory.list()
      .then(function(data) {
        console.log('tenantsCtrl - Tenant list response:\n' + JSON.stringify(data, null, '  '));
        $scope.tenants = data;
      }, function(error) {
        console.log(error.stack);
        $window.location.href = '#/login';
      });
  });

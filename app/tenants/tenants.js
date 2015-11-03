angular.module('tenants', [])
  .factory('tenantsFactory', function($http, $q, $window, sessionFactory) {
    return {
      list: list
    };

    function list() {
      var deferred = $q.defer();
      sessionFactory.withToken()
        .then(function(token_id) {
          $http.get('http://192.168.122.183:5000/v2.0/tenants')
            .then(function(response){
              console.log('tenantsFactory:list common $http headers in tenantsFactory: \n', $http.defaults.headers.common)
              console.log('tenantsFactory:list Response:\n' + JSON.stringify(response, null, '  '));
              deferred.resolve(response.data);
            }, function(err_response) {
              deferred.reject(err_response);
            });
        }, function(error) {
          deferred.reject(error + '\ntenantsFactory:list - Error getting subject token');
        });
      return deferred.promise;
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
        console.log(error + '\ntenantsCtrl - Error getting tenant list');
        $window.location.href = '#/login';
      });
  });

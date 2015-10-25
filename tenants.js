angular.module('tenants', [])
  .factory('tenantsFactory', function($http, sessionFactory) {
    function withData(callback) {
      sessionFactory.withToken(function(token_id) {
        $http.get('http://192.168.122.183:5000/v2.0/tenants')
        .success(function(response){
          console.log('tenantsFactory:withData common $http headers in tenantsFactory: \n', $http.defaults.headers.common)
          console.log('tenantsFactory:withData Response:\n' + JSON.stringify(response, null, '  '));
          callback(response);
        }); <!-- add failure handling -->
      });
    };

    return {
      withData: withData
    };
  })
  .controller('tenantsCtrl', function($scope, $http, $cookies, tenantsFactory){
    $scope.tenants = [];
    $scope.sortField = 'name';
    $scope.reverse = false;

    tenantsFactory.withData(function(data) {
      $scope.tenants = data;
    });
  });

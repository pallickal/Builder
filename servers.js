angular.module('servers', [])
.factory('serversFactory', function($http, $q, sessionFactory) {
  return {
    list: list
  };

  function list(tenant_id) {
    var deferred = $q.defer();
    sessionFactory.withTenantToken(tenant_id)
      .then(function(tenant_token) {
        console.log('serversFactory:list - Tenant token =' + tenant_token);
        $http.get('http://192.168.122.183:8774/v2.1/' + tenant_id + '/servers')
          .then(function(response) {
            console.log('serversFactory:list - Common $http headers: \n', $http.defaults.headers.common)
            console.log('serversFactory:list - Response:\n' + JSON.stringify(response, null, '  '));
            deferred.resolve(response.data);
          }, function(err_response) {
            deferred.reject(err_response);
          });
      }, function(error) {
        console.log('serversFactory:list Error getting tenant token -\n' + error);
      });
    return deferred.promise;
  };
})
.controller('serversCtrl', function($scope, $routeParams, tenantsFactory, serversFactory){
  $scope.tenants = {};

  $scope.servers = {};
  $scope.sortField = 'name';
  $scope.reverse = false;

  console.log('serversCtrl: $routeParams:\n' + JSON.stringify($routeParams, null, '  '));
  tenantsFactory.list()
    .then(function(data) {
      console.log('serversCtrl:tenantsFactory.list Data:\n' + JSON.stringify(data, null, '  '));
      $scope.tenants = data;
      if ($scope.tenants.tenants[0]) {
        serversFactory.list($scope.tenants.tenants[0].id)
          .then(function(data) {
            console.log('serversCtrl:serversFactory.list Data:\n' + JSON.stringify(data, null, '  '));
            $scope.servers = data;
          }, function(error) {
            console.log('serversCtrl:serversFactory.list Error:\n' + JSON.stringify(error, null, '  '));
          });
      } else {
        console.log('serversCtrl:tenantsFactory.list $scope.tenants.tenants[0] undefined - $scope.tenants = :\n' + JSON.stringify(data, null, '  '));
      }
    }, function(error) {
      console.log('serversCtrl:tenantsFactory.list Error:\n' + JSON.stringify(error, null, '  '));
    });
});

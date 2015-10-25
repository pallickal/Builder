angular.module('servers', [])
.factory('serversFactory', function($http, sessionFactory) {
  function withData(tenant_id, callback) {
    sessionFactory.withTenantToken(tenant_id, function(tenant_token) {
      console.log('serversFactory:withData - sessionFactory:withTenantToken - ' + tenant_token);
      $http.get('http://192.168.122.183:8774/v2.1/' + tenant_id + '/servers')
        .success(function(response) {
          console.log('common $http headers in serversFactory: \n', $http.defaults.headers.common)
          console.log('Servers response:\n' + JSON.stringify(response, null, '  '));
          callback(response);
        }); <!-- add failure handling -->
    });
  };

  return {
    withData: withData
  };
})
.controller('serversCtrl', function($scope, $routeParams, tenantsFactory, serversFactory){
  $scope.tenants = {};

  $scope.servers = {};
  $scope.sortField = 'name';
  $scope.reverse = false;

  console.log('serversCtrl: $routeParams:\n' + JSON.stringify($routeParams, null, '  '));
  tenantsFactory.withData(function(data) {
    $scope.tenants = data;
    if ($scope.tenants.tenants[0]) {
      serversFactory.withData($scope.tenants.tenants[0].id, function(data) {
        $scope.servers = data;
      });
    }
  });
});

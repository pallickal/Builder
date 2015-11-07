angular.module('servers', [])
  .factory('serversFactory', function($http, $q, sessionFactory) {
    return {
      list: list
    };

    function list(tenant_id) {
      return sessionFactory.withTenantToken(tenant_id)
        .then(function(tenant_token) {
          return $http.get('http://192.168.122.183:8774/v2.1/' + tenant_id + '/servers')
            .then(function(response) {
              console.log('serversFactory:list - Common $http headers: \n', $http.defaults.headers.common)
              console.log('serversFactory:list - Response:\n' + JSON.stringify(response, null, '  '));
              return response.data;
            }, function(response) {
              return $q.reject(new Error('Could not get server list for tenant ' + tenant_id));
            });
        });
    };
  })
  .controller('serversCtrl', function($scope, $routeParams, $window, serversFactory){
    $scope.servers = {};
    $scope.sortField = 'name';
    $scope.reverse = false;

    console.log('serversCtrl: $routeParams:\n' + JSON.stringify($routeParams, null, '  '));
    serversFactory.list($routeParams.tenant_id)
      .then(function(data) {
        console.log('serversCtrl - server listing success - data =\n' + JSON.stringify(data, null, '  '));
        $scope.servers = data;
      }, function(error) {
        console.log(error.stack);
        $window.location.href = '#/login';
      });
  });

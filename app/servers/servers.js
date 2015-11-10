angular.module('servers', [])
  .service('serversService', function($http, $q, sessionService) {
    return {
      list: list
    };

    function list(tenantId) {
      return $http.get('http://192.168.122.183:8774/v2.1/' + tenantId + '/servers')
        .then(function(response) {
          console.log('serversService:list - Common $http headers: \n', $http.defaults.headers.common)
          console.log('serversService:list - Response:\n' + JSON.stringify(response, null, '  '));
          return response.data;
        }, function(response) {
          return $q.reject(new Error('Could not get server list for tenant ' + tenantId));
        });
    };
  })
  .controller('serversCtrl', function($scope, $routeParams, $window, serversService){
    $scope.servers = {};
    $scope.sortField = 'name';
    $scope.reverse = false;

    console.log('serversCtrl: $routeParams:\n' + JSON.stringify($routeParams, null, '  '));
    serversService.list($routeParams.tenantId)
      .then(function(data) {
        console.log('serversCtrl - server listing success - data =\n' + JSON.stringify(data, null, '  '));
        $scope.servers = data;
      }, function(error) {
        console.log(error.stack);
        $window.location.href = '#/login';
      });
  });

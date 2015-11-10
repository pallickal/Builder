angular.module('servers', [])
  .service('serversService', function($http, $q, sessionService) {
    return {
      list: list
    };

    function list(tenantId) {
      return $http.get('http://192.168.122.183:8774/v2.1/' + tenantId + '/servers')
        .then(function(response) {
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

    serversService.list($routeParams.tenantId)
      .then(function(data) {
        $scope.servers = data;
      }, function(error) {
        console.log(error.stack);
        $window.location.href = '#/login';
      });
  });

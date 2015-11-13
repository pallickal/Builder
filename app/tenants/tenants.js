angular.module('tenants', [])
  .service('Tenants', function($http, $q, $rootScope) {
    var service = {
      list: list,
      currentTenantId: currentTenantId,
      setCurrentTenantId: setCurrentTenantId
    };

    var currTenantId;

    return service;

    function list() {
      return $http.get('http://192.168.122.183:5000/v2.0/tenants')
        .then(function(response) {
          if (!currTenantId) {
            currTenantId = response.data.tenants[0].id;
            $rootScope.$broadcast('tenants:currentTenant:updated', currTenantId);
          }
          return response.data.tenants;
        }, function(response) {
          return $q.reject(new Error('Could not get tenant list'));
        });
    };

    function currentTenantId() {
      return currTenantId;
    }

    function setCurrentTenantId(tenantId) {
      currTenantId = tenantId;
      $rootScope.$broadcast('tenants:currentTenant:updated', currTenantId);
    }
  })
  .controller('tenantsCtrl', function($scope, $http, $state, Tenants) {
    $scope.tenants = [];
    $scope.sortField = 'name';
    $scope.reverse = false;

    Tenants.list()
      .then(function(data) {
        $scope.tenants = data;
      }, function(error) {
        console.log(error.stack);
        $state.go('login');
      });
  });

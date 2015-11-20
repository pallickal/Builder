angular.module('osAPI.Tenants', [])
  .service('Tenants', function($http, $q, $rootScope) {
    var service = {
      list: list,
      currentTenantId: currentTenantId,
      setCurrentTenantId: setCurrentTenantId
    };

    var currTenantId, requestedAt, requestPromise;

    return service;

    function list() {
      if (requestedAt) {
        var secSinceRequested = moment().diff(requestedAt, 'seconds');
        if (secSinceRequested <= 7) return requestPromise;
      }
      return retrieveTenants();
    };

    function currentTenantId() {
      return currTenantId;
    }

    function setCurrentTenantId(tenantId) {
      currTenantId = tenantId;
      $rootScope.$broadcast('tenants:currentTenant:updated', currTenantId);
    }

    function retrieveTenants() {
      requestedAt = moment();
      requestPromise = $http.get('http://192.168.122.183:5000/v2.0/tenants')
        .then(function(response) {
          if (!currTenantId) {
            currTenantId = response.data.tenants[0].id;
            $rootScope.$broadcast('tenants:currentTenant:updated', currTenantId);
          }
          return response.data.tenants;
        }, function(response) {
          requestedAt = null;
          return $q.reject(new Error('Could not get tenant list'));
        });
      return requestPromise;
    }

  });

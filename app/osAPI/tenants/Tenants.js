angular.module('osAPI.tenants', [])
  .service('Tenants', function($http, $q, $localStorage, $rootScope) {
    var service = {
      list: list,
      currentTenantId: currentTenantId,
      setCurrentTenantId: setCurrentTenantId,
      remove: remove
    };

    var requestedAt, requestPromise;

    return service;

    function list() {
      if (requestedAt && requestPromise) {
        var secSinceRequested = moment().diff(requestedAt, 'seconds');
        if (secSinceRequested <= 7) {
          return requestPromise
            .then(function(tenants) {
              if (!currentTenantId()) {
                setCurrentTenantId(tenants[0].id);
              }
              return tenants;
            });
        }
      }
      return uncached()
        .then(function(tenants) {
          if (!currentTenantId()) {
            setCurrentTenantId(tenants[0].id);
          } else {
            validateTenantId(currentTenantId());
          }
          return tenants;
        });
    };

    function currentTenantId() {
      return $localStorage.currentTenantId;
    }

    function setCurrentTenantId(tenantId) {
      $localStorage.currentTenantId = tenantId;
      validateTenantId(tenantId);
    }

    function uncached() {
      requestedAt = moment();
      requestPromise = $http.get('http://192.168.122.183:5000/v2.0/tenants')
        .then(function(response) {
          return response.data.tenants;
        }, function(response) {
          requestedAt = null;
          return $q.reject(new Error('Could not get tenant list'));
        });
      return requestPromise;
    }

    function remove() {
      delete $localStorage.currentTenantId;
    }

    function validateTenantId(tenantId) {

      function validate(tenants) {
        function tenantIdMatch(element, index, array) {
          if (element.id == tenantId) return true;
        }

        if (!tenants.find(tenantIdMatch)) {
          $rootScope.$broadcast('tenants:currentTenant:invalid', tenantId);
        }
      }

      return list()
        .then(function(data) {
          validate(data);
          $rootScope.$broadcast('tenants:currentTenant:updated',
                                currentTenantId());
        })
        .catch(function(error) {
          console.log(error.stack);
        });
    }
  });

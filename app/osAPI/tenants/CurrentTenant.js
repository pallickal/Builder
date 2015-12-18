angular.module('osAPI.tenants')
  .service('CurrentTenant', function($localStorage, $q, $rootScope, Tenants,
    CallbackChain) {
    var onErrorCallbackChain = new CallbackChain;

    var service = {
      id: id,
      setId: setId,
      setIdWithoutErrorCallbacks: setIdWithoutErrorCallbacks,
      validateId : validateId,
      onErrorCallbackChain: onErrorCallbackChain,
      remove: remove
    };
    return service;

    function id() {
      return $localStorage.currentTenantId;
    }

    function setId(tenantId) {
      console.log('CurrentTenant:setId - calling setIdWithoutErrorCallbacks()');
      return setIdWithoutErrorCallbacks(tenantId)
        .catch(function(error) {
          console.log('CurrentTenant:setId - setIdWithoutErrorCallbacks rejected - about to call onErrorCallbackChain.run()');
          return onErrorCallbackChain.run().catch(setIdErrorHandler);
        });
    }

    function setIdWithoutErrorCallbacks(tenantId) {
      var oldId = id();
      return validateId(tenantId)
        .then(function() {
          $localStorage.currentTenantId = tenantId;
          console.log('CurrentTenant:setIdWithoutErrorCallbacks - validate resolved - setting currentTenantId to ' + tenantId);
          if (tenantId != oldId) {
            $rootScope.$broadcast('tenants:currentTenant:updated', tenantId);
          }
          return tenantId;
        })
        .catch(function(error) {
          console.log('CurrentTenant:setIdWithoutErrorCallbacks - validate rejected - bad tenantId = ' + tenantId);
          return $q.reject(error);
        });
    }

    function validateId(tenantId) {
      return Tenants.list()
        .then(function(tenants) {
          if (tenantIdExistsIn(tenants)) {
            console.log('CurrentTenant:validateId - tenantIdExistsIn() returned true - resolving');
            return tenantId;
          }
          console.log('CurrentTenant:validateId - tenantIdExistsIn() returned false - rejecting');
          return $q.reject(new Error('Could not validate tenantId ' +
                                     tenantId));
        });

        function tenantIdExistsIn(tenants) {
          return tenants.find(function(element, index, array) {
            if (element.id == tenantId) return true;
          });
        }
    }

    function remove() {
      delete $localStorage.currentTenantId;
    }

    function setIdErrorHandler() {
      console.log('CurrentTenant:setIdErrorHandler - onErrorCallbackChain callback #3 - $stateParams does not validate, try id() = ' + id());
      return setIdWithoutErrorCallbacks(id())
        .catch(function(error) {
          Tenants.list()
            .then(function(tenants) {
              console.log('CurrentTenant:setIdErrorHandler - onErrorCallbackChain callback #4 - try setId() with Tenants.list()[0].id = ' + tenants[0].id);
              return setIdWithoutErrorCallbacks(tenants[0].id);
            });
        })
    }
  });

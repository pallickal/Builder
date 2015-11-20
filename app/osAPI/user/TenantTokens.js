angular.module('osApp.user')
  .service('TenantTokens', function($interval, $http, $localStorage, $q,
    $injector, UserToken) {
    return {
      use: use,
      cached: cached,
      get: get,
      remove: remove
    };

    function use(tenantId) {
      var token = cached(tenantId);

      if (token) {
        return $q.resolve(token);
      } else {
        return get(tenantId);
      }
    }

    function cached(tenantId) {
      var tenantTokens = $localStorage.tenantTokens;
      var tenantToken;

      if (tenantTokens) tenantToken = tenantTokens[tenantId];
      return tenantToken;

    }

    function get(tenantId) {
      return UserToken.use()
        .then(function(userToken) {
          var data = {
            "auth": {
              "token": {
                "id": userToken.id
              },
              "tenantId": tenantId
            }
          };

          return $http.post('http://192.168.122.183:35357/v2.0/tokens', data)
            .then(
              function(response) {
                set(tenantId, response.data);
                return cached(tenantId);
              },
              function(response) {
                return $q.reject(new Error('Error getting tenant token for id ' + tenantId));
              }
            );
        });
    }

    function remove() {
      delete $localStorage.tenantTokens;
    }

    function set(tenantId, data) {
      $localStorage.tenantTokens = $localStorage.tenantTokens || {};
      token = angular.copy(data.access.token);
      token.responseData = data;
      $localStorage.tenantTokens[tenantId] = token;
    }
  });

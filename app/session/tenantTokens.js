angular.module('tenantTokens', ['token'])
  .service('tenantTokensService', function($interval, $http, $cookies, $q, tokenService) {
    return {
      get: get,
      setDirty: setDirty,
      renewDirty: renewDirty,
      renew: renew,
      remove: remove
    };

    function get(tenantId) {
      var tenantTokens = $cookies.getObject('Tenant-Tokens');
      var requestedToken;

      if (tenantTokens) requestedToken = tenantTokens[tenantId];
      console.log(
        'tenantTokensService:get - |Tenant-Tokens|["' + tenantId + '"] = ' +
        JSON.stringify(requestedToken, null, '  ')
      );

      return requestedToken;
    }

    function setDirty(tenantId) {
      var token = get(tenantId);
      console.log('tenantTokensService:setDirty - setting tenant ' + tenantId + ' token dirty');
      token.dirty = true;
      set(tenantId, token.id, token.expiresAt, token.dirty);
    };

    function renewDirty() {
      var tokens = $cookies.getObject('Tenant-Tokens');

      for (tenantId in tokens) {
        if (tokens[tenantId].dirty) {
          console.log('tenantTokensService:renewDirty - token for tenantId ' + tenantId + ' is dirty');
          renew(tokenService.get().id, tenantId)
            .catch(function(error) {
              console.log(error.stack);
            });
        }
      }
    }

    function renew(subjectTokenId, tenantId) {
      var data = {
        "auth": {
          "token": {
            "id": subjectTokenId
          },
          "tenantId": tenantId
        }
      };
      console.log('tenantTokensService:renew - Request data\n' + JSON.stringify(data, null, '  '));

      return $http.post('http://192.168.122.183:35357/v2.0/tokens', data)
        .then(
          function(response) {
            console.log('tenantTokensService:renew - Response:\n' + JSON.stringify(response, null, '  '));
            set(tenantId, response.data.access.token.id, response.data.access.token.expires);
            return get(tenantId);
          },
          function(response) {
            return $q.reject(new Error('Error getting tenant token for id ' + tenantId));
          }
        );
    }

    function remove() {
      $cookies.remove('Tenant-Tokens');
      console.log(
        "tenantTokenService:remove - Tenant tokens removed. |Tenant-Tokens| = " +
        JSON.stringify($cookies.getObject('Tenant-Tokens'), null, '  ')
      );
    }

    function set(tenantId, tenantToken, expiresAt, dirty) {
      tenantTokens = $cookies.getObject('Tenant-Tokens') || {};
      token = {
        'id': tenantToken,
        'dirty': (dirty ? true : false),
        'expiresAt': expiresAt,
        'storedAt': moment().toISOString()
      };
      tenantTokens[tenantId] = token;
      $cookies.putObject('Tenant-Tokens', tenantTokens, {expires: token.expiresAt});
      console.log(
        "tenantTokenService:set - Added tenantId " + tenantId +
        "\n|Tenant-Tokens| = " +
        JSON.stringify($cookies.getObject('Tenant-Tokens'), null, '  ')
      );
    }
  });

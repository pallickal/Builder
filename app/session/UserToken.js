angular.module('token', [])
  .service('UserToken', function($interval, $q, $http, $cookies) {
    return {
      cached: cached,
      setDirty: setDirty,
      renewDirty: renewDirty,
      renew: renew,
      set: set,
      remove: remove
    };

    function cached() {
      return $cookies.getObject('User-Token');
    }

    function setDirty() {
      var token = cached();
      token.dirty = true;
      set(token.id, token.expiresAt, token.dirty);
    };

    function renewDirty() {
      var token = cached();
      if (token && token.dirty) {
        renew()
          .catch(function(error) {
            console.log(error.stack);
          });
      }
    }

    function renew() {
      var token = cached();
      if (!token) return $q.reject(new Error('Token never existed or expired'));

      var data = {
        "auth": {
          "token": {
            "id": token.id
          }
        }
      };

      return $http.post('http://192.168.122.183:35357/v2.0/tokens', data)
        .then(
          function(response) {
            set(response.data.access.token.id, response.data.access.token.expires);
            return cached();
          },
          function(response) {
            return $q.reject(new Error('Error retrieving user token'));
          }
        );
    }

    function set(userTokenId, expiresAt, dirty) {
      var token = {
        'id': userTokenId,
        'dirty': (dirty ? true : false),
        'expiresAt': expiresAt,
        'storedAt': moment().toISOString()
      };
      $cookies.putObject('User-Token', token, {expires: token.expiresAt});
    }

    function remove() {
      $cookies.remove('User-Token');
    }
  });

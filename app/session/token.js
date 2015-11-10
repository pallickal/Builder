angular.module('token', [])
  .service('tokenService', function($interval, $q, $http, $cookies) {
    return {
      get: get,
      setDirty: setDirty,
      renewDirty: renewDirty,
      renew: renew,
      set: set,
      remove: remove
    };

    function get() {
      return $cookies.getObject('X-Subject-Token');
    }

    function setDirty() {
      var token = get();
      token.dirty = true;
      set(token.id, token.expiresAt, token.dirty);
    };

    function renewDirty() {
      var token = get();
      if (token && token.dirty) {
        renew()
          .catch(function(error) {
            console.log(error);
            console.log(error.stack);
          });
      }
    }

    function renew() {
      var token = get();

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
          return get();
        },
        function(response) {
          return $q.reject(new Error('Error retrieving subject token'));
        }
      );
    }

    function set(subjectTokenId, expiresAt, dirty) {
      var token = {
        'id': subjectTokenId,
        'dirty': (dirty ? true : false),
        'expiresAt': expiresAt,
        'storedAt': moment().toISOString()
      };
      $cookies.putObject('X-Subject-Token', token, {expires: token.expiresAt});
    }

    function remove() {
      $cookies.remove('X-Subject-Token');
    }
  });

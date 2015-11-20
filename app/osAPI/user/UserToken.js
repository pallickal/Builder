angular.module('osApp.user')
  .service('UserToken', function($interval, $q, $http, $localStorage) {
    return {
      use: use,
      cached: cached,
      get: get,
      set: set,
      remove: remove
    };

    function use(tenantId) {
      var token = cached();

      if (token) {
        return $q.resolve(token);
      } else {
        return $q.reject(new Error('User token has expired.'));
      }
    }

    function cached() {
      return $localStorage.userToken;
    }

    function get() {
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
            set(data);
            return cached();
          },
          function(response) {
            return $q.reject(new Error('Error retrieving user token'));
          }
        );
    }

    function set(data) {
      var token = angular.copy(data.access.token);
      token.responseData = data;
      $localStorage.userToken = token;
    }

    function remove() {
      delete $localStorage.userToken
    }
  });

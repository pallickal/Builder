angular.module('user', [])
  .service('userService', function($http, $q, $cookies, subjectTokenService, tenantTokensService) {
    return {
      signIn: signIn,
      signOut: signOut
    };

    function signIn(userName, password) {
      var data = {
        "auth": {
          "passwordCredentials": {
            "username": userName,
            "password": password
          }
        }
      };

      signOut();

      return $http.post('http://192.168.122.183:5000/v2.0/tokens', data)
        .then(function(response) {
          subjectTokenService.set(response.data.access.token.id, response.data.access.token.expires);
          set(response.data.access.user);
        }, function(response) {
          return $q.reject(new Error('Error signing in'));
        });
    };

    function signOut() {
      subjectTokenService.remove();
      tenantTokensService.remove();
      remove();
    }

    function set(data) {
      $cookies.putObject('User', data, {expires: moment().add(8, 'hours').toISOString()});
    }

    function remove() {
      $cookies.remove('User');
    }
  });

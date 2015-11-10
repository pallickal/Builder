angular.module('user', [])
  .service('userService', function($http, $q, $cookies, tokenService, tenantTokensService) {
    return {
      signIn: signIn,
      signOut: signOut
    };

    function signIn(userName, password) {
      var data = {
                        "auth": {
                          "identity": {
                            "methods": [
                              "password"
                            ],
                            "password": {
                              "user": {
                                "domain": {
                                  "name": "default"
                                },
                                "name": userName,
                                "password": password
                              }
                            }
                          }
                        }
                      };

      signOut();

      return $http.post('http://192.168.122.183:35357/v3/auth/tokens', data)
        .then(function(response) {
          tokenService.set(response.headers('X-Subject-Token'), response.data.token.expires_at);
          set(response.data.token.user);
        }, function(response) {
          return $q.reject(new Error('Error signing in'));
        });
    };

    function signOut() {
      tokenService.remove();
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

angular.module('osApp.user')
.service('sessionInterceptor', function($injector, $q, $urlMatcherFactory) {
  var service = {
    request: request
  }

  var routes = [
    { url: 'http://192.168.122.183:5000/v2.0/tenants', tokenType: 'user' },
    { url: 'http://192.168.122.183:8774/v2.1/:tenantId/servers', tokenType: 'tenant' },
    { url: 'http://192.168.122.183:8774/v2.1/:tenantId/servers/:serverId', tokenType: 'tenant' },
    { url: 'http://192.168.122.183:8774/v2.1/:tenantId/flavors/detail', tokenType: 'tenant' },
    { url: 'http://192.168.122.183:9292/v2/images', tokenType: 'tenant' }
  ];

  return service;

  function request(config) {
    var Session = $injector.get('Session');

    return withTokenForUrl(config.url)
      .then(function(token) {
        if (token) config.headers['X-Auth-Token'] = token.id;
        return config;
      }, function(error) {
        console.log(error.stack);
        return config;
      });
  }

  function withTokenForUrl(url) {
    for (var i = 0; i < routes.length; i++) {
      var route = routes[i];
      route.urlMatcher = route.urlMatcher || $urlMatcherFactory.compile(route.url);
      var match = route.urlMatcher.exec(url);
      if (match) {
        var Session = $injector.get('Session');
        switch (route.tokenType) {
          case 'user':
            return Session.userToken();
            break;
          case 'tenant':
            return Session.tenantToken(match.tenantId);
            break;
        }
      }
    }
    return $q.resolve();
  }
})
.config(function($httpProvider) {
  $httpProvider.interceptors.push('sessionInterceptor');
});

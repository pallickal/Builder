angular.module('session')
.service('sessionInterceptor', function($injector, $q, $urlMatcherFactory) {
  var routes = [
    { url: 'http://192.168.122.183:5000/v2.0/tenants', tokenType: 'subject' },
    { url: 'http://192.168.122.183:8774/v2.1/:tenantId/servers', tokenType: 'tenant' }
  ];

  return { request: request };

  function request(config) {
    var sessionService = $injector.get('sessionService');

    console.log('Intercepted:\n' + JSON.stringify(config, null, '  '));

    return withTokenForUrl(config.url)
      .then(function(token) {
        if (token) config.headers['X-Auth-Token'] = token.id;
        return config;
      }, function(error) {
        console.log(error);
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
        var sessionService = $injector.get('sessionService');
        switch (route.tokenType) {
          case 'subject':
            return sessionService.withSubjectToken();
            break;
          case 'tenant':
            return sessionService.withTenantToken(match.tenantId);
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

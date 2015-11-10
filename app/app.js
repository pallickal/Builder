angular.module('osApp', ['ngRoute', 'ngCookies', 'session', 'login', 'tenants', 'servers'])
  .config(function($routeProvider) {
    $routeProvider.
      when('/login',{
        templateUrl: 'app/login/login.html',
        <!-- logged in ? redirect to /first_tenant/servers -->
        controller: 'loginCtrl'
      }).
      when('/tenants',{
        templateUrl: 'app/tenants/tenants.html',
        controller: 'tenantsCtrl'
      }).
      when('/:tenantId/servers/',{
        templateUrl: 'app/servers/servers.html',
        controller: 'serversCtrl'
      }).
      otherwise({
        redirectTo: '/login'
      });
  });

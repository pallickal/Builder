angular.module('osApp', ['ngRoute', 'ngCookies', 'login', 'session', 'tenants', 'servers'])
  .config(function($routeProvider) {
    $routeProvider.
      when('/login',{
        templateUrl: 'login.html',
        <!-- logged in ? redirect to /first_tenant/servers -->
        controller: 'loginCtrl'
      }).
      when('/tenants',{
        templateUrl: 'tenants.html',
        controller: 'tenantsCtrl'
      }).
      when('/:tenant_id/servers/',{
        templateUrl: 'servers.html',
        controller: 'serversCtrl'
      }).
      otherwise({
        redirectTo: '/login'
      });
  });

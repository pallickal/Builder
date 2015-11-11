angular.module('osApp', ['ui.router', 'ngCookies', 'session', 'login', 'tenants', 'servers'])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.
      state('login',{
        url: '/login',
        templateUrl: 'app/login/login.html',
        controller: 'loginCtrl'
      }).
      state('tenants',{
        url: '/tenants',
        templateUrl: 'app/tenants/tenants.html',
        controller: 'tenantsCtrl'
      }).
      state('servers',{
        url: '/:tenantId/servers',
        templateUrl: 'app/servers/servers.html',
        controller: 'serversCtrl'
      });
      $urlRouterProvider.otherwise('/login');
  });

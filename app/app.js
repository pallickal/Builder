angular.module('osApp', ['ui.router', 'ngCookies', 'session', 'login', 'tenants', 'servers'])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('app', {
        abstract: true,
        views: {
          'header': { templateUrl: 'app/shared/header.html' },
          'sidebar': { templateUrl: 'app/shared/sidebar.html' },
          'content': { template: 'content placeholder' }
        }
      })
      .state('login',{
        url: '/login',
        views: {
          'content' : {
            templateUrl: 'app/login/login.html',
            controller: 'loginCtrl'
          }
        }
      })
      .state('app.tenants', {
        url: '/tenants',
        views: {
          'content@' : {
            templateUrl: 'app/tenants/tenants.html',
            controller: 'tenantsCtrl'
          }
        }
      })
      .state('app.servers', {
        url: '/:tenantId/servers',
        views: {
          'content@' : {
            templateUrl: 'app/servers/servers.html',
            controller: 'serversCtrl'
          }
        }
      });
      $urlRouterProvider.otherwise('/login');
  });

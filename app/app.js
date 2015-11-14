angular.module('osApp', ['ngCookies', 'ui.router', 'ui.bootstrap', 'session',
  'login', 'header', 'sidebar', 'tenants', 'servers'])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('login',{
        url: '/login',
        views: {
          'content' : {
            templateUrl: 'app/login/login.html',
            controller: 'loginCtrl'
          }
        }
      })
      .state('app', {
        abstract: true,
        views: {
          'header': {
            templateUrl: 'app/shared/header.html',
            controller: 'headerCtrl'
          },
          'sidebar': {
            templateUrl: 'app/shared/sidebar.html',
            controller: 'sidebarCtrl'
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

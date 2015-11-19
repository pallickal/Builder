angular.module('builderApp', ['ngCookies', 'ui.router', 'ui.bootstrap', 'session',
  'login', 'header', 'sidebar', 'tenants', 'servers'])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('login',{
        url: '/login',
        views: {
          'content' : {
            templateUrl: 'app/login/login.html',
            controller: 'loginController'
          }
        }
      })
      .state('app', {
        abstract: true,
        views: {
          'header': {
            templateUrl: 'app/shared/header.html',
            controller: 'headerController'
          },
          'content': {
            templateUrl: 'app/shared/sidebarLayout.html',
          },
          'sidebar@app': {
            templateUrl: 'app/shared/sidebar.html',
            controller: 'sidebarController'
           }
        }
      })
      .state('app.tenants', {
        url: '/tenants',
        views: {
          'sideBarTarget' : {
            templateUrl: 'app/tenants/tenants.html',
            controller: 'tenantsController'
          }
        }
      })
      .state('app.servers', {
        url: '/:tenantId/servers',
        views: {
          'sideBarTarget' : {
            templateUrl: 'app/servers/servers.html',
            controller: 'serversController'
          }
        }
      });
      $urlRouterProvider.otherwise('/login');
  });

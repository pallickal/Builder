angular.module('builderApp', ['ngCookies', 'ui.router', 'ui.bootstrap',
  'login', 'header', 'sidebar', 'tenants', 'servers', 'osAPI'])
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
            templateUrl: 'app/layout/header.html',
            controller: 'headerController'
          },
          'content': {
            templateUrl: 'app/layout/sidebarLayout.html',
          },
          'sidebar@app': {
            templateUrl: 'app/layout/sidebar.html',
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
  })
  .filter('bytes', function() {
    return function(bytes, precision) {
      if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
      if (bytes === 0) return '0 bytes';
      if (typeof precision === 'undefined') precision = 1;
      var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
        number = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
    }
  });

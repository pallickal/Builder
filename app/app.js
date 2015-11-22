angular.module('builderApp', ['ui.router', 'ngStorage', 'ui.bootstrap', 'osAPI',
  'builderApp.signIn', 'builderApp.header', 'builderApp.sidebar',
  'builderApp.tenants', 'builderApp.servers'])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('signIn',{
        url: '/sign-in',
        views: {
          'content' : {
            templateUrl: 'app/signIn/signIn.html',
            controller: 'SignInController'
          }
        }
      })
      .state('app', {
        abstract: true,
        views: {
          'header': {
            templateUrl: 'app/layout/header.html',
            controller: 'HeaderController'
          },
          'content': {
            templateUrl: 'app/layout/sidebarLayout.html',
            controller: 'SidebarController'
          }
        }
      })
      .state('app.tenants', {
        url: '/tenants',
        views: {
          'sideBarTarget' : {
            templateUrl: 'app/tenants/tenants.html',
            controller: 'TenantsController'
          }
        }
      })
      .state('app.servers', {
        url: '/:tenantId/servers',
        views: {
          'sideBarTarget' : {
            templateUrl: 'app/servers/servers.html',
            controller: 'ServersController'
          }
        }
      });
      $urlRouterProvider.otherwise('/sign-in');
  })
  .run(function($stateParams, $rootScope, Tenants) {
    $rootScope.$watch(function() {
      return $stateParams.tenantId;
    }, function(newTenantId, oldTenantId) {
      if (newTenantId && (newTenantId != oldTenantId)) {
        Tenants.setCurrentTenantId($stateParams.tenantId);
      }
    });
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

angular.module('tokensPolling', ['token', 'tenantTokens'])
  .service('tokensPollingService', function($interval, $q, $http, UserToken, TenantTokens) {
    return {
      start: start,
      stop: stop
    };

    var intervalPromise;

    function start() {
      stop();
      intervalPromise = $interval(refreshDirtyToken, 30000, false);
    };

    function stop() {
      $interval.cancel(intervalPromise);
    };

    function refreshDirtyToken() {
      TenantTokens.renewDirty();
      UserToken.renewDirty();
    };
  })
  .run(function(tokensPollingService) {
    tokensPollingService.start();
  });

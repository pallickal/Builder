angular.module('osAPI.callbackChains', [])
  .factory('CallbackChain', function() {
    var CallbackChain = function() {
      var callbacks = [];

      this.add = function(metadataOrCallback, callback) {
        var callbackData;

        if (angular.isFunction(metadataOrCallback)) {
          callbackData = { callback: metadataOrCallback };
        }
        else {
          callbackData = metadataOrCallback || {};
          if (callback) callbackData.callback = callback;
        }

        throwErrorIfDuplicate(callbackData);
        callbacks.push(callbackData);
      }

      this.run = function() {
        var rootCallbackData = callbacks.find(
          function(element, index, array) {
            return !element.before;
          }
        );
        return chainAndRun(rootCallbackData);
      }

      this.get = function() {
        var rootCallbackData = callbacks.find(
          function(element, index, array) {
            return !element.before;
          }
        );

        function buildChain() {
          var chain = [];
          for (var callBackData = rootCallbackData; callBackData;
               callBackData = callbacks.find(function(element) {
                  return element.before == callBackData.name;
                })
              )
          {
            chain.push(callBackData);
          }
          return chain;
        }

        return buildChain();
      }

      this.getUnchained = function() {
        return callbacks;
      }

      this.remove = function(name) {
        var pre = callbacks.length;
        callbacks = callbacks.filter(function(element, index, array) {
          return element.name != name;
        });
        var post = callbacks.length;
        if (pre === post) throw(new Error('Callback with name + ' + name +
                                          ' does not exist. Nothing removed.'));
      }

      var chainAndRun = function(callbackData) {
        var nextCallbackData = callbacks.find(
          function(element, index, array) {
            return element.before == callbackData.name;
          }
        );

        if (nextCallbackData) {
          return chainAndRun(nextCallbackData)
            .catch(function() {
              return callbackData.callback();
            });
        }
        else {
          return callbackData.callback();
        }
      }

      var throwErrorIfDuplicate = function(callbackData) {
        var messages = [], dupName, dupBefore;

        for (i = 0; i < callbacks.length; i++) {
          if (callbacks[i].name == callbackData.name) dupName = true;
          if (callbacks[i].before == callbackData.before) dupBefore = true;
        }
        if (dupName) {
          messages.push('Cannot add callback named ' + callbackData.name +
                        ', that name is already taken by another callback.');
        }
        if (dupBefore) {
          messages.push('Cannot add callback named ' + callbackData.name +
                        ', its before pointer,' + callbackData.before +
                        ', is already taken by another callback.');
        }
        if (dupName || dupBefore) {
          messages = messages.join('\n');
          throw new Error(messages);
        }
      }
    }
    return CallbackChain;
  });

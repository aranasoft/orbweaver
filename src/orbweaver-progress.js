(function (window, angular, undefined) {
  'use strict';

  var orbweaver = angular.module('orbProgress', ['orbResource', 'ngResource']);

  orbweaver.factory("orbRestfulProgressService", ['$q', 'orbProgressService', function ($q, orbRestfulResource, orbProgressService) {
    var defer = function (fn, params) {
      params = params || {};
      var deferred = $q.defer();
      orbProgressService.start();
      fn(params,
        function (response) {
          orbProgressService.done();
          deferred.resolve(response);
        },
        function (response) {
          orbProgressService.done();
          deferred.reject(response);
        });
      return deferred.promise;
    };

    var deferInstance = function (inst, fn, params) {
      params = params || {};
      var deferred = $q.defer();
      orbProgressService.start();
      inst[fn](params,
        function (response) {
          orbProgressService.done();
          deferred.resolve(response);
        },
        function (response) {
          orbProgressService.done();
          deferred.reject(response);
        });
      return deferred.promise;
    };

    return {
      withPromises: function (RestfulResource) {
        return {
          empty: function () {
            return new RestfulResource();
          },
          all: function (params) {
            return defer(RestfulResource.query, params);
          },
          find: function (id, params) {
            params = params || {};
            params = _.extend(params, {id: id});
            return defer(RestfulResource.get, params);
          },
          save: function (res, params) {
            params = params || {};
            if (res.id) {
              params = _.extend(params, {id: res.id});
              return deferInstance(res, "$update", params);
            } else {
              return deferInstance(res, "$create", params);
            }
          },
          'delete': function (res, params) {
            params = params || {};
            params = _.extend(params, {id: res.id});
            return defer(RestfulResource['delete'], params);
          }
        };
      }
    };
  }]);

  orbweaver.factory("orbProgressService", function () {
    var progressCounter = 0;

    function incrementProgressCounter() {
      if (progressCounter === 0) {
        NProgress.start();
      }
      progressCounter++;
    }

    function decrementProgressCounter() {
      progressCounter--;
      if (progressCounter === 0) {
        NProgress.done();
      }
    }

    return {
      start: function () {
        incrementProgressCounter();
      },
      done: function () {
        decrementProgressCounter();
      }
    };
  });
})(window, window.angular);


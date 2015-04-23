(function (window, angular, undefined) {
  'use strict';

  var orbweaver = angular.module('orbResource', ['ngResource']);

  orbweaver.factory("orbRestfulResource", ['$resource', function ($resource) {
    return function (url, params, methods, options) {
      var idProperty = 'id';
      if( options && options.idProperty ) { idProperty = options.idProperty; }

      var defaults = {
        update: {method: 'put', isArray: false},
        create: {method: 'post'}
      };

      methods = angular.extend(defaults, methods);

      var resource = $resource(url, params, methods);
      resource.idProperty = idProperty;

      resource.prototype.$save = function (params, success, failure) {
        if (!this[idProperty]) {
          this.$create(params, success, failure);
        } else {
          this.$update(params, success, failure);
        }
      };

      return resource;
    };
  }]);

  orbweaver.factory("orbRestfulService", ['$q', function ($q) {
    var defer = function (fn, params) {
      params = params || {};
      var deferred = $q.defer();
      fn(params,
          function (response) {
            deferred.resolve(response);
          },
          function (response) {
            deferred.reject(response);
          });
      return deferred.promise;
    };

    var deferInstance = function (inst, fn, params) {
      params = params || {};
      var deferred = $q.defer();
      inst[fn](params,
          function (response) {
            deferred.resolve(response);
          },
          function (response) {
            deferred.reject(response);
          });
      return deferred.promise;
    };

    return function (RestfulResource) {
      var idProperty = RestfulResource.idProperty;

      return {
        empty: function () {
          return new RestfulResource();
        },
        all: function (params) {
          return defer(RestfulResource.query, params);
        },
        find: function (id, params) {
          params = params || {};
          var options = {};
          options[idProperty] = id;
          params = angular.extend(params, options);
          return defer(RestfulResource.get, params);
        },
        save: function (res, params) {
          params = params || {};
          if (res.id) {
            var options = {};
            options[idProperty] = res[idProperty];
            params = angular.extend(params, options);
            return deferInstance(res, "$update", params);
          } else {
            return deferInstance(res, "$create", params);
          }
        },
        'delete': function (res, params) {
          params = params || {};
          var options = {};
          options[idProperty] = res[idProperty];
          params = angular.extend(params, options);
          return defer(RestfulResource['delete'], params);
        }
      };
    };
  }]);
})(window, window.angular);

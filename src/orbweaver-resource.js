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
    return function (RestfulResource) {
      var idProperty = RestfulResource.idProperty;

      return {
        empty: function () {
          return new RestfulResource();
        },
        all: function (params) {
          return RestfulResource.query(params).$promise;
        },
        find: function (id, params) {
          params = params || {};
          var options = {};
          options[idProperty] = id;
          params = angular.extend(params, options);
          return RestfulResource.get(params).$promise;
        },
        save: function (inst, params) {
          params = params || {};
          if (inst.id) {
            var options = {};
            options[idProperty] = inst[idProperty];
            params = angular.extend(params, options);
            return RestfulResource.update(params, inst).$promise;
          } else {
            return RestfulResource.create(params, inst).$promise;
          }
        },
        'delete': function (inst, params) {
          params = params || {};
          var options = {};
          options[idProperty] = inst[idProperty];
          params = angular.extend(params, options);
          return RestfulResource['delete'](params).$promise;
        }
      };
    };
  }]);
})(window, window.angular);

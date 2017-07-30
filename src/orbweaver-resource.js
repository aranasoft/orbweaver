(function (window, angular, undefined) {
  'use strict';

  var orbResourceMinErr = angular.$$minErr('orbResource');
  var orbweaver = angular.module('orbResource', ['ngResource']);

  orbweaver.provider('orbRestfulResource', function RestfulResourceProvider() {
    var provider = this;

    this.defaults = {
      options: {
        idProperty: 'id',
        saveAsCreateOrUpdate: true
      },
      actions: {
        update: {method: 'PUT'},
        create: {method: 'POST'}
      }
    };

    this.$get = ['$resource', function ($resource) {
      function restfulResourceFactory (url, params, actions, options) {
        var extend = angular.extend,
          isFunction = angular.isFunction;

        actions = extend({}, provider.defaults.actions, actions);
        options = extend({}, provider.defaults.options, options);

        var resource = $resource(url, params, actions, options);
        resource.idProperty = options.idProperty;

        if (options.saveAsCreateOrUpdate !== false) {
          resource.prototype.$save = function (params, success, error) {
            if (isFunction(params)) {
              error = success; success = params; params = {};
            }
            var result = resource.save.call(this, params, this, success, error);
            return result.$promise || result;
          };
          resource.save = function(a1, a2, a3, a4) {
            var params = {}, data, success, error;

            switch (arguments.length) {
              case 4:
                error = a4;
                success = a3;
                /* falls through */
              case 3:
              case 2:
                if (isFunction(a2)) {
                  if (isFunction(a1)) {
                    throw orbResourceMinErr('badargs',
                      'Expected between first argument to not be a function [[params,] data, [success [, error]]]');
                  }

                  success = a2;
                  error = a3;
                } else {
                  params = a1;
                  data = a2;
                  success = a3;
                  break;
                }
                /* falls through */
              case 1:
                data = a1;
                break;
              default:
                throw orbResourceMinErr('badargs',
                  'Expected between 1 and 4 arguments [[params,] data, [success [, error]]], got {0} arguments',
                  arguments.length);
            }

            var method;
            if (!data[this.idProperty]) {
              method = 'create';
            } else {
              method = 'update';
            }
            return resource[method].call(this, params, data, success, error);
          };
        }

        return resource;
      }

      return restfulResourceFactory;
    }];
  });

  orbweaver.provider('orbRestfulService', ['$resourceProvider', 'orbRestfulResourceProvider', function RestfulServiceProvider($resourceProvider, orbRestfulResourceProvider) {
    this.$get = ['$q', 'orbRestfulResource', function ($q, orbRestfulResource) {
      function restfulServiceFactory(url, params, actions, options) {
        var extend = angular.extend,
          forEach = angular.forEach,
          isDefined = angular.isDefined,
          isFunction = angular.isFunction,
          isObject = angular.isObject;

        actions = extend({}, $resourceProvider.defaults.actions, orbRestfulResourceProvider.defaults.actions, actions);
        options = extend({}, orbRestfulResourceProvider.defaults.options, options);

        var resource = new orbRestfulResource(url, params, actions, options);

        function RestfulService() {
          return new resource();
        }

        RestfulService.empty = function() {
          return new resource();
        };

        if (options.saveAsCreateOrUpdate !== false) {
          RestfulService.save = function (arg1, arg2, arg3, arg4) {
            var params = {}, data, success, error;

            switch (arguments.length) {
              case 4:
                error = arg4;
                success = arg3;
                /* falls through */
              case 3:
              case 2:
                if (isFunction(arg2)) {
                  if (isFunction(arg1)) {
                    throw orbResourceMinErr('badargs',
                      'Expected first argument to not be a function [[params,] data, [success [, error]]]');
                  }

                  data = arg1;
                  success = arg2;
                  error = arg3;
                } else {
                  params = arg1;
                  data = arg2;
                  success = arg3;
                }
                break;
              case 1:
                if (isFunction(arg1)) {
                  throw orbResourceMinErr('badargs',
                    'Expected first argument to not be a function [[params,] data, [success [, error]]]');
                }
                data = arg1;
                break;
              default:
                throw orbResourceMinErr('badargs',
                  'Expected between 1 and 4 arguments [[params,] data, [success [, error]]], got {0} arguments',
                  arguments.length);
            }

            var result;
            if (isDefined(data[options.idProperty])) {
              result = resource.update.apply(this, arguments);
            } else {
              result = resource.create.apply(this, arguments);
            }
            return result.$promise || result;

          };
        }

        forEach(actions, function(action, name) {
          var hasBody = action.hasBody === true || (action.hasBody !== false && /^(POST|PUT|PATCH)$/i.test(action.method));

          RestfulService[name] = function(arg1, arg2, arg3, arg4, arg5) {
            var identity, params = {}, data, success, error;

            switch (arguments.length) {
              case 5:
              case 4:
                if (isFunction(arg3)) {
                  success = arg3;
                  error = arg4;
                } else {
                  success = arg4;
                  error = arg5;
                }
                /* falls through */
              case 3:
                if (isFunction(arg2)) {
                  error = arg3;
                  success = arg2;
                  data = arg1;
                } else if (isFunction(arg3)) {
                  error = arg4;
                  success = arg3;
                  data = arg2;
                  if (isObject(arg1)) {
                    params = arg1;
                  } else {
                    identity = arg1;
                  }
                } else {
                  data = arg3;
                  params = arg2;
                  identity = arg1;
                }
                break;
              case 2:
                if (isFunction(arg2)) {
                  if (isFunction(arg1)) {
                    error = arg2;
                  } else {
                    success = arg2;
                  }
                } else {
                  if (hasBody) {
                    data = arg2;
                    if (isObject(arg1)) {
                      params = arg1;
                    } else {
                      identity = arg1;
                    }
                  } else {
                    params = arg2;
                    identity = arg1;
                  }
                  break;
                }
                /* falls through */
              case 1:
                if (isFunction(arg1)) {
                  success = arg1;
                } else if (hasBody) {
                  data = arg1;
                } else if (isObject(arg1)) {
                  params = arg1;
                } else {
                  identity = arg1;
                }
                break;
              case 0: break;
              default:
                throw orbResourceMinErr('badargs',
                  'Expected between 1 and 5 arguments [[id,] [params,] data, [success [, error]]], got {0} arguments',
                  arguments.length);
            }

            if (isDefined(identity)) {
              var identityParams = {};
              identityParams[options.idProperty] = identity;
              params = extend({}, params, identityParams);
            }

            var result = resource[name](params, data, success, error);
            return result.$promise || result;
          };
        });

        return RestfulService;
      }

      return restfulServiceFactory;
    }];
  }]);
})(window, window.angular);

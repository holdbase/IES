'use strict';

var aService = angular.module('app.user.service', []);

aService.factory('userService', ['$http', function ($http) {
    var service = {};

    service.user = 1;

    return service;
}]);
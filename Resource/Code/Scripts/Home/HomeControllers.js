'use strict';

var appHome = angular.module('app.home.controllers', []);

appHome.controller('HomeCtrl', ['$scope', '$state', function ($scope, $state) {
    $state.go('content.resource');

    //$scope.toResource = function () {
    //    $state.go('content.resource');
    //}
}]);

/// 错误处理
appHome.controller('Error404Ctrl', ['$scope', function () {

}]);
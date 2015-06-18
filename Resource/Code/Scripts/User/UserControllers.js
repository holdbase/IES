'use strict';

var userModule = angular.module('app.user.controllers', []);

userModule.controller('UserCtrl', ['$scope', '$state', 'userProviderUrl', function ($scope, $state, userProviderUrl) {
    $scope.userName = 'test';
    $scope.password = '123';
    ///登录验证
    $scope.login = function (userName, password) {
        var url = userProviderUrl + "/Login";
        var param = { userName: userName, password: password };
        $scope.baseService.post(url, param, function (data) {
            if (data.d === 1) {
                $state.go('home');
            } else {
                alert('用户名密码错误');
            }
        });
    }

    $scope.register = function (userName, password, confirm) {
        if (password !== confirm) {
            alert('两次密码输入不一致！');
            return;
        }
        var url = userProviderUrl + "/Register";
        var param = { userName: userName, password: password };
        $scope.baseService.post(url, param, function (data) {
            console.log(data.d);
            alert('注册成功');
            $state.go('home');
        });
    }
}]);


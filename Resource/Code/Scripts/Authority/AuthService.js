'use strict';

var aService = angular.module('app.auth.services', []);

aService.factory('authService', ['httpService', function (httpService) {
    var service = {};

    service.currentUser = undefined;
    service.ocTeamRoles = undefined;

    var authProviderUrl = '/DataProvider/Authority/AuthProvider.aspx';

    ///获取用户权限
    service.LoadUserAuths = function (callback) {
        if (!service.currentUser) {
            httpService.ajaxPost(authProviderUrl, 'LoadCurrentUser', {}, function (data) {
                service.currentUser = data.d;
                httpService.ajaxPost(authProviderUrl, 'LoadUserAuths', {}, function (data) {
                    service.ocTeamRoles = data.d;
                });
            });
        } else {
            httpService.ajaxPost(authProviderUrl, 'LoadUserAuths', {}, function (data) {
                service.ocTeamRoles = data.d;
            });
        }
    }

    var findRoleByocid = function (ocid) {
        var length = service.ocTeamRoles.length;
        for (var i = 0; i < length; i++) {
            if (service.ocTeamRoles[i].OCID === ocid) return service.ocTeamRoles[i];
        }
        return null;
    }

    ///一般权限判定
    service.hasAuth = function (createrUserId, ocid) {

        ///Case1：个人资料或本人数据
        if (ocid === 0 || createrUserId === service.currentUser.UserID) {
            return true;
        }

        var ocTeamRole = findRoleByocid(ocid);

        ///Case2: 非法角色
        if (!ocTeamRole || ocTeamRole.Role === undefined || ocTeamRole.Role > 3) return false;

        ///Case3: 非本人但拥有 0 或 1 角色
        return ocTeamRole.Role === 0 || ocTeamRole.Role === 1;
    }

    ///章节权限判定 只有 Role in (0, 1)的有操作权限
    service.hasChapterAuth = function (ocid) {

        var ocTeamRole = findRoleByocid(ocid);

        ///Case2: 非法角色
        if (!ocTeamRole || ocTeamRole.Role === undefined || ocTeamRole.Role > 3) return false;

        ///Case3: 非本人但拥有 0 或 1 角色
        return ocTeamRole.Role === 0 || ocTeamRole.Role === 1;
    }

    return service;
}]);
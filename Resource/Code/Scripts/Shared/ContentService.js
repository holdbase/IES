'use strict';

var contentApp = angular.module('app.content.services', []);

contentApp.factory('contentService', ['httpService', function (httpService) {
    var service = {};

    var url = '/DataProvider/Shared/ContentProvider.aspx';

    ///当前选中课程
    service.OCID = 0;

    ///在线课程列表
    service.User_OC_List = function (callback) {
        httpService.ajaxPost(url, 'User_OC_List', null, callback);
    }

    service.OC_Get = function (callback) {
        httpService.ajaxPost(url, 'OC_Get', null, callback);
    }
    return service;
}]);
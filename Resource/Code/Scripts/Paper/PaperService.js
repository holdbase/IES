'use strict';

var aService = angular.module('app.paper.services', []);

aService.factory('PaperService', ['httpService', function (httpService) {
    var service = {};
    
    var paperProviderUrl = '/DataProvider/Paper/PaperProvider.aspx';

    var ajaxPost = function (method, param, callback) {
        var url = paperProviderUrl + '/' + method;
        httpService.post(url, param, callback);
    }

    ///获取试题类型
    service.getPaperTypes = function (callback) {
        ajaxPost('GetPaperTypes', null, callback); 
    }

    ///获取共享范围
    service.getShareRanges = function (callback) {
        ajaxPost('GetShareRanges', null, callback);
    }

    ///创建Paper对象
    service.paperGet = function (callback) {
        ajaxPost('Paper_Get', null, callback);
    }

    ///查询
    service.search = function (paper, pageSize, pageIndex, callback) {
        var param = { paper: paper, pageSize: pageSize, pageIndex: pageIndex };
        ajaxPost('Paper_Search', param, callback);
    } 

    ///课程列表
    service.User_OC_List = function (callback) {
        ajaxPost('User_OC_List', null, callback); 
    }
    return service;
}]);
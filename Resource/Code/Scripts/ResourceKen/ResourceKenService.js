'use strict';

var contentApp = angular.module('app.resken.services', []);

contentApp.factory('resourceKenService', ['httpService', function (httpService) {
    var service = {};

    var url = '/DataProvider/ResourceKen/ResourceKenProvider.aspx';

    service.ResourceKen_ADD = function (model, callback) {
        httpService.ajaxPost(url, 'ResourceKen_ADD', {model: model}, callback);
    } 

    service.ResourceKen_Del= function (model, callback) {
        httpService.ajaxPost(url, 'ResourceKen_Del', { model: model }, callback);
    }

    service.ResourceKen_List = function (ocid, searchKey, source, topNum, callback) {
        httpService.ajaxPost(url, 'ResourceKen_List', { ocid: ocid, searchKey: searchKey, source: source, topNum: topNum}, callback);
    }

    service.ResourceKen_List_Source = function (ocid, source, callback) {
        httpService.ajaxPost(url, 'ResourceKen_List_Source', { ocid: ocid, source: source}, callback);
    }

    return service;
}]);
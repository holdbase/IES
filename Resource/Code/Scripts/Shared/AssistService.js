'use strict';

var aService = angular.module('app.assist.services', []);

aService.factory('assistService', ['httpService', function (httpService) {
    var service = {};

    var url = '/DataProvider/Shared/AssistProvider.aspx';

    var difficults = [];
    var requirements = [];
    var exerciseTypes = [];
    var scopes = [];
    var shareRanges = [];

    service.Resource_Dict_Requirement_Get = function (callback) {
        if (requirements.length > 0) {
            if (callback) callback(requirements);
        } else {
            httpService.ajaxPost(url, 'Resource_Dict_Requirement_Get', null, function (data) {
                requirements = data.d;
                if (callback) callback(requirements);
            });
        }
    }

    service.Resource_Dict_Diffcult_Get = function (callback) {
        if (difficults.length > 0) {
            if (callback) callback(difficults);
        } else {
            httpService.ajaxPost(url, 'Resource_Dict_Diffcult_Get', null, function (data) {
                difficults = data.d;
                if (callback) callback(difficults);
            });
        }
    }
    service.Resource_Dict_ExerciseType_Get = function (callback) {
        if (exerciseTypes.length > 0) {
            if (callback) callback(exerciseTypes);
        } else {
            httpService.ajaxPost(url, 'Resource_Dict_ExerciseType_Get', null, function (data) {
                exerciseTypes = data.d;
                if (callback) callback(exerciseTypes);
            });
        }
    }
    service.Resource_Dict_Scope_Get = function (callback) {
        if (scopes.length > 0) {
            if (callback) callback(scopes);
        } else {
            httpService.ajaxPost(url, 'Resource_Dict_Scope_Get', null, function (data) {
                scopes = data.d;
                if (callback) callback(scopes);
            });
        }
    }
    service.Resource_Dict_ShareRange_Get = function (callback) {
        if (shareRanges.length > 0) {
            if (callback) callback(shareRanges);
        } else {
            httpService.ajaxPost(url, 'Resource_Dict_ShareRange_Get', null, function (data) {
                shareRanges = data.d;
                if (callback) callback(shareRanges);
            });
        }
    }
    service.Key_List = function (model, callback) {
        httpService.ajaxPost(url, 'Key_List', { model: model }, callback);
    }

    service.Resource_Key_List = function (ocid, searchKey, source, topNum, callback) {
        httpService.ajaxPost(url, 'Resource_Key_List', { ocid: ocid, searchKey: searchKey, source: source, topNum: topNum }, callback);
    }

    service.init = function () {
        service.Resource_Dict_Requirement_Get();
        service.Resource_Dict_Diffcult_Get();
        service.Resource_Dict_ExerciseType_Get();
        service.Resource_Dict_Scope_Get();
        service.Resource_Dict_ShareRange_Get();
    }

    return service;
}])
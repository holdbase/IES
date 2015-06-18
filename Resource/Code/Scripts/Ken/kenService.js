'use strict';

var aService = angular.module('app.ken.services', []);

aService.factory('kenService', ['httpService', function (httpService) {
    var service = {};

    var kenProviderUrl = '/DataProvider/Knowledge/KnowProvider.aspx';

    service.data = {
        ocid: -1,
        linkType: 'File'
    }

    service.Ken_List = function (model, callback) {
        httpService.ajaxPost(kenProviderUrl, 'Ken_List', { model: model }, callback);
    }

    service.Ken_ADD = function (model, callback) {
        httpService.ajaxPost(kenProviderUrl, 'Ken_ADD', { model: model }, callback);
    }

    service.Ken_Upd = function (model, callback) {
        httpService.ajaxPost(kenProviderUrl, 'Ken_Upd', { model: model }, callback);
    } 

    service.Ken_Del = function (model, callback) {
        httpService.ajaxPost(kenProviderUrl, 'Ken_Del', { model: model }, callback);
    }

    service.Chapter_KenID_List = function (model, callback) {
        httpService.ajaxPost(kenProviderUrl, 'Chapter_KenID_List', { model: model }, callback);
    } 

    service.Ken_FileFilter_ChapterID_List = function (chapter, callback) {
        httpService.ajaxPost(kenProviderUrl, 'Ken_FileFilter_ChapterID_List', { chapter: chapter}, callback);
    }

    service.Ken_ExerciseFilter_ChapterID_List = function (chapter, callback) {
        httpService.ajaxPost(kenProviderUrl, 'Ken_ExerciseFilter_ChapterID_List', { chapter: chapter }, callback);
    }
 
    service.File_KenID_ChapterID_List = function (chapter, ken, callback) {
        httpService.ajaxPost(kenProviderUrl, 'File_KenID_ChapterID_List', { chapter: chapter, ken: ken }, callback);
    } 

    service.Exercise_KenID_ChapterID_List = function (chapter, ken, callback) {
        httpService.ajaxPost(kenProviderUrl, 'Exercise_KenID_ChapterID_List', { chapter: chapter, ken: ken }, callback);
    }

    return service;
}]);
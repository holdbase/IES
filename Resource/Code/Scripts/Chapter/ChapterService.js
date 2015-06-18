'use strict';

var aService = angular.module('app.chapter.services', []);

aService.factory('chapterService', ['httpService', function (httpService) {
    var service = {};

    var chapterProviderUrl = '/DataProvider/Chapter/ChapterProvider.aspx';

    service.Chapter_Get = function (callback) {
        httpService.ajaxPost(chapterProviderUrl, 'Chapter_Get', null, callback);
    }

    service.Chapter_List = function (model, callback) {
        httpService.ajaxPost(chapterProviderUrl, 'Chapter_List', { model: model }, callback);
    }

    service.File_ChapterID_KenID_List = function (chapter, ken, callback) {
        httpService.ajaxPost(chapterProviderUrl, 'File_ChapterID_KenID_List', { chapterId: chapter.ChapterID, kenId: ken.KenID, ocid: chapter.OCID}, callback);
    }

    service.Exercise_ChapterID_KenID_List = function (chapter, ken, callback) {
        httpService.ajaxPost(chapterProviderUrl, 'Exercise_ChapterID_KenID_List', { chapterId: chapter.ChapterID, kenId: ken.KenID, ocid: chapter.OCID }, callback);
    }

    service.Chapter_Ken_List = function (chapterId, callback) {
        httpService.ajaxPost(chapterProviderUrl, 'Chapter_Ken_List', { chapterId: chapterId }, callback);
    }

    service.Chapter_ADD = function (model, callback) {
        var param = { model: model };
        httpService.ajaxPost(chapterProviderUrl, 'Chapter_ADD', param, callback);
    }

    service.Chapter_Upd = function (model, callback) {
        httpService.ajaxPost(chapterProviderUrl, 'Chapter_Upd', { model: model }, callback);
    }

    service.Chapter_Del = function (model, callback) {
        httpService.ajaxPost(chapterProviderUrl, 'Chapter_Del', { model: model }, callback);
    }

    service.Chapter_Batch_Upd = function (models, callback) {
        httpService.ajaxPost(chapterProviderUrl, 'Chapter_Batch_Upd', { models: models }, callback);
    }

    service.Chapter_Move = function (chapter, direction, callback) {
        httpService.ajaxPost(chapterProviderUrl, 'Chapter_Move', { model: chapter, direction: direction}, callback);
    }

    service.SectionFormat = function (chapters) {
        var chapterIndex = 0;
        var sectionIndex = 0;
        var length = chapters.length;
        for (var i = 0; i < length; i++) {
            var chapter = chapters[i];
            if (chapter.ParentID === 0) {
                chapterIndex += 1;
                chapter.Title = '' + chapterIndex + '.' + ' ' + chapter.Title;
                sectionIndex = 0;
            } else {
                sectionIndex += 1;
                chapter.Title = '' + chapterIndex + '.' + sectionIndex + ' ' + chapter.Title;
            }
        }
    }     

    return service;
}])

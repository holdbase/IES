'use strict';

var appPaper = angular.module('app.paper.controllers', [
    'app.paper.services',
    'app.common.services',
    'app.content.services'
]);

appPaper.controller('PaperListCtrl', ['$scope', 'PaperService', 'contentService', 'pageService', function ($scope, PaperService, contentService, pageService) {

    $scope.$emit('willResetCourse');

    $scope.searchKey = '';

    $scope.model = {};
    $scope.data = [];
    $scope.paperTypes = [];
    $scope.paperTypeFilters = [];
    $scope.shareRangeFilters = [];


    $scope.typeChanged = function (v) {
        $scope.model.Type = v;
        $scope.filterChanged();
    }

    $scope.dateChanged = function (v) {
        ///TODO $scope.model无对应字段
        //$scope.filterChanged();
    }

    $scope.scopeChanged = function (v) {
        $scope.model.Scope = v;
        $scope.filterChanged();
    }

    ///分页
    $scope.pageService = pageService;
 
    ///换页
    var changePageFunc = function(pageIndex, pageSize){
        PaperService.search($scope.model, pageSize, pageIndex, function (data) {
            if (data.d) {
                $scope.data = data.d;
            }
        });
    } 

    ///查询
    $scope.filterChanged = function () { 
        var pageSize = 10;
        var pageIndex = 1;
        PaperService.search($scope.model, pageSize, pageIndex, function (data) {
            if (data.d && data.d.length > 0) { 
                $scope.data = data.d;
                $scope.pageService.init(pageSize, pageIndex, $scope.data[0].rowscount, changePageFunc);
            }
        });
    } 

    ///初始化试卷类型
    PaperService.getPaperTypes(function (data) {
        $scope.paperTypes = data.d;
        if ($scope.paperTypes.length > 0) {
            angular.copy($scope.paperTypes, $scope.paperTypeFilters);
            var item = {};
            angular.copy($scope.paperTypeFilters[0], item);
            item.id = -1;
            item.name = '不限';
            $scope.paperTypeFilters.insert(0, item); 
        }
    });

    ///初始化使用权限
    PaperService.getShareRanges(function (data) {
        if (data.d) {
            $scope.shareRangeFilters = data.d;
            var item = {};
            angular.copy($scope.shareRangeFilters[0], item);
            item.id = -1;
            item.name = '不限';
            $scope.shareRangeFilters.insert(0, item);
        }
    }); 
    ///创建Paper对象
    PaperService.paperGet(function (data) {
        if (data.d) {
            $scope.model = data.d;
            $scope.model.Type = -1;
            $scope.model.Scope = -1;
            $scope.model.UpdateTime = new Date();
        }
    });
    ///获取课程列表
    contentService.User_OC_List(function (data) {
        if (data.d) {
            $scope.tabs = data.d;
            $scope.tabSelection = $scope.tabs[0].OCID;
        }
    });
}]); 

appPaper.controller('PaperSmartCtrl', ['$scope', 'PaperService', function ($scope, PaperService) {
}]);

appPaper.controller('PaperTestCtrl', ['$scope', 'PaperService', function ($scope, PaperService) {
}]);

appPaper.controller('PaperSheetCtrl', ['$scope', 'PaperService', function ($scope, PaperService) {
}]);

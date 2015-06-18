'use strict';

var contentApp = angular.module('app.content.controllers', [
    'app.content.services'
]);
contentApp.controller('ContentCtrl', ['$scope', 'contentService', '$stateParams', 'authService',
    function ($scope, contentService, $stateParams, authService) {
        $scope.course = {};
        $scope.courses = [];
        $scope.courseMore = [];

        $scope.$emit('onSideLeftSwitch', true);
        $scope.$emit('onWizardSwitch', true);

        $scope.moreTitle = '查看更多';

        $scope.$on('onResetMoreTitle', function (event) {
            $scope.moreTitle = '查看更多';
        });

        ///更多菜单 课程切换
        $scope.$on('onWillCourseChanged', function (event, course, isMore) {
            $scope.moreTitle = isMore === 0 ? '查看更多' : course.Name;
            $scope.course = course;

            contentService.OCID = course.OCID;
            $scope.$broadcast('willCourseChanged', $scope.course);
        });

        var initCourseByFunc = function (from, data) {
            var courses = [];
            var courseMore = [];

            if (from === 'Resource') {
                var personResource = {};
                personResource.OCID = 0;
                personResource.CourseID = 0;
                personResource.Name = '个人资料';
                courses.insert(0, personResource);
            }
            var limitIndex = from === 'Resource' ? 2 : 3;
            for (var i = 0; i < data.length; i++) {
                if (i < limitIndex) {
                    courses.push(data[i]);
                } else {
                    courseMore.push(data[i]);
                }
            }
            $scope.courses = courses;
            $scope.courseMore = courseMore;
        }


        ///请求重置课程
        $scope.$on('willResetCourse', function (event, from) {
            contentService.User_OC_List(function (data) {
                $scope.courses.length = 0;
                $scope.courseMore.length = 0;

                if (data.d) {

                    initCourseByFunc(from, data.d)

                    $scope.course = {};
                    angular.forEach($scope.courses, function (item) {
                        if (item.OCID === contentService.OCID) {
                            $scope.course = item;
                            $scope.$broadcast('courseLoaded', $scope.course);
                        }
                    });
                    angular.forEach($scope.courseMore, function (item) {
                        if (item.OCID === contentService.OCID) {
                            $scope.course = item;
                            $scope.moreTitle = item.Name;
                            $scope.$broadcast('courseLoaded', $scope.course);
                        }
                    });
                    if (!$scope.course.OCID) {
                        $scope.course = $scope.courses[0];
                        $scope.$broadcast('courseLoaded', $scope.course);
                    }
                }
            });
        });
    }]);




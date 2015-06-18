'use strict';

var appExercise = angular.module('app.exercise.controllers', [
    'ngSanitize',
    'checklist-model',
    'app.assist.services',
    'app.exercise.services',
    'app.ken.services',
    'app.res.services',
    'app.resken.services',
    'app.common.services'
]);

appExercise.controller('PreviewCtrl', ['$scope', 'previewService', '$state', '$stateParams', function ($scope, previewService, $state, $stateParams) {
    $scope.exercise = previewService.exercise;
    $scope.$emit('onPreviewSwitch', true);
    $scope.back = function () {
        if ($scope.exercise.exercisecommon.exercise.ExerciseID == 0) {
            window.history.back();
            return;
        }
        var param = { ocid: $scope.exercise.exercisecommon.exercise.OCID, ExerciseID: $scope.exercise.exercisecommon.exercise.ExerciseID };
        switch ($scope.exercise.exercisecommon.exercise.ExerciseType) {
            case 18: //简答题
                $state.go('exercise.shortanswer', param)
                break;
            case 4: //名词解释
                $state.go('exercise.noun', param)
                break;
            case 12: //听力题
                $state.go('exercise.listening', param)
                break;
            case 17: //自定义题
                $state.go('exercise.custom', param)
                break;
            case 10: //问答题
                $state.go('exercise.quesanswer', param)
                break;
            case 13: //写作题
                $state.go('exercise.quesanswer', param)
                break;
            case 1: //判断题
                $state.go('exercise.truefalse', param)
                break;
            case 5: //填空题
                $state.go('exercise.fillblank', param)
                break;
            case 6:  //连线题
                $state.go('exercise.connection', param)
                break;
            case 2: //单选题
                $state.go('exercise.radio', param)
                break;
            case 3: //多选题
                $state.go('exercise.multiple', param)
                break;
            case 11: //翻译题
                $state.go('exercise.translation', param)
                break;
            case 7: //排序题
                $state.go('exercise.sorting', param)
                break;
            case 8: //分析题
                $state.go('exercise.analysis', param)
                break;
            case 9: //计算题
                $state.go('exercise.analysis', param)
                break;
            case 14: //阅读理解题
                $state.go('exercise.reading', param)
                break;
            default:
                break;
        }
    }
}]);

appExercise.controller('ExerciseListCtrl', ['$scope', '$state', '$stateParams', 'freezeService', 'tagService', 'resourceService', 'resourceKenService', 'exerciseService', 'contentService', 'kenService', 'assistService',
    function ($scope, $state, $stateParams, freezeService, tagService, resourceService, resourceKenService, exerciseService, contentService, kenService, assistService) {

        $scope.pagesNum = 100;
        var pageSize = exerciseService.Page.Size;

        $scope.$emit('willResetCourse', 'Exerciese');

        $scope.$emit('onResetMoreTitle');

        $scope.$emit('onSetAppTitle', '习题库');

        var isMoreCourse = function (ocid) {
            var length = $scope.courseMore.length;
            for (var i = 0; i < length; i++) {
                if ($scope.courseMore[i].OCID === ocid) {
                    return true;
                }
            }
            return false;
        }

        //习题列表
        $scope.exercises = [];

        //课程
        //$scope.courses = [];

        //试题类型
        $scope.exerciseTypes = [];
        //难易程度
        $scope.difficulties = [];
        $scope.conditionDifficulties = [];
        //范围
        $scope.shareRanges = [];
        $scope.shareRangesQuery = [];
        //标签
        $scope.keys = [];
        //知识点
        $scope.kens = [];

        $scope.data = {};
        $scope.data.searchKey = '';
        $scope.data.course = {};
        $scope.data.exerciseType = {};
        $scope.data.difficult = {};
        //知识点
        $scope.data.ken = {};
        $scope.data.shareRange = {};
        //被选择的标签
        $scope.data.key = {};

        var layPageFlag = false;

        $scope.$on('willCourseChanged', function (event, course) {
            $scope.data.course = course;
            exerciseService.Page.Index = 1;
            layPageFlag = false;
            initByOCID($scope.data.course, filterChanged);
            //filterChanged();
        });

        $scope.$on('courseLoaded', function (event, course) {
            var freezeData = freezeService.getFreeze(tagService.ExerciseListTag);
            if (freezeData) {
                $scope.data.course = freezeData.data.course;
                $scope.$parent.course = $scope.data.course;
                if (isMoreCourse($scope.$parent.course.OCID)) {
                    $scope.$parent.moreTitle = $scope.data.course.Name;
                }
                freezeService.unFreeze(tagService.ExerciseListTag);
            } else {
                $scope.data.course = course;
            }
            initByOCID($scope.data.course, filterChanged);
            //filterChanged();
        });


        var initByOCID = function (course, callback) {
            $scope.keys.length = 0;
            $scope.kens.length = 0;
            resourceKenService.ResourceKen_List(course.OCID, '', 'Exercise', 100, function (data) {
                if (data.d && data.d.length > 0) {
                    $scope.kens = data.d;
                    $scope.data.ken = angular.copy($scope.kens[0]);
                    $scope.data.ken.KenID = 0;
                    $scope.data.ken.Name = '不限';
                    $scope.kens.insert(0, $scope.data.ken);
                }
            });

            assistService.Resource_Key_List(course.OCID, '', 'Exercise', 100, function (data) {
                if (data.d.length > 0) {
                    $scope.keys = data.d;
                    var item = angular.copy($scope.keys[0]);
                    item.KeyID = 0;
                    item.Name = '不限';
                    $scope.keys.insert(0, item);
                    $scope.data.key = $scope.keys[0];
                }
            });
            if (callback) callback();
        }

        assistService.Resource_Dict_ExerciseType_Get(function (data) {
            if (data) {
                $scope.exerciseTypes = angular.copy(data);
                var item = angular.copy($scope.exerciseTypes[0]);
                item.id = 0;
                item.name = '不限';
                $scope.exerciseTypes.insert(0, item);
                $scope.data.exerciseType = $scope.exerciseTypes[0];
            }
        });

        assistService.Resource_Dict_Diffcult_Get(function (data) {
            if (data) {
                //$scope.difficulties = angular.copy(data);
                //var item = angular.copy($scope.difficulties[0]);
                //item.id = 0;
                //item.name = '不限';
                //$scope.difficulties.insert(0, item);
                $scope.difficulties = data;

                $scope.conditionDifficulties = angular.copy(data);
                $scope.conditionDifficulties = angular.copy(data);
                var item = angular.copy($scope.conditionDifficulties[0]);
                item.id = 0;
                item.name = '不限';
                $scope.conditionDifficulties.insert(0, item);
                $scope.data.difficult = $scope.conditionDifficulties[0];
            }
        });

        assistService.Resource_Dict_ShareRange_Get(function (data) {
            if (data) {
                $scope.shareRangesQuery = angular.copy(data);
                var item = angular.copy($scope.shareRangesQuery[0]);
                item.id = 0;
                item.name = '不限';
                $scope.shareRangesQuery.insert(0, item);
                $scope.data.shareRange = $scope.shareRangesQuery[0];
            }
        });

        assistService.Resource_Dict_ShareRange_Get(function (data) {
            if (data) {
                $scope.shareRanges = data;
            }
        });



        $scope.checkAll = function () {
            $scope.checks.length = 0;
            if ($scope.checkAllValue === true) {
                angular.forEach($scope.exercises, function (item) {
                    $scope.checks.push(item);
                });
            }
        }

        //$scope.courseChanged = function (item) {
        //    $scope.data.course = item;
        //    ExerciseSearch(pageSize, 1);
        //}

        $scope.exerciseTypeChanged = function (item) {
            $scope.data.exerciseType = item;
            $scope.search()
        }

        $scope.difficultChanged = function (item) {
            $scope.data.difficult = item;
            $scope.search()
        }

        $scope.shareRangeChanged = function (item) {
            $scope.data.shareRange = item;
            $scope.search()
        }

        $scope.keyChanged = function (item) {
            $scope.data.key = item;
            $scope.search()
        }

        $scope.kenChanged = function (item) {
            $scope.data.ken = item;
            $scope.search()
        }
        $scope.pagesNum = 1;

        $scope.$on('onExerciseImportComplete', function (e) {
            filterChanged();
        });

        var ExerciseSearch = function (pageSize, pageIndex) {
            $scope.checkAllValue = false;
            var model = {
                Conten: $scope.data.searchKey,
                OCID: $scope.data.course.OCID,
                CourseID: $scope.data.course.CourseID,
                ExerciseType: $scope.data.exerciseType.id,
                Diffcult: $scope.data.difficult.id,
                Scope: -1,
                ShareRange: $scope.data.shareRange.id
            };
            var keys = $scope.data.key.KeyID === undefined || $scope.data.key.KeyID === 0 ? '' : $scope.data.key.Name;
            var kens = $scope.data.ken.KenID === undefined || $scope.data.ken.KenID === 0 ? '' : $scope.data.ken.Name;
            exerciseService.Exercise_Search(model, $scope.data.key, keys, kens, pageSize, pageIndex, function (data) {
                $scope.exercises.length = 0;
                $scope.pagesNum = 1;
                if (data.d && data.d.length > 0) {
                    angular.forEach(data.d, function (item) {
                        if (item.Keys && item.Keys.length > 0) {
                            item.Keys = item.Keys.split(/wshgkjqbwhfbxlfrh/).distinct();
                            item.Keys.splice(item.Keys.length - 1, 1);
                        }
                        if (item.Kens && item.Kens.length > 0) {
                            item.Kens = item.Kens.split(/wshgkjqbwhfbxlfrh/).distinct();
                            item.Kens.splice(item.Kens.length - 1, 1);
                        }
                    });
                    $scope.exercises = data.d;
                    var rowsCount = $scope.exercises[0].RowsCount;
                    $scope.pagesNum = Math.ceil(rowsCount / pageSize);
                }
            });
        }

        var changePage = function (e) { //触发分页后的回调
            $scope.checks.length = 0;
            exerciseService.Page.Index = e.curr;
            ExerciseSearch(pageSize, exerciseService.Page.Index);
        }

        var filterChanged = function () {
            $scope.checks.length = 0;
            $scope.checkAllValue = false;
            var model = {
                Conten: $scope.data.searchKey,
                OCID: $scope.data.course.OCID,
                CourseID: $scope.data.course.CourseID,
                ExerciseType: $scope.data.exerciseType.id,
                Diffcult: $scope.data.difficult.id,
                Scope: -1,
                ShareRange: $scope.data.shareRange.id
            };
            var keys = $scope.data.key.KeyID === undefined || $scope.data.key.KeyID === 0 ? '' : $scope.data.key.Name;
            var kens = $scope.data.ken.KenID === undefined || $scope.data.ken.KenID === 0 ? '' : $scope.data.ken.Name;
            exerciseService.Exercise_Search(model, $scope.data.key, keys, kens, pageSize, exerciseService.Page.Index, function (data) {
                $scope.exercises.length = 0;
                $scope.pagesNum = 1;
                if (data.d && data.d.length > 0) {
                    $scope.exercises = data.d;
                    angular.forEach($scope.exercises, function (item) {
                        if (item.Keys && item.Keys.length > 0) {
                            item.Keys = item.Keys.split(/wshgkjqbwhfbxlfrh/).distinct();
                            item.Keys.splice(item.Keys.length - 1, 1);
                        }
                        if (item.Kens && item.Kens.length > 0) {
                            item.Kens = item.Kens.split(/wshgkjqbwhfbxlfrh/).distinct();
                            item.Kens.splice(item.Kens.length - 1, 1);
                        }
                    });
                    var rowsCount = $scope.exercises[0].RowsCount;
                    $scope.pagesNum = Math.ceil(rowsCount / pageSize);
                    if (!layPageFlag) {
                        laypage({
                            cont: $('#pager'), //容器。值支持id名、原生dom对象，jquery对象, 'page'/document.getElementById('page')/$('#page')
                            pages: $scope.pagesNum, //总页数
                            curr: exerciseService.Page.Index,
                            skip: true, //是否开启跳页
                            skin: '#374760', //选中的颜色
                            groups: 3,//连续显示分页数
                            first: '首页', //若不显示，设置false即可
                            last: '尾页', //若不显示，设置false即可
                            jump: changePage
                        });
                        layPageFlag = true;
                    }
                }
            });
        }

        $scope.search = function () {
            layPageFlag = false;
            exerciseService.Page.Index = 1;
            filterChanged();
        }

        $scope.checks = [];

        var buildIDs = function (checks) {
            var ids = '';
            var length = checks.length;
            for (var i = 0; i < length; i++) {
                ids += checks[i].ExerciseID + ',';
            }
            return ids.substr(0, ids.length - 1);
        }

        $scope.newExercise = function () {
            freezeService.freeze(tagService.ExerciseListTag, { course: $scope.data.course });
            freezeService.freeze(tagService.UrlSourceTag, 'content.exercise');
            $state.go('exercise.truefalse', { ocid: $scope.data.course.OCID, ExerciseID: -1 });
        }
        $scope.$on('onExerciseImportComplete', function (event) {
            filterChanged();
        });
        ///批量共享
        $scope.$on('onBatchShareRange', function (event, range) {
            if ($scope.checks.length === 0) {
                alert('请选择需要操作的习题');
                return;
            }
            var ids = buildIDs($scope.checks);
            exerciseService.Exercise_Batch_ShareRange(ids, range.id, function (data) {
                if (data.d === true) {
                    var length = $scope.checks.length;
                    for (var i = 0; i < length; i++) {
                        $scope.checks[i].ShareRange = range.id;
                    }
                } else {
                    ///TODO 统一提示框 加美化效果
                    alert('批量共享操作失败！');
                }
            });
        });
        ///批量删除
        $scope.$on('onBatchRemove', function () {
            var ids = buildIDs($scope.checks);
            exerciseService.Exercise_Batch_Del(ids, function (data) {
                if (data.d === true) {
                    layPageFlag = false;
                    if ($scope.checks.length === $scope.exercises.length) {
                        exerciseService.Page.Index = exerciseService.Page.Index > 1 ? exerciseService.Page.Index - 1 : 1;
                    }
                    filterChanged();
                    $scope.checks.length = 0;
                } else {
                    ///TODO 统一提示框 加美化效果
                    alert('批量删除操作失败！');
                }
            });

        });

        ///批量难易程度
        $scope.$on('onBatchDifficult', function (event, difficult) {
            var ids = buildIDs($scope.checks);
            exerciseService.Exercise_Batch_Diffcult(ids, difficult.id, function (data) {
                if (data.d === true) {
                    //filterChanged();
                    var length = $scope.checks.length;
                    for (var i = 0; i < length; i++) {
                        $scope.checks[i].Diffcult = difficult.id;
                    }
                } else {
                    ///TODO 统一提示框 加美化效果
                    alert('难易程度批量操作失败！');
                }
            });
        });

        ///习题共享 TODO 
        $scope.$on('onShareExercise', function (event, exercise, range) {
            var ids = exercise.ExerciseID;
            exerciseService.Exercise_Batch_ShareRange(ids, range.id, function (data) {
                if (data.d === true) {
                    filterChanged();
                } else {
                    ///TODO 统一提示框 加美化效果
                    alert('共享操作失败！');
                }
            });
        });
        ///显示删除提示框
        $scope.$on('onDeleteExercise', function (event, exercise) {
            $scope.exerciseItemDelete = exercise;
            $('#eConfirm').show();
        });

        $scope.bgPreview = false;
        //显示预览页面
        $scope.$on('onPreviewExercise', function (event, exercise) {
            $scope.exercisePreview = exercise;
            $('#ePreview').show();
            $scope.bgPreview = true;
        });
        //关闭预览页面
        $scope.closePreview = function () {
            $('#ePreview').hide();
            $scope.bgPreview = false;
        }

        $scope.exerciseItemDelete = {};
        ///确认删除
        $scope.$on('onDialogOk', function (event) {
            exerciseService.Exercise_Del($scope.exerciseItemDelete.ExerciseID, function (data) {
                var length = $scope.exercises.length;
                for (var i = 0; i < length; i++) {
                    if ($scope.exercises[i].ExerciseID == $scope.exerciseItemDelete.ExerciseID) {
                        $scope.exercises.splice(i, 1);
                        layPageFlag = false;
                        if ($scope.exercises.length === 0) {
                            exerciseService.Page.Index = exerciseService.Page.Index > 1 ? exerciseService.Page.Index - 1 : 1;
                        }
                        filterChanged();
                        break;
                    }
                }
            });
        });

        /// <summary>
        /// 1判断题 ; 2单选题 ; 3 多选题 4填空题（客观）5填空题 ; 6连线题 ;7 排序题 ; 8分析题  9计算题   10问答题 ;
        ///11 翻译题  12听力训练  13写作  14阅读理解  15论述题 ;16 答题卡题型  17自定义题型
        /// </summary>
        ///编辑习题
        $scope.$on('onEditExercise', function (event, exercise) {
            freezeService.freeze(tagService.ExerciseListTag, { course: $scope.data.course });
            freezeService.freeze(tagService.UrlSourceTag, 'content.exercise');

            var param = { ocid: $scope.course.OCID, ExerciseID: exercise.ExerciseID };
            switch (exercise.ExerciseType) {
                case 18: //简答题
                    $state.go('exercise.shortanswer', param)
                    break;
                case 4: //名词解释
                    $state.go('exercise.noun', param)
                    break;
                case 12: //听力题
                    $state.go('exercise.listening', param)
                    break;
                case 17: //自定义题
                    $state.go('exercise.custom', param)
                    break;
                case 10: //问答题
                    $state.go('exercise.quesanswer', param)
                    break;
                case 13: //写作题
                    $state.go('exercise.quesanswer', param)
                    break;
                case 1: //判断题
                    $state.go('exercise.truefalse', param)
                    break;
                case 5: //填空题
                    $state.go('exercise.fillblank', param)
                    break;
                    //case 4: //填空客观题
                    //    $state.go('exercise.fillblank2', param)
                    //    break;
                case 6:  //连线题
                    $state.go('exercise.connection', param)
                    break;
                case 2: //单选题
                    $state.go('exercise.radio', param)
                    break;
                case 3: //多选题
                    $state.go('exercise.multiple', param)
                    break;
                case 11: //翻译题
                    $state.go('exercise.translation', param)
                    break;
                case 7: //排序题
                    $state.go('exercise.sorting', param)
                    break;
                case 8: //分析题
                    $state.go('exercise.analysis', param)
                    break;
                case 9: //计算题
                    $state.go('exercise.analysis', param)
                    break;
                case 14: //阅读理解题
                    $state.go('exercise.reading', param)
                    break;
                default:
                    break;
            }
        });
    }]);

appExercise.controller('ExerciseCtrl', ['$scope', '$window', '$timeout', '$state', '$stateParams', 'contentService', 'exerciseService', 'chapterService', 'freezeService', 'tagService', 'previewService', 'resourceService', 'kenService', 'assistService',
    function ($scope, $window, $timeout, $state, $stateParams, contentService, exerciseService, chapterService, freezeService, tagService, previewService, resourceService, kenService, assistService) {
        $scope.$emit('onPreviewSwitch', false);
        $scope.$emit('onSideLeftSwitch', false);

        var ocid = $stateParams.ocid ? parseInt($stateParams.ocid) : -1;
        var source = $stateParams.source;
        $scope.courseOCID = ocid;

        //课程
        $scope.courses = [];
        //试题类型
        $scope.exerciseTypes = [];
        //难易程度
        $scope.difficulties = [];
        //范围
        $scope.ranges = [];
        //使用权限
        $scope.shareRanges = [];

        $scope.chapters = [];
        //标签
        //$scope.keys = [];

        $scope.keySelection = {};
        $scope.scope = {};

        $scope.data = {};
        $scope.data.course = {};
        $scope.data.shareRange = {};
        $scope.data.exerciseType = {};
        $scope.data.difficult = {};
        $scope.data.chapter = {};

        ///获取章节
        var getChapters = function (callback) {
            chapterService.Chapter_List({ OCID: $scope.courseOCID }, function (data) {
                if (data.d && data.d.length > 0) {
                    chapterService.SectionFormat(data.d);
                    var item = {};
                    angular.copy(data.d[0], item);
                    item.ChapterID = 0;
                    item.Title = '请选择章节';
                    $scope.chapters = data.d;
                    $scope.chapters.insert(0, item);
                    if (callback) callback();
                }
            });
        }

        getChapters(function () {
            $scope.data.chapter = $scope.chapters[0];
        });

        ///获取在线课程 
        contentService.User_OC_List(function (data) {
            if (data.d) {
                var courses = data.d;
                var length = courses.length;
                for (var i = 0; i < length; i++) {
                    if (courses[i].OCID == $stateParams.ocid) {
                        $scope.data.course = courses[i];
                        break;
                    }
                }
            }
        });


        //知识点
        $scope.data.kens = [];
        //标签
        $scope.data.keys = [];
        //已经选择的范围
        $scope.data.scopes = [];
        //被选择的标签
        $scope.data.selectedKeys = [];

        assistService.Resource_Dict_ShareRange_Get(function (data) {
            if (data) {
                $scope.shareRanges = data;
                $scope.data.shareRange = $scope.shareRanges[0];
            }
        });

        assistService.Resource_Dict_ExerciseType_Get(function (data) {
            if (data) {
                $scope.exerciseTypes = angular.copy(data);
                $scope.data.exerciseType = $scope.exerciseTypes[0];
            }
        });

        assistService.Resource_Dict_Diffcult_Get(function (data) {
            if (data) {
                $scope.difficulties = angular.copy(data);
                $scope.data.difficult = $scope.difficulties[0];
            }
        });

        assistService.Resource_Dict_Scope_Get(function (data) {
            if (data) {
                $scope.scopes = angular.copy(data);
                $scope.data.scopes.push($scope.scopes[0]);
            }
        });

        $scope.canChangeExerciseType = function (e) {
            if ($scope.$stateParams.ExerciseID > 0) {
                if (e.id == 8 || e.id == 9 || e.id == 10 || e.id == 13) return false;
                else return true;
            } else return false;
        }

        $scope.$on('$viewContentLoaded', function () {
            if ($scope.$stateParams.ExerciseID == '-1') {
                var param = { ExerciseID: $scope.$stateParams.ExerciseID };
                switch ($scope.data.exerciseType.id) {
                    case '18': //简答题
                        $state.go('exercise.shortanswer', param)
                        break;
                    case '4': //名词解释
                        $state.go('exercise.noun', param)
                        break;
                    case '12': //听力题
                        $state.go('exercise.listening', param)
                        break;
                    case '17': //自定义题
                        $state.go('exercise.custom', param)
                        break;
                    case '10': //问答题
                        $state.go('exercise.quesanswer', param)
                        break;
                    case '13': //写作题
                        $state.go('exercise.quesanswer', param)
                        break;
                    case '1': //判断题
                        $state.go('exercise.truefalse', param)
                        break;
                    case '5': //填空题
                        $state.go('exercise.fillblank', param)
                        break;
                        //case '4': //填空客观题
                        //    $state.go('exercise.fillblank2', param)
                        //    break;
                    case '6':  //连线题
                        $state.go('exercise.connection', param)
                        break;
                    case '2'://单选题
                        $state.go('exercise.radio', param)
                        break;
                    case '3'://多选题
                        $state.go('exercise.multiple', param)
                        break;
                    case '11': //翻译题
                        $state.go('exercise.translation', param)
                        break;
                    case '7': //排序题
                        $state.go('exercise.sorting', param)
                        break;
                    case '8': //分析题
                        $state.go('exercise.analysis', param)
                        break;
                    case '9': //计算题
                        $state.go('exercise.analysis', param)
                        break;
                    case '14': //阅读理解题
                        $state.go('exercise.reading', param)
                        break;
                    default:
                        break;
                }                
            }
        });

        $scope.changeExerciseType = function (v) {
            if ($scope.$stateParams.ExerciseID > 0) {
                var type = $scope.data.exerciseType.id;
                if (type == 8 && v.id == 9) return;
                if (type == 9 && v.id == 8) return;

                if (type == 10 && v.id == 13) return;
                if (type == 13 && v.id == 10) return;
            }
            var param = { ExerciseID: $scope.$stateParams.ExerciseID };
            switch (v.id) {
                case '18': //简答题
                    $state.go('exercise.shortanswer', param)
                    break;
                case '4': //名词解释
                    $state.go('exercise.noun', param)
                    break;
                case '12': //听力题
                    $state.go('exercise.listening', param)
                    break;
                case '17': //自定义题
                    $state.go('exercise.custom', param)
                    break;
                case '10': //问答题
                    $state.go('exercise.quesanswer', param)
                    break;
                case '13': //写作题
                    $state.go('exercise.quesanswer', param)
                    break;
                case '1': //判断题
                    $state.go('exercise.truefalse', param)
                    break;
                case '5': //填空题
                    $state.go('exercise.fillblank', param)
                    break;
                    //case '4': //填空客观题
                    //    $state.go('exercise.fillblank2', param)
                    //    break;
                case '6':  //连线题
                    $state.go('exercise.connection', param)
                    break;
                case '2'://单选题
                    $state.go('exercise.radio', param)
                    break;
                case '3'://多选题
                    $state.go('exercise.multiple', param)
                    break;
                case '11': //翻译题
                    $state.go('exercise.translation', param)
                    break;
                case '7': //排序题
                    $state.go('exercise.sorting', param)
                    break;
                case '8': //分析题
                    $state.go('exercise.analysis', param)
                    break;
                case '9': //计算题
                    $state.go('exercise.analysis', param)
                    break;
                case '14': //阅读理解题
                    $state.go('exercise.reading', param)
                    break;
                default:
                    break;

            }
        }

        $scope.addKey = function (exerciseKey) {
            if (exerciseKey) {
                $scope.data.keys.push({ Name: exerciseKey });
                $scope.exerciseKey = '';
            }
        }

        $scope.addKen = function (exerciseKen) {
            if (exerciseKen) {
                $scope.data.kens.push({ Name: exerciseKen });
                $scope.exerciseKen = '';
            }
        }

        $scope.removeKey = function (index) {
            $scope.data.keys.splice(index, 1);
        }

        $scope.removeKen = function (ken) {
            var length = $scope.data.kens.length;
            for (var i = 0; i < length; i++) {
                if ($scope.data.kens[i].KenID === ken.KenID) {
                    $scope.data.kens.splice(i, 1);
                    break;
                }
            }
        }

        var forbidSubmit = false;        

        $scope.submit = function () {
            if (forbidSubmit) return;
            forbidSubmit = true;
            $scope.$broadcast('willRequestSave', $scope.data);
        }

        $scope.resetForbid = function () {
            forbidSubmit = false;
        }

        //var setCourse = function (OCID, courseID) {
        //    var length = $scope.courses.length;
        //    for (var i = 0; i < length; i++) {
        //        if ($scope.courses[i].OCID == OCID && $scope.courses[i].CourseID == courseID) {
        //            $scope.data.course = $scope.courses[i];
        //            return;
        //        }
        //    }
        //}
        var setShareRange = function (shareRange) {
            var length = $scope.shareRanges.length;
            for (var i = 0; i < length; i++) {
                if ($scope.shareRanges[i].id == shareRange) {
                    $scope.data.shareRange = $scope.shareRanges[i];
                    break;
                }
            }
        }
        var setExerciseType = function (ExerciseType) {
            var length = $scope.exerciseTypes.length;
            for (var i = 0; i < length; i++) {
                if ($scope.exerciseTypes[i].id == ExerciseType) {
                    $scope.data.exerciseType = $scope.exerciseTypes[i];
                    return;
                }
            }
        }
        var setDifficult = function (Difficult) {
            var length = $scope.difficulties.length;
            for (var i = 0; i < length; i++) {
                if ($scope.difficulties[i].id == Difficult) {
                    $scope.data.difficult = $scope.difficulties[i];
                    return;
                }
            }
        }

        var setChapter = function (chapterID) {
            if ($scope.chapters.length === 0) {
                getChapters(function () {
                    var length = $scope.chapters.length;
                    for (var i = 0; i < length; i++) {
                        if ($scope.chapters[i].ChapterID == chapterID) {
                            $scope.data.chapter = $scope.chapters[i];
                            break;
                        }
                    }
                });
            } else {
                var length = $scope.chapters.length;
                for (var i = 0; i < length; i++) {
                    if ($scope.chapters[i].ChapterID == chapterID) {
                        $scope.data.chapter = $scope.chapters[i];
                        break;
                    }
                }
            }
        }
        var setScope = function (Scope) {
            $scope.data.scopes.length = 0;
            var length = $scope.scopes.length;
            for (var i = 0; i < length; i++) {
                if ((parseInt($scope.scopes[i].id) & parseInt(Scope)) > 0) {
                    $scope.data.scopes.push($scope.scopes[i]);
                }
            }
        }

        var setKeys = function (keyList) {
            $scope.data.keys.length = 0;
        }

        $scope.willEdit = function (data) {
            $scope.model = data;
            //setCourse(data.exercisecommon.exercise.OCID, data.exercisecommon.exercise.CourseID);
            setShareRange(data.exercisecommon.exercise.ShareRange);
            setExerciseType(data.exercisecommon.exercise.ExerciseType);
            setDifficult(data.exercisecommon.exercise.Diffcult);
            setScope(data.exercisecommon.exercise.Scope);
            setChapter(data.exercisecommon.exercise.Chapter);
            $scope.data.keys = data.exercisecommon.keylist;
            $scope.data.kens = data.exercisecommon.kenlist;
        }

        $scope.willTopBind = function (model, data) {
            //顶部关联项
            console.log(data.course);
            model.exercisecommon.exercise.ShareRange = data.shareRange.id;
            model.exercisecommon.exercise.OCID = data.course.OCID;
            model.exercisecommon.exercise.CourseID = data.course.CourseID;//课程编号
            model.exercisecommon.exercise.Diffcult = parseInt(data.difficult.id);//难度等级
            model.exercisecommon.exercise.Chapter = parseInt(data.chapter.ChapterID);//章节
            var scope = 0;
            for (var i = 0; i < data.scopes.length; i++) {
                scope += parseInt(data.scopes[i].id);
            }

            model.exercisecommon.exercise.Scope = scope;
            //key关键字
            model.exercisecommon.exercise.Keys = '';
            for (var i = 0; i < data.keys.length; i++) {
                model.exercisecommon.exercise.Keys += data.keys[i].Name + 'wshgkjqbwhfbxlfrh';
            }

            //ken知识点
            model.exercisecommon.exercise.Kens = '';
            for (var i = 0; i < data.kens.length; i++) {
                model.exercisecommon.exercise.Kens += data.kens[i].Name + 'wshgkjqbwhfbxlfrh';
            }

            model.exercisecommon.exercise.ExerciseType = data.exerciseType.id;

            model.exercisecommon.exercise.ExerciseTypeName = data.exerciseType.name;

        }

        $scope.attachmentList = [];

        $scope.data.exercise = {};

        $scope.preview = function () {
            $scope.$broadcast('onPreview');
        }
        $scope.bgPreview = false;
        $scope.$on('onBeginPreview', function (event, model) {
            model.exercisecommon.exercise.ExerciseType = $scope.data.exerciseType.id;
            $scope.data.exercise = model;
            previewService.exercise = angular.copy(model);
            //$state.go('preview');
            $scope.exercisePreview = previewService.exercise;
            $('#ePreview').show();
            $scope.bgPreview = true;
        });
        //关闭预览页面
        $scope.closePreview = function () {
            $('#ePreview').hide();
            $scope.bgPreview = false;
        }


        ///更新附件关联关系
        var attachmentSave = function (exerciseID) {
            if (exerciseID === -1) return;
            var length = $scope.attachmentList.length;
            for (var i = 0; i < length; i++) {
                var model = $scope.attachmentList[i];
                if (model.SourceID <= 0) {
                    model.Source = 'Exercise';
                    model.SourceID = exerciseID;
                    exerciseService.Attachment_SourceID_Upd(model);
                }
            }
        }

        $scope.$on('onExerciseSaved', function (event, exerciseID) {
            attachmentSave(exerciseID);
            alert('提交成功！');
            $scope.back();
        });

        $scope.back = function () {
            var urlSource = freezeService.getFreeze(tagService.UrlSourceTag);
            if (urlSource) {
                $state.go(urlSource.data);
            } else {
                $state.go('content.exercise');
            }
        }

        ///删除附件
        $scope.removeAttachment = function (attachmentList, removedAttachmentObject) {
            var length = attachmentList.length;
            for (var i = 0; i < length; i++) {
                if (attachmentList[i].AttachmentID === removedAttachmentObject.AttachmentID) {
                    attachmentList.splice(i, 1);
                    break;
                }
            }
        }

        ///删除附件
        var attachmentRemoved = function (removedAttachmentObject) {
            var length = $scope.attachmentList.length;
            for (var i = 0; i < length; i++) {
                if ($scope.attachmentList[i].AttachmentID === removedAttachmentObject.AttachmentID) {
                    $scope.attachmentList.splice(i, 1);
                    break;
                }
            }
        }

        $scope.$on('onRemoveAttachment', function (event, attachment) {
            attachment.Updatetime = new Date();
            resourceService.Attachment_Del(attachment, function (data) {
                if (data.d) {
                    attachmentRemoved(attachment);
                    //$scope.$broadcast('onRemoveFinishedAttachment', attachment);

                }
            });
        });

        $scope.$on('onAttachmentList', function (event, attachment) {
            $scope.attachmentList = attachment;
        });

        /// 附件上传
        $scope.$on('onSuccessItem', function (event, fileItem, response, status, headers) {
            //response.file.SourceID = $scope.model.exercisecommon.exercise.ExerciseID;
            for (var i = 0; i < response.length; i++) {
                $scope.attachmentList.push(response[i]);
            }
            attachmentSave(-1);
        });

        $scope.$on('onCompleteItem', function (event) {

        });

        $scope.assignEditorValues = function (arrEditorNameValues) {
            //$("#editor01").contentWindow.setHTML($scope.editorText);
            //$("#editor02").contentWindow.setHTML($scope.editorAnswerText);
            //$("#editor03").contentWindow.setHTML($scope.editorAnalysisText); 
            $timeout(function () {
                angular.forEach(arrEditorNameValues, function (value, key) {
                    EWEBEDITOR.Instances[key].setHTML(value);
                    //document.getElementById(key).contentView.setHTML(value);
                });
            }, 200);
        }
    }]);


//简答题
appExercise.controller('ShortAnswerCtrl', ['$scope', 'exerciseService', '$stateParams', function ($scope, exerciseService, $stateParams) {

    //$scope.$on('willExerciseChange', function (event, changeParam) {
    //});

    //$scope.$on('willRequestSave', function (event, data) {
    //    //顶部关联项            
    //    $scope.model.exercise.OCID = data.course.OCID
    //    $scope.model.exercise.CourseID = data.course.CourseID;//课程编号
    //    $scope.model.exercise.Diffcult = parseInt(data.difficult.id);//难度等级
    //    var scope = 0;
    //    for (var i = 0; i < data.rangeSelected.length; i++) {
    //        scope += parseInt(data.rangeSelected[i].id);
    //    }

    //    $scope.model.exercise.Scope = scope;
    //    //key关键字
    //    $scope.model.exercise.Keys = '';
    //    for (var i = 0; i < data.selectedKeys.length; i++) {
    //        $scope.model.exercise.Keys = data.selectedKeys[i].Name + 'wshgkjqbwhfbxlfrh';
    //    }

    //    //ken知识点
    //    $scope.model.exercise.Kens = '';
    //    for (var i = 0; i < data.knowledges.length; i++) {
    //        $scope.model.exercise.Kens = data.knowledges[i].Name + 'wshgkjqbwhfbxlfrh';
    //    }

    //    $scope.model.exercise.ExerciseType = data.exerciseType.id;

    //    exerciseService.Exercise_ADD($scope.model, function (data) {
    //        if (data.d) {
    //            alert('提交成功！');
    //            $state.go('content.exercise');
    //        }
    //    });
    //});

    //$scope.$on('willPreview', function (event, exerciseData) {

    //});

    //$scope.model = {};//ExerciseInfo对象

    //var answer = { IsCorrect: false, Conten: '' };
    //$scope.Attachment = {};//附件对象
    //$scope.ExerciseID = parseInt($stateParams.ExerciseID);//习题ID

    //var init = function () {
    //    if ($scope.ExerciseID > -1) {
    //        exerciseService.ExerciseInfo_Get($scope.ExerciseID, function (data) {
    //            $scope.model = data.d;
    //            $scope.willEdit($scope.model);
    //        });
    //    } else {
    //        exerciseService.Exercise_Model_Info(function (data) {
    //            $scope.model = data.d;
    //            answer = { IsCorrect: false, Conten: '' };
    //            $scope.model.exercisechoicelist.push(answer);
    //        });
    //    }
    //}
    //$scope.isRandChange = function (IsRand) {
    //    $scope.model.exercisecommon.exercise.IsRand = !!IsRand;
    //}

    ////添加选项
    //$scope.AddAnswer = function () {
    //    answer = { IsCorrect: false, Conten: '' };
    //    $scope.model.exercisechoicelist.push(answer);
    //}
    ////删除选项
    //$scope.del = function (item) {
    //    for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
    //        if ($scope.model.exercisechoicelist[i].$$hashKey == item.$$hashKey) {
    //            $scope.model.exercisechoicelist.splice(i, 1);
    //        }
    //    }
    //}
    ////是否是正确答案
    //$scope.isCorrectChange = function (item) {
    //    item.IsCorrect = item.IsCorrect ? false : true;
    //}
    //init();
}]);

//听力题
appExercise.controller('ListeningCtrl', ['$scope', 'exerciseService', '$stateParams', '$state', function ($scope, exerciseService, $stateParams, $state) {
    $scope.$on('willExerciseChange', function (event, changeParam) {

    });
    //保存方法
    $scope.$on('willRequestSave', function (event, data) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        if ($scope.model.exercisecommon.exercise.Conten == "" || $scope.model.exercisecommon.exercise.Conten == null) {
            alert('请填写题干');
            $scope.$parent.resetForbid();
            return;
        }

        $scope.willTopBind($scope.model, data);
        //增加子单选题
        if ($scope.isShowRadio == 1) {
            SplicingRadio($scope.model.Children);
            for (var i = 0; i < $scope.model.Children.length; i++) {
                $scope.model.Children[i].exercisecommon.exercise.ExerciseType = 2;
                $scope.model.Children[i].exercisecommon.exercise.ExerciseTypeName = '单选题';
            }
        }
        //增加子多选题
        if ($scope.isShowMultiple == 1) {
            SplicingRadio($scope.model.ChildrenMultiple);
            for (var i = 0; i < $scope.model.ChildrenMultiple.length; i++) {
                $scope.model.ChildrenMultiple[i].exercisecommon.exercise.ExerciseType = 3;
                $scope.model.ChildrenMultiple[i].exercisecommon.exercise.ExerciseTypeName = '多选题';
            }
        }
        //增加子填空题
        if ($scope.isShowFillBlank == 1) {
            for (var i = 0; i < $scope.model.ChildrenFillBlank.length; i++) {
                $scope.model.ChildrenFillBlank[i].exercisecommon.exercise.ExerciseType = 18;
                $scope.model.ChildrenFillBlank[i].exercisecommon.exercise.ExerciseTypeName = '填空题';
            }
        }


        var v = angular.toJson($scope.model);
        exerciseService.Exercise_Custom_M_Edit(v, function (data) {
            if (data.d != null) {
                $scope.$emit('onExerciseSaved', data.d.exercisecommon.exercise.ExerciseID);
            }
        });
    });
    //打印方法
    $scope.$on('onPreview', function (event) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        $scope.$emit('onBeginPreview', $scope.model);
    });
    //上传方法
    $scope.$on('onRemoveFinishedAttachment', function (event, attachment) {
        $scope.removeAttachment($scope.model.exercisecommon.attachmentlist, attachment);
    });

    $scope.model = {};//ExerciseInfo对象

    $scope.Attachment = {};//附件对象
    $scope.ExerciseID = parseInt($stateParams.ExerciseID);//习题ID
    var answer = { Conten: '', IsCorrect: 0 };


    var init = function () {
        if ($scope.ExerciseID > -1) {
            exerciseService.Exercise_Custom_Get($scope.ExerciseID, function (data) {
                $scope.model = data.d;
                //if ($scope.model.Children[0].exercisecommon.exercise.ExerciseType == 2)
                //    $scope.isShowRadio = 1;
                //if ($scope.model.ChildrenMultiple[0].exercisecommon.exercise.ExerciseType == 3)
                //    $scope.isShowMultiple = 1;
                //if ($scope.model.ChildrenFillBlank[0].exercisecommon.exercise.ExerciseType == 18)
                //    $scope.isShowFillBlank = 1;
                if ($scope.model.Children.length > 0)
                    $scope.isShowRadio = 1;
                if ($scope.model.ChildrenMultiple.length > 0)
                    $scope.isShowMultiple = 1;
                if ($scope.model.ChildrenFillBlank.length > 0)
                    $scope.isShowFillBlank = 1;

                $scope.willEdit($scope.model);
                $scope.editorText = $scope.model.exercisecommon.exercise.Conten;
                $scope.editorAnalysisText = $scope.model.exercisecommon.exercise.Analysis;
                $scope.assignEditorValues(
                           {
                               editorInput: $scope.editorText
                               //editorAnswer: $scope.editorAnswerText,
                               //editorAnalysis: $scope.editorAnalysisText
                           }
                       )
                if ($scope.model.exercisecommon.attachmentlist.length > 0) {
                    $scope.$emit('onAttachmentList', $scope.model.exercisecommon.attachmentlist);
                }
            });
        } else {
            exerciseService.Exercise_Model_Info_Get(function (data) {
                $scope.model = data.d;
                $scope.model.Children.length = 0;
                $scope.model.ChildrenMultiple.length = 0;
                $scope.model.ChildrenFillBlank.length = 0;
            });
        }
    }
    //添加选项
    $scope.AddAnswer = function (children) {
        answer = { Conten: '', IsCorrect: 0 };
        children.exercisechoicelist.push(answer);
    }
    //删除选项
    $scope.del = function (item) {
        if ($scope.ExerciseID > 0) {
            for (var n = 0; n < $scope.model.Children.length; n++) {
                for (var i = 0; i < $scope.model.Children[n].exercisechoicelist.length; i++) {
                    if ($scope.model.Children[n].exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                        $scope.model.Children[n].exercisechoicelist[i].Conten = '';
                    }
                }
            }
        } else {
            for (var n = 0; n < $scope.model.Children.length; n++) {
                for (var i = 0; i < $scope.model.Children[n].exercisechoicelist.length; i++) {
                    if ($scope.model.Children[n].exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                        $scope.model.Children[n].exercisechoicelist.splice(i, 1);
                    }
                }
            }
        }
    }
    //是否是正确答案
    $scope.isCorrectChange = function (item, items) {
        for (var i = 0; i < items.length; i++) {
            items[i].IsCorrect = 0;
        }
        item.IsCorrect = item.IsCorrect ? 0 : 1;
    }

    //添加选项,多选
    $scope.AddAnswerMultiple = function (childrenMultiple) {
        answer = { Conten: '', IsCorrect: 0 };
        childrenMultiple.exercisechoicelist.push(answer);
    }
    //删除选项,多选
    $scope.delMultiple = function (item) {
        if ($scope.ExerciseID > 0) {
            for (var n = 0; n < $scope.model.ChildrenMultiple.length; n++) {
                for (var i = 0; i < $scope.model.ChildrenMultiple[n].exercisechoicelist.length; i++) {
                    if ($scope.model.ChildrenMultiple[n].exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                        $scope.model.ChildrenMultiple[n].exercisechoicelist[i].Conten = '';
                    }
                }
            }
        } else {
            for (var n = 0; n < $scope.model.ChildrenMultiple.length; n++) {
                for (var i = 0; i < $scope.model.ChildrenMultiple[n].exercisechoicelist.length; i++) {
                    if ($scope.model.ChildrenMultiple[n].exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                        $scope.model.ChildrenMultiple[n].exercisechoicelist.splice(i, 1);
                    }
                }
            }
        }
    }
    //是否是正确答案,多选
    $scope.isCorrectChangeMultiple = function (item) {
        item.IsCorrect = item.IsCorrect ? 0 : 1;
    }

    //拼接单选，多选题选项
    var SplicingRadio = function (model) {
        for (var n = 0; n < model.length; n++) {
            model[n].exercisecommon.exercise.Content = "";
            if (model[n].exercisecommon.exercise.ExerciseID > 0) {
                for (var i = 0; i < model[n].exercisechoicelist.length; i++) {
                    var answer = model[n].exercisechoicelist[i].Conten == null ? "" : model[n].exercisechoicelist[i].Conten;
                    var childId = model[n].exercisechoicelist[i].ChoiceID == null ? 0 : model[n].exercisechoicelist[i].ChoiceID;
                    var isCorrect = model[n].exercisechoicelist[i].IsCorrect == false ? 0 : 1;
                    if ((i + 1) == model[n].exercisechoicelist.length) {
                        model[n].exercisecommon.exercise.Content +=
                        childId + "wshgkjqbwhfbxlfrh_b"
                        + answer + "wshgkjqbwhfbxlfrh_c" + isCorrect;
                    } else {
                        model[n].exercisecommon.exercise.Content +=
                        childId + "wshgkjqbwhfbxlfrh_b"
                        + answer + "wshgkjqbwhfbxlfrh_c" + isCorrect + "wshgkjqbwhfbxlfrh_a";
                    }
                }
            }
            else {
                for (var i = 0; i < model[n].exercisechoicelist.length; i++) {
                    var answer = model[n].exercisechoicelist[i].Conten == null ? "" : model[n].exercisechoicelist[i].Conten;
                    if ((i + 1) == model[n].exercisechoicelist.length) {
                        model[n].exercisecommon.exercise.Content +=
                        "0wshgkjqbwhfbxlfrh_b" + answer + "wshgkjqbwhfbxlfrh_c" + model[n].exercisechoicelist[i].IsCorrect;
                    } else {
                        model[n].exercisecommon.exercise.Content +=
                        "0wshgkjqbwhfbxlfrh_b" + answer + "wshgkjqbwhfbxlfrh_c" + model[n].exercisechoicelist[i].IsCorrect + "wshgkjqbwhfbxlfrh_a";
                    }
                }
            }
        }
    }
    //增加一类提
    $scope.AddRadio = function () {
        if ($scope.isShowRadio != 1) {
            $scope.isShowRadio = 1;
        }
        exerciseService.Exercise_Model_Info_Get(function (data) {
            var rs = data.d;
            for (var i = 0; i < 4; i++) {
                $scope.AddAnswer(rs.Children[0]);
            }
            $scope.model.Children.push(rs.Children[0]);
        });
    }
    $scope.AddMultiple = function () {
        if ($scope.isShowMultiple != 1) {
            $scope.isShowMultiple = 1;
        }
        exerciseService.Exercise_Model_Info_Get(function (data) {
            var rs = data.d;
            for (var i = 0; i < 4; i++) {
                $scope.AddAnswer(rs.ChildrenMultiple[0]);
            }
            $scope.model.ChildrenMultiple.push(rs.ChildrenMultiple[0]);
        });
    }
    $scope.AddFillBlank = function () {
        if ($scope.isShowFillBlank != 1) {
            $scope.isShowFillBlank = 1;
        }
        exerciseService.Exercise_Model_Info_Get(function (data) {
            var rs = data.d;
            $scope.model.ChildrenFillBlank.push(rs.ChildrenFillBlank[0]);
        });
    }

    /// 0 Radio 1 Multi 2 fillBlank
    $scope.typeValue = -1;
    $scope.removeIndex = -1;
    $scope.opChildren = undefined;

    //删除一类题
    //$scope.delRadio = function (children) {
    //    $scope.model.Children.splice(children, 1);
    //    exerciseService.Exercise_Del(children.exercisecommon.exercise.ExerciseID, function (data) {
    //    });
    //    if ($scope.model.Children.length == 0) {
    //        $scope.isShowRadio = 0;
    //    }
    //}
    //$scope.delMultiples = function (childrenMultiple) {
    //    $scope.model.ChildrenMultiple.splice(childrenMultiple, 1);
    //    exerciseService.Exercise_Del(childrenMultiple.exercisecommon.exercise.ExerciseID, function (data) {
    //    });
    //    if ($scope.model.ChildrenMultiple.length == 0) {
    //        $scope.isShowMultiple = 0;
    //    }
    //}
    //$scope.delFillBlank = function (childrenFillBlank) {
    //    $scope.model.ChildrenFillBlank.splice(childrenFillBlank, 1);
    //    exerciseService.Exercise_Del(childrenFillBlank.exercisecommon.exercise.ExerciseID, function (data) {
    //    });
    //    if ($scope.model.ChildrenFillBlank.length == 0) {
    //        $scope.isShowFillBlank = 0;
    //    }
    //}
    //删除一类题
    $scope.delRadio = function (removeIndex, typeValue) {
        $scope.typeValue = typeValue;
        $scope.removeIndex = removeIndex;
        $scope.opChildren = $scope.model.Children[removeIndex];
        $('#eConfirm').toggle();
    }
    $scope.delMultiples = function (removeIndex, typeValue) {
        $scope.typeValue = typeValue;
        $scope.removeIndex = removeIndex;
        $scope.opChildren = $scope.model.ChildrenMultiple[removeIndex];
        $('#eConfirm').toggle();
    }
    $scope.delFillBlank = function (removeIndex, typeValue) {
        $scope.typeValue = typeValue;
        $scope.removeIndex = removeIndex;
        $scope.opChildren = $scope.model.ChildrenFillBlank[removeIndex];
        $('#eConfirm').toggle();
    }

    ///确认删除
    $scope.$on('onDialogOk', function (event) {
        switch ($scope.typeValue) {
            case 0: /// Radio
                $scope.model.Children.splice($scope.removeIndex, 1);

                exerciseService.Exercise_Del($scope.opChildren.exercisecommon.exercise.ExerciseID, function (data) {
                });
                if ($scope.model.Children.length == 0) {
                    $scope.isShowRadio = 0;
                }
                break;
            case 1:  /// Multi
                $scope.model.ChildrenMultiple.splice($scope.removeIndex, 1);
                exerciseService.Exercise_Del($scope.opChildren.exercisecommon.exercise.ExerciseID, function (data) {
                });
                if ($scope.model.ChildrenMultiple.length == 0) {
                    $scope.isShowMultiple = 0;
                }
                break;
            case 2: /// FillBlank
                $scope.model.ChildrenFillBlank.splice($scope.removeIndex, 1);
                exerciseService.Exercise_Del($scope.opChildren.exercisecommon.exercise.ExerciseID, function (data) {
                });
                if ($scope.model.ChildrenFillBlank.length == 0) {
                    $scope.isShowFillBlank = 0;
                }
                break;
            default:
                break;
        }
    });

    init();
}]);

//自定义题
appExercise.controller('CustomCtrl', ['$scope', 'exerciseService', '$stateParams', '$state', function ($scope, exerciseService, $stateParams, $state) {
    $scope.$on('willExerciseChange', function (event, changeParam) {

    });
    //保存方法
    $scope.$on('willRequestSave', function (event, data) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();

        if ($scope.model.exercisecommon.exercise.Conten == "" || $scope.model.exercisecommon.exercise.Conten == null) {
            alert('请填写题干');
            $scope.$parent.resetForbid();
            return;
        }

        $scope.willTopBind($scope.model, data);
        //增加子单选题
        if ($scope.isShowRadio == 1) {
            SplicingRadio($scope.model.Children);
            for (var i = 0; i < $scope.model.Children.length; i++) {
                $scope.model.Children[i].exercisecommon.exercise.ExerciseType = 2;
                $scope.model.Children[i].exercisecommon.exercise.ExerciseTypeName = '单选题';
            }
        }
        //增加子多选题
        if ($scope.isShowMultiple == 1) {
            SplicingRadio($scope.model.ChildrenMultiple);
            for (var i = 0; i < $scope.model.ChildrenMultiple.length; i++) {
                $scope.model.ChildrenMultiple[i].exercisecommon.exercise.ExerciseType = 3;
                $scope.model.ChildrenMultiple[i].exercisecommon.exercise.ExerciseTypeName = '多选题';
            }
        }
        //增加子填空题
        if ($scope.isShowFillBlank == 1) {
            for (var i = 0; i < $scope.model.ChildrenFillBlank.length; i++) {
                $scope.model.ChildrenFillBlank[i].exercisecommon.exercise.ExerciseType = 18;
                $scope.model.ChildrenFillBlank[i].exercisecommon.exercise.ExerciseTypeName = '填空题';
            }
        }


        var v = angular.toJson($scope.model);
        exerciseService.Exercise_Custom_M_Edit(v, function (data) {
            if (data.d != null) {
                $scope.$emit('onExerciseSaved', data.d.exercisecommon.exercise.ExerciseID);
            }
        });
    });
    //打印方法
    $scope.$on('onPreview', function (event) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        $scope.$emit('onBeginPreview', $scope.model);
    });
    //上传方法
    $scope.$on('onRemoveFinishedAttachment', function (event, attachment) {
        $scope.removeAttachment($scope.model.exercisecommon.attachmentlist, attachment);
    });

    $scope.model = {};//ExerciseInfo对象

    $scope.Attachment = {};//附件对象
    $scope.ExerciseID = parseInt($stateParams.ExerciseID);//习题ID
    var answer = { Conten: '', IsCorrect: 0 };


    var init = function () {
        if ($scope.ExerciseID > -1) {
            exerciseService.Exercise_Custom_Get($scope.ExerciseID, function (data) {
                $scope.model = data.d;
                //if ($scope.model.Children[0].exercisecommon.exercise.ExerciseType == 2)
                //    $scope.isShowRadio = 1;
                //if ($scope.model.ChildrenMultiple[0].exercisecommon.exercise.ExerciseType == 3)
                //    $scope.isShowMultiple = 1;
                //if ($scope.model.ChildrenFillBlank[0].exercisecommon.exercise.ExerciseType == 18)
                //    $scope.isShowFillBlank = 1;
                if ($scope.model.Children.length > 0)
                    $scope.isShowRadio = 1;
                if ($scope.model.ChildrenMultiple.length > 0)
                    $scope.isShowMultiple = 1;
                if ($scope.model.ChildrenFillBlank.length > 0)
                    $scope.isShowFillBlank = 1;

                $scope.willEdit($scope.model);
                $scope.editorText = $scope.model.exercisecommon.exercise.Conten;
                $scope.editorAnalysisText = $scope.model.exercisecommon.exercise.Analysis;


                $scope.assignEditorValues(
                    {
                        editorInput: $scope.editorText
                        //editorAnswer: $scope.editorAnswerText,
                        //editorAnalysis: $scope.editorAnalysisText
                    });

                if ($scope.model.exercisecommon.attachmentlist.length > 0) {
                    $scope.$emit('onAttachmentList', $scope.model.exercisecommon.attachmentlist);
                }
            });
        } else {
            exerciseService.Exercise_Model_Info_Get(function (data) {
                $scope.model = data.d;
                $scope.model.Children.length = 0;
                $scope.model.ChildrenMultiple.length = 0;
                $scope.model.ChildrenFillBlank.length = 0;
            });
        }
    }
    //添加选项
    $scope.AddAnswer = function (children) {
        answer = { Conten: '', IsCorrect: 0 };
        children.exercisechoicelist.push(answer);
    }
    //删除选项
    $scope.del = function (item) {
        if ($scope.ExerciseID > 0) {
            for (var n = 0; n < $scope.model.Children.length; n++) {
                for (var i = 0; i < $scope.model.Children[n].exercisechoicelist.length; i++) {
                    if ($scope.model.Children[n].exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                        $scope.model.Children[n].exercisechoicelist[i].Conten = '';
                    }
                }
            }
        } else {
            for (var n = 0; n < $scope.model.Children.length; n++) {
                for (var i = 0; i < $scope.model.Children[n].exercisechoicelist.length; i++) {
                    if ($scope.model.Children[n].exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                        $scope.model.Children[n].exercisechoicelist.splice(i, 1);
                    }
                }
            }
        }
    }
    //是否是正确答案
    $scope.isCorrectChange = function (item, items) {
        for (var i = 0; i < items.length; i++) {
            items[i].IsCorrect = 0;
        }
        item.IsCorrect = item.IsCorrect ? 0 : 1;
    }

    //添加选项,多选
    $scope.AddAnswerMultiple = function (childrenMultiple) {
        answer = { Conten: '', IsCorrect: 0 };
        childrenMultiple.exercisechoicelist.push(answer);
    }
    //删除选项,多选
    $scope.delMultiple = function (item) {
        if ($scope.ExerciseID > 0) {
            for (var n = 0; n < $scope.model.ChildrenMultiple.length; n++) {
                for (var i = 0; i < $scope.model.ChildrenMultiple[n].exercisechoicelist.length; i++) {
                    if ($scope.model.ChildrenMultiple[n].exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                        $scope.model.ChildrenMultiple[n].exercisechoicelist[i].Conten = '';
                    }
                }
            }
        } else {
            for (var n = 0; n < $scope.model.ChildrenMultiple.length; n++) {
                for (var i = 0; i < $scope.model.ChildrenMultiple[n].exercisechoicelist.length; i++) {
                    if ($scope.model.ChildrenMultiple[n].exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                        $scope.model.ChildrenMultiple[n].exercisechoicelist.splice(i, 1);
                    }
                }
            }
        }
    }
    //是否是正确答案,多选
    $scope.isCorrectChangeMultiple = function (item) {
        item.IsCorrect = item.IsCorrect ? 0 : 1;
    }

    //拼接单选，多选题选项
    var SplicingRadio = function (model) {
        for (var n = 0; n < model.length; n++) {
            model[n].exercisecommon.exercise.Content = "";
            if (model[n].exercisecommon.exercise.ExerciseID > 0) {
                for (var i = 0; i < model[n].exercisechoicelist.length; i++) {
                    var answer = model[n].exercisechoicelist[i].Conten == null ? "" : model[n].exercisechoicelist[i].Conten;
                    var childId = model[n].exercisechoicelist[i].ChoiceID == null ? 0 : model[n].exercisechoicelist[i].ChoiceID;
                    var isCorrect = model[n].exercisechoicelist[i].IsCorrect == false ? 0 : 1;
                    if ((i + 1) == model[n].exercisechoicelist.length) {
                        model[n].exercisecommon.exercise.Content +=
                        childId + "wshgkjqbwhfbxlfrh_b"
                        + answer + "wshgkjqbwhfbxlfrh_c" + isCorrect;
                    } else {
                        model[n].exercisecommon.exercise.Content +=
                        childId + "wshgkjqbwhfbxlfrh_b"
                        + answer + "wshgkjqbwhfbxlfrh_c" + isCorrect + "wshgkjqbwhfbxlfrh_a";
                    }
                }
            }
            else {
                for (var i = 0; i < model[n].exercisechoicelist.length; i++) {
                    var answer = model[n].exercisechoicelist[i].Conten == null ? "" : model[n].exercisechoicelist[i].Conten;
                    if ((i + 1) == model[n].exercisechoicelist.length) {
                        model[n].exercisecommon.exercise.Content +=
                        "0wshgkjqbwhfbxlfrh_b" + answer + "wshgkjqbwhfbxlfrh_c" + model[n].exercisechoicelist[i].IsCorrect;
                    } else {
                        model[n].exercisecommon.exercise.Content +=
                        "0wshgkjqbwhfbxlfrh_b" + answer + "wshgkjqbwhfbxlfrh_c" + model[n].exercisechoicelist[i].IsCorrect + "wshgkjqbwhfbxlfrh_a";
                    }
                }
            }
        }
    }
    //增加一类提
    $scope.AddRadio = function () {
        if ($scope.isShowRadio != 1) {
            $scope.isShowRadio = 1;
        }
        exerciseService.Exercise_Model_Info_Get(function (data) {
            var rs = data.d;
            for (var i = 0; i < 4; i++) {
                $scope.AddAnswer(rs.Children[0]);
            }
            $scope.model.Children.push(rs.Children[0]);
        });
    }
    $scope.AddMultiple = function () {
        if ($scope.isShowMultiple != 1) {
            $scope.isShowMultiple = 1;
        }
        exerciseService.Exercise_Model_Info_Get(function (data) {
            var rs = data.d;
            for (var i = 0; i < 4; i++) {
                $scope.AddAnswer(rs.ChildrenMultiple[0]);
            }
            $scope.model.ChildrenMultiple.push(rs.ChildrenMultiple[0]);
        });
    }
    $scope.AddFillBlank = function () {
        if ($scope.isShowFillBlank != 1) {
            $scope.isShowFillBlank = 1;
        }
        exerciseService.Exercise_Model_Info_Get(function (data) {
            var rs = data.d;
            $scope.model.ChildrenFillBlank.push(rs.ChildrenFillBlank[0]);
        });
    }
    //删除一类题
    $scope.delRadio = function (children) {
        $scope.model.Children.splice(children, 1);
        exerciseService.Exercise_Del(children.exercisecommon.exercise.ExerciseID, function (data) {
        });
        if ($scope.model.Children.length == 0) {
            $scope.isShowRadio = 0;
        }
    }
    $scope.delMultiples = function (childrenMultiple) {
        $scope.model.ChildrenMultiple.splice(childrenMultiple, 1);
        exerciseService.Exercise_Del(childrenMultiple.exercisecommon.exercise.ExerciseID, function (data) {
        });
        if ($scope.model.ChildrenMultiple.length == 0) {
            $scope.isShowMultiple = 0;
        }
    }
    $scope.delFillBlank = function (childrenFillBlank) {
        $scope.model.ChildrenFillBlank.splice(childrenFillBlank, 1);
        exerciseService.Exercise_Del(childrenFillBlank.exercisecommon.exercise.ExerciseID, function (data) {
        });
        if ($scope.model.ChildrenFillBlank.length == 0) {
            $scope.isShowFillBlank = 0;
        }
    }
    init();
}]);

//阅读理解
appExercise.controller('ReadingCtrl', ['$scope', 'exerciseService', '$stateParams', '$state', function ($scope, exerciseService, $stateParams, $state) {
    $scope.$on('willExerciseChange', function (event, changeParam) {

    });
    //保存方法
    $scope.$on('willRequestSave', function (event, data) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        if ($scope.model.exercisecommon.exercise.Conten == "" || $scope.model.exercisecommon.exercise.Conten == null) {
            alert('请填写题干');
            $scope.$parent.resetForbid();
            return;
        }

        $scope.willTopBind($scope.model, data);
        //增加子单选题
        if ($scope.isShowRadio == 1) {
            SplicingRadio($scope.model.Children);
            for (var i = 0; i < $scope.model.Children.length; i++) {
                $scope.model.Children[i].exercisecommon.exercise.ExerciseType = 2;
                $scope.model.Children[i].exercisecommon.exercise.ExerciseTypeName = '单选题';
            }
        }
        //增加子多选题
        if ($scope.isShowMultiple == 1) {
            SplicingRadio($scope.model.ChildrenMultiple);
            for (var i = 0; i < $scope.model.ChildrenMultiple.length; i++) {
                $scope.model.ChildrenMultiple[i].exercisecommon.exercise.ExerciseType = 3;
                $scope.model.ChildrenMultiple[i].exercisecommon.exercise.ExerciseTypeName = '多选题';
            }
        }
        //增加子填空题
        if ($scope.isShowFillBlank == 1) {
            for (var i = 0; i < $scope.model.ChildrenFillBlank.length; i++) {
                $scope.model.ChildrenFillBlank[i].exercisecommon.exercise.ExerciseType = 18;
                $scope.model.ChildrenFillBlank[i].exercisecommon.exercise.ExerciseTypeName = '填空题';
            }
        }


        var v = angular.toJson($scope.model);
        exerciseService.Exercise_Custom_M_Edit(v, function (data) {
            if (data.d != null) {
                $scope.$emit('onExerciseSaved', data.d.exercisecommon.exercise.ExerciseID);
            }
        });
    });
    //打印方法
    $scope.$on('onPreview', function (event) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        $scope.$emit('onBeginPreview', $scope.model);
    });
    //上传方法
    $scope.$on('onRemoveFinishedAttachment', function (event, attachment) {
        $scope.removeAttachment($scope.model.exercisecommon.attachmentlist, attachment);
    });

    $scope.model = {};//ExerciseInfo对象

    $scope.Attachment = {};//附件对象
    $scope.ExerciseID = parseInt($stateParams.ExerciseID);//习题ID
    var answer = { Conten: '', IsCorrect: 0 };


    var init = function () {
        if ($scope.ExerciseID > -1) {
            exerciseService.Exercise_Custom_Get($scope.ExerciseID, function (data) {
                $scope.model = data.d;
                //if ($scope.model.Children[0].exercisecommon.exercise.ExerciseType == 2)
                //    $scope.isShowRadio = 1;
                //if ($scope.model.ChildrenMultiple[0].exercisecommon.exercise.ExerciseType == 3)
                //    $scope.isShowMultiple = 1;
                //if ($scope.model.ChildrenFillBlank[0].exercisecommon.exercise.ExerciseType == 18)
                //    $scope.isShowFillBlank = 1;
                if ($scope.model.Children.length > 0)
                    $scope.isShowRadio = 1;
                if ($scope.model.ChildrenMultiple.length > 0)
                    $scope.isShowMultiple = 1;
                if ($scope.model.ChildrenFillBlank.length > 0)
                    $scope.isShowFillBlank = 1;

                $scope.willEdit($scope.model);
                $scope.editorText = $scope.model.exercisecommon.exercise.Conten;
                $scope.editorAnalysisText = $scope.model.exercisecommon.exercise.Analysis;

                $scope.assignEditorValues(
                {
                    editorInput: $scope.editorText
                    //editorAnswer: $scope.editorAnswerText,
                    //editorAnalysis: $scope.editorAnalysisText
                });
                if ($scope.model.exercisecommon.attachmentlist.length > 0) {
                    $scope.$emit('onAttachmentList', $scope.model.exercisecommon.attachmentlist);
                }
            });
        } else {
            exerciseService.Exercise_Model_Info_Get(function (data) {
                $scope.model = data.d;
                $scope.model.Children.length = 0;
                $scope.model.ChildrenMultiple.length = 0;
                $scope.model.ChildrenFillBlank.length = 0;
            });
        }
    }
    //添加选项
    $scope.AddAnswer = function (children) {
        answer = { Conten: '', IsCorrect: 0 };
        children.exercisechoicelist.push(answer);
    }
    //删除选项
    $scope.del = function (item) {
        if ($scope.ExerciseID > 0) {
            for (var n = 0; n < $scope.model.Children.length; n++) {
                for (var i = 0; i < $scope.model.Children[n].exercisechoicelist.length; i++) {
                    if ($scope.model.Children[n].exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                        $scope.model.Children[n].exercisechoicelist[i].Conten = '';
                    }
                }
            }
        } else {
            for (var n = 0; n < $scope.model.Children.length; n++) {
                for (var i = 0; i < $scope.model.Children[n].exercisechoicelist.length; i++) {
                    if ($scope.model.Children[n].exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                        $scope.model.Children[n].exercisechoicelist.splice(i, 1);
                    }
                }
            }
        }
    }
    //是否是正确答案
    $scope.isCorrectChange = function (item, items) {
        for (var i = 0; i < items.length; i++) {
            items[i].IsCorrect = 0;
        }
        item.IsCorrect = item.IsCorrect ? 0 : 1;
    }

    //添加选项,多选
    $scope.AddAnswerMultiple = function (childrenMultiple) {
        answer = { Conten: '', IsCorrect: 0 };
        childrenMultiple.exercisechoicelist.push(answer);
    }
    //删除选项,多选
    $scope.delMultiple = function (item) {
        if ($scope.ExerciseID > 0) {
            for (var n = 0; n < $scope.model.ChildrenMultiple.length; n++) {
                for (var i = 0; i < $scope.model.ChildrenMultiple[n].exercisechoicelist.length; i++) {
                    if ($scope.model.ChildrenMultiple[n].exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                        $scope.model.ChildrenMultiple[n].exercisechoicelist[i].Conten = '';
                    }
                }
            }
        } else {
            for (var n = 0; n < $scope.model.ChildrenMultiple.length; n++) {
                for (var i = 0; i < $scope.model.ChildrenMultiple[n].exercisechoicelist.length; i++) {
                    if ($scope.model.ChildrenMultiple[n].exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                        $scope.model.ChildrenMultiple[n].exercisechoicelist.splice(i, 1);
                    }
                }
            }
        }
    }
    //是否是正确答案,多选
    $scope.isCorrectChangeMultiple = function (item) {
        item.IsCorrect = item.IsCorrect ? 0 : 1;
    }

    //拼接单选，多选题选项
    var SplicingRadio = function (model) {
        for (var n = 0; n < model.length; n++) {
            model[n].exercisecommon.exercise.Content = "";
            if (model[n].exercisecommon.exercise.ExerciseID > 0) {
                for (var i = 0; i < model[n].exercisechoicelist.length; i++) {
                    var answer = model[n].exercisechoicelist[i].Conten == null ? "" : model[n].exercisechoicelist[i].Conten;
                    var childId = model[n].exercisechoicelist[i].ChoiceID == null ? 0 : model[n].exercisechoicelist[i].ChoiceID;
                    var isCorrect = model[n].exercisechoicelist[i].IsCorrect == false ? 0 : 1;
                    if ((i + 1) == model[n].exercisechoicelist.length) {
                        model[n].exercisecommon.exercise.Content +=
                        childId + "wshgkjqbwhfbxlfrh_b"
                        + answer + "wshgkjqbwhfbxlfrh_c" + isCorrect;
                    } else {
                        model[n].exercisecommon.exercise.Content +=
                        childId + "wshgkjqbwhfbxlfrh_b"
                        + answer + "wshgkjqbwhfbxlfrh_c" + isCorrect + "wshgkjqbwhfbxlfrh_a";
                    }
                }
            }
            else {
                for (var i = 0; i < model[n].exercisechoicelist.length; i++) {
                    var answer = model[n].exercisechoicelist[i].Conten == null ? "" : model[n].exercisechoicelist[i].Conten;
                    if ((i + 1) == model[n].exercisechoicelist.length) {
                        model[n].exercisecommon.exercise.Content +=
                        "0wshgkjqbwhfbxlfrh_b" + answer + "wshgkjqbwhfbxlfrh_c" + model[n].exercisechoicelist[i].IsCorrect;
                    } else {
                        model[n].exercisecommon.exercise.Content +=
                        "0wshgkjqbwhfbxlfrh_b" + answer + "wshgkjqbwhfbxlfrh_c" + model[n].exercisechoicelist[i].IsCorrect + "wshgkjqbwhfbxlfrh_a";
                    }
                }
            }
        }
    }
    //增加一类提
    $scope.AddRadio = function () {
        if ($scope.isShowRadio != 1) {
            $scope.isShowRadio = 1;
        }
        exerciseService.Exercise_Model_Info_Get(function (data) {
            var rs = data.d;
            for (var i = 0; i < 4; i++) {
                $scope.AddAnswer(rs.Children[0]);
            }
            $scope.model.Children.push(rs.Children[0]);
        });
    }
    $scope.AddMultiple = function () {
        if ($scope.isShowMultiple != 1) {
            $scope.isShowMultiple = 1;
        }
        exerciseService.Exercise_Model_Info_Get(function (data) {
            var rs = data.d;
            for (var i = 0; i < 4; i++) {
                $scope.AddAnswer(rs.ChildrenMultiple[0]);
            }
            $scope.model.ChildrenMultiple.push(rs.ChildrenMultiple[0]);
        });
    }
    $scope.AddFillBlank = function () {
        if ($scope.isShowFillBlank != 1) {
            $scope.isShowFillBlank = 1;
        }
        exerciseService.Exercise_Model_Info_Get(function (data) {
            var rs = data.d;
            $scope.model.ChildrenFillBlank.push(rs.ChildrenFillBlank[0]);
        });
    }

    /// 0 Radio 1 Multi 2 fillBlank
    $scope.typeValue = -1;
    $scope.removeIndex = -1;
    $scope.opChildren = undefined;

    //删除一类题
    $scope.delRadio = function (removeIndex, typeValue) {
        $scope.typeValue = typeValue;
        $scope.removeIndex = removeIndex;
        $scope.opChildren = $scope.model.Children[removeIndex];
        $('#eConfirm').toggle();
    }
    $scope.delMultiples = function (removeIndex, typeValue) {
        $scope.typeValue = typeValue;
        $scope.removeIndex = removeIndex;
        $scope.opChildren = $scope.model.ChildrenMultiple[removeIndex];
        $('#eConfirm').toggle();
    }
    $scope.delFillBlank = function (removeIndex, typeValue) {
        $scope.typeValue = typeValue;
        $scope.removeIndex = removeIndex;
        $scope.opChildren = $scope.model.ChildrenFillBlank[removeIndex];
        $('#eConfirm').toggle();
    }

    ///确认删除
    $scope.$on('onDialogOk', function (event) {
        switch ($scope.typeValue) {
            case 0: /// Radio
                $scope.model.Children.splice($scope.removeIndex, 1);

                exerciseService.Exercise_Del($scope.opChildren.exercisecommon.exercise.ExerciseID, function (data) {
                });
                if ($scope.model.Children.length == 0) {
                    $scope.isShowRadio = 0;
                }
                break;
            case 1:  /// Multi
                $scope.model.ChildrenMultiple.splice($scope.removeIndex, 1);
                exerciseService.Exercise_Del($scope.opChildren.exercisecommon.exercise.ExerciseID, function (data) {
                });
                if ($scope.model.ChildrenMultiple.length == 0) {
                    $scope.isShowMultiple = 0;
                }
                break;
            case 2: /// FillBlank
                $scope.model.ChildrenFillBlank.splice($scope.removeIndex, 1);
                exerciseService.Exercise_Del($scope.opChildren.exercisecommon.exercise.ExerciseID, function (data) {
                });
                if ($scope.model.ChildrenFillBlank.length == 0) {
                    $scope.isShowFillBlank = 0;
                }
                break;
            default:
                break;
        }

    });

    init();
}]);

//问答题
appExercise.controller('QuesanswerCtrl', ['$scope', 'exerciseService', '$stateParams', '$state', '$timeout',
    function ($scope, exerciseService, $stateParams, $state, $timeout) {


        $scope.$on('willExerciseChange', function (event, changeParam) {

        });
        $scope.$on('willRequestSave', function (event, data) {
            var editor = EWEBEDITOR.Instances["editorInput"];
            $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
            var editor1 = EWEBEDITOR.Instances["editorAnalysis"];
            $scope.model.exercisecommon.exercise.Analysis = editor1.getHTML();
            var editor2 = EWEBEDITOR.Instances["editorAnswer"];
            $scope.model.exercisecommon.exercise.Answer = editor2.getHTML();

            if ($scope.model.exercisecommon.exercise.Conten == "" || $scope.model.exercisecommon.exercise.Conten == null) {
                alert('请填写题干');
                $scope.$parent.resetForbid();
                return;
            }

            $scope.willTopBind($scope.model, data);

            var v = angular.toJson($scope.model);
            exerciseService.Exercise_Writing_M_Edit(v, function (data) {
                if (data.d != null) {
                    $scope.$emit('onExerciseSaved', data.d.exercisecommon.exercise.ExerciseID);
                }
            });
        });

        $scope.$on('onPreview', function (event) {
            var editor = EWEBEDITOR.Instances["editorInput"];
            $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
            var editor2 = EWEBEDITOR.Instances["editorAnswer"];
            $scope.model.exercisecommon.exercise.Answer = editor2.getHTML();
            $scope.$emit('onBeginPreview', $scope.model);
        });

        $scope.model = {};//ExerciseInfo对象
        $scope.Attachment = {};//附件对象
        $scope.ExerciseID = parseInt($stateParams.ExerciseID);//习题ID

        $scope.$on('onRemoveFinishedAttachment', function (event, attachment) {
            $scope.removeAttachment($scope.model.exercisecommon.attachmentlist, attachment);
        });
        /*
        var setEditorValue = function () {
            //$("#editor01").contentWindow.setHTML($scope.editorText);
            //$("#editor02").contentWindow.setHTML($scope.editorAnswerText);
            //$("#editor03").contentWindow.setHTML($scope.editorAnalysisText); 

            EWEBEDITOR.Instances["editorInput"].setHTML($scope.editorText);
            EWEBEDITOR.Instances["editorAnswer"].setHTML($scope.editorAnswerText);
            EWEBEDITOR.Instances["editorAnalysis"].setHTML($scope.editorAnalysisText);
        }

        var setEditorValue1 = function (arrEditorNameValues) {
            //$("#editor01").contentWindow.setHTML($scope.editorText);
            //$("#editor02").contentWindow.setHTML($scope.editorAnswerText);
            //$("#editor03").contentWindow.setHTML($scope.editorAnalysisText); 

            angular.forEach(arrEditorNameValues, function (key, value) {
                EWEBEDITOR.Instances[key].setHTML(value);
            });
        }*/

        $scope.$on('$viewContentLoaded', function (event) {

            //if (EWEBEDITOR.Instances["editorInput1"]) {
            //    EWEBEDITOR.Instances["editorInput1"].Remove();
            //}

            //EWEBEDITOR.Replace("editorInput1", { style: "coolblue", width: "850", height: "300" });

            $scope.$parent.AllowedChangeExerciseType = true;
            if ($scope.ExerciseID > -1) {
                exerciseService.loadedCount = 1;
                exerciseService.Exercise_Writing_Get($scope.ExerciseID, function (data) {
                    $scope.model = data.d;
                    $scope.willEdit($scope.model);
                    $scope.editorText = $scope.model.exercisecommon.exercise.Conten;
                    $scope.editorAnalysisText = $scope.model.exercisecommon.exercise.Analysis;
                    $scope.editorAnswerText = $scope.model.exercisecommon.exercise.Answer;
                    if ($scope.model.exercisecommon.attachmentlist.length > 0) {
                        $scope.$emit('onAttachmentList', $scope.model.exercisecommon.attachmentlist);
                    }
                    //EWEBEDITOR.Instances["editorInput1"].setHTML($scope.editorText);

                    $scope.assignEditorValues(
                            {
                                editorInput: $scope.editorText,
                                editorAnswer: $scope.editorAnswerText,
                                editorAnalysis: $scope.editorAnalysisText
                            }
                        )
                    /*
                     $timeout(function () {
                         //$("#editor01").contentWindow.setHTML($scope.editorText);
                         //$("#editor02").contentWindow.setHTML($scope.editorAnswerText);
                         //$("#editor03").contentWindow.setHTML($scope.editorAnalysisText); 
                       
                         EWEBEDITOR.Instances["editorInput"].setHTML($scope.editorText);
                         EWEBEDITOR.Instances["editorAnswer"].setHTML($scope.editorAnswerText);
                         EWEBEDITOR.Instances["editorAnalysis"].setHTML($scope.editorAnalysisText);
                     }, 200);*/
                });
            } else {
                exerciseService.Exercise_Model_Info_Get(function (data) {
                    $scope.model = data.d;
                    $scope.textarea = 0;//切换试题解析和得分点
                });
            }
        });
    }]);

//名词解释
appExercise.controller('NounCtrl', ['$scope', 'exerciseService', '$stateParams', '$state', function ($scope, exerciseService, $stateParams, $state) {
    $scope.$on('willExerciseChange', function (event, changeParam) {

    });

    $scope.$on('willRequestSave', function (event, data) {
        //var editor = EWEBEDITOR.Instances["editorInput"];
        //$scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        var editor1 = EWEBEDITOR.Instances["editorAnalysis"];
        $scope.model.exercisecommon.exercise.Analysis = editor1.getHTML();

        if ($scope.model.exercisecommon.exercise.Conten == "" || $scope.model.exercisecommon.exercise.Conten == null) {
            alert('请填写题干');
            $scope.$parent.resetForbid();
            return;
        }

        $scope.model.exercisecommon.exercise.Content = "";
        if ($scope.ExerciseID > 0) {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                var answer = $scope.model.exercisechoicelist[i].Answer == null ? "" : $scope.model.exercisechoicelist[i].Answer;
                var childId = $scope.model.exercisechoicelist[i].ExerciseID == null ? 0 : $scope.model.exercisechoicelist[i].ExerciseID;
                if ((i + 1) == $scope.model.exercisechoicelist.length) {
                    $scope.model.exercisecommon.exercise.Content +=
                    childId + "wshgkjqbwhfbxlfrh_b"
                    + $scope.model.exercisecommon.exercise.Conten + "wshgkjqbwhfbxlfrh_c" + answer;
                } else {
                    $scope.model.exercisecommon.exercise.Content +=
                    childId + "wshgkjqbwhfbxlfrh_b"
                    + $scope.model.exercisecommon.exercise.Conten + "wshgkjqbwhfbxlfrh_c" + answer + "wshgkjqbwhfbxlfrh_a";
                }
            }
        }
        else {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                var answer = $scope.model.exercisechoicelist[i].Answer == null ? "" : $scope.model.exercisechoicelist[i].Answer;
                if ((i + 1) == $scope.model.exercisechoicelist.length) {
                    $scope.model.exercisecommon.exercise.Content +=
                    "0wshgkjqbwhfbxlfrh_b" + $scope.model.exercisecommon.exercise.Conten + "wshgkjqbwhfbxlfrh_c" + answer;
                } else {
                    $scope.model.exercisecommon.exercise.Content +=
                    "0wshgkjqbwhfbxlfrh_b" + $scope.model.exercisecommon.exercise.Conten + "wshgkjqbwhfbxlfrh_c" + answer + "wshgkjqbwhfbxlfrh_a";
                }
            }
        }

        $scope.willTopBind($scope.model, data);

        var v = angular.toJson($scope.model);
        exerciseService.Exercise_Analysis_M_Edit(v, function (data) {
            if (data.d != null) {
                $scope.$emit('onExerciseSaved', data.d.exercisecommon.exercise.ExerciseID);
            }
        });
    });

    $scope.$on('onPreview', function (event) {
        $scope.$emit('onBeginPreview', $scope.model);
    });

    $scope.$on('onRemoveFinishedAttachment', function (event, attachment) {
        $scope.removeAttachment($scope.model.exercisecommon.attachmentlist, attachment);
    });

    $scope.model = {};
    $scope.ExerciseID = parseInt($stateParams.ExerciseID);//习题ID
    var answer = { Answer: '' };


    var init = function () {
        if ($scope.ExerciseID > -1) {
            exerciseService.Exercise_Analysis_Get($scope.ExerciseID, function (data) {
                $scope.model = data.d;
                if ($scope.model.exercisechoicelist.length == 0) {
                    $scope.model.exercisechoicelist.push(answer);
                }
                $scope.willEdit($scope.model);
                $scope.editorText = $scope.model.exercisecommon.exercise.Conten;
                $scope.editorAnalysisText = $scope.model.exercisecommon.exercise.Analysis;

                $scope.assignEditorValues(
    {
        //editorInput: $scope.editorText,
        //editorAnswer: $scope.editorAnswerText,
        editorAnalysis: $scope.editorAnalysisText
    });
                if ($scope.model.exercisecommon.attachmentlist.length > 0) {
                    $scope.$emit('onAttachmentList', $scope.model.exercisecommon.attachmentlist);
                }
            });
        } else {
            exerciseService.Exercise_Model_Info_Get(function (data) {
                $scope.model = data.d;
                $scope.model.exercisechoicelist.push(answer);
            });
        }

    }
    $scope.Attachment = {};//附件对象

    init();
}]);

//判断题
appExercise.controller('TruefalseCtrl', ['$scope', 'exerciseService', '$stateParams', '$state', function ($scope, exerciseService, $stateParams, $state) {

    $scope.$on('willExerciseChange', function (event, changeParam) {

    });

    $scope.$on('willRequestSave', function (event, data) {
       
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        var editor1 = EWEBEDITOR.Instances["editorAnalysis"];
        $scope.model.exercisecommon.exercise.Analysis = editor1.getHTML();

        if ($scope.model.exercisecommon.exercise.Conten == "" || $scope.model.exercisecommon.exercise.Conten == null) {
            alert('请填写题干');
            $scope.$parent.resetForbid();
            return;
        }

        if ($scope.model.exercisecommon.exercise.Answer == null) {
            alert('请选择正确答案');
            $scope.$parent.resetForbid();
            return;
        }
        $scope.willTopBind($scope.model, data);
        var v = angular.toJson($scope.model);
        exerciseService.Exercise_Judge_M_Edit(v, function (data) {
            if (data.d != null) {
                $scope.$emit('onExerciseSaved', data.d.exercisecommon.exercise.ExerciseID);
            }
        });
    });

    $scope.$on('onPreview', function (event) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        $scope.$emit('onBeginPreview', $scope.model);
    });

    $scope.$on('onRemoveFinishedAttachment', function (event, attachment) {
        $scope.removeAttachment($scope.model.exercisecommon.attachmentlist, attachment);
    });

    $scope.model = {};//Exercise对象
    $scope.Attachment = {};//附件对象
    $scope.ExerciseID = parseInt($stateParams.ExerciseID);//习题ID


    var init = function () {
        if ($scope.ExerciseID > -1) {
            exerciseService.Exercise_Judge_Get($scope.ExerciseID, function (data) {
                $scope.model = data.d;
                $scope.willEdit($scope.model);
                $scope.editorText = $scope.model.exercisecommon.exercise.Conten;
                $scope.editorAnalysisText = $scope.model.exercisecommon.exercise.Analysis;


                $scope.assignEditorValues(
                    {
                        editorInput: $scope.editorText,
                        //editorAnswer: $scope.editorAnswerText,
                        editorAnalysis: $scope.editorAnalysisText
                    });

                if ($scope.model.exercisecommon.attachmentlist.length > 0) {
                    $scope.$emit('onAttachmentList', $scope.model.exercisecommon.attachmentlist);
                }

            });
        } else {
            exerciseService.Exercise_Model_Info_Get(function (data) {
                $scope.model = data.d;
            });
        }
    }
    init();

    $scope.answeChange = function (answer) {
        $scope.model.exercisecommon.exercise.Answer = answer == 0 ? 1 : 0;
    }

}]);

//填空题
appExercise.controller('FillBlankCtrl', ['$scope', 'exerciseService', '$stateParams', '$state', function ($scope, exerciseService, $stateParams, $state) {
    $scope.$on('willExerciseChange', function (event, changeParam) {

    });

    $scope.$on('willRequestSave', function (event, data) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        var editor1 = EWEBEDITOR.Instances["editorAnalysis"];
        $scope.model.exercisecommon.exercise.Analysis = editor1.getHTML();

        if ($scope.model.exercisecommon.exercise.Conten == "" || $scope.model.exercisecommon.exercise.Conten == null) {
            alert('请填写题干');
            $scope.$parent.resetForbid();
            return;
        }

        var content = '';
        var choicSplitFlag = 'wshgkjqbwhfbxlfrh_a';
        angular.forEach($scope.model.exercisechoicelist, function (item) {
            var answer = item.IsDeleted ? '' : item.Answer;
            var spare = item.IsDeleted ? '' : item.Spare;
            var exerciseId = !!item.ExerciseID ? item.ExerciseID : 0;
            content += exerciseId + "wshgkjqbwhfbxlfrh_b";
            if (item.IsDeleted) {
                content += String.fromCharCode(32);
            } else {
                content += answer + "wshgkjqbwhfbxlfrh_c" + spare;
            }

            content += choicSplitFlag;
        });

        if (content.length > 0) {
            content = content.substring(0, content.length - choicSplitFlag.length);
        }
        $scope.model.exercisecommon.exercise.Content = content;

        $scope.willTopBind($scope.model, data);

        var v = angular.toJson($scope.model);
        exerciseService.Exercise_FillInBlanks_M_Edit(v, function (data) {
            if (data.d != null) {
                $scope.$emit('onExerciseSaved', data.d.exercisecommon.exercise.ExerciseID);
            }
        });
    });

    $scope.$on('onPreview', function (event) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        $scope.$emit('onBeginPreview', $scope.model);
    });

    $scope.$on('onRemoveFinishedAttachment', function (event, attachment) {
        $scope.removeAttachment($scope.model.exercisecommon.attachmentlist, attachment);
    });

    $scope.model = {};//Exercise对象
    $scope.Attachment = {};//附件对象

    var answer = { Answer: '', Spare: '' };
    $scope.ExerciseID = parseInt($stateParams.ExerciseID);//习题ID

    var init = function () {
        if ($scope.ExerciseID > -1) {
            exerciseService.Exercise_Analysis_Get($scope.ExerciseID, function (data) {
                $scope.model = data.d;
                $scope.willEdit($scope.model);
                $scope.editorText = $scope.model.exercisecommon.exercise.Conten;
                $scope.editorAnalysisText = $scope.model.exercisecommon.exercise.Analysis;

                $scope.assignEditorValues(
    {
        editorInput: $scope.editorText,
        //editorAnswer: $scope.editorAnswerText,
        editorAnalysis: $scope.editorAnalysisText
    });

                for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                    var a = $scope.model.exercisechoicelist[i].Answer.split('wshgkjqbwhfbxlfrh_c');
                    $scope.model.exercisechoicelist[i].Answer = a[0];
                    $scope.model.exercisechoicelist[i].Spare = a[1];
                }
                if ($scope.model.exercisecommon.attachmentlist.length > 0) {
                    $scope.$emit('onAttachmentList', $scope.model.exercisecommon.attachmentlist);
                }
                if ($scope.model.exercisechoicelist.length == 0) {
                    answer = { Answer: '', Spare: '' };
                    $scope.model.exercisechoicelist.push(answer);
                }

                $("#editorInput").val($scope.model.exercisecommon.exercise.Conten);
                $("#editorAnalysis").val($scope.model.exercisecommon.exercise.Analysis);
            });
        } else {
            exerciseService.Exercise_Model_Info_Get(function (data) {
                $scope.model = data.d;
                answer = { Answer: '', Spare: '' };
                $scope.model.exercisechoicelist.push(answer);
            });
        }
    }

    //添加选项
    $scope.Add = function () {
        answer = { Answer: '', Spare: '' };
        $scope.model.exercisechoicelist.push(answer);
    }
    //删除选项
    $scope.Del = function (index) {
        $scope.model.exercisechoicelist[index].IsDeleted = true;
    }
    init();
}]);

//填空客观题
appExercise.controller('FillBlank2Ctrl', ['$scope', 'exerciseService', '$stateParams', function ($scope, exerciseService, $stateParams) {
    $scope.$on('willExerciseChange', function (event, changeParam) {

    });

    $scope.$on('willSubmit', function (event) {
        for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
            $scope.model.exercisechoicelist[i].Conten = $scope.model.exercisechoicelist[i].Conten +
                'wshgkjqbwhfbxlfrh' + $scope.model.exercisechoicelist[i].Spare;
        }
        $scope.$emit('willSave', $scope.model);
    });

    $scope.$on('willPreview', function (event) {

    });

    $scope.model = {};//Exercise对象
    $scope.Attachment = {};//附件对象
    var answer = { Conten: '', Spare: '' };
    $scope.ExerciseID = parseInt($stateParams.ExerciseID);//习题ID

    var init = function () {
        if ($scope.ExerciseID > -1) {
            exerciseService.ExerciseInfo_Get($scope.ExerciseID, function (data) {
                $scope.model = data.d;
                //$scope.willEdit($scope.model);

                for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                    var a = $scope.model.exercisechoicelist[i].Conten.split('wshgkjqbwhfbxlfrh');
                    $scope.model.exercisechoicelist[i].Conten = a[0];
                    $scope.model.exercisechoicelist[i].Spare = a[1];
                }
            });
        } else {
            exerciseService.Exercise_Model_Info(function (data) {
                $scope.model = data.d;
                answer = { Conten: '', Spare: '' };
                $scope.model.exercisechoicelist.push(answer);
            });
        }
    }

    //添加选项
    $scope.Add = function () {
        answer = { Conten: '', Spare: '' };
        $scope.model.exercisechoicelist.push(answer);
    }
    //删除选项
    $scope.Del = function (item) {
        for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
            if ($scope.model.exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                $scope.model.exercisechoicelist.splice(i, 1);
            }
        }
    }
    init();
}]);

//连线题
appExercise.controller('ConnectionCtrl', ['$scope', 'exerciseService', '$stateParams', '$state', function ($scope, exerciseService, $stateParams, $state) {
    $scope.$on('willExerciseChange', function (event, changeParam) {

    });

    $scope.$on('willRequestSave', function (event, data) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        var editor1 = EWEBEDITOR.Instances["editorAnalysis"];
        $scope.model.exercisecommon.exercise.Analysis = editor1.getHTML();

        if ($scope.model.exercisecommon.exercise.Conten == "" || $scope.model.exercisecommon.exercise.Conten == null) {
            alert('请填写题干');
            $scope.$parent.resetForbid();
            return;
        }

        //将选项加到exercisechoicelist数组中
        $scope.model.exercisechoicelist.length = 0;
        var choice = {};
        for (var i = 0; i < $scope.list.length; i++) {
            choice = { Conten: $scope.list[i].Conten, grou: $scope.list[i].grou, ChoiceID: $scope.list[i].ChoiceID };
            $scope.model.exercisechoicelist.push(choice);
            choice = { Conten: $scope.list[i].Answer, grou: $scope.list[i].grou, ChoiceID: $scope.list[i].ChoiceID1 };
            $scope.model.exercisechoicelist.push(choice);
        }
        for (var i = 0; i < $scope.ganraoList.length; i++) {
            $scope.model.exercisechoicelist.push($scope.ganraoList[i]);
        }

        //将exercisechoicelist数组中的元素拼接成Content
        $scope.model.exercisecommon.exercise.Content = "";
        if ($scope.ExerciseID > 0) {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                var conten = $scope.model.exercisechoicelist[i].Conten == null ? String.fromCharCode(32) : $scope.model.exercisechoicelist[i].Conten;
                var childId = $scope.model.exercisechoicelist[i].ChoiceID == null ? 0 : $scope.model.exercisechoicelist[i].ChoiceID;
                var grou = $scope.model.exercisechoicelist[i].grou == null ? 0 : $scope.model.exercisechoicelist[i].grou;
                if ((i + 1) == $scope.model.exercisechoicelist.length) {
                    $scope.model.exercisecommon.exercise.Content +=
                    childId + "wshgkjqbwhfbxlfrh_b"
                    + conten + "wshgkjqbwhfbxlfrh_c" + grou;
                } else {
                    $scope.model.exercisecommon.exercise.Content +=
                    childId + "wshgkjqbwhfbxlfrh_b"
                    + conten + "wshgkjqbwhfbxlfrh_c" + grou + "wshgkjqbwhfbxlfrh_a";
                }
            }
        }
        else {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                var conten = $scope.model.exercisechoicelist[i].Conten == null ? String.fromCharCode(32) : $scope.model.exercisechoicelist[i].Conten;
                var grou = $scope.model.exercisechoicelist[i].grou == null ? 0 : $scope.model.exercisechoicelist[i].grou;
                if ((i + 1) == $scope.model.exercisechoicelist.length) {
                    $scope.model.exercisecommon.exercise.Content +=
                    "0wshgkjqbwhfbxlfrh_b" + conten + "wshgkjqbwhfbxlfrh_c" + grou;
                } else {
                    $scope.model.exercisecommon.exercise.Content +=
                    "0wshgkjqbwhfbxlfrh_b" + conten + "wshgkjqbwhfbxlfrh_c" + grou + "wshgkjqbwhfbxlfrh_a";
                }
            }
        }

        $scope.willTopBind($scope.model, data);

        var v = angular.toJson($scope.model);
        exerciseService.Exercise_Line_S_Edit(v, function (data) {
            if (data.d != null) {
                $scope.$emit('onExerciseSaved', data.d.exercisecommon.exercise.ExerciseID);
            }
        });
    });

    $scope.$on('onPreview', function (event) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();

        $scope.model.exercisecommon.exercise.ExerciseType = 6;
        $scope.model.exercisechoicelist.length = 0;
        var choice = {};
        for (var i = 0; i < $scope.list.length; i++) {
            choice = { Conten: $scope.list[i].Conten, Answer: $scope.list[i].Answer, grou: $scope.list[i].grou };
            $scope.model.exercisechoicelist.push(choice);
        }
        for (var i = 0; i < $scope.ganraoList.length; i++) {
            choice = { Conten: '', Answer: $scope.ganraoList[i].Conten, grou: $scope.ganraoList[i].grou };
            $scope.model.exercisechoicelist.push(choice);
        }
        $scope.$emit('onBeginPreview', $scope.model);
    });

    $scope.$on('onRemoveFinishedAttachment', function (event, attachment) {
        $scope.removeAttachment($scope.model.exercisecommon.attachmentlist, attachment);
    });

    $scope.model = {};//Exercise对象
    $scope.Attachment = {};//附件对象
    $scope.ExerciseID = parseInt($stateParams.ExerciseID);//习题ID
    $scope.ganraoList = [];//答案数组最终
    $scope.list = [];//答案数组起始
    var grou = 1;//连线分组
    var answer = {};

    var init = function () {
        if ($scope.ExerciseID > -1) {
            exerciseService.Exercise_MultipleChoice_Get($scope.ExerciseID, function (data) {
                $scope.model = data.d;
                $scope.willEdit($scope.model);
                $scope.editorText = $scope.model.exercisecommon.exercise.Conten;
                $scope.editorAnalysisText = $scope.model.exercisecommon.exercise.Analysis;
                $scope.assignEditorValues(
    {
        editorInput: $scope.editorText,
        //editorAnswer: $scope.editorAnswerText,
        editorAnalysis: $scope.editorAnalysisText
    });
                for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                    if ($scope.model.exercisechoicelist[i].Grou == 0) {
                        $scope.ganraoList.push($scope.model.exercisechoicelist[i]);
                    }
                }

                var choiceList = $scope.model.exercisechoicelist;
                for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                    if ($scope.model.exercisechoicelist[i].Grou == 0) continue;
                    if ($scope.model.exercisechoicelist[i].Grou > grou) grou = $scope.model.exercisechoicelist[i].Grou;
                    for (var n = 0; n < $scope.model.exercisechoicelist.length; n++) {
                        if ($scope.model.exercisechoicelist[i].Grou == choiceList[n].Grou) {
                            $scope.list.push({
                                Conten: choiceList[n].Conten,
                                Answer: choiceList[n + 1].Conten,
                                grou: choiceList[n].Grou,
                                ChoiceID: choiceList[n].ChoiceID,
                                ChoiceID1: choiceList[n + 1].ChoiceID
                            });
                            choiceList.splice(n, 1);
                        }
                    }
                }

                if ($scope.model.exercisecommon.attachmentlist.length > 0) {
                    $scope.$emit('onAttachmentList', $scope.model.exercisecommon.attachmentlist);
                }

                $("#editorInput").val($scope.model.exercisecommon.exercise.Conten);
                $("#editorAnalysis").val($scope.model.exercisecommon.exercise.Analysis);
            });
        } else {
            exerciseService.Exercise_Model_Info_Get(function (data) {
                $scope.model = data.d;
                answer = { Conten: '', Answer: '', grou: grou, ChoiceID: 0 };
                $scope.list.push(answer);
                answer = { Conten: '', grou: 0, ChoiceID: 0 };
                $scope.ganraoList.push(answer);
            });
        }
    }
    //添加干扰项
    $scope.AddInterference = function () {
        answer = { Conten: '', grou: 0, ChoiceID: 0 };
        $scope.ganraoList.push(answer);
    }

    //添加选项
    $scope.Add = function () {
        grou += 1;
        answer = { Conten: '', Answer: '', grou: grou, ChoiceID: 0 };
        $scope.list.push(answer);
    }
    //删除选项
    $scope.Del = function (item) {
        if ($scope.ExerciseID > 0) {
            for (var i = 0; i < $scope.list.length; i++) {
                if ($scope.list[i].$$hashKey == item.$$hashKey) {
                    $scope.list[i].Conten = '';
                    $scope.list[i].Answer = '';
                }
            }
        } else {
            for (var i = 0; i < $scope.list.length; i++) {
                if ($scope.list[i].$$hashKey == item.$$hashKey) {
                    $scope.list.splice(i, 1);
                }
            }
        }
    }
    init();
}]);

//单选题
appExercise.controller('RadioCtrl', ['$scope', 'exerciseService', '$stateParams', '$state', function ($scope, exerciseService, $stateParams, $state) {
    $scope.$on('willExerciseChange', function (event, changeParam) {

    });
    $scope.$on('willRequestSave', function (event, data) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        var editor1 = EWEBEDITOR.Instances["editorAnalysis"];
        $scope.model.exercisecommon.exercise.Analysis = editor1.getHTML();

        if ($scope.model.exercisecommon.exercise.Conten == "" || $scope.model.exercisecommon.exercise.Conten == null) {
            alert('请填写题干');
            $scope.$parent.resetForbid();
            return;
        }
        var isNull = true;
        for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
            var answer = $scope.model.exercisechoicelist[i].Conten;
            if (answer != '') {
                isNull = false;
            }
        }
        if (isNull) {
            alert('请填写选项');
            $scope.$parent.resetForbid();
            return;
        }
        var isNullCorrect = true;
        for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
            var isCorrect = $scope.model.exercisechoicelist[i].IsCorrect;
            if (isCorrect) isNullCorrect = false;
        }
        if (isNullCorrect) {
            alert('请选择正确答案');
            $scope.$parent.resetForbid();
            return;
        }


        $scope.model.exercisecommon.exercise.Content = "";
        if ($scope.ExerciseID > 0) {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                var answer = $scope.model.exercisechoicelist[i].Conten == null ? "" : $scope.model.exercisechoicelist[i].Conten;
                var childId = $scope.model.exercisechoicelist[i].ChoiceID == null ? 0 : $scope.model.exercisechoicelist[i].ChoiceID;
                var isCorrect = $scope.model.exercisechoicelist[i].IsCorrect == false ? 0 : 1;
                if ((i + 1) == $scope.model.exercisechoicelist.length) {
                    $scope.model.exercisecommon.exercise.Content +=
                    childId + "wshgkjqbwhfbxlfrh_b"
                    + answer + "wshgkjqbwhfbxlfrh_c" + isCorrect;
                } else {
                    $scope.model.exercisecommon.exercise.Content +=
                    childId + "wshgkjqbwhfbxlfrh_b"
                    + answer + "wshgkjqbwhfbxlfrh_c" + isCorrect + "wshgkjqbwhfbxlfrh_a";
                }
            }
        }
        else {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                var answer = $scope.model.exercisechoicelist[i].Conten == null ? "" : $scope.model.exercisechoicelist[i].Conten;
                if ((i + 1) == $scope.model.exercisechoicelist.length) {
                    $scope.model.exercisecommon.exercise.Content +=
                    "0wshgkjqbwhfbxlfrh_b" + answer + "wshgkjqbwhfbxlfrh_c" + $scope.model.exercisechoicelist[i].IsCorrect;
                } else {
                    $scope.model.exercisecommon.exercise.Content +=
                    "0wshgkjqbwhfbxlfrh_b" + answer + "wshgkjqbwhfbxlfrh_c" + $scope.model.exercisechoicelist[i].IsCorrect + "wshgkjqbwhfbxlfrh_a";
                }
            }
        }

        $scope.willTopBind($scope.model, data);

        var v = angular.toJson($scope.model);
        exerciseService.Exercise_MultipleChoice_M_Edit(v, function (data) {
            if (data.d != null) {
                $scope.$emit('onExerciseSaved', data.d.exercisecommon.exercise.ExerciseID);
            }
        });
    });

    $scope.$on('onPreview', function (event) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        $scope.$emit('onBeginPreview', $scope.model);
    });

    $scope.$on('onRemoveFinishedAttachment', function (event, attachment) {
        $scope.removeAttachment($scope.model.exercisecommon.attachmentlist, attachment);
    });

    $scope.model = {};//ExerciseInfo对象

    $scope.Attachment = {};//附件对象
    $scope.ExerciseID = parseInt($stateParams.ExerciseID);//习题ID

    var answer = { Conten: '', IsCorrect: 0 };

    var init = function () {
        if ($scope.ExerciseID > -1) {
            exerciseService.Exercise_MultipleChoice_Get($scope.ExerciseID, function (data) {
                $scope.model = data.d;
                $scope.willEdit($scope.model);
                $scope.editorText = $scope.model.exercisecommon.exercise.Conten;
                $scope.editorAnalysisText = $scope.model.exercisecommon.exercise.Analysis;

                $scope.assignEditorValues( {
                    editorInput: $scope.editorText,
                    editorAnalysis: $scope.editorAnalysisText
                });
                if ($scope.model.exercisecommon.attachmentlist.length > 0) {
                    $scope.$emit('onAttachmentList', $scope.model.exercisecommon.attachmentlist);
                }
            });
        } else {
            exerciseService.Exercise_Model_Info_Get(function (data) {
                $scope.model = data.d;
                answer = { Conten: '', IsCorrect: 0 };
                $scope.model.exercisechoicelist = [];
                for (var i = 0; i < 4; i++) {
                    $scope.AddAnswer();
                }
            });
        }
    }

    //添加选项
    $scope.AddAnswer = function () {
        answer = { Conten: '', IsCorrect: 0 };
        $scope.model.exercisechoicelist.push(answer);
    }
    //删除选项
    $scope.del = function (item) {
        if ($scope.ExerciseID > 0) {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                if ($scope.model.exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                    $scope.model.exercisechoicelist[i].Conten = '';
                }
            }
        } else {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                if ($scope.model.exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                    $scope.model.exercisechoicelist.splice(i, 1);
                }
            }
        }
    }

    //是否是正确答案
    $scope.isCorrectChange = function (item) {
        for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {

            $scope.model.exercisechoicelist[i].IsCorrect = 0;
        }
        item.IsCorrect = item.IsCorrect ? 0 : 1;
    }

    init();
}]);

//多选题
appExercise.controller('MultipleCtrl', ['$scope', 'exerciseService', '$stateParams', '$state', function ($scope, exerciseService, $stateParams, $state) {
    $scope.$on('willExerciseChange', function (event, changeParam) {

    });

    $scope.$on('willRequestSave', function (event, data) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        var editor1 = EWEBEDITOR.Instances["editorAnalysis"];
        $scope.model.exercisecommon.exercise.Analysis = editor1.getHTML();

        if ($scope.model.exercisecommon.exercise.Conten == "" || $scope.model.exercisecommon.exercise.Conten == null) {
            alert('请填写题干');
            $scope.$parent.resetForbid();
            return;
        }

        var isNull = true;
        for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
            var answer = $scope.model.exercisechoicelist[i].Conten;
            if (answer != '') {
                isNull = false;
            }
        }
        if (isNull) {
            alert('请填写选项');
            $scope.$parent.resetForbid();
            return;
        }
        var isNullCorrect = true;
        for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
            var isCorrect = $scope.model.exercisechoicelist[i].IsCorrect;
            if (isCorrect) isNullCorrect = false;
        }
        if (isNullCorrect) {
            alert('请选择正确答案');
            $scope.$parent.resetForbid();
            return;
        }

        $scope.model.exercisecommon.exercise.Content = "";
        if ($scope.ExerciseID > 0) {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                var answer = $scope.model.exercisechoicelist[i].Conten == null ? "" : $scope.model.exercisechoicelist[i].Conten;
                var childId = $scope.model.exercisechoicelist[i].ChoiceID == null ? 0 : $scope.model.exercisechoicelist[i].ChoiceID;
                var isCorrect = $scope.model.exercisechoicelist[i].IsCorrect == false ? 0 : 1;
                if ((i + 1) == $scope.model.exercisechoicelist.length) {
                    $scope.model.exercisecommon.exercise.Content +=
                    childId + "wshgkjqbwhfbxlfrh_b"
                    + answer + "wshgkjqbwhfbxlfrh_c" + isCorrect;
                } else {
                    $scope.model.exercisecommon.exercise.Content +=
                    childId + "wshgkjqbwhfbxlfrh_b"
                    + answer + "wshgkjqbwhfbxlfrh_c" + isCorrect + "wshgkjqbwhfbxlfrh_a";
                }
            }
        }
        else {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                var answer = $scope.model.exercisechoicelist[i].Conten == null ? "" : $scope.model.exercisechoicelist[i].Conten;
                if ((i + 1) == $scope.model.exercisechoicelist.length) {
                    $scope.model.exercisecommon.exercise.Content +=
                    "0wshgkjqbwhfbxlfrh_b" + answer + "wshgkjqbwhfbxlfrh_c" + $scope.model.exercisechoicelist[i].IsCorrect;
                } else {
                    $scope.model.exercisecommon.exercise.Content +=
                    "0wshgkjqbwhfbxlfrh_b" + answer + "wshgkjqbwhfbxlfrh_c" + $scope.model.exercisechoicelist[i].IsCorrect + "wshgkjqbwhfbxlfrh_a";
                }
            }
        }

        $scope.willTopBind($scope.model, data);

        var v = angular.toJson($scope.model);
        exerciseService.Exercise_MultipleChoice_M_Edit(v, function (data) {
            if (data.d != null) {
                $scope.$emit('onExerciseSaved', data.d.exercisecommon.exercise.ExerciseID);
            }
        });
    });

    $scope.$on('onPreview', function (event) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        $scope.$emit('onBeginPreview', $scope.model);
    });

    $scope.$on('onRemoveFinishedAttachment', function (event, attachment) {
        $scope.removeAttachment($scope.model.exercisecommon.attachmentlist, attachment);
    });

    $scope.model = {};//ExerciseInfo对象

    $scope.Attachment = {};//附件对象
    $scope.ExerciseID = parseInt($stateParams.ExerciseID);//习题ID

    var answer = { Conten: '', IsCorrect: 0 };

    var init = function () {
        if ($scope.ExerciseID > -1) {
            exerciseService.Exercise_MultipleChoice_Get($scope.ExerciseID, function (data) {
                $scope.model = data.d;
                $scope.willEdit($scope.model);
                $scope.editorText = $scope.model.exercisecommon.exercise.Conten;
                $scope.editorAnalysisText = $scope.model.exercisecommon.exercise.Analysis;

                $scope.assignEditorValues(
    {
        editorInput: $scope.editorText,
        //editorAnswer: $scope.editorAnswerText,
        editorAnalysis: $scope.editorAnalysisText
    });
                if ($scope.model.exercisecommon.attachmentlist.length > 0) {
                    $scope.$emit('onAttachmentList', $scope.model.exercisecommon.attachmentlist);
                }
            });
        } else {
            exerciseService.Exercise_Model_Info_Get(function (data) {
                $scope.model = data.d;
                answer = { Conten: '', IsCorrect: 0 };
                $scope.model.exercisechoicelist = [];
                for (var i = 0; i < 4; i++) {
                    $scope.AddAnswer();
                }
            });
        }
    }

    //添加选项
    $scope.AddAnswer = function () {
        answer = { Conten: '', IsCorrect: 0 };
        $scope.model.exercisechoicelist.push(answer);
    }
    //删除选项
    $scope.del = function (item) {
        if ($scope.ExerciseID > 0) {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                if ($scope.model.exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                    $scope.model.exercisechoicelist[i].Conten = '';
                }
            }
        } else {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                if ($scope.model.exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                    $scope.model.exercisechoicelist.splice(i, 1);
                }
            }
        }
    }

    //是否是正确答案
    $scope.isCorrectChange = function (item) {
        item.IsCorrect = item.IsCorrect ? 0 : 1;
    }

    init();
}]);

//翻译题
appExercise.controller('TranslationCtrl', ['$scope', 'exerciseService', '$stateParams', '$state', function ($scope, exerciseService, $stateParams, $state) {
    $scope.$on('willExerciseChange', function (event, changeParam) {

    });
    $scope.$on('willRequestSave', function (event, data) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        var editor1 = EWEBEDITOR.Instances["editorAnalysis"];
        $scope.model.exercisecommon.exercise.Analysis = editor1.getHTML();
        var editor2 = EWEBEDITOR.Instances["editorAnswer"];
        $scope.model.exercisecommon.exercise.Answer = editor2.getHTML();

        if ($scope.model.exercisecommon.exercise.Conten == "" || $scope.model.exercisecommon.exercise.Conten == null) {
            alert('请填写题干');
            $scope.$parent.resetForbid();
            return;
        }

        $scope.willTopBind($scope.model, data);
        var v = angular.toJson($scope.model);
        exerciseService.Exercise_Writing_M_Edit(v, function (data) {
            if (data.d != null) {
                $scope.$emit('onExerciseSaved', data.d.exercisecommon.exercise.ExerciseID);
            }
        });
    });

    $scope.$on('onPreview', function (event) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        var editor2 = EWEBEDITOR.Instances["editorAnswer"];
        $scope.model.exercisecommon.exercise.Answer = editor2.getHTML();
        $scope.$emit('onBeginPreview', $scope.model);
    });

    $scope.$on('onRemoveFinishedAttachment', function (event, attachment) {
        $scope.removeAttachment($scope.model.exercisecommon.attachmentlist, attachment);
    });
    $scope.model = {};//ExerciseInfo对象
    $scope.Attachment = {};//附件对象
    $scope.ExerciseID = parseInt($stateParams.ExerciseID);//习题ID
    var init = function () {
        if ($scope.ExerciseID > -1) {
            exerciseService.Exercise_Writing_Get($scope.ExerciseID, function (data) {
                $scope.model = data.d;
                $scope.willEdit($scope.model);
                $scope.editorText = $scope.model.exercisecommon.exercise.Conten;
                $scope.editorAnalysisText = $scope.model.exercisecommon.exercise.Analysis;
                $scope.editorAnswerText = $scope.model.exercisecommon.exercise.Answer;

                $("#editorInput").val($scope.model.exercisecommon.exercise.Conten);
                $("#editorAnswer").val($scope.model.exercisecommon.exercise.Answer);
                $("#editorAnalysis").val($scope.model.exercisecommon.exercise.Analysis);

                if ($scope.model.exercisecommon.attachmentlist.length > 0) {
                    $scope.$emit('onAttachmentList', $scope.model.exercisecommon.attachmentlist);
                }
                $scope.assignEditorValues(
    {
        editorInput: $scope.editorText,
        editorAnswer: $scope.editorAnswerText,
        editorAnalysis: $scope.editorAnalysisText
    });
            });
        } else {
            exerciseService.Exercise_Model_Info_Get(function (data) {
                $scope.model = data.d;
                $scope.textarea = 0;//切换试题解析和得分点
            });
        }
    }
    init();
}]);

//排序题
appExercise.controller('SortingCtrl', ['$scope', 'exerciseService', '$stateParams', '$state', function ($scope, exerciseService, $stateParams, $state) {
    $scope.$on('willExerciseChange', function (event, changeParam) {

    });

    $scope.$on('willRequestSave', function (event, data) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        var editor1 = EWEBEDITOR.Instances["editorAnalysis"];
        $scope.model.exercisecommon.exercise.Analysis = editor1.getHTML();

        if ($scope.model.exercisecommon.exercise.Conten == "" || $scope.model.exercisecommon.exercise.Conten == null) {
            alert('请填写题干');
            $scope.$parent.resetForbid();
            return;
        }
        var isNull = true;
        for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
            var answer = $scope.model.exercisechoicelist[i].Conten;
            if (answer != '') {
                isNull = false;
            }
        }
        if (isNull) {
            alert('请填写选项');
            $scope.$parent.resetForbid();
            return;
        }

        $scope.model.exercisecommon.exercise.Content = "";
        if ($scope.ExerciseID > 0) {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                var answer = $scope.model.exercisechoicelist[i].Conten == null ? String.fromCharCode(32) : $scope.model.exercisechoicelist[i].Conten;
                var childId = $scope.model.exercisechoicelist[i].ChoiceID == null ? 0 : $scope.model.exercisechoicelist[i].ChoiceID;
                if ((i + 1) == $scope.model.exercisechoicelist.length) {
                    $scope.model.exercisecommon.exercise.Content +=
                    childId + "wshgkjqbwhfbxlfrh_b"
                    + answer + "wshgkjqbwhfbxlfrh_c" + (i + 1);
                } else {
                    $scope.model.exercisecommon.exercise.Content +=
                    childId + "wshgkjqbwhfbxlfrh_b"
                    + answer + "wshgkjqbwhfbxlfrh_c" + (i + 1) + "wshgkjqbwhfbxlfrh_a";
                }
            }
        }
        else {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                var answer = $scope.model.exercisechoicelist[i].Conten == null ? "" : $scope.model.exercisechoicelist[i].Conten;
                if ((i + 1) == $scope.model.exercisechoicelist.length) {
                    $scope.model.exercisecommon.exercise.Content +=
                    "0wshgkjqbwhfbxlfrh_b" + answer + "wshgkjqbwhfbxlfrh_c" + (i + 1);
                } else {
                    $scope.model.exercisecommon.exercise.Content +=
                    "0wshgkjqbwhfbxlfrh_b" + answer + "wshgkjqbwhfbxlfrh_c" + (i + 1) + "wshgkjqbwhfbxlfrh_a";
                }
            }
        }

        $scope.willTopBind($scope.model, data);

        var v = angular.toJson($scope.model);
        exerciseService.Exercise_Order_M_Edit(v, function (data) {
            if (data.d != null) {
                $scope.$emit('onExerciseSaved', data.d.exercisecommon.exercise.ExerciseID);
            }
        });
    });


    $scope.$on('onPreview', function (event) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();

        $scope.model.exercisecommon.exercise.ExerciseType = 7;
        for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
            $scope.model.exercisechoicelist[i].OrderNum = i + 1;
        }
        $scope.$emit('onBeginPreview', $scope.model);
    });

    $scope.$on('onRemoveFinishedAttachment', function (event, attachment) {
        $scope.removeAttachment($scope.model.exercisecommon.attachmentlist, attachment);
    });

    $scope.model = {};//Exercise对象
    $scope.Attachment = {};//附件对象    
    $scope.ExerciseID = parseInt($stateParams.ExerciseID);//习题ID
    var answer = { Conten: '', OrderNum: 0 };

    var init = function () {
        if ($scope.ExerciseID > -1) {
            exerciseService.Exercise_MultipleChoice_Get($scope.ExerciseID, function (data) {
                $scope.model = data.d;
                $scope.willEdit($scope.model);
                $scope.editorText = $scope.model.exercisecommon.exercise.Conten;
                $scope.editorAnalysisText = $scope.model.exercisecommon.exercise.Analysis;
                //for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                //    var a = $scope.model.exercisechoicelist[i].Answer.split('wshgkjqbwhfbxlfrh_c');
                //    $scope.model.exercisechoicelist[i].Answer = a[0];
                //    $scope.model.exercisechoicelist[i].Spare = a[1];
                //}

                $scope.assignEditorValues(
    {
        editorInput: $scope.editorText,
        //editorAnswer: $scope.editorAnswerText,
        editorAnalysis: $scope.editorAnalysisText
    });
                if ($scope.model.exercisecommon.attachmentlist.length > 0) {
                    $scope.$emit('onAttachmentList', $scope.model.exercisecommon.attachmentlist);
                }
            });
        } else {
            exerciseService.Exercise_Model_Info_Get(function (data) {
                $scope.model = data.d;
                answer = { Conten: '', OrderNum: 0 };
                //$scope.model.exercisechoicelist.push(answer);
                for (var i = 0; i < 4; i++) {
                    $scope.Add();
                }
            });
        }
    }

    //添加选项
    $scope.Add = function () {
        answer = { Conten: '', OrderNum: 0 };
        $scope.model.exercisechoicelist.push(answer);
    }
    //删除选项
    $scope.Del = function (item) {
        if ($scope.ExerciseID > 0) {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                if ($scope.model.exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                    $scope.model.exercisechoicelist[i].Conten = '';
                }
            }
        } else {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                if ($scope.model.exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                    $scope.model.exercisechoicelist.splice(i, 1);
                }
            }
        }

    }
    init();
}]);

//分析题
appExercise.controller('AnalysisCtrl', ['$scope', 'exerciseService', '$stateParams', '$state', function ($scope, exerciseService, $stateParams, $state) {

    $scope.$on('onPreview', function (event) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        $scope.$emit('onBeginPreview', $scope.model);
    });

    $scope.$on('willRequestSave', function (event, data) {
        var editor = EWEBEDITOR.Instances["editorInput"];
        $scope.model.exercisecommon.exercise.Conten = editor.getHTML();
        var editor1 = EWEBEDITOR.Instances["editorAnalysis"];
        $scope.model.exercisecommon.exercise.Analysis = editor1.getHTML();

        if ($scope.model.exercisecommon.exercise.Conten == "" || $scope.model.exercisecommon.exercise.Conten == null) {
            alert('请填写题干');
            $scope.$parent.resetForbid();
            return;
        }

        var length = $scope.model.exercisechoicelist.length;
        for (var i = 0; i < length; i++) {
            if ($scope.model.exercisechoicelist[i].Conten == "") {
                alert('必须填写所有选项的题干');
                $scope.$parent.resetForbid();
                return;
            }
        }

        $scope.model.exercisecommon.exercise.Content = "";
        if ($scope.ExerciseID > 0) {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                var conten = $scope.model.exercisechoicelist[i].Conten == null ? "" : $scope.model.exercisechoicelist[i].Conten;
                var answer = $scope.model.exercisechoicelist[i].Answer == null ? "" : $scope.model.exercisechoicelist[i].Answer;
                var childId = $scope.model.exercisechoicelist[i].ExerciseID == null ? 0 : $scope.model.exercisechoicelist[i].ExerciseID;
                if ((i + 1) == $scope.model.exercisechoicelist.length) {
                    $scope.model.exercisecommon.exercise.Content +=
                    childId + "wshgkjqbwhfbxlfrh_b"
                    + conten + "wshgkjqbwhfbxlfrh_c" + answer;
                } else {
                    $scope.model.exercisecommon.exercise.Content +=
                    childId + "wshgkjqbwhfbxlfrh_b"
                    + conten + "wshgkjqbwhfbxlfrh_c" + answer + "wshgkjqbwhfbxlfrh_a";
                }
            }
        }
        else {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                var conten = $scope.model.exercisechoicelist[i].Conten == null ? "" : $scope.model.exercisechoicelist[i].Conten;
                var answer = $scope.model.exercisechoicelist[i].Answer == null ? "" : $scope.model.exercisechoicelist[i].Answer;
                if ((i + 1) == $scope.model.exercisechoicelist.length) {
                    $scope.model.exercisecommon.exercise.Content +=
                    "0wshgkjqbwhfbxlfrh_b" + conten + "wshgkjqbwhfbxlfrh_c" + answer;
                } else {
                    $scope.model.exercisecommon.exercise.Content +=
                    "0wshgkjqbwhfbxlfrh_b" + conten + "wshgkjqbwhfbxlfrh_c" + answer + "wshgkjqbwhfbxlfrh_a";
                }
            }
        }

        $scope.willTopBind($scope.model, data);

        var v = angular.toJson($scope.model);
        exerciseService.Exercise_Analysis_M_Edit(v, function (data) {
            if (data.d != null) {
                $scope.$emit('onExerciseSaved', data.d.exercisecommon.exercise.ExerciseID);
            }
        });
    });

    $scope.$on('onRemoveFinishedAttachment', function (event, attachment) {
        $scope.removeAttachment($scope.model.exercisecommon.attachmentlist, attachment);
    });

    $scope.ExerciseID = parseInt($stateParams.ExerciseID);//习题ID

    var answer = { Conten: '', Answer: '' };

    var init = function () {
        if ($scope.ExerciseID > -1) {
            exerciseService.Exercise_Analysis_Get($scope.ExerciseID, function (data) {
                $scope.model = data.d;
                $scope.willEdit($scope.model);
                $scope.editorText = $scope.model.exercisecommon.exercise.Conten;
                $scope.editorAnalysisText = $scope.model.exercisecommon.exercise.Analysis;

                $scope.assignEditorValues(
    {
        editorInput: $scope.editorText,
        //editorAnswer: $scope.editorAnswerText,
        editorAnalysis: $scope.editorAnalysisText
    });
                if ($scope.model.exercisecommon.attachmentlist.length > 0) {
                    $scope.$emit('onAttachmentList', $scope.model.exercisecommon.attachmentlist);
                }
            });
        } else {
            exerciseService.Exercise_Model_Info_Get(function (data) {
                $scope.model = data.d;
                $scope.model.exercisechoicelist.push(answer);
            });
        }
    }

    //添加选项
    $scope.Add = function () {
        answer = { Conten: '', Answer: '' };
        $scope.model.exercisechoicelist.push(answer);
    }

    //删除选项
    $scope.Del = function (item) {
        if ($scope.ExerciseID > 0) {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                if ($scope.model.exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                    $scope.model.exercisechoicelist[i].Conten = '';
                    $scope.model.exercisechoicelist[i].Answer = '';
                }
            }
        } else {
            for (var i = 0; i < $scope.model.exercisechoicelist.length; i++) {
                if ($scope.model.exercisechoicelist[i].$$hashKey == item.$$hashKey) {
                    $scope.model.exercisechoicelist.splice(i, 1);
                }
            }
        }

    }

    init();
}]);
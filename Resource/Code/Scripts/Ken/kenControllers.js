'use strict';

var appKnow = angular.module('app.ken.controllers', [
    'app.content.services',
    'app.chapter.services',
    'app.ken.services',
    'app.resken.services',
    'app.assist.services',
    'app.common.services'
]);

appKnow.controller('KenCtrl', ['$scope', '$state', '$stateParams', 'freezeService', 'tagService', 'contentService', 'kenService', 'chapterService', 'assistService', 'resourceKenService', 'exerciseService',
    function ($scope, $state, $stateParams, freezeService, tagService, contentService, kenService, chapterService, assistService, resourceKenService, exerciseService) {

        $scope.$emit('onWizardSwitch', true);

        $scope.$emit('willResetCourse');
        $scope.$emit('onSetAppTitle', '知识点');
        $scope.isKen = false;
        $scope.course = {};

        $scope.chapters = [];
        $scope.kens = [];
        ///用于添加章节下拉列表
        $scope.ocKens = [];
        $scope.kenSelection = {};
        $scope.resourceKens = [];
        $scope.shareRanges = [];

        $scope.requireMent = {};
        $scope.requireMents = [];

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

        ///按章节查询，同时显示知识点查询条件 
        $scope.kenDisable = true;

        ///关联 资料 习题 话题
        $scope.tab = 1;

        $scope.kenSelected = function (item) {
            $scope.kenSelection = item;
            $scope.$broadcast('requestQuery', $scope.kenSelection);
        }

        assistService.Resource_Dict_Requirement_Get(function (data) {
            if (data && data.length > 0) {
                $scope.requireMents = data;
                $scope.requireMent = $scope.requireMents[0];
            }
        });

        assistService.Resource_Dict_ShareRange_Get(function (data) {
            if (data) {
                $scope.shareRanges = angular.copy(data);
                var item = angular.copy($scope.shareRanges[0]);
                item.id = 0;
                item.name = '不限';
                $scope.shareRanges.insert(0, item);
            }
        });

        $scope.linkFiles = [];

        $scope.linkExercises = [];


        ///子页面请求查询数据
        $scope.$on('onRequestQuery', function (event, chapter, ken, from) {
            //if (chapter.ChapterID && ken.KenID >= 0) {
            ken.UpdateTime = new Date();
            $scope.linkFiles.length = 0;
            $scope.linkExercises.length = 0;
            if (!ken || !ken.KenID) ken.KenID = 0;
            if (!chapter || !chapter.ChapterID) chapter.ChapterID = 0;
            switch ($scope.tab) {
                case 1:
                    if (from === 'fromChapter') {
                        chapterService.File_ChapterID_KenID_List(chapter, ken, function (data) {
                            $scope.linkFiles = data.d;
                        });
                    } else {
                        if (!chapter.ChapterID) chapter.ChapterID = 0;
                        kenService.File_KenID_ChapterID_List(chapter, ken, function (data) {
                            $scope.linkFiles = data.d;
                        });
                    }
                    break;
                case 2:
                    if (from === 'fromChapter') {
                        chapterService.Exercise_ChapterID_KenID_List(chapter, ken, function (data) {
                            $scope.linkExercises = data.d;
                        });
                    } else {
                        if (!chapter.ChapterID) chapter.ChapterID = 0;
                        kenService.Exercise_KenID_ChapterID_List(chapter, ken, function (data) {
                            $scope.linkExercises = data.d;
                        });
                    }
                    break;
                default:
                    break;
            }
            //}
        });

        $scope.$on('willCourseChanged', function (event, course) {
            $scope.course = course;
            $scope.chapters.length = 0;
            $scope.loadStart($scope.course);
        });

        $scope.$on('courseLoaded', function (event, course) {
            var freezeData = freezeService.getFreeze(tagService.KenListTag);
            if (freezeData) {
                $scope.course = freezeData.data.course;
                $scope.tab = freezeData.data.tab;
                $scope.$parent.course = $scope.course;
            } else {
                $scope.course = course;
            }
        });


        $scope.tabChange = function (tab) {
            $scope.tab = tab;
            ///广播消息，通知子页面发起数据请求
            $scope.$broadcast('requestQuery', $scope.kenSelection);
        }

        ///保存ResourceKen 关联数据
        var ResourceKenAdd = function (chapterId, kenId) {
            var resKen = {
                ResourceID: chapterId,
                KenID: kenId,
                Source: 'Chapter'
            };
            resourceKenService.ResourceKen_ADD(resKen, function (data) {
                $scope.resourceKens.push(data.d);
            });
        }

        /// 添加知识点 
        $scope.ken = {};
        $scope.originKen = {};
        //$scope.ken.name = '';
        //$scope.ken.chapter = {};
        $scope.kenSave = function (ken, keeping) {
            if (!ken.Name || ken.Name.length === 0) return;
            var newData = {
                OCID: $scope.course.OCID,
                CourseID: $scope.course.CourseID,
                Name: $scope.ken.Name,
                ChapterID: $scope.ken.chapter ? $scope.ken.chapter.ChapterID : 0,
                Requirement: $scope.requireMent.id,
                UpdateTime: new Date()
            };
            if (ken.KenID && ken.KenID > 0) {
                newData.KenID = ken.KenID;
                kenService.Ken_Upd(newData, function (data) {
                    if (data.d) {
                        $scope.$broadcast('onKenEdited', newData);
                    }
                });
            } else {
                kenService.Ken_ADD(newData, function (data) {
                    var resultKen = data.d;
                    $scope.ocKens.push(resultKen);
                    ResourceKenAdd(resultKen.ChapterID, resultKen.KenID);
                    if (keeping) $scope.ken.Name = '';
                });
            }

            $scope.ken = {};
        }

        $scope.kenCancel = function () {
            ///还原数据
            var length = $scope.ocKens.length;
            for (var i = 0; i < length; i++) {
                if ($scope.ocKens[i].KenID === $scope.ken.KenID) {
                    $scope.ocKens[i] = angular.copy($scope.originKen);
                }
            }
            $scope.ken = {};
            $scope.originKen = {};
        }

        /// end 添加知识点

        ///添加章节
        $scope.chapter = {};
        $scope.chapter.name = '';
        $scope.chapter.ken = {};

        $scope.chapterSave = function (chapter, keeping) {
            var newData = {
                OCID: $scope.course.OCID,
                CourseID: $scope.course.CourseID,
                name: chapter.ken.name,
                Title: chapter.name
            }
            chapterService.Chapter_ADD(newData, function (data) {
                var resultChapter = data.d;
                $scope.chapters.push(resultChapter);
                ResourceKenAdd(resultChapter.ChapterID, chapter.ken.KenID)
                if (keeping) $scope.chapter.name = '';
            });
        }
        /// end 添加章节 


        ///习题共享 TODO 
        $scope.$on('onShareExercise', function (event, exercise, range) {
            var ids = exercise.ExerciseID;
            exerciseService.Exercise_Batch_ShareRange(ids, range.id, function (data) {
                if (data.d === true) {
                    //filterChanged();
                    exercise.ShareRange = range.id;
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

        $scope.exerciseItemDelete = {};
        ///确认删除
        $scope.$on('onDialogOk', function (event) {
            if (!$scope.exerciseItemDelete.ExerciseID) return;
            exerciseService.Exercise_Del($scope.exerciseItemDelete.ExerciseID, function (data) {
                var length = $scope.linkExercises.length;
                for (var i = 0; i < length; i++) {
                    if ($scope.linkExercises[i].ExerciseID == $scope.exerciseItemDelete.ExerciseID) {
                        $scope.linkExercises.splice(i, 1);
                        $scope.exerciseItemDelete = {};
                        break;
                    }
                }
            });
        });

        $scope.$on('onEditExercise', function (event, exercise) {
            ///消息转发给子页面，由子页面来处理
            $scope.$broadcast('onKenExerciseEdit', exercise);
        });

        /// <summary>
        /// 1判断题 ; 2单选题 ; 3 多选题 4填空题（客观）5填空题 ; 6连线题 ;7 排序题 ; 8分析题  9计算题   10问答题 ;
        ///11 翻译题  12听力训练  13写作  14阅读理解  15论述题 ;16 答题卡题型  17自定义题型
        /// </summary>
        ///编辑习题
        $scope.navEditExercise = function (exercise) {
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
        }

        ///习题删除
        $scope.deleteExercise = function (exercise) {
            var model = {
                KenID: $scope.knowSelection.KenID,
                ResourceID: exercise.ExerciseID,
                Source: 'Exercise'
            }
            resourceKenService.ResourceKen_Del(model, function (data) {
                if (data.d === true) {
                    var length = $scope.chapterExercises.length;
                    for (var i = 0; i < length; i++) {
                        if ($scope.chapterExercises[i].ExerciseID === exercise.ExerciseID) {
                            $scope.chapterExercises.splice(i, 1);
                            break;
                        }
                    }
                }
            });
        }

        ///初始化加载数据
        $scope.loadStart = function (course) {
            $scope.chapters.length = 0;
            chapterService.Chapter_List({ OCID: course.OCID }, function (data) {
                $scope.chapters = data.d;
                if ($scope.chapters.length > 0) {
                    chapterService.SectionFormat($scope.chapters);
                    $scope.ken.chapter = $scope.chapters[0];
                }
            });
            kenService.Ken_List({ OCID: course.OCID }, function (data) {
                $scope.ocKens = angular.copy(data.d);
                if ($scope.ocKens.length > 0) {
                    $scope.chapter.ken = $scope.ocKens[0];
                }
            });
        }
    }]);

appKnow.controller('KenChapterCtrl', ['$scope', '$state', 'chapterService', 'kenService', 'tagService', 'freezeService', 'authService',
    function ($scope, $state, chapterService, kenService, tagService, freezeService, authService) {
        $scope.$parent.isKen = false;
        //$scope.$emit('willResetCourse', 'Ken');
        $scope.$emit('onResetMoreTitle');

        $scope.$parent.tab = 1;
        $scope.$parent.kenDisable = true;
        $scope.canAdd = false;
        $scope.enableEdit = false;
        $scope.title = '';

        $scope.lastSelection = {};
        $scope.parentChapter = {};
        $scope.childChapter = {};
        ///权限判定
        $scope.hasChapterAuth = authService.hasChapterAuth($scope.course.OCID);;

        $scope.$on('willCourseChanged', function (event, course) {
            $scope.parentChapter = {};
            $scope.childChapter = {};
            $scope.$parent.tab = 1;
            $scope.hasChapterAuth = authService.hasChapterAuth(course.OCID);
        });

        $scope.$on('courseLoaded', function (event, course) {
            $scope.loadStart($scope.course);
            var freezeData = freezeService.getFreeze(tagService.KenListTag);
            if (freezeData) {
                $scope.parentChapter = freezeData.data.parentChapter;
                $scope.childChapter = freezeData.data.childChapter;
                $scope.lastSelection = freezeData.data.lastSelection;
                $scope.$parent.kens = freezeData.data.kens;
                $scope.$parent.kenSelection = freezeData.data.kenSelection;
                freezeService.unFreeze(tagService.KenListTag);
            }
            $scope.hasChapterAuth = authService.hasChapterAuth(course.OCID);
        });

        $scope.$on('onKenExerciseEdit', function (event, exercise) {
            freezeService.freeze(tagService.UrlSourceTag, $state.current.name);
            freezeService.freeze(tagService.KenListTag, {
                course: $scope.course,
                tab: $scope.tab,
                parentChapter: $scope.parentChapter,
                childChapter: $scope.childChapter,
                lastSelection: $scope.lastSelection,
                kenSelection: $scope.kenSelection,
                kens: $scope.kens
            });
            $scope.navEditExercise(exercise);
        });

        ///添加章节
        $scope.addChapter = function () {
            $scope.willAddedChapter = {}
            $scope.willAddedChapter.ParentID = 0;
            $scope.willAddedChapter.ChapterID = 0;
            $scope.willAddedChapter.Title = '';
            $scope.willAddedChapter.Orde = 9999;

            $scope.editorTitle = '添加章节'; 
            $('#eChapter').show();
        }

        $scope.save = function (chapter) {
            var newChapter = angular.copy(chapter);
            if (chapter.ChapterID === 0) {
                newChapter.OCID = $scope.course.OCID;
                newChapter.CourseID = $scope.course.OCID;

                chapterService.Chapter_ADD(newChapter, function (data) {
                    if (data.d) {
                        $scope.$parent.chapters.push(data.d);
                        chapterService.SectionFormat($scope.chapters);
                    }
                });
            } else {
                chapterService.Chapter_Upd(chapter, function (data) {
                    if (data.d) {
                        var length = $scope.$parent.chapters.length;
                        for (var i = 0; i < length; i++) {
                            if ($scope.$parent.chapters[i].ChapterID === newChapter.ChapterID) {
                                $scope.$parent.chapters[i] = newChapter;
                                break;
                            }
                        }
                    }
                });
            }
        }

        $scope.$on('onEdit', function (event, chapter) {
            $scope.willAddedChapter = angular.copy(chapter); 
            $scope.editorTitle = '编辑章节';
            $('#eChapter').show();
        }); 
       

        $scope.$on('onSectionSelected', function (event, section) {
            $scope.childChapter = section;
        });

        var Ken_FileFilter_ChapterID_List = function (chapter) {
            if (!chapter.ChapterID) return;
            $scope.$parent.kens.length = 0;
            kenService.Ken_FileFilter_ChapterID_List(chapter, function (data) {
                $scope.$parent.kens = data.d;
                var allKenItem = {};
                if ($scope.$parent.kens.length > 0) {
                    allKenItem = angular.copy($scope.chapter.ken);
                }
                allKenItem.KenID = 0;
                allKenItem.Name = '全部';
                $scope.$parent.kens.insert(0, allKenItem);

                if (!$scope.$parent.kenSelection) {
                    $scope.$parent.kenSelection = allKenItem;
                }

                $scope.$emit('onRequestQuery', $scope.lastSelection, $scope.kenSelection, 'fromChapter');
            });
        }

        var Ken_ExerciseFilter_ChapterID_List = function (chapter) {
            $scope.$parent.kens.length = 0;
            kenService.Ken_ExerciseFilter_ChapterID_List(chapter, function (data) {
                $scope.$parent.kens = data.d;
                var allKenItem = {};
                if ($scope.$parent.kens.length > 0) {
                    allKenItem = angular.copy($scope.chapter.ken);
                }
                allKenItem.KenID = 0;
                allKenItem.Name = '全部';
                $scope.$parent.kens.insert(0, allKenItem);

                if (!$scope.$parent.kenSelection.KenID) {
                    $scope.$parent.kenSelection = allKenItem;
                }
                $scope.$emit('onRequestQuery', $scope.lastSelection, $scope.kenSelection, 'fromChapter');
            });
        }

        var findFirstChild = function (chapter) {
            var children = [];
            angular.forEach($scope.chapters, function (item) {
                if (item.ParentID === chapter.ChapterID) {
                    this.push(item);
                }
            }, children);

            if (children.length === 0) return null;

            children.sort(function (a, b) {
                return a.Orde - b.Orde;
            });

            return children[0];
        }

        $scope.parentFocus = function (item) {
            $scope.parentChapter = item;
            $scope.childChapter = findFirstChild($scope.parentChapter);
            $scope.lastSelection = item;
            $scope.$parent.kenSelection = {};
            switch ($scope.tab) {
                case 1:
                    Ken_FileFilter_ChapterID_List(item);
                    break;
                default:
                    Ken_ExerciseFilter_ChapterID_List(item);
                    break;
            }
        }
        ///节被选中
        $scope.$on('onChildSelected', function (event, item) {
            $scope.childChapter = item;
            $scope.lastSelection = item;
            switch ($scope.tab) {
                case 1:
                    Ken_FileFilter_ChapterID_List(item);
                    break;
                default:
                    Ken_ExerciseFilter_ChapterID_List(item);
                    break;
            }
        });

        $scope.willAddedChapter = {};

        ///增加小节
        $scope.$on('onAddChild', function (event, chapter) {
            $scope.willAddedChapter = angular.copy(chapter);
            $scope.willAddedChapter.ParentID = chapter.ChapterID;
            $scope.willAddedChapter.ChapterID = 0;
            $scope.willAddedChapter.Title = '';
            $scope.willAddedChapter.Orde = 9999;

            $scope.editorTitle = '增加小节';
            $('#eChapter').show();
        });

        $scope.$watch('tab', function (tab) {
            switch (tab) {
                case 1:
                    Ken_FileFilter_ChapterID_List($scope.lastSelection);
                    break;
                default:
                    Ken_ExerciseFilter_ChapterID_List($scope.lastSelection);
                    break;
            }
        });


        /// 知识点被选中, Tab页面切换， 请求查询数据
        $scope.$on('requestQuery', function (event, ken) {
            $scope.$emit('onRequestQuery', $scope.lastSelection, ken, 'fromChapter');
        });

        var findChapter = function (chapterID) {
            var length = $scope.chapters.length;
            for (var i = 0; i < length; i++) {
                if ($scope.chapters[i].ChapterID === chapterID) {
                    return $scope.chapters[i];
                }
            }
        }

        $scope.move = function (direction) {
            if (!$scope.lastSelection.ChapterID) return;
            chapterService.Chapter_Move($scope.lastSelection, direction, function (data) {
                if (data.d) {
                    //$scope.$parent.chapters = data.d;
                    var changedChapters = [];
                    angular.forEach(data.d, function (item) {
                        if (item.ParentID === $scope.parentChapter.ChapterID) {
                            this.push(item);
                        }
                    }, changedChapters);

                    angular.forEach(changedChapters, function (item) {
                        var chapter = findChapter(item.ChapterID);
                        chapter.Orde = item.Orde;
                    });
                    chapterService.SectionFormat($scope.$parent.chapters);
                }
            });
        }

        $scope.deleteChapter = function () {
            if (!$scope.lastSelection.ChapterID) return;
            $('#eChapterConfirm').show();
        }

        $scope.$on('onDialogOk', function (event) {
            chapterService.Chapter_Del($scope.lastSelection, function (data) {
                if (data.d == true) {
                    var length = $scope.$parent.chapters.length;
                    for (var i = 0; i < length; i++) {
                        if ($scope.$parent.chapters[i].ChapterID === $scope.lastSelection.ChapterID) {
                            $scope.$parent.chapters.splice(i, 1);
                            $scope.lastSelection = {};
                            break;
                        }
                    }
                    chapterService.SectionFormat($scope.$parent.chapters);

                    $scope.$parent.linkFiles.length = 0;
                    $scope.$parent.linkExercises.length = 0;
                }
            });
        });
    }]);

appKnow.controller('KenTopicCtrl', ['$scope', '$state', 'resourceKenService', 'chapterService', 'kenService', 'tagService', 'freezeService',
    function ($scope, $state, resourceKenService, chapterService, kenService, tagService, freezeService) {

        $scope.$parent.isKen = true;
        $scope.$emit('onResetMoreTitle');

        $scope.$parent.kenDisable = false;

        $scope.$parent.linkExercises.length = 0;
        $scope.$parent.linkFiles.length = 0;
        $scope.$parent.tab = 1;


        $scope.dataKen = {};
        $scope.dataChapter = {};
        $scope.dataChapters = [];

        $scope.orderField = '-Requirement';

        $scope.editKen = function (ken) {
            ///记录旧知识点，以便取消还原
            $scope.$parent.originKen = angular.copy(ken);
            $scope.$parent.ken = ken;
            var length = $scope.requireMents.length;
            for (var i = 0; i < length; i++) {
                if ($scope.$parent.requireMents[i].id == ken.Requirement) {
                    $scope.$parent.requireMent = $scope.$parent.requireMents[i];
                    break;
                }
            }
            angular.forEach($scope.$parent.chapters, function (item) {
                if (item.ChapterID === ken.ChapterID) {
                    $scope.$parent.ken.chapter = item;
                }
            });
            $('#eKen').show();
        }

        $scope.delIsShow = false;
        $scope.bgShow = false;
        $scope.willRemovedKen = {};
        //删除知识点
        $scope.fireRemove = function (item) {
            $scope.delIsShow = true;
            $scope.bgShow = true;
            $scope.willRemovedKen = item;
        }

        $scope.cancelRemove = function () {
            $scope.delIsShow = false;
            $scope.bgShow = false;
            $scope.willRemovedKen = {};
        }

        $scope.removeKen = function (ken) {
            ken.UpdateTime = new Date();
            kenService.Ken_Del(ken, function (data) {
                if (data.d) {
                    var length = $scope.$parent.ocKens.length;
                    for (var i = 0; i < length; i++) {
                        if ($scope.$parent.ocKens[i].KenID === ken.KenID) {
                            $scope.$parent.ocKens.splice(i, 1);
                            break;
                        }
                    }
                    $scope.$parent.ken = {};
                }
            });
            $scope.cancelRemove();
        }

        $scope.$on('onKenEdited', function (event, ken) {
            //$scope.kenFocus(ken);
            var length = $scope.$parent.ocKens.length;
            for (var i = 0; i < length; i++) {
                if ($scope.$parent.ocKens[i].KenID === ken.KenID) {
                    $scope.$parent.ocKens[i] = ken;
                    break;
                }
            }
        });

        $scope.$on('courseLoaded', function (event, course) {
            $scope.dataChapters.length = 0;
            $scope.loadStart($scope.course);
            var freezeData = freezeService.getFreeze(tagService.KenListTag);
            if (freezeData) {
                $scope.dataKen = freezeData.data.dataKen;
                $scope.dataChapter = freezeData.data.dataChapter;
                $scope.dataChapters = freezeData.data.dataChapters;
                $scope.$parent.linkFiles = freezeData.data.linkFiles;
                $scope.$parent.linkExercises = freezeData.data.linkExercises;
                freezeService.unFreeze(tagService.KenListTag);
            }
        });

        $scope.$on('onKenExerciseEdit', function (event, exercise) {
            freezeService.freeze(tagService.UrlSourceTag, $state.current.name);
            freezeService.freeze(tagService.KenListTag, {
                course: $scope.course,
                tab: $scope.tab,
                dataKen: $scope.dataKen,
                linkFiles: $scope.linkFiles,
                linkExercises: $scope.linkExercises,
                dataChapter: $scope.dataChapter,
                dataChapters: $scope.dataChapters
            });
            $scope.navEditExercise(exercise);
        });

        $scope.$watch('dataKen', function (v) {
            $scope.know = v.Requirement === 1;
        });

        $scope.kenFocus = function (item) {
            $scope.dataKen = item;
            $scope.dataChapters.length = 0;
            kenService.Chapter_KenID_List({ KenID: item.KenID, OCID: $scope.course.OCID }, function (data) {
                $scope.dataChapters = data.d;
                //if ($scope.dataChapters.length > 0) {
                $scope.dataChapter = {};
                $scope.dataChapter.ChapterID = 0;
                $scope.dataChapter.Title = '全部';
                $scope.dataChapters.insert(0, $scope.dataChapter);
                $scope.$emit('onRequestQuery', $scope.dataChapter, $scope.dataKen, 'fromKen');
                //}
            });
        }

        $scope.$on('willCourseChanged', function (event, course) {
            $scope.dataChapters.length = 0;
            $scope.$parent.linkFiles.length = 0;
            $scope.$parent.linkExercises.length = 0;
        });

        $scope.chapterFocus = function (item) {
            $scope.dataChapter = item;
            $scope.$emit('onRequestQuery', $scope.dataChapter, $scope.dataKen, 'fromKen');
        }

        /// 知识点被选中, Tab页面切换， 请求查询数据
        $scope.$on('requestQuery', function (event, ken) {
            $scope.$emit('onRequestQuery', $scope.dataChapter, $scope.dataKen, 'fromKen');
        });
    }]);


'use strict';

var appResource = angular.module('app.resource.controllers', [
    'app.res.services',
    'app.chapter.services',
    'app.content.services',
    'checklist-model',
    'ui.tree'
]);

appResource.controller('ResourceCtrl', ['$scope', 'resourceService', 'pageService', 'contentService', 'chapterService', 'kenService', 'FileUploader',
    function ($scope, resourceService, pageService, contentService, chapterService, kenService, FileUploader) {

        $scope.$emit('onPreviewSwitch', false);
        $scope.$emit('onResetMoreTitle');
        $scope.$emit('onSetAppTitle', '资料库');
        $scope.model = {};
        $scope.fileTypes = [];//文件类型
        $scope.timePass = [];//上传时间
        $scope.shareRanges = []; //使用权限
        $scope.shareRangesQuery = [];

        $scope.model.FileType = -1;
        $scope.model.timeSelection = -1;
        $scope.model.ShareRange = 0;
        $scope.model.FileTitle = '';
        $scope.checksSelect = [];//复选框选中的值
        $scope.folders = [];//文件夹数组

        $scope.folderRelations = [];//文件夹文件数组

        $scope.model.ParentID = 0;//上级ID
        $scope.files = [];//移动文件夹数据

        $scope.delIsShow = false;//删除弹出框
        $scope.moveShow = false;//移动弹出框
        $scope.bgShow = false;//背景置灰

        $scope.folder = {};//文件夹对象

        $scope.propertyShow = false;//资料属性显示

        $scope.chapters = [];//关联章节
        $scope.kens = [];//关联知识点

        $scope.model.timePass = -1;
        $scope.tabTitles = [];

        $scope.$emit('willResetCourse', 'Resource');

        ///课程切换
        $scope.$on('willCourseChanged', function (event, course) {
            //console.log(course);
            $scope.model.ParentID = 0;
            $scope.model.OCID = course.OCID;
            $scope.model.CourseID = course.CourseID;
            $scope.filterChanged();
            $scope.folderRelation = {};

            $scope.tabTitles.length = 0;
            $scope.tabTitles.push({ id: 0, name: course.Name, order: $scope.order });

            $scope.checks.length = 0;
            resetFilePropertyData(course);
        });

        $scope.$on('courseLoaded', function (event, course) {
            $scope.model.OCID = $scope.course.OCID;
            $scope.model.CourseID = $scope.course.CourseID;
            $scope.model.ParentID = 0;
            $scope.filterChanged();

            $scope.order = 0;
            $scope.tabTitles.length = 0;
            $scope.tabTitles.push({ id: 0, name: $scope.course.Name, order: $scope.order });

            resetFilePropertyData(course);
        });

        var resetFilePropertyData = function (course) {
            //获取关联章节数据
            chapterService.Chapter_List({ OCID: course.OCID }, function (data) {
                if (data.d.length > 0) {
                    $scope.chapters = data.d;
                    chapterService.SectionFormat($scope.chapters);
                    //var length = $scope.chapters.length;
                    //for (var i = 0; i < length; i++) {
                    //    chapterService.FormatSection($scope.chapters[i]);
                    //}
                }
            });
            //获取关联知识点数据
            kenService.Ken_List({ OCID: course.OCID }, function (data) {
                if (data.d.length > 0) {
                    $scope.kens = data.d;
                    //$scope.ken = $scope.kens[0];
                }
            });
        }

        //$scope.orderField = 'Name';

        //$scope.orderField = 'folderRelation';
        //$scope.changeOrder = function (fieldName) {
        //    if ($scope.orderField === fieldName) {
        //        $scope.orderField = '-' + fieldName;
        //    } else {
        //        $scope.orderField = fieldName;
        //    }
        //}

        //时间格式转换
        var dateFormat = function (v) {
            var re = /-?\d+/;
            var m = re.exec(v);
            var d = new Date(parseInt(m[0]));
            // 按【2012-02-13 09:09:09】的格式返回日期
            return d;
        }

        var orderTime = 0;
        var order = 0;
        $scope.orderField = 'folderRelation';
        $scope.changeOrder = function (filedName) {
            $scope.folderRelations.sort(function (a, b) {
                var resultRelationType = (a.RelationType - b.RelationType);
                //按时间
                if (filedName == 'CreateTime') {
                    var obj1 = dateFormat(a.CreateTime);
                    var obj2 = dateFormat(b.CreateTime);
                    if (resultRelationType == 0) {
                        if (orderTime == 0) return obj1.valueOf() - obj2.valueOf();
                        else return -(obj1.valueOf() - obj2.valueOf());
                    }
                }
                if (filedName == 'Name') {
                    if (resultRelationType == 0) {
                        if (orderTime == 0) return a.Name.localeCompare(b.Name);
                        else return -(a.Name.localeCompare(b.Name));
                    }
                }
                return resultRelationType;
            });
            if (orderTime == 0) orderTime = 1;
            else orderTime = 0;
        }

        $scope.tabChange = function (item) {
            $scope.model.ParentID = item.id;
            $scope.filterChanged();

            $scope.folderRelation = {};

            var arr = [];
            for (var i = 0; i < $scope.tabTitles.length; i++) {
                if ($scope.tabTitles[i].order <= item.order) {
                    arr.push($scope.tabTitles[i]);
                }
            }
            $scope.tabTitles.length = 0;
            $scope.tabTitles = arr;
        }
        //单击文件夹名称方法,进入文件夹
        $scope.folderClick = function (item) {
            if (item.RelationType == 1) return;
            $scope.model.ParentID = item.Id;
            $scope.folderRelation = item;
            $scope.filterChanged();

            $scope.order += 1;
            if (item.Id == null) return;
            $scope.tabTitles.push({ id: item.Id, name: '>' + item.Name, order: $scope.order });
        }
        $scope.typeChanged = function (v) {
            $scope.model.FileType = v;
            $scope.filterChanged();
        }
        $scope.timeChanged = function (v) {
            $scope.model.timePass = v;
            $scope.filterChanged();
        }
        $scope.shareChanged = function (v) {
            $scope.model.ShareRange = v;
            $scope.filterChanged();
        }



        //文件类型初始化
        resourceService.Resource_Dict_FileType_Get(function (data) {
            if (data.d) {
                var item = {};
                angular.copy(data.d[0], item);
                item.id = -1;
                item.name = '不限';
                $scope.fileTypes = data.d;
                $scope.fileTypes.insert(0, item);
            }
        });



        //上传时间初始化
        resourceService.Resource_Dict_TimePass_Get(function (data) {
            if (data.d) {
                $scope.timePass = data.d;
                var item = {};
                angular.copy($scope.timePass[0], item);
                item.id = -1;
                item.name = '不限';
                $scope.timePass.insert(0, item);
            }
        });
        //使用权限初始化
        resourceService.Resource_Dict_ShareRange_Get(function (data) {
            if (data.d) {
                var item = {};
                angular.copy(data.d[0], item);
                item.id = 0;
                item.name = '不限';
                $scope.shareRangesQuery = data.d;
                $scope.shareRangesQuery.insert(0, item);


            }
        });
        //使用权限初始化
        resourceService.Resource_Dict_ShareRange_Get(function (data) {
            if (data.d) {
                $scope.shareRanges = data.d;
            }
        });

        //获取使用权限
        $scope.GetShareRange = function (shareRange) {
            for (var i = 0; i < $scope.shareRanges.length; i++) {
                if ($scope.shareRanges[i].id == shareRange) {
                    return $scope.shareRanges[i].name;
                }
            }
        }




        //查询
        $scope.filterChanged = function () {
            var folder = angular.copy($scope.model);
            var file = angular.copy($scope.model);
            if ($scope.course.OCID === 0) {
                file.ShareRange = 0;
            }
            resourceService.FolderRelation_List(folder, file, function (data) {
                if (data.d.length > 0) {
                    $scope.folderRelations = data.d;
                } else {
                    $scope.folderRelations = [];
                }
                $scope.checksSelect.length = 0;
            });
        }

        var fileIndex = 0;
        //新建文件
        ///************************************************文件上传******************************************

        //FROM 1 资料  2 附件 
        $scope.$on('onSuccessItem', function (event, fileItem, response, status, headers) {
            ////TODO required testing
            //var length = response.length;
            //for (var i = 0; i < length; i++) {
            //    $scope.folderRelations.push(response[i]); 
            //}
        });

        $scope.$on('onCompleteItem', function (event) {
            $scope.filterChanged();
        });


        ///************************************************END 文件上传******************************************

        var copyFolder = {};

        $scope.$on('onCopyFolder', function (event, oldFolder) {
            copyFolder = angular.copy(oldFolder);
        });

        $scope.updFolderName = function (item) {
            if (!item.Name) {
                item.Name = copyFolder.Name;
            }
            if (item.RelationType == 1) {
                var file = { FileID: item.Id, FileTitle: item.Name };
                resourceService.File_FileTitle_Upd(file, function (data) {
                    if (data.d) {
                        $scope.filterChanged();
                    }
                });
            }
            else {
                //新建
                if (item.FolderID == 0) {
                    var folder = { FolderName: item.Name, ParentID: $scope.model.ParentID, OCID: item.OCID };
                    resourceService.Folder_ADD(folder, function (data) {
                        if (data.d) {
                            $scope.filterChanged();
                        }
                    });
                }
                else {//修改            
                    var folder = { FolderName: item.Name, FolderID: item.Id };
                    resourceService.Folder_Name_Upd(folder, function (data) {
                        if (data.d) {
                            $scope.filterChanged();
                        }
                    });
                }
            }
        }

        //新建文件夹
        $scope.AddFolder = function () {
            $scope.orderField = 'null';
            resourceService.Folder_Get(function (data) {
                var folder = data.d;
                folder.Name = '请输入文件夹名称';
                folder.ParentID = $scope.model.ParentID;
                folder.OCID = $scope.model.OCID;
                //folder.folderRelation = 0;
                folder.FileType = -1;
                folder.RelationType = 0;
                $scope.folderRelations.insert(0, folder);
                //console.log($('.course_data tbody').next());
            });

        }

        //返回上一层
        $scope.returnPage = function (item) {
            if (item) {
                var folder = { FolderID: item.ParentID };
                resourceService.Folder_GetModel(folder, function (data) {
                    if (data.d) {
                        $scope.model.ParentID = data.d.ParentID;
                        $scope.filterChanged();
                    }
                });
            }
        }
        $scope.assignShare = function (shareItem) {
            console.log(shareItem);
        }
        //移动文件夹选中数据
        //$scope.selectedMove = function (item) {
        //    $scope.folder = item;
        //}
        $scope.$on('onSelectedMove', function (event, node) {
            $scope.folder = node;
        })

        //移动文件框保存方法
        $scope.moveFileSubmit = function () {
            for (var i = 0; i < $scope.checksSelect.length; i++) {
                if ($scope.checksSelect[i].RelationType == 0) {
                    var folder = { FolderID: $scope.checksSelect[i].Id, OCID: $scope.folder.OCID };
                    folder.ParentID = $scope.folder.RelationType === 1 || $scope.folder.RelationType === -1 ? 0 : $scope.folder.Id;
                    resourceService.Folder_ParentID_Upd(folder, function (data) {
                        if (data.d) {
                            $scope.filterChanged();
                            $scope.close();
                        }
                    });
                } else {
                    var file = { OCID: $scope.folder.OCID, FileID: $scope.checksSelect[i].Id };
                    file.FolderID = $scope.folder.RelationType === 1 || $scope.folder.RelationType === -1 ? 0 : $scope.folder.Id;
                    resourceService.File_FolderID_Upd(file, function (data) {
                        if (data.d) {
                            $scope.filterChanged();
                            $scope.close();
                        }
                    });
                }
            }
        }

        ///移动文件夹树
        $scope.folderTrees = [];

        $scope.mobileFolder = function () {
            $scope.folderTrees.length = 0;
            resourceService.ResourceFolderTree($scope.checksSelect, function (data) {
                $scope.folderTrees = data.d;
            });
        }

        $scope.batchMove = function () {
            $scope.folderTrees.length = 0;
            resourceService.ResourceFolderTree($scope.checksSelect, function (data) {
                $scope.folderTrees = data.d;
            });
        }


        //移动数据循环删除子项
        var mobilesDel = function (Children, item) {
            for (var n = 0; n < Children.length; n++) {
                if (Children[n].Id == item) {
                    Children.splice(n, 1);
                } else {
                    mobilesDel(Children[n].Children, item);
                }
            }
        }


        //文件夹移动按钮
        //$scope.mobileClick = function () {
        //    var folder = { FolderID: $scope.FolderID, ParentID: $scope.ParentID.FolderID }
        //    resourceService.Folder_ParentID_Upd(folder, function (data) {
        //        if (data.d) {
        //            $scope.filterChanged();
        //            //关闭弹出层
        //            $('.pop_bg,.pop_400').hide();
        //        }
        //    });
        //}


        //删除文件夹弹出框
        $scope.fireRemove = function (item) {
            $scope.delIsShow = true;
            $scope.bgShow = true;
            $scope.folder = item;
        }
        //批量删除文件夹弹出框
        $scope.fireRemoveAll = function () {
            if ($scope.checks.length == 0) return;
            $scope.delIsShow = true;
            $scope.bgShow = true;
            $scope.folder = null;
        }
        //移动文件弹出框
        $scope.fireMobile = function (item) {
            $scope.checksSelect.length = 0;
            $scope.moveShow = true;
            $scope.bgShow = true;
            $scope.checksSelect.push(item);
            $scope.mobileFolder();
        }
        //移动文件弹出框
        $scope.fireMobileBatch = function () {
            if ($scope.checks.length == 0) return;
            $scope.checksSelect = $scope.checks;
            $scope.moveShow = true;
            $scope.bgShow = true;
            $scope.mobileFolder();
        }

        //资料属性弹出框
        $scope.fileProperty = function (item) {
            $scope.file = item;
            $('#fileProp').show();
            resourceService.File_Chapter_Ken(item.Id, function (data) {
                if (data.d != null) {
                    var chapter = {};
                    for (var i = 0; i < $scope.chapters.length; i++) {
                        if ($scope.chapters[i].ChapterID == data.d.ChapterID) {
                            chapter = $scope.chapters[i];
                        }
                    }
                    var ken = {};
                    for (var i = 0; i < $scope.kens.length; i++) {
                        if ($scope.kens[i].KenID == data.d.KenID) {
                            ken = $scope.kens[i];
                        }
                    }
                    $scope.chapter = chapter;
                    $scope.ken = ken;
                }
            })
        }

        $scope.$on('onPerpertySave', function (e, chapter, ken) {
            var file = { FileID: $scope.file.Id };
            var c = { ChapterID: chapter.ChapterID };
            var k = { KenID: ken.KenID };
            resourceService.File_Chapter_Ken_Edit(file, c, k);
        });


        var removeItem = function (item) {
            var length = $scope.folderRelations.length;
            for (var i = 0; i < length; i++) {
                if ($scope.folderRelations[i].Id === item.Id) {
                    $scope.folderRelations.splice(i, 1);
                    $scope.folder = null;
                    $scope.checks.length = 0;
                    break;
                }
            }
        }

        var removeChecks = function (checks) {
            var length = checks.length;
            for (var i = 0; i < length; i++) {
                removeItem(checks[i]);
            }
            $scope.folder = null;
            $scope.checks.length = 0;
        }

        $scope.removeAll = function () {

            if ($scope.folder) {
                var copyFolder = angular.copy($scope.folder);
                ///单一文件删除
                if ($scope.folder.RelationType === 1) {
                    resourceService.File_Del({ FileID: $scope.folder.Id }, function (data) {
                        if (data.d == "1") {
                            removeItem(copyFolder);
                        } else if (data.d == "0") {
                            alert("文件已经在MOOC中被引用了，删除失败!");
                        } else {
                            alert("删除失败,请稍后重试!");
                        }
                        //if (data.d) {
                        //    alert(data.d);
                        //} else {
                        //    removeItem(copyFolder);

                        //}
                    });

                } else {
                    resourceService.Folder_Del({ FolderID: $scope.folder.Id }, function (data) {
                        removeItem(copyFolder);
                    });
                }
            } else {
                var fileIDS = '';
                var folderIDS = '';
                var length = $scope.checks.length;
                for (var i = 0; i < length; i++) {
                    var fileObj = $scope.checks[i];
                    if (fileObj.RelationType === 1) {
                        fileIDS += fileObj.Id + ',';
                    } else {
                        folderIDS += fileObj.Id + ',';
                    }
                }
                var items = angular.copy($scope.checks);
                //文件 
                if (fileIDS.length > 0) {
                    fileIDS = fileIDS.substr(0, fileIDS.length - 1);
                    resourceService.File_Batch_Del(fileIDS, function (data) {
                        if (data.d) {
                            removeChecks(items);
                        }
                    });
                }

                ///文件夹
                if (folderIDS.length > 0) {
                    folderIDS = folderIDS.substr(0, folderIDS.length - 1);
                    resourceService.Folder_Batch_Del(folderIDS, function (data) {
                        if (data.d) {
                            removeChecks(items);
                        }
                    });
                }
            }
            $scope.close();
        }

        //删除文件夹弹出框点击确定按钮
        $scope.folderDelClick = function () {

            $scope.checksSelect.length = 0;

            if ($scope.folder == null) {
                $scope.checksSelect = $scope.checks;
            } else {
                $scope.checksSelect.push($scope.folder);
            }

            for (var i = 0; i < $scope.checksSelect.length; i++) {
                if ($scope.checksSelect[i].RelationType == 0) {
                    var folder = { FolderID: $scope.checksSelect[i].Id };
                    resourceService.Folder_Del(folder, function (data) {
                        if (data.d) {
                            $scope.filterChanged();
                            $scope.close();
                        }
                    });
                } else {
                    var file = { FileID: $scope.checksSelect[i].Id };
                    resourceService.File_Del(file, function (data) {
                        if (data.d == "1") {
                            $scope.filterChanged();
                            $scope.close();
                        } else if (data.d == "0") {
                            //alert("文件已经在MOOC中被引用了，删除失败!");
                        } else {
                            //alert("删除失败,请稍后重试!");
                        }

                        //if (data.d.length === 0) {
                        //    $scope.filterChanged();
                        //    $scope.close();
                        //} else {
                        //    alert(data.d);
                        //}
                    });
                }
            }

        }

        //删除文件夹
        $scope.delFolder = function (item) {
            var folder = { FolderID: item.FolderID };
            resourceService.Folder_Del(folder, function (data) {
                if (data.d) {
                    $scope.filterChanged();
                }
            });
        }
        //批量删除文件夹
        $scope.delALLFolder = function () {
            if ($scope.checksSelect.length > 0) {
                var length = $scope.checksSelect.length;
                for (var i = 0; i < length; i++) {
                    var folder = { FolderID: $scope.checksSelect[i].FolderID };
                    resourceService.Folder_Del(folder, function (data) {
                        if (data.d)
                            $scope.filterChanged();
                    });
                }

            }
        }

        //关闭删除文件夹弹出框
        $scope.close = function () {
            $scope.delIsShow = false;
            $scope.bgShow = false;
            $scope.moveShow = false;
            $scope.propertyShow = false;
            $scope.folder = {};
            $scope.$broadcast('selectMoveClear', $scope.folder);
        }


        $scope.visible = function (item) {
            if ($scope.query && $scope.query.length > 0
              && item.title.indexOf($scope.query) == -1) {
                return false;
            }
            return true;
        };

        $scope.checks = [];

        $scope.$watch('selectionAllToggle', function (v) {
            $scope.checks.length = 0
            if (v === 'YES') {
                angular.forEach($scope.folderRelations, function (item) {
                    this.push(item);
                }, $scope.checks);
            }
        });
        //批量共享
        $scope.batchShareRange = function (shareRange) {
            if ($scope.checks.length === 0) return;
            var fileIds = '';
            var folderIds = '';
            var length = $scope.checks.length;
            for (var i = 0; i < length; i++) {
                if ($scope.checks[i].RelationType === 1) {
                    fileIds += $scope.checks[i].Id.toString() + ',';
                } else {
                    folderIds += $scope.checks[i].Id.toString() + ',';
                }
            }
            if (fileIds.length > 0) {
                fileIds = fileIds.substr(0, fileIds.length - 1);
                resourceService.File_Batch_ShareRange(fileIds, shareRange.id);
            }
            if (folderIds.length > 0) {
                folderIds = folderIds.substr(0, folderIds.length - 1);
                resourceService.Folder_Batch_ShareRange(folderIds, shareRange.id);
            }

        }

        var canAllowDownload = function (folderRelation) {
            return folderRelation.Ext === '.ppt'
                || folderRelation.Ext === '.pptx'
                || folderRelation.Ext === '.pdf'
                || folderRelation.Ext === '.doc'
                || folderRelation.Ext === '.docx'
                || folderRelation.Ext === '.mp4'
                || folderRelation.Ext === '.wmv'
                || folderRelation.Ext === '.asf'
                || folderRelation.Ext === '.mp3';
        }

        $scope.$on('allowDownload', function (event, allowed) {
            if ($scope.checks.length === 0) return;
            var fileIds = '';
            var length = $scope.checks.length;
            for (var i = 0; i < length; i++) {
                if ($scope.checks[i].RelationType === 1 && canAllowDownload($scope.checks[i])) {
                    fileIds += $scope.checks[i].Id.toString() + ',';
                }
            }
            if (fileIds.length > 0) {
                fileIds = fileIds.substr(0, fileIds.length - 1);
                resourceService.File_Batch_AllowDownload(fileIds, allowed, function () {
                    angular.forEach($scope.checks, function (item) {
                        if (item.RelationType === 1) item.AllowDownload = allowed;
                    });
                });
            }
        });

        $scope.fireAllowDownload = function (folderRelation, allowed) {
            if (folderRelation.RelationType === 0) return;
            resourceService.File_Batch_AllowDownload(folderRelation.Id, allowed, function () {
                folderRelation.AllowDownload = allowed;
            });
        }

        



        $scope.$on('batchShareRange', function (event, range) {
            if ($scope.checks.length === 0) return;
            var fileIds = '';
            var folderIds = '';
            var length = $scope.checks.length;
            for (var i = 0; i < length; i++) {
                if ($scope.checks[i].RelationType === 1) {
                    fileIds += $scope.checks[i].Id.toString() + ',';
                } else {
                    folderIds += $scope.checks[i].Id.toString() + ',';
                }
            }
            if (fileIds.length > 0) {
                fileIds = fileIds.substr(0, fileIds.length - 1);
                resourceService.File_Batch_ShareRange(fileIds, range.id, function () {
                    angular.forEach($scope.checks, function (item) {
                        if (item.RelationType === 1) item.ShareRange = range.id;
                    });
                });
            }
            if (folderIds.length > 0) {
                folderIds = folderIds.substr(0, folderIds.length - 1);
                resourceService.Folder_Batch_ShareRange(folderIds, range.id, function (data) {
                    angular.forEach($scope.checks, function (item) {
                        if (item.RelationType === 0) item.ShareRange = range.id;
                    });
                });
            }
            //$scope.filterChanged();
        });

        //单一共享
        $scope.$on('shareRange', function (event, range, file) {
            if (file.RelationType === 1) {
                //文件
                var file = { FileID: file.Id, ShareRange: range.id }
                resourceService.File_ShareRange_Upd(file);
            } else {
                var folder = { FolderID: file.Id, ShareRange: range.id }
                resourceService.Folder_ShareRange_Upd(folder);
            }
            $scope.filterChanged();
        });

        $scope.isShow = function (a) {
            if (a.$element.find('ul').is(':hidden')) {
                a.$element.find('ul').show();
                a.$element.find('span').html('<em>-</em>');
            } else {
                a.$element.find('ul').hide();
                a.$element.find('span').html('<em>+</em>');
            }
        }

        //计算文件大小
        $scope.CalculatedSize = function (size) {
            if (size == null) return '一';
            var rs = Math.round(size / 1024);
            if (rs < 1024) {
                return rs + 'KB';
            } else {
                return (rs / 1024).toFixed(2) + 'MB';
            }
        }


        //$scope.showLi = function (a) {
        //    if (a.$element.find('ul').is(':hidden')) {
        //        if (a.$element.find('li').length == 0) {
        //            a.$element.find('span').html('')
        //        } else {
        //            a.$element.find('span').html('<em>+</em>');
        //        }
        //    } else {
        //        if (a.$element.find('li').length == 0) {
        //            a.$element.find('span').html('')
        //        } else {
        //            a.$element.find('span').html('<em>-</em>');
        //        }
        //    }
        //}

        //移动文件弹出框    
        //$('.first_file span').bind('click', function () {
        //    if ($(this).parent().next().is(':hidden')) {
        //        $(this).html('<em>-</em>');
        //        $(this).parent().next().slideDown();
        //    } else {
        //        $(this).html('<em>+</em>');
        //        $(this).parent().next().slideUp();
        //    }
        //})
    }]);

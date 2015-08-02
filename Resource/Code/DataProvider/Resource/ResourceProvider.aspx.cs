/* **************************************************************
* Copyright(c) 2014 IES, All Rights Reserved.   
* File             : ResourceProvider.aspx.cs
* Description      : 试卷数据访问
* Author           : shujianhua 
* Created          : 2014-12-29  
* Revision History : 
******************************************************************/
namespace App.Resource.DataProvider.Resource
{
    using IES.Common.Data;
    using IES.Resource.Model;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Web;
    using System.Web.Services;
    using System.Web.UI;
    using System.Web.UI.WebControls;

    using IES.G2S.Resource.BLL;
    using IES.Service;
    using IES.CC.OC.Model;

    public partial class ResourceProvider : System.Web.UI.Page
    {
        #region 文件列表
        /// <summary>
        /// 获取资源的文件类型
        /// </summary>
        /// <returns></returns>
        [WebMethod]
        public static IList<ResourceDict> Resource_Dict_FileType_Get()
        {
            return ResourceCommonData.Resource_Dict_FileType_Get();
        }

        /// <summary>
        /// 获取上传时间的设置
        /// </summary>
        /// <returns></returns>
        [WebMethod]
        public static IList<ResourceDict> Resource_Dict_TimePass_Get()
        {
            return ResourceCommonData.Resource_Dict_TimePass_Get();
        }

        /// <summary>
        /// 获取使用权限
        /// </summary>
        /// <returns></returns>
        [WebMethod]
        public static IList<ResourceDict> Resource_Dict_ShareRange_Get()
        {
            return ResourceCommonData.Resource_Dict_ShareRange_Get();
        }

        /// <summary>
        /// 文件查询列表
        /// </summary>
        /// <param name="file"></param>
        /// <param name="PageSize"></param>
        /// <param name="PageIndex"></param>
        /// <returns></returns>
        [WebMethod]
        public static IList<File> File_Search(File file)
        {
            file.CreateUserID = IES.Service.UserService.CurrentUser.UserID;
            return new FileBLL().File_Search(file);
        }
        /// <summary>
        /// 删除文件功能
        /// </summary>
        /// <param name="list"></param>
        /// <returns></returns>
        [WebMethod]
        public static string File_Del(File file)
        {
            return new FileBLL().File_Del(file);
        }

        /// <summary>
        /// 文件新增
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        [WebMethod]
        public static File File_ADD(File file)
        {
            file.CreateUserID = IES.Service.UserService.CurrentUser.UserID;
            file.CreateUserName = IES.Service.UserService.CurrentUser.UserName;
            return new FileBLL().File_ADD(file);
        }

        /// <summary>
        /// 文件重命名
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        [WebMethod]
        public static bool File_FileTitle_Upd(File file)
        {
            return new FileBLL().File_FileTitle_Upd(file);
        }

        /// <summary>
        /// 文件移动
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        [WebMethod]
        public static bool File_FolderID_Upd(File file)
        {
            return new FileBLL().File_FolderID_Upd(file);
        }

        /// <summary>
        /// 批量设置使用权限
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        [WebMethod]
        public static bool File_Batch_ShareRange(string FileIDS, int ShareRange)
        {
            return new FileBLL().File_Batch_ShareRange(FileIDS, ShareRange);
        }

        [WebMethod]
        public static bool File_Chapter_Ken_Edit(File model, Chapter chapter, Ken ken)
        {
            return new FileBLL().File_Chapter_Ken_Edit(model, chapter, ken);
        }

        [WebMethod]
        public static FileChapterKen File_Chapter_Ken(int FileID)
        {
            return new FileBLL().File_Chapter_Ken(FileID);
        }

        /// <summary>
        /// 设置共享范围
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [WebMethod]
        public static bool File_ShareRange_Upd(File model)
        {
            return new FileBLL().File_ShareRange_Upd(model);
        }

        /// <summary>
        /// 设置是否允许下载
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [WebMethod]
        public static bool File_Batch_AllowDownload(string fileIDS, int allowed)
        {
            return new FileBLL().File_Batch_AllowDownload(fileIDS, allowed == 1);
        }

        /// <summary>
        /// 更新zip起始页名称
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [WebMethod]
        public static bool File_RarIndexPage_Upd(int fileId, string rarIndexPage)
        {
            IES.Resource.Model.File file = new IES.Resource.Model.File() { FileID = fileId, RarIndexPage = rarIndexPage };
            return new FileBLL().File_RarIndexPage_Upd(file);
        }
        #endregion

        #region FolderRelation

        /// <summary>
        /// 查询列表
        /// </summary>
        /// <param name="folder"></param>
        /// <returns></returns>
        [WebMethod]
        public static IList<FolderRelation> FolderRelation_List(Folder folder, File file)
        {
            folder.CreateUserID = IES.Service.UserService.CurrentUser.UserID;
            IList<FolderRelation> allFolderRelations = new List<FolderRelation>();
            IList<Folder> allFolders = Folder_List(folder);
            bool isFilter = !string.IsNullOrEmpty(file.FileTitle);
            if (!isFilter)
            {
                foreach (var item in allFolders)
                {
                    FolderRelation fr = new FolderRelation();
                    fr.Id = item.FolderID;
                    fr.Name = item.FolderName;
                    fr.OCID = item.OCID;
                    fr.ParentID = item.ParentID;
                    fr.RelationType = FileType.Folder;
                    fr.CourseId = item.CourseID;
                    fr.CreateUserID = item.CreateUserID;
                    fr.CreateTime = item.CreateTime;
                    fr.ShareRange = item.ShareRange;
                    allFolderRelations.Add(fr);
                }
            }
            else
            {
                folder.FolderID = folder.ParentID;
                allFolders = new FileBLL().Folder_Children(folder);
            }

            if (file != null)
            {
                file.FolderID = folder.ParentID;
            }
            file.CreateUserID = IES.Service.UserService.CurrentUser.UserID;
            IList<File> allFiles = new FileBLL().File_Search(file);

            foreach (var item in allFiles)
            {
                FolderRelation fr = new FolderRelation();
                fr.Id = item.FileID;
                fr.Name = item.FileTitle;
                fr.OCID = item.OCID;
                fr.ParentID = item.FolderID;
                fr.RelationType = FileType.File;
                fr.CourseId = item.CourseID;
                fr.FileSize = item.FileSize;
                fr.Ext = item.Ext;
                fr.CreateTime = item.UploadTime;
                fr.FileType = item.FileType;
                fr.ShareRange = item.ShareRange;
                fr.Kens = item.Kens;
                fr.CreateUserID = item.CreateUserID;
                if (item.FileType == 1 || item.FileType == 2 || item.FileType == 4 || item.FileType == 6)
                {
                    fr.DownURL = item.ViewURL;
                }
                else
                {
                    fr.DownURL = item.DownURL;
                }
                fr.CreateUserName = item.CreateUserName;
                allFolderRelations.Add(fr);
            }

            IList<FolderRelation> roots = new List<FolderRelation>();

            foreach (var root in allFolderRelations)
            {
                //var parentId = folder.ParentID == -1 ? 0 : folder.ParentID;
                //if (root.ParentID == parentId) roots.Add(root);
                roots.Add(root);
            }
            foreach (var root in roots)
            {
                if (root.RelationType == FileType.Folder)
                {
                    BuildRelationFolder(allFolderRelations, root);
                }
            }
            if (isFilter)
            {
                IList<FolderRelation> filterItems = new List<FolderRelation>();
                foreach (var item in allFolders)
                {
                    var children = from v in roots
                                   where v.ParentID == item.FolderID
                                   select v;
                    foreach (var child in children)
                    {
                        filterItems.Add(child);
                    }
                }
                return filterItems.ToList();
            }

            return roots.ToList();
        }

        private static void BuildRelationFolder(IList<FolderRelation> allFolders, FolderRelation root)
        {
            var children = from v in allFolders
                           where v.ParentID == root.Id
                           select v;
            foreach (var child in children)
            {
                root.Children.Add(child);
                if (child.RelationType == FileType.Folder)
                {
                    BuildRelationFolder(allFolders, child);
                }
            }
        }

        [WebMethod]
        public static IList<FolderRelation> ResourceFolderTree(IList<FolderRelation> movedFolders)
        {
            var user = UserService.CurrentUser;
            //用户所有的课程
            IList<OC> ocs = UserService.User_OC_List(user);

            IList<FolderRelation> roots = new List<FolderRelation>();

            FolderRelation fr = new FolderRelation();
            fr.Id = 0;
            fr.Name = "个人资料";
            fr.ParentID = 0;
            fr.RelationType = FileType.None;
            roots.Add(fr);

            foreach (var item in ocs)
            {
                fr = new FolderRelation();
                fr.Id = item.OCID;
                fr.Name = item.Name;
                fr.ParentID = 0;
                fr.OCID = item.OCID;
                fr.RelationType = FileType.None;
                roots.Add(fr);
            }

            IList<FolderRelation> relationFolders = new List<FolderRelation>();
            IList<Folder> folders = new FileBLL().Folder_ALL_Tree(user.UserID);

            foreach (var item in folders)
            {
                var exists = from v in movedFolders where item.FolderID == v.Id && v.RelationType == FileType.Folder select v;
                if (exists.Any()) continue;
                fr = new FolderRelation();
                fr.Id = item.FolderID;
                fr.Name = item.FolderName;
                //fr.ParentID = item.ParentID == 0 ? item.OCID : item.ParentID;
                fr.ParentID = item.ParentID;
                fr.RelationType = FileType.Folder;
                fr.OCID = item.OCID;
                relationFolders.Add(fr);
            }

            var rootFolders = from v in relationFolders where v.ParentID == 0 select v;
            
            foreach (var rootFolder in rootFolders)
            {
                BuildRelationFolder(relationFolders, rootFolder);
                var root = from v in roots where v.OCID == rootFolder.OCID select v;
                if (root.Any())
                {
                    root.First().Children.Add(rootFolder);
                }
            }          
            return roots;
        }
        #endregion

        #region 文件夹
        [WebMethod]
        public static bool Folder_ShareRange_Upd(Folder model)
        {
            return new FileBLL().Folder_ShareRange_Upd(model);
        }

        /// <summary>
        /// 批量设置使用权限
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        [WebMethod]
        public static bool Folder_Batch_ShareRange(string folderIds, int shareRange)
        {
            return new FileBLL().Folder_Batch_ShareRange(folderIds, shareRange);
        }
        /// <summary>
        /// 文件夹查询列表
        /// </summary>
        /// <param name="folder"></param>
        /// <returns></returns>
        [WebMethod]
        public static IList<Folder> Folder_List(Folder folder)
        {
            if (!IES.Service.UserService.OC_IsRole(folder.OCID))
            {
                return null;
            }

            folder.CreateUserID = IES.Service.UserService.CurrentUser.UserID;
            IList<Folder> allFolders = new FileBLL().Folder_List(folder);
            return allFolders;
        }

        /// <summary>
        /// 新建文件夹
        /// </summary>
        /// <param name="folder"></param>
        /// <returns></returns>
        [WebMethod]
        public static Folder Folder_ADD(Folder folder)
        {
            if (!IES.Service.UserService.OC_IsRole(folder.OCID))
            {
                return null;
            }
            folder.CreateUserID = IES.Service.UserService.CurrentUser.UserID;
            return new FileBLL().Folder_ADD(folder);
        }
        /// <summary>
        /// 修改文件夹名称
        /// </summary>
        /// <param name="folder"></param>
        /// <returns></returns>
        [WebMethod]
        public static bool Folder_Name_Upd(Folder folder)
        {
            if (!IES.Service.UserService.OC_IsRole(folder.OCID))
            {
                return false;
            }

            return new FileBLL().Folder_Name_Upd(folder);
        }
        /// <summary>
        /// 获得空对象
        /// </summary>
        /// <returns></returns>
        [WebMethod]
        public static Folder Folder_Get()
        {
            return new FileBLL().Folder_Get();
        }
        /// <summary>
        /// 获得文件夹对象
        /// </summary>
        /// <returns></returns>
        [WebMethod]
        public static Folder Folder_GetModel(Folder folder)
        {
            if (!IES.Service.UserService.OC_IsRole(folder.OCID))
            {
                return null;
            }

            return new FileBLL().Folder_GetModel(folder);
        }

        /// <summary>
        /// 文件夹移动
        /// </summary>
        /// <param name="folder"></param>
        /// <returns></returns>
        [WebMethod]
        public static bool Folder_ParentID_Upd(Folder folder)
        {
            if (!IES.Service.UserService.OC_IsRole(folder.OCID))
            {
                return false;
            }

            return new FileBLL().Folder_ParentID_Upd(folder);
        }

        /// <summary>
        /// 删除文件夹
        /// </summary>
        /// <param name="folder"></param>
        /// <returns></returns>
        [WebMethod]
        public static bool Folder_Del(Folder folder)
        {
            if (!IES.Service.UserService.OC_IsRole(folder.OCID))
            {
                return false;
            }

            return new FileBLL().Folder_Del(folder);
        }

        [WebMethod]
        public static bool File_Batch_Del(string fileIDS)
        {
            return new FileBLL().File_Batch_Del(fileIDS);
        }

        [WebMethod]
        public static bool Folder_Batch_Del(string folderIDS)
        {
            return new FileBLL().Folder_Batch_Del(folderIDS);
        }
        #endregion

        #region 附件
        [WebMethod]
        public static bool Attachment_Del(Attachment model)
        {
            return AttachmentBLL.Attachment_Del(model);
        }

        #endregion
    }
}
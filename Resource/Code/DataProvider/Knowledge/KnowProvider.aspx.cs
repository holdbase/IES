/* **************************************************************
 * Copyright(c) 2015 IES, All Rights Reserved.   
 * File             : KnowProvider.aspx.cs
 * Description      : 知识点数据访问
 * Author           : zhaotianyu
 * Created          : 2015-01-17  
 * Revision History : 
******************************************************************/
namespace App.Resource.DataProvider.Knowledge
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Web;
    using System.Web.Services;
    using System.Web.UI;
    using System.Web.UI.WebControls;
    using IES.Resource.Model;
    using IES.G2S.Resource.BLL;
    public partial class KnowProvider : System.Web.UI.Page
    {

        [WebMethod]
        public static IList<Ken> Ken_List(Ken model)
        {
            return new KenBLL().Ken_List(model);
        }

        [WebMethod]
        public static Ken Ken_ADD(Ken model)
        {
            model.CreateUserID = IES.Service.UserService.CurrentUser.UserID; 
            return new KenBLL().Ken_ADD(model);
        }

        [WebMethod]
        public static bool Ken_Upd(Ken model)
        {
            model.CreateUserID = IES.Service.UserService.CurrentUser.UserID;
            return new KenBLL().Ken_Upd(model);
        }

        [WebMethod]
        public static bool Ken_Del(Ken model)
        {
            model.CreateUserID = IES.Service.UserService.CurrentUser.UserID;  
            return new KenBLL().Ken_Del(model);
        }

        [WebMethod]
        public static IList<Ken> Ken_FileFilter_ChapterID_List(Chapter chapter)
        {
            return new KenBLL().Ken_FileFilter_ChapterID_List(chapter);
        }

        [WebMethod]
        public static IList<Ken> Ken_ExerciseFilter_ChapterID_List(Chapter chapter)
        {
            return new KenBLL().Ken_ExerciseFilter_ChapterID_List(chapter);
        }

        [WebMethod]
        public static IList<Exercise> Exercise_KenID_ChapterID_List(Chapter chapter, Ken ken)
        {
            return new KenBLL().Exercise_KenID_ChapterID_List(chapter, ken);
        }

        [WebMethod]
        public static List<File> File_KenID_ChapterID_List(Chapter chapter, Ken ken)
        {
            return new KenBLL().File_KenID_ChapterID_List(chapter, ken);
        }

        [WebMethod]
        public static IList<Chapter> Chapter_KenID_List(Ken model)
        {
            return new KenBLL().Chapter_KenID_List(model.KenID, model.OCID);
        }

        //[WebMethod]
        //public static List<IES.Resource.Model.File> Ken_File_List(int chapterId, int kenId, int ocid)
        //{
        //    Chapter chapter = new Chapter();
        //    chapter.ChapterID = chapterId;
        //    chapter.CreateUserID = IES.Service.UserService.CurrentUser.UserID;
        //    Ken ken = new Ken() { KenID = kenId, OCID = ocid };
        //    return new KenBLL().Ken_File_List(chapter, ken);
        //}

        //[WebMethod]
        //public static IList<Exercise> Ken_Exercise_List(int chapterId, int kenId, int ocid)
        //{
        //    Chapter chapter = new Chapter();
        //    chapter.ChapterID = chapterId;
        //    chapter.CreateUserID = IES.Service.UserService.CurrentUser.UserID;
        //    Ken ken = new Ken() { KenID = kenId, OCID = ocid };
        //    return new KenBLL().Ken_Exercise_List(chapter, ken);
        //}

    }
}
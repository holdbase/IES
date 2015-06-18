/* **************************************************************
 * Copyright(c) 2014 IES, All Rights Reserved.   
 * File             : AssistProvider.aspx.cs
 * Description      : 辅助数据访问
 * Author           : zhaotianyu
 * Created          : 2015-01-17  
 * Revision History : 
******************************************************************/ 
namespace App.Resource.DataProvider.Shared
{
    using IES.Common.Data;
    using IES.G2S.Resource.BLL;
    using IES.Resource.Model;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Web;
    using System.Web.Services;
    using System.Web.UI;
    using System.Web.UI.WebControls;
    public partial class AssistProvider : System.Web.UI.Page
    {
        [WebMethod]
        public static IList<ResourceDict> Resource_Dict_Requirement_Get()
        {
            return ResourceCommonData.Resource_Dict_Requirement_Get();
        }

        [WebMethod]
        public static IList<ResourceDict> Resource_Dict_Diffcult_Get()
        {
            return ResourceCommonData.Resource_Dict_Diffcult_Get();
        }

        [WebMethod]
        public static IList<ResourceDict> Resource_Dict_ExerciseType_Get()
        {
            return ResourceCommonData.Resource_Dict_ExerciseType_Get();
        }

        [WebMethod]
        public static IList<ResourceDict> Resource_Dict_Scope_Get()
        {
            return ResourceCommonData.Resource_Dict_Scope_Get();
        }

        [WebMethod]
        public static IList<ResourceDict> Resource_Dict_ShareRange_Get()
        {
            return ResourceCommonData.Resource_Dict_ShareRange_Get();
        }

        [WebMethod]
        public static List<Key> Key_List(Key model)
        {
            return new KeyBLL().Key_List(model);
        }

        [WebMethod]
        public static List<Key> Resource_Key_List(int ocid, string searchKey, string source, int topNum)
        {
            var user = IES.Service.UserService.CurrentUser;
            return new KeyBLL().Resource_Key_List(ocid, searchKey, source, user.UserID, topNum);
        }
    }
}
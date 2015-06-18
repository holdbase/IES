/* **************************************************************
* Copyright(c) 2014 IES, All Rights Reserved.   
* File             : ContentProvider.aspx.cs
* Description      : 试卷数据访问
* Author           : zhaotianyu 
* Created          : 2015-01-11  
* Revision History : 
******************************************************************/
namespace App.Resource.DataProvider.Shared
{
    using IES.CC.OC.Model;
    using IES.G2S.Resource.BLL;
    using IES.Resource.Model;
    using IES.Service;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Web;
    using System.Web.Services;
    using System.Web.UI;
    using System.Web.UI.WebControls;

    public partial class ContentProvider : System.Web.UI.Page
    {
        [WebMethod]
        public static IList<OC> User_OC_List()
        {
            var user = UserService.CurrentUser;
            return UserService.User_OC_List(user);
        }

        [WebMethod]
        public static OC OC_Get()
        {
            return new OC();
        } 
    }
}
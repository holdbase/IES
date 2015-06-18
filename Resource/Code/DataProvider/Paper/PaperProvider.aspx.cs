/* **************************************************************
 * Copyright(c) 2014 IES, All Rights Reserved.   
 * File             : PaperProvider.aspx.cs
 * Description      : 试卷数据访问
 * Author           : fenglujian
 * Created          : 2014-12-29  
 * Revision History : 
******************************************************************/
namespace App.Resource.DataProvider.Paper
{
    using IES.CC.OC.Model;
    using IES.Common.Data;
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
    public partial class PaperProvider : System.Web.UI.Page
    {
        [WebMethod]
        public static IList<ResourceDict> GetPaperTypes()
        {
            IList<ResourceDict> dicts = ResourceCommonData.Resource_Dict_PaperType_Get();
            return dicts;
        }

        [WebMethod]
        public static IList<ResourceDict> GetShareRanges()
        {
            IList<ResourceDict> dicts = ResourceCommonData.Resource_Dict_ShareRange_Get();
            return dicts;
        }

        [WebMethod]
        public static List<Paper> Paper_Search(Paper paper, int pageSize, int pageIndex)
        {
            return new PaperBLL().Paper_Search(paper, pageSize, pageIndex);
        }

        [WebMethod]
        public static IPaper Paper_Get()
        {
            Paper model = new Paper();
            return new PaperBLL().Paper_Get(model);
        } 
        
    }
}
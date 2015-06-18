using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace App.G2S.DataProvider
{
    public partial class UploadFile : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        /// <summary>
        /// 文件关联论坛
        /// </summary>
        /// <param name="?"></param>
        /// <param name="list"></param>
        /// <returns></returns>
        [WebMethod]
        public static bool File_Upload(int source_id, string sourceName, List<IES.Resource.Model.Attachment> list)
        {
            bool flag = false;
            for (int i = 0; i < list.Count; i++)
            {
                string guid = list[i].Guid;
                int sourceid = source_id;
                string source = sourceName;
                IES.Resource.Model.Attachment atmt = new IES.Resource.Model.Attachment { Guid = guid, Source = source, SourceID = sourceid };
                flag = IES.Service.FileService.AttachmentRelation(atmt);
            }
            return flag;
        }
    }
}
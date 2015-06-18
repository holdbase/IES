using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace App.Resource.Redir
{
    public partial class Filedown : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            //string fid = Request.QueryString["fid"];
            //if (!string.IsNullOrEmpty(fid))
            //{
            //    IES.G2S.Resource.BLL.FileBLL filebll = new IES.G2S.Resource.BLL.FileBLL();
            //    IES.Resource.Model.IFile file = filebll.File_Simple_Get(fid);
            //    Response.Redirect(IES.Service.FileService.FileDownURL(file));
            //}

            //string aid = Request.QueryString["aid"];
            //if (!string.IsNullOrEmpty(aid))
            //{
            //    IES.G2S.Resource.BLL.AttachmentBLL abll = new IES.G2S.Resource.BLL.AttachmentBLL();
            //    IES.Resource.Model.IFile file = abll.Attachment_Get(aid);
            //    Response.Redirect(IES.Service.FileService.FileDownURL(file));
            //}
        }
    }
}
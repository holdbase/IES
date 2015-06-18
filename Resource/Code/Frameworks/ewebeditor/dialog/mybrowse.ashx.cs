using IES.Cache;
using IES.Resource.Model;
using IES.Service;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.Web.SessionState;

namespace App.G2S.Frameworks.ewebeditor.dialog
{
    /// <summary>
    /// mybrowse 的摘要说明
    /// </summary>
    public class mybrowse : IHttpHandler, IRequiresSessionState
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            context.Response.AddHeader("Cache-Control", "no-cache,must-revalidate");
            string action = context.Request.Params["action"];

            if (!string.IsNullOrEmpty(action)) this.GetType().GetMethod(action).Invoke(this, new object[] { context });
            context.Response.End();
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }

        //获取资料
        public void File_Search(HttpContext context) {
            string Searchkey = context.Request.Params["Searchkey"];
            int OCID = Convert.ToInt32(context.Request.Params["OCID"]);
            int CourseID = Convert.ToInt32(context.Request.Params["CourseID"]);
            int FolderID = Convert.ToInt32(context.Request.Params["FolderID"]);
            int FileType = Convert.ToInt32(context.Request.Params["FileType"]);
            int ShareRange=-1;
            int UserID = UserService.CurrentUser.UserID;
            int OwnerUserID = 1;
            int PageSize = 999999;
            int PageIndex = 1;
            File file = new File();
            file.Keys = Searchkey;
            file.OCID = OCID;
            file.CourseID = CourseID;
            file.FolderID = FolderID;
            file.FileType = FileType;
            file.ShareRange = -1;
            file.CreateUserID = UserID;
            file.UploadTime = DateTime.Now.AddMonths(-1000);
            IES.G2S.Resource.BLL.FileBLL filebll = new IES.G2S.Resource.BLL.FileBLL();
            //List<File> filelist = filebll.File_Search(file, PageSize, PageIndex);
            DataTable dt = IES.Common.ListToDateUtil.ListToDataTable<File>(filebll.File_Search(file, PageSize, PageIndex));
            if (dt != null && dt.Rows.Count > 0)
            {
                context.Response.Write(Tools.JsonConvert.GetJSON(dt));
            }
            else
            {
                context.Response.Write("False");
            }
        }

        //根据用户获取网站
        public void Get_Site(HttpContext context) {
            IES.G2S.OC.BLL.OC.OCBLL ocbll = new IES.G2S.OC.BLL.OC.OCBLL();
            IES.JW.Model.User user = IES.Service.UserService.CurrentUser;
            WebCache.SetExpire(user.UserID.ToString(), "_" + user.Role.ToString() + "OC_List");
            DataTable dt = IES.Common.ListToDateUtil.ListToDataTable<IES.CC.OC.Model.OC>(ocbll.OC_List(user.UserID, user.Role));
            if (dt != null && dt.Rows.Count > 0)
            {
                context.Response.Write(Tools.JsonConvert.GetJSON(dt));
            }
            else
            {
                context.Response.Write("False");
            }
        }

        //获取化学编辑器的图片
        public void GetChemistry(HttpContext context)
        {
            string smiles = context.Request.Params["smiles"];
            string trueURL1 = "http://depict.emolecules.com/cgi-bin/mymol/depict.cgi?" +
            "smiles=" + smiles + "&width=150&height=150&colorscheme=cow&format=png&submit=image";
            string httpstr = GetHttpData(trueURL1);
            context.Response.Write(httpstr);


        }



        public string GetHttpData(string Url)
        {
            string sException = null;
            string sRslt = null;
            System.Net.WebResponse oWebRps = null;
            System.Net.WebRequest oWebRqst = System.Net.WebRequest.Create(Url);
            oWebRqst.Timeout = 50000;
            try
            {
                oWebRps = oWebRqst.GetResponse();
            }
            catch (System.Net.WebException e)
            {
                sException = e.Message.ToString();
                // EYResponse.Write(sException);
            }
            catch (Exception e)
            {
                sException = e.ToString();
                // EYResponse.Write(sException);
            }
            finally
            {
                if (oWebRps != null)
                {
                    System.IO.StreamReader oStreamRd = new System.IO.StreamReader(oWebRps.GetResponseStream(), System.Text.Encoding.GetEncoding("UTF-8"));
                    sRslt = oStreamRd.ReadToEnd();
                    oStreamRd.Close();
                    oWebRps.Close();
                }
            }
            return sRslt;
        }

    }
}
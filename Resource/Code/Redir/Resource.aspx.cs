using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace App.Resource.Redir
{
    public partial class Resource : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

            string rt = Request.QueryString["rt"];
            if (string.IsNullOrEmpty(rt))
            {
                Response.Redirect( IES.Service.Common.ConfigService.ResourceURL+ "#/content/resource");
                return;
            }
            if (rt == "p")
            {
                Response.Redirect( IES.Service.Common.ConfigService.G2SURL+"Resource/Paper/Index");
            }

        }
    }
}
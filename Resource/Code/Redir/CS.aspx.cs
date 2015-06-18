using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace App.Resource.Redir
{
    public partial class CS : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            Response.Redirect(IES.Service.Common.ConfigService.G2SURL + "Home/StudentIndex?leftmenu=C11&topmenu=C1");
        }
    }
}
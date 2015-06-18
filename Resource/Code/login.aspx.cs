using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Security;

using IES.Security;
using IES.Cache;

namespace Test
{
    public partial class login : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!Page.IsPostBack)
            {
                //string userid = IESCookie.GetCookieValue("ies");

                //if (userid != string.Empty )
                //{
                //    if (Request.QueryString["ReturnUrl"] != null)
                //    {
                //        string ReturnUrl = Request.QueryString["ReturnUrl"];
                //        Response.Redirect(ReturnUrl);
                //    }
                //}

            }
        }

        protected void Button1_Click(object sender, EventArgs e)
        {

            IES.JW.Model.User user = new IES.JW.Model.User { LoginName = tbuser.Text, Pwd = tbpassword.Text };
            
            if( IES.Service.UserService.Login(user))
            { 
                //if(  Request.QueryString["ReturnUrl"] != null  )
                //{
                //    string ReturnUrl = Request.QueryString["ReturnUrl"];
                //    Response.Redirect(ReturnUrl);
                //}
                //else
                //    Response.Redirect("~");
            }

        
        }
    }
}
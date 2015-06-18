using IES.CC.OC.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace App.Resource.DataProvider.Authority
{
    public partial class AuthProvider : System.Web.UI.Page
    {

        /// <summary>
        /// 加载用户权限
        /// </summary>
        [WebMethod]
        public static IList<OCTeam> LoadUserAuths()
        {
            IList<OCTeam> allOCTeamRoles = IES.Service.UserService.OC_ALLRole_Get();
            if (allOCTeamRoles == null)
            {
                allOCTeamRoles = new List<OCTeam>(); 
            }
            ///个人资料
            allOCTeamRoles.Add(new OCTeam() { UserID = IES.Service.UserService.CurrentUser.UserID, OCID = 0, Role = 1 }); 
            return allOCTeamRoles;
        } 

        /// <summary>
        /// 加载用户
        /// </summary>
        [WebMethod]
        public static IES.JW.Model.User LoadCurrentUser()
        {
            return IES.Service.UserService.CurrentUser;
        }
    }
}
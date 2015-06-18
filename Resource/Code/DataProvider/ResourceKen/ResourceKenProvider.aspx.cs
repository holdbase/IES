using IES.G2S.Resource.BLL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace App.Resource.DataProvider.ResourceKen
{
    public partial class ResourceKenProvider : System.Web.UI.Page
    {
        [WebMethod]
        public static IES.Resource.Model.ResourceKen ResourceKen_ADD(IES.Resource.Model.ResourceKen model)
        {
            return new ResourceKenBLL().ResourceKen_ADD(model);
        }
        [WebMethod]
        public static IList<IES.Resource.Model.ResourceKen> ResourceKen_List_Source(int ocid, string source)
        {
            if (!IES.Service.UserService.OC_IsRole(ocid))
            {
                return null;
            }


            IList <IES.Resource.Model.ResourceKen> kens = new ResourceKenBLL().ResourceKen_List_Source(ocid, source);
            return kens;
        }

        [WebMethod]
        public static IList<IES.Resource.Model.Ken> ResourceKen_List(int ocid, string searchKey, string source, int topNum)
        {
            if (!IES.Service.UserService.OC_IsRole(ocid))
            {
                return null;
            }

            var user = IES.Service.UserService.CurrentUser;
            return new ResourceKenBLL().ResourceKen_List(ocid, searchKey, source, user.UserID, topNum);
        }

        [WebMethod]
        public static bool ResourceKen_Del(IES.Resource.Model.ResourceKen model)
        {
            return new ResourceKenBLL().ResourceKen_Del(model);
        }
    }
}
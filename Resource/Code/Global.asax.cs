// --------------------------------------------------------------------------------------------------------------------
// <copyright file="Global.asax.cs" company="">
//   Copyright ?2014 
// </copyright>
// --------------------------------------------------------------------------------------------------------------------

namespace App.Resource
{
    using System.Web;
    using System.Web.Optimization;
    using System.Web.Routing;
    using IES.JW.Model;

    public class Application : HttpApplication
    {
        protected void Application_Start()
        {
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            IES.Service.AuService.AuLoad(); //用户授权信息加载
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;
using System.Net;
namespace App.Resource
{
    /// <summary>
    /// Logout 的摘要说明
    /// </summary>
    public class Logout : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            LogLogin_Add();
            context.Response.Cookies.Remove("ies");
            context.Response.Cookies["ies"].Expires = DateTime.Now.AddDays(-1);
            context.Response.Redirect(ConfigurationManager.AppSettings["TokenURL"] + "login.aspx");
        }
        /// <summary>
        /// 注销日志
        /// </summary>
        public void LogLogin_Add()
        {
            string ip = GetClientIPv4Address();
            int UserID = 0;
            try { UserID = IES.Service.UserService.CurrentUser.UserID; }
            catch { UserID = 0; }
            if (UserID != null && UserID > 0)
            {
                IES.JW.Model.LogLogin model = new IES.JW.Model.LogLogin { UserID = UserID, Type = 2, IP = ip };
                bool rs = new IES.G2S.JW.BLL.LogBLL().LogLogin_Add(model);
            }
        }
        public static string GetClientIPv4Address()
        {
            string ipv4 = String.Empty;

            foreach (IPAddress ip in Dns.GetHostAddresses(GetClientIP()))
            {
                if (ip.AddressFamily.ToString() == "InterNetwork")
                {
                    ipv4 = ip.ToString();
                    break;
                }
            }

            if (ipv4 != String.Empty)
            {
                return ipv4;
            }
            // 利用 Dns.GetHostEntry 方法，由获取的 IPv6 位址反查 DNS 纪录，
            // 再逐一判断何者为 IPv4 协议，即可转为 IPv4 位址。
            foreach (IPAddress ip in Dns.GetHostEntry(GetClientIP()).AddressList)
            //foreach (IPAddress ip in Dns.GetHostAddresses(Dns.GetHostName()))
            {
                if (ip.AddressFamily.ToString() == "InterNetwork")
                {
                    ipv4 = ip.ToString();
                    break;
                }
            }

            return ipv4;
        }
        public static string GetClientIP()
        {
            if (null == HttpContext.Current.Request.ServerVariables["HTTP_VIA"])
            {
                return HttpContext.Current.Request.ServerVariables["REMOTE_ADDR"];
            }
            else
            {
                return HttpContext.Current.Request.ServerVariables["HTTP_X_FORWARDED_FOR"];
            }
        }
        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}
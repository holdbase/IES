// --------------------------------------------------------------------------------------------------------------------
// <copyright file="BundleConfig.cs" company="">
//   Copyright ?2014 
// </copyright>
// --------------------------------------------------------------------------------------------------------------------

namespace App.Resource
{
    using System.Web;
    using System.Web.Optimization;

    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {

            bundles.Add(new StyleBundle("~/content/css/app").Include(
                "~/Frameworks/bootstrap/css/bootstrap.min.css",
                //"~/Frameworks/bootstrap/css/bootstrap.css",
                //"~/Frameworks/bootstrap/css/bootstrap-theme.min.css",
                "~/Frameworks/angularTree/angular-ui-tree.min.css",
                "~/Css/app.css",
                "~/Css/common.css",
                "~/Css/footer.css",
                "~/Css/resource.css",
                "~/Css/header.css",
                "~/Css/side_left.css"));

            bundles.Add(new ScriptBundle("~/js/framework").Include(
                "~/Frameworks/jquery/jquery-1.11.1.min.js",
                "~/Frameworks/bootstrap/js/bootstrap.min.js",
                "~/Frameworks/ewebeditor/ewebeditor.js",
                "~/Frameworks/angular/angular.js",
                "~/Frameworks/angular/angular-cookies.js",
                "~/Frameworks/angular/angular-sanitize.min.js",
                "~/Frameworks/angularTree/angular-ui-tree.min.js",
                "~/Frameworks/checklist-model/checklist-model.js",
                "~/Frameworks/angular/angular-ui-router.js",
                "~/Frameworks/laypage/laypage.js",
                "~/Frameworks/angular/angular-file-upload.js"
                ));
          
            bundles.Add(new ScriptBundle("~/js/app").Include(
                "~/scripts/Common/tools.js",
                "~/scripts/Common/assistant.js",
                "~/scripts/Common/filters.js",
                "~/scripts/Common/directives.js",
                "~/scripts/Common/services.js",

               // "~/Components/js/components.js",

                "~/scripts/Home/HomeControllers.js", 
                "~/scripts/Authority/AuthService.js", 
                "~/scripts/Shared/ContentControllers.js",
                "~/scripts/Shared/ContentService.js",
                "~/scripts/Shared/AssistService.js",
                "~/scripts/Exercise/ExerciseService.js",
                "~/scripts/Exercise/ExerciseControllers.js", 
                "~/scripts/Resource/ResourceService.js",
                "~/scripts/Resource/ResourceControllers.js", 
                "~/scripts/ResourceKen/ResourceKenService.js", 
                "~/scripts/Chapter/ChapterService.js",
                "~/scripts/Ken/KenService.js",
                "~/scripts/Ken/KenControllers.js", 
                "~/scripts/Paper/PaperService.js",
                "~/scripts/Paper/PaperControllers.js", 
                "~/scripts/User/UserService.js", 
                "~/scripts/User/UserControllers.js",
                "~/scripts/CourseLive/Forum/ForumController.js",
                "~/scripts/app.js"));
        }
    }
}

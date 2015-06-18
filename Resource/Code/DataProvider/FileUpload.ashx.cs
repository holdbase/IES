using IES.Common;
using IES.G2S.Resource.BLL;
using IES.Resource.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Web;

namespace App.G2S.DataProvider
{
    /// <summary>
    /// FileUpload 的摘要说明
    /// 公用上传文件处理程序
    /// </summary>
    public class FileUpload : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/plain";
            context.Response.AddHeader("Cache-Control", "no-cache,must-revalidate");

            //FROM 1 资料  2 附件
            var from = context.Request.QueryString["FROM"];
            if (from.Equals("2"))
            {
                ///习题附件
                List<IES.Resource.Model.Attachment> attachMentList = IES.Service.FileService.AttachmentUpload();
                context.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(attachMentList));
            }
            else if (from.Equals("3"))
            {
                try
                {
                    ///习题验证 
                    ///读取Excel文件内容
                    HttpFileCollection files = HttpContext.Current.Request.Files;
                    HttpPostedFile postFile = files[0];
                    string filehead = Guid.NewGuid().ToString().Replace("-", "");
                    string Ext = Path.GetExtension(postFile.FileName);
                    string newFileName = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Temp", filehead + Ext);
                    postFile.SaveAs(newFileName);
                    System.Data.DataTable table = NPOIHandler.ExcelToDataTable(newFileName, "Sheet1", true);

                    DataTable resultTable = ImportCheck(table, int.Parse(context.Request.Form["Category"]));

                    var obj = new { fileName = filehead + Ext, data = resultTable };
                    context.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(obj));
                }
                catch (Exception ex)
                {
                    DataTable resultTable = BuildResultTable();
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "导入文件格式错误！";
                    newRow["Status"] = "-2";
                    newRow["RowNumber"] = 1;
                    resultTable.Rows.Add(newRow);
                    var obj = new { fileName = "", data = resultTable };
                    context.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(obj));
                }

            }
            else if (from.Equals("4"))
            {
                ///习题导入
                string serverFileName = context.Request.QueryString["fileName"];
                int ocid = int.Parse(context.Request.QueryString["OCID"]);
                int courseId = int.Parse(context.Request.QueryString["CourseID"]);
                int category = int.Parse(context.Request.QueryString["Category"]);
                if (string.IsNullOrEmpty(serverFileName))
                {
                    context.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(new { status = -2 })); ;
                    return;
                }

                string newFileName = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Temp", serverFileName);
                System.Data.DataTable table = NPOIHandler.ExcelToDataTable(newFileName, "Sheet1", true);

                ///导入数据至数据库
                DataTable resultTable = ExerciseInfo_Import(table, ocid, courseId, category);
                context.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(new { status = 1, data = resultTable })); ;
            }
            else
            {
                ///资料库文件导入
                IES.Resource.Model.File fileModel = new IES.Resource.Model.File();
                fileModel.OCID = int.Parse(context.Request.Form["OCID"]);
                fileModel.CourseID = int.Parse(context.Request.Form["CourseID"]);
                fileModel.FolderID = int.Parse(context.Request.Form["FolderID"] == "undefined" ? "0" : context.Request.Form["FolderID"]);
                fileModel.ShareRange = int.Parse(context.Request.Form["ShareRange"]);
                List<IES.Resource.Model.File> fileList = IES.Service.FileService.ResourceFileUpload(fileModel);
                context.Response.Write(Newtonsoft.Json.JsonConvert.SerializeObject(fileList));
            }
            context.Response.End();
        }


        #region 习题导入

        private static DataTable ImportCheck(DataTable table, int exerciseType)
        {
            try
            {
                DataTable resultTable = BuildResultTable();
                table.Columns.Add("ErrMsg", typeof(String));
                switch (exerciseType)
                {
                    case 7: //排序题
                    case 8: //分析题
                    case 9: //计算题
                    case 14: //阅读理解题
                    case 18: //简答题
                    case 12: //听力题
                    case 17: //自定义题
                    case 6:  //连线题
                        break;
                    case 10: //问答题
                    case 11: //翻译题
                    case 4: //名词解释
                    case 13: //写作题 
                        CheckWenDa(table, resultTable);
                        break;
                    case 1: //判断题
                        CheckPanDuan(table, resultTable);
                        break;
                    case 5: //填空题
                        CheckTianKong(table, resultTable);
                        break;
                    case 2: //单选题
                        CheckDanXuan(table, resultTable);
                        break;
                    case 3: //多选题
                        CheckDuoXuan(table, resultTable);
                        break;
                    default:
                        break;
                }
                return resultTable;
            }
            catch (Exception)
            {
                DataTable resultTable = BuildResultTable();
                DataRow newRow = resultTable.NewRow();
                newRow["Message"] = "格式错误不能导入！";
                newRow["Status"] = "-2";
                newRow["RowNumber"] = 1;
                resultTable.Rows.Add(newRow);
                return resultTable;
            }
        }
        private static void CheckWenDa(DataTable table, DataTable resultTable)
        {
            ///习题内容不能为空
            ///答案不能为空
            int index = 0;
            foreach (DataRow dr in table.Rows)
            {
                index++;
                if (string.IsNullOrEmpty(dr["习题内容"].ToString()))
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "习题内容不能为空！";
                    newRow["Status"] = "-1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                    continue;
                }
                if (string.IsNullOrEmpty(dr["答案"].ToString()))
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "答案不能为空！";
                    newRow["Status"] = "-1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                }
                else
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "格式正确！";
                    newRow["Status"] = "1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                }
            }
        }

        private static void CheckPanDuan(DataTable table, DataTable resultTable)
        {
            ///习题内容不能为空
            ///正确答案不能为空
            int index = 0;
            foreach (DataRow dr in table.Rows)
            {
                index++;
                if (string.IsNullOrEmpty(dr["习题内容"].ToString()))
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "习题内容不能为空！";
                    newRow["Status"] = "-1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                    continue;
                }
                if (string.IsNullOrEmpty(dr["答案"].ToString()))
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "答案不能为空！";
                    newRow["Status"] = "-1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                }
                else
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "格式正确！";
                    newRow["Status"] = "1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                }
            }
        }

        private static void CheckTianKong(DataTable table, DataTable resultTable)
        { 
            ///习题内容不能为空
            //至少有一个答案
            int index = 0;
            foreach (DataRow dr in table.Rows)
            {
                index++;
                if (string.IsNullOrEmpty(dr["习题内容"].ToString()))
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "习题内容不能为空！";
                    newRow["Status"] = "-1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                    continue;
                }
                if (string.IsNullOrEmpty(dr["答案1"].ToString()) &&
                     string.IsNullOrEmpty(dr["答案2"].ToString()) &&
                     string.IsNullOrEmpty(dr["答案3"].ToString()) &&
                     string.IsNullOrEmpty(dr["答案4"].ToString()) &&
                     string.IsNullOrEmpty(dr["答案5"].ToString()) &&
                     string.IsNullOrEmpty(dr["答案6"].ToString())
                    )
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "答案不能全部为空！";
                    newRow["Status"] = "-1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                }
                else
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "格式正确！";
                    newRow["Status"] = "1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                }
            }
        }

        private static void CheckDanXuan(DataTable table, DataTable resultTable)
        {
            ///习题内容不能为空
            ///选项1 选项2 不能为空
            ///正确答案不能为空， 单选题只能是一个答案。
            ///答案范围不能超出选项
            int index = 0;
            foreach (DataRow dr in table.Rows)
            {
                index++;
                if (string.IsNullOrEmpty(dr["习题内容"].ToString()))
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "习题内容不能为空！";
                    newRow["Status"] = "-1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                    continue;
                }
                if (string.IsNullOrEmpty(dr["选项1"].ToString()) ||
                     string.IsNullOrEmpty(dr["选项2"].ToString())
                    )
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "选项1、选项2不能为空！";
                    newRow["Status"] = "-1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                    continue;
                }
                if (string.IsNullOrEmpty(dr["正确答案"].ToString()) ||
                 dr["正确答案"].ToString().Trim().Length > 1
                 )
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "正确答案不能为空且只能有一个答案！";
                    newRow["Status"] = "-1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                    continue;
                }
                int value = -1;
                if (!int.TryParse(dr["正确答案"].ToString(), out value))
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "正确答案必须为数字！";
                    newRow["Status"] = "-1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                    continue;
                }
                var maxOptionIndex = 0;
                var maxOptionCount = 8;
                var optionName = "选项";
                for (int i = 1; i <= maxOptionCount; i++)
                {
                    string fieldName = optionName + i.ToString();
                    if (!string.IsNullOrEmpty(dr[fieldName].ToString()))
                    {
                        maxOptionIndex = i;
                    }
                }
                if (int.Parse(dr["正确答案"].ToString()) > maxOptionIndex)
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "答案范围不能超出选项！";
                    newRow["Status"] = "-1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                }
                else
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "格式正确！";
                    newRow["Status"] = "1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                }
            }
        }

        private static void CheckDuoXuan(DataTable table, DataTable resultTable)
        {
            ///习题内容不能为空
            ///选项1 选项2 不能为空
            ///正确答案不能为空， 多选题有>=1个答案。
            ///答案范围不能超出选项 
            int index = 0;
            foreach (DataRow dr in table.Rows)
            {
                index++;
                if (string.IsNullOrEmpty(dr["习题内容"].ToString()))
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "习题内容不能为空！";
                    newRow["Status"] = "-1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                    continue;
                }
                if (string.IsNullOrEmpty(dr["选项1"].ToString()) ||
                     string.IsNullOrEmpty(dr["选项2"].ToString())
                    )
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "选项1、选项2不能为空！";
                    newRow["Status"] = "-1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                    continue;
                }
                if (string.IsNullOrEmpty(dr["正确答案"].ToString()))
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "正确答案不能为空！";
                    newRow["Status"] = "-1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                    continue;
                }
                int value = -1;
                if (!int.TryParse(dr["正确答案"].ToString(), out value))
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "正确答案必须为数字！";
                    newRow["Status"] = "-1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                    continue;
                }
                var maxOptionCount = 8;
                var maxOptionIndex = 0;
                var optionName = "选项";
                for (int i = 1; i <= maxOptionCount; i++)
                {
                    string fieldName = optionName + i.ToString();
                    if (!string.IsNullOrEmpty(dr[fieldName].ToString())){
                        maxOptionIndex = i;
                    }
                }
                bool isRight = true;
                var rightAnswer = dr["正确答案"].ToString();
                for (int i = 0; i < rightAnswer.Length; i++)
                {
                    if (int.Parse(rightAnswer.Substring(i, 1)) > maxOptionIndex)
                    {
                        DataRow newRow = resultTable.NewRow();
                        newRow["Message"] = "答案范围不能超出选项！";
                        newRow["Status"] = "-1";
                        newRow["RowNumber"] = index;
                        resultTable.Rows.Add(newRow);
                        isRight = false;
                        break;
                    }
                }

                if (isRight)
                {
                    DataRow newRow = resultTable.NewRow();
                    newRow["Message"] = "格式正确！";
                    newRow["Status"] = "1";
                    newRow["RowNumber"] = index;
                    resultTable.Rows.Add(newRow);
                }
            }
        }


        ///难易程序如果为空则为1
        ///适用范围如果为空则为1
        private static void ExerciseSetDefault(DataTable table)
        {
            foreach (DataRow dr in table.Rows)
            {
                if (string.IsNullOrEmpty(dr["难易程度"].ToString()))
                {
                    dr["难易程度"] = 1;
                }

                if (string.IsNullOrEmpty(dr["适用范围"].ToString()))
                {
                    dr["适用范围"] = 1;
                }
            }
        }



        /// <summary>
        /// 习题导入
        /// </summary>
        /// <param name="dt">要导入的数据</param>
        /// <param name="exerciseType">习题类型</param>
        /// <returns>true成功，false失败</returns>
        private static DataTable ExerciseInfo_Import(DataTable dt, int ocid, int courseId, int exerciseType)
        {
            if (dt.Rows.Count == 0) return null;
            ExerciseSetDefault(dt);
            switch (exerciseType)
            {
                case 7: //排序题
                case 8: //分析题
                case 9: //计算题
                case 14: //阅读理解题
                case 18: //简答题
                case 12: //听力题
                case 17: //自定义题
                case 6:  //连线题
                    break;
                case 10: //问答题
                case 11: //翻译题
                case 4: //名词解释
                case 13: //写作题
                    return ExerciseImportA(dt, ocid, courseId, exerciseType);
                case 1: //判断题
                    return ExerciseImportB(dt, ocid, courseId, exerciseType);
                case 5: //填空题
                    return ExerciseImportC(dt, ocid, courseId, exerciseType);
                case 2: //单选题
                case 3: //多选题
                    return ExerciseImportD(dt, ocid, courseId, exerciseType);
                default:
                    break;
            }
            return null;
        }

        /// <summary>
        /// 构造习题导入结果集
        /// </summary>
        /// <returns></returns>
        private static DataTable BuildResultTable()
        {
            DataTable resultDt = new DataTable();
            resultDt.Columns.Add("RowNumber");
            resultDt.Columns.Add("Message");
            resultDt.Columns.Add("Status");
            return resultDt;
        }

        private static string GetExerciseTypeName(int exerciseType)
        {
            switch (exerciseType)
            {
                case 7: //排序题
                    return "排序题";
                case 8: //分析题
                    return "分析题";
                case 9: //计算题
                    return "计算题";
                case 14: //阅读理解题
                    return "阅读理解题";
                case 18: //简答题
                    return "简答题";
                case 12: //听力题
                    return "听力题";
                case 17: //自定义题
                    return "自定义题";
                case 6:  //连线题
                    return "连线题";
                case 10: //问答题
                    return "问答题";
                case 11: //翻译题
                    return "翻译题";
                case 4: //名词解释
                    return "名词解释";
                case 13: //写作题
                    return "写作题";
                case 1: //判断题
                    return "判断题";
                case 5: //填空题
                    return "填空题";
                case 2: //单选题
                    return "单选题";
                case 3: //多选题
                    return "多选题";
                default:
                    return "";
            }
        }
        private static DataTable ExerciseImportA(DataTable dt, int ocid, int courseId, int exerciseType)
        {
            DataTable resultTable = BuildResultTable();
            ExerciseInfo exercise;
            if (dt.Rows.Count == 0) return resultTable;
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                var newRow = resultTable.NewRow();
                resultTable.Rows.Add(newRow);
                try
                {
                    exercise = ExerciseBind(dt.Rows[i]);
                    exercise.exercisecommon.exercise.OCID = ocid;
                    exercise.exercisecommon.exercise.CourseID = courseId;
                    exercise.exercisecommon.exercise.Conten = dt.Rows[i]["习题内容"].ToString();
                    exercise.exercisecommon.exercise.Analysis = dt.Rows[i]["习题解析"].ToString();
                    exercise.exercisecommon.exercise.Answer = dt.Rows[i]["答案"].ToString();
                    exercise.exercisecommon.exercise.ExerciseType = exerciseType;
                    exercise.exercisecommon.exercise.ExerciseTypeName = GetExerciseTypeName(exerciseType);

                    Exercise_Writing_M_Edit(Newtonsoft.Json.JsonConvert.SerializeObject(exercise));
                    newRow["Message"] = "导入成功";
                    newRow["Status"] = "1";
                }
                catch (Exception ex)
                {
                    newRow["Message"] = ex.Message;
                    newRow["Status"] = "-2";
                }
                newRow["RowNumber"] = i.ToString();
            }
            return resultTable;
        }

        private static DataTable ExerciseImportB(DataTable dt, int ocid, int courseId, int exerciseType)
        {
            DataTable resultTable = BuildResultTable();
            ExerciseInfo exercise;
            if (dt.Rows.Count == 0) return resultTable;
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                var newRow = resultTable.NewRow();
                resultTable.Rows.Add(newRow);
                try
                {
                    exercise = ExerciseBind(dt.Rows[i]);
                    exercise.exercisecommon.exercise.OCID = ocid;
                    exercise.exercisecommon.exercise.CourseID = courseId;
                    exercise.exercisecommon.exercise.Conten = dt.Rows[i]["习题内容"].ToString();
                    exercise.exercisecommon.exercise.Analysis = dt.Rows[i]["习题解析"].ToString();
                    exercise.exercisecommon.exercise.ExerciseType = exerciseType;
                    exercise.exercisecommon.exercise.ExerciseTypeName = GetExerciseTypeName(exerciseType);

                    exercise.exercisecommon.exercise.Answer = dt.Rows[i]["答案"].ToString();
                    Exercise_Judge_M_Edit(Newtonsoft.Json.JsonConvert.SerializeObject(exercise));
                    newRow["Message"] = "导入成功";
                    newRow["Status"] = "1";
                }
                catch (Exception ex)
                {
                    newRow["Message"] = ex.Message;
                    newRow["Status"] = "-2";
                }
                newRow["RowNumber"] = i.ToString();

            }
            return resultTable;
        }

        private static DataTable ExerciseImportC(DataTable dt, int ocid, int courseId, int exerciseType)
        {
            DataTable resultTable = BuildResultTable();
            if (dt.Rows.Count == 0) return resultTable;
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                var newRow = resultTable.NewRow();
                resultTable.Rows.Add(newRow);
                try
                {
                    string content = "";
                    ExerciseInfo exercise = ExerciseBind(dt.Rows[i]);
                    exercise.exercisecommon.exercise.OCID = ocid;
                    exercise.exercisecommon.exercise.CourseID = courseId;
                    exercise.exercisecommon.exercise.Conten = dt.Rows[i]["习题内容"].ToString();
                    exercise.exercisecommon.exercise.Analysis = dt.Rows[i]["习题解析"].ToString();
                    exercise.exercisecommon.exercise.ExerciseType = exerciseType;
                    exercise.exercisecommon.exercise.ExerciseTypeName = GetExerciseTypeName(exerciseType);
                    for (int n = 0; n < 6; n++)
                    {
                        if (string.IsNullOrEmpty(dt.Rows[i]["答案" + (n + 1)].ToString())) continue;
                        string alternative = dt.Rows[i]["答案" + (n + 1) + "（备选）"].ToString() == "" ? ((char)32).ToString() : dt.Rows[i]["答案" + (n + 1) + "（备选）"].ToString();
                        //判断下一题是不是空
                        if (!string.IsNullOrEmpty(dt.Rows[i]["答案" + (n + 2)].ToString()))
                        {
                            content += "0wshgkjqbwhfbxlfrh_b" + dt.Rows[i]["答案" + (n + 1)].ToString()
                             + "wshgkjqbwhfbxlfrh_c" + alternative + "wshgkjqbwhfbxlfrh_a";
                        }
                        else
                        {
                            content += "0wshgkjqbwhfbxlfrh_b" + dt.Rows[i]["答案" + (n + 1)].ToString()
                                + "wshgkjqbwhfbxlfrh_c" + alternative;
                            //if (!string.IsNullOrEmpty(alternative.Trim()))
                        }
                    }
                    exercise.exercisecommon.exercise.Content = content;
                    Exercise_FillInBlanks_M_Edit(Newtonsoft.Json.JsonConvert.SerializeObject(exercise));
                    newRow["Message"] = "导入成功";
                    newRow["Status"] = "1";
                }
                catch (Exception ex)
                {
                    newRow["Message"] = ex.Message;
                    newRow["Status"] = "-2";
                }
                newRow["RowNumber"] = i.ToString();
            }
            return resultTable;
        }

        private static DataTable ExerciseImportD(DataTable dt, int ocid, int courseId, int exerciseType)
        {
            DataTable resultTable = BuildResultTable();
            ExerciseInfo exercise;
            if (dt.Rows.Count == 0) return resultTable;
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                var newRow = resultTable.NewRow();
                resultTable.Rows.Add(newRow);
                try
                {
                    string content = "";
                    exercise = ExerciseBind(dt.Rows[i]);
                    exercise.exercisecommon.exercise.OCID = ocid;
                    exercise.exercisecommon.exercise.CourseID = courseId;
                    exercise.exercisecommon.exercise.Conten = dt.Rows[i]["习题内容"].ToString();
                    exercise.exercisecommon.exercise.Analysis = dt.Rows[i]["习题解析"].ToString();
                    exercise.exercisecommon.exercise.ExerciseType = exerciseType;
                    exercise.exercisecommon.exercise.ExerciseTypeName = GetExerciseTypeName(exerciseType);
                    int[] answer = new int[dt.Rows[i]["正确答案"].ToString().Length];

                    for (int n = 0; n < dt.Rows[i]["正确答案"].ToString().Length; n++)
                    {
                        answer[n] = Convert.ToInt32(dt.Rows[i]["正确答案"].ToString().Substring(n, 1));
                    }

                    for (int n = 0; n < 8; n++)
                    {
                        if (string.IsNullOrEmpty(dt.Rows[i]["选项" + (n + 1)].ToString())) continue;
                        int correct = 0;
                        foreach (var a in answer)
                        {
                            if (a == (n + 1))
                            {
                                correct = 1;
                            }
                        }
                        //判断下一题是不是空
                        if (!string.IsNullOrEmpty(dt.Rows[i]["选项" + (n + 2)].ToString()))
                        {
                            content += "0wshgkjqbwhfbxlfrh_b" + dt.Rows[i]["选项" + (n + 1)].ToString()
                            + "wshgkjqbwhfbxlfrh_c" + correct + "wshgkjqbwhfbxlfrh_a";
                        }
                        else
                        {
                            content += "0wshgkjqbwhfbxlfrh_b" + dt.Rows[i]["选项" + (n + 1)].ToString()
                            + "wshgkjqbwhfbxlfrh_c" + correct;
                        }

                    }
                    exercise.exercisecommon.exercise.Content = content;
                    Exercise_MultipleChoice_M_Edit(Newtonsoft.Json.JsonConvert.SerializeObject(exercise));
                    newRow["Message"] = "导入成功";
                    newRow["Status"] = "1";
                }
                catch (Exception ex)
                {
                    newRow["Message"] = ex.Message;
                    newRow["Status"] = "-2";
                }
                newRow["RowNumber"] = i.ToString();
            }
            return resultTable;
        }
        private static ExerciseInfo ExerciseBind(DataRow dr)
        {
            ExerciseInfo exercise = new ExerciseInfo() { exercisecommon = new ExerciseCommon() { exercise = new Exercise() } };
            exercise.exercisecommon.exercise.CreateUserID = IES.Service.UserService.CurrentUser.UserID;
            exercise.exercisecommon.exercise.CreateUserName = IES.Service.UserService.CurrentUser.UserName;
            exercise.exercisecommon.exercise.Diffcult = Convert.ToInt32(dr["难易程度"]);
            if (dr["适用范围"] != null)
            {
                exercise.exercisecommon.exercise.Scope = Convert.ToInt32(dr["适用范围"].ToString());
            }
            if (!string.IsNullOrEmpty(dr["关键字"].ToString().Trim()))
            {
                exercise.exercisecommon.exercise.Keys = dr["关键字"].ToString().Replace(",", "wshgkjqbwhfbxlfrh");
                exercise.exercisecommon.exercise.Keys += "wshgkjqbwhfbxlfrh";
            }
            if (!string.IsNullOrEmpty(dr["知识点"].ToString()))
            {
                exercise.exercisecommon.exercise.Kens = dr["知识点"].ToString().Replace(",", "wshgkjqbwhfbxlfrh");
                exercise.exercisecommon.exercise.Kens += "wshgkjqbwhfbxlfrh";
            }
            return exercise;
        }

        private static ExerciseInfo Exercise_Writing_M_Edit(string model)
        {
            ExerciseInfo v = Newtonsoft.Json.JsonConvert.DeserializeObject<ExerciseInfo>(model);
            v.exercisecommon.exercise.CreateUserID = IES.Service.UserService.CurrentUser.UserID;
            v.exercisecommon.exercise.CreateUserName = IES.Service.UserService.CurrentUser.UserName;
            return new ExerciseBLL().Exercise_Writing_M_Edit(v);
        }

        private static ExerciseInfo Exercise_FillInBlanks_M_Edit(string model)
        {
            ExerciseInfo v = Newtonsoft.Json.JsonConvert.DeserializeObject<ExerciseInfo>(model);
            v.exercisecommon.exercise.CreateUserID = IES.Service.UserService.CurrentUser.UserID;
            v.exercisecommon.exercise.CreateUserName = IES.Service.UserService.CurrentUser.UserName;
            return new ExerciseBLL().Exercise_FillInBlanks_M_Edit(v);
        }

        private static ExerciseInfo Exercise_Judge_M_Edit(string model)
        {
            ExerciseInfo v = Newtonsoft.Json.JsonConvert.DeserializeObject<ExerciseInfo>(model);
            v.exercisecommon.exercise.CreateUserID = IES.Service.UserService.CurrentUser.UserID;
            v.exercisecommon.exercise.CreateUserName = IES.Service.UserService.CurrentUser.UserName;
            return new ExerciseBLL().Exercise_Judge_M_Edit(v);
        }
        private static ExerciseInfo Exercise_MultipleChoice_M_Edit(string model)
        {
            ExerciseInfo v = Newtonsoft.Json.JsonConvert.DeserializeObject<ExerciseInfo>(model);
            v.exercisecommon.exercise.CreateUserID = IES.Service.UserService.CurrentUser.UserID;
            v.exercisecommon.exercise.CreateUserName = IES.Service.UserService.CurrentUser.UserName;
            return new ExerciseBLL().Exercise_MultipleChoice_M_Edit(v);
        }
        #endregion



        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}
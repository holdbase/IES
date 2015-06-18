<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="login.aspx.cs" Inherits="Test.login" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title></title>
</head>
<body>
    <form id="form1" runat="server">
    <div>
    用户名<asp:TextBox ID="tbuser" runat="server"></asp:TextBox>
         密码<asp:TextBox ID="tbpassword" runat="server"></asp:TextBox>
        <asp:Button ID="Button1" runat="server" Text="登录" OnClick="Button1_Click" />
    </div>
    </form>
</body>
</html>

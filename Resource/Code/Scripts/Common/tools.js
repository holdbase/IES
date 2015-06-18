Array.prototype.insert = function (index, item) {
    this.splice(index, 0, item);
};

Date.prototype.format = function (format) //author: meizz
{
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "h+": this.getHours(),   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
    (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
      RegExp.$1.length == 1 ? o[k] :
        ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}
///数组去重
Array.prototype.distinct = function () {
    var sameObj = function (a, b) {
        var tag = true;
        if (!a || !b) return false;
        for (var x in a) {
            if (!b[x])
                return false;
            if (typeof (a[x]) === 'object') {
                tag = sameObj(a[x], b[x]);
            } else {
                if (a[x] !== b[x])
                    return false;
            }
        }
        return tag;
    }
    var newArr = [], obj = {};
    for (var i = 0, len = this.length; i < len; i++) {
        if (!sameObj(obj[typeof (this[i]) + this[i]], this[i])) {
            newArr.push(this[i]);
            obj[typeof (this[i]) + this[i]] = this[i];
        }
    }
    return newArr;
}

///删除左右两端的空格
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

String.prototype.charLeftAll = function (bchar, alength) {
    var xchar = '' + this;
    for (var i = 0; i < alength; i++) {
        xchar = bchar + xchar;
        if (xchar.length == alength)
            break;
    }
    return (xchar);
}
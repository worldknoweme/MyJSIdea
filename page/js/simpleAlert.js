/**
 * Created by Dasate on 2017/9/14.
 * QQ361899429
 *
 * 在此基础上进行扩展
 * wangjianlin1989@163.com
 */
var simpleAlert = function (opts) {
    //设置默认参数
    var opt = {
        "closeAll": false,
        "content": "",
        "testBase":"",
        "buttons": {}
    }
    //合并参数
    var option = $.extend(opt, opts);
    //事件
    var dialog = {}
    var $simpleAlert = $('<div class="simpleAlert">');
    var $shelter = $('<div class="simpleAlertShelter">');
    var $simpleAlertBody = $('<div class="simpleAlertBody">');
  //  var $simpleAlertBodyClose = $('<img class="simpleAlertBodyClose" src="img/close.png" height="14" width="14"/>');
    var $simpleAlertBodyContent = $('<p class="simpleAlertBodyContent">' + option.content + '</p>');
    var testBaseHtml = "<p class='simpleAlertBodyTestBaseTitle'>【测试标准】</p>";
    var testBaseContentArr = option.testBase.split(";");
    var simpleAlertBodyTestBase = "";
    for(var i=0;i<testBaseContentArr.length;i++){
        simpleAlertBodyTestBase+='<p>◆' + testBaseContentArr[i] + '</p>';
    }
    dialog.init = function () {
        $simpleAlertBody.append($simpleAlertBodyContent);
        $simpleAlertBody.append(testBaseHtml);
        $simpleAlertBody.append("<div class='simpleAlertBodyTestBase'>"+simpleAlertBodyTestBase+"</div>");
        var num = 0;
        var only = false;
        var onlyArr = [];
        for (var i = 0; i < 2; i++) {
            for (var key in option.buttons) {
                switch (i) {
                    case 0:
                        onlyArr.push(key);
                        break;
                    case 1:
                        if (onlyArr.length <= 1) {
                            only = true;
                        } else {
                            only = false;
                        }
                        num++;
                        var $btn = $('<button class="simpleAlertBtn simpleAlertBtn' + num + '">' + key + '</button>')
                        $btn.bind("click", option.buttons[key]);
                        if (only) {
                            $btn.addClass("onlyOne")
                        }
                        $simpleAlertBody.append($btn);
                        break;
                }

            }
        }
        $simpleAlert.append($shelter).append($simpleAlertBody);
        $("body").append($simpleAlert);
        $simpleAlertBody.show().animate({"marginTop":"-128px","opacity":"1"},300);
    }

    dialog.close = function () {
        if(option.closeAll){
            $(".simpleAlert").remove()
        }else {
            $simpleAlertBody.animate({"marginTop": "-188px", "opacity": "0"}, 200, function () {
                $(".simpleAlert").last().remove()
            });
        }
    }
    dialog.init();
    return dialog;
}

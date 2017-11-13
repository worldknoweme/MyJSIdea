/**
 * 初始化底部按钮
 */
function fillHtml() {
    var footer = "<div class=\"button_container\">\n" +
        "\n" +
        "        <span  class=\"testagain\"\n" +
        "                data-button=\"\"\n" +
        "                data-ret=\"testAgain\">重新测试</span>\n" +
        "        <span  class=\"interrupt\"\n" +
        "                data-button=\"\"\n" +
        "                data-ret=\"failure\">中断测试</span>\n" +
        "        <span class=\"cotinuetest\" data-button=\"\" data-ret=\"continue\">继续测试</span>\n" +
        "</div>  <!-- end .button_container -->";
    $("body").append(footer);
}

/**
 * 根据数据库配置，初始化页面测试项
 * 初始化测试标准
 * @param testProcessWidth 已测试项目进度
 * @param moduleName 模块名称
 * @param flag 是否为人机交互页面
 * @param ifMask 是否需要弹框
 * @param testLine 当前测试行
 */
function initAlert(testProcessWidth,moduleName,flag,ifMask,testLine) {
    var inner_bar = $(".inner_bar");
    var width =testProcessWidth+"%";
    inner_bar.width(width);
    //初始化页面显示项
    //进行配置项的初始化
    dict.SetString("@.s.c.item.PIN"," <tr><td>检测项</td><td>检测状态</td></tr> <tr><td id=\"td1\">版本确认</td><td><img id=\"status1\" src=\"\" style='position:relative;top:7px;' ><span id=\"statusText1\">暂未测试</span></td></tr> <tr><td id=\"td2\">键值应用</td><td><img id=\"status2\" src=\"\" style='position:relative;top:7px;' ><span id=\"statusText2\">暂未测试</span></td></tr> <tr><td id=\"td3\">密钥验证</td><td><img id=\"status3\" src=\"\" style='position:relative;top:7px;' ><span id=\"statusText3\">暂未测试</span></td></tr> <tr><td id=\"td4\">测试项目22</td><td><img id=\"status4\" src=\"\" style='position:relative;top:7px;' ><span id=\"statusText4\">暂未测试</span></td></tr>");
    var itemInfo = dict.GetString("@.s.c.item.PIN");
    log.info("itemInfo="+itemInfo);
    $("#info_table").html(itemInfo);
    //设置当前测试行为测试中的效果
    $("#status"+testLine).attr('src','img/4rate3/testing.png');
    $("#status"+testLine).addClass("run_ani");//动画效果
    $("#statusText"+testLine).html("测试中");
    if(testLine>1){
        //假如当前测试行不为1，需要设置小于行号的行为测试成功
        for(var i=1;i<testLine;i++){
            $("#status"+testLine).attr('src','img/4rate3/pass.png');
            $("#statusText"+testLine).html("成功");
        }
    }
    //这里就可以进行每一行状态的判断（这里需要添加正在进行中的动画）
  /*  $("#status1").attr('src','img/4rate3/testing.png');
    $("#status1").addClass("run_ani");//动画效果
    $("#statusText1").html("测试中");*/


    //var standardPcString = "[{\"content\":\"版本确认\",\"testStandard\":\"测试标准1;测试标准2;测试标准3\"},{\"content\":\"键值应用\",\"testStandard\":\"测试标准1;测试标准2;测试标准3\"},{\"content\":\"密钥验证\",\"testStandard\":\"测试标准1;测试标准2;测试标准3\"},{\"content\":\"测试项目22\",\"testStandard\":\"测试标准;没有;试试\"}]";
    //dict.SetString("@.s.c.item.PIN.StandardPC",standardPcString)

    //动态创建弹出框数据
//        var testFuction = "版本确认";
//        var testBase = "使用测试工具进行版本号获取;测试标准2;测试标准3";
    if(flag){
        //获取人机交互测试项对象
        var standardPc = dict.GetString("@.s.c.item."+moduleName+".StandardPC");
        log.info("该模块的人机交互测试项如下："+standardPc);
        standardPc = JSON.parse(standardPc);
        setTimeout(function () {
            ifItemSuccess(standardPc,moduleName,testProcessWidth,0);
        },1000);
    }else {
        if(ifMask){
          //  var standardPcString = "[\"测试标准1;测试标准2;测试标准3\",\"测试标准1;测试标准2;测试标准3\",\"测试标准1;测试标准2;测试标准3\",\"测试标准;没有;试试\"]";
           // dict.SetString("@.s.c.item.PIN.StandardAll",standardPcString)
            //获取所有测试对象
            var standardAll = dict.GetString("@.s.c.item."+moduleName+".StandardAll");
            log.info("该模块的所有测试项如下："+standardAll);
            standardAll = JSON.parse(standardAll);
            setTimeout(function () {
                ifModuleSuccess(standardAll,moduleName,testProcessWidth,testLine);
            },1000);
        }

    }

}


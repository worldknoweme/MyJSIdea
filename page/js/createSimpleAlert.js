/**
 * @Description页面弹框样式及逻辑
 * @param width   进度条进度
 * @param testFunction 测试模块测试项名称
 * @param testBase 测试模块测试标准
 * @param moduleName 测试模块名称
 * @param testAlready 需要改变的测试项对应图标
 * @param changeText 需要改变的测试项对应文本
 */
function ifSuccess(standardPc) {
    //json字符串对象转为json对象
    standardPc = JSON.parse(standardPc);
    standardPc.size();
    for (var key in standardPc) {

    }

}

function getJsonObjLength(jsonObj) {
    var Length = 0;
    for (var item in jsonObj) {
        Length++;
    }
    return Length;
}

/**
 * @Description页面弹框样式及逻辑
 * @param standardPc   获取到的需人机交互json对象（数组格式）
 * @param moduleName 测试模块名称
 * @param testAlready 非人机交互项完成之后，测试进度
 * @param index 人机交互测试序号（从0开始）
 */
function ifItemSuccess(standardPc, moduleName, testAlready, index) {
    //计算测试进度
    var length = getJsonObjLength(standardPc)-index;
    var eachIndex = parseInt((100 - testAlready) / length);
    var width = testAlready + eachIndex;
    var inner_bar = $(".inner_bar");
    var itemTest = standardPc[index];
    //获取测试项目内容
    var testFunction = itemTest.content;
    index=index+1;
    //获取测试项目测试标准
    var testBase = itemTest.testStandard;
    var dblChoseAlert = simpleAlert({
        "content": testFunction + "功能是否正常？",
        "testBase": testBase,
        "buttons": {
            "是": function () {
                // dict.SetString("@.s.c.text.cam","1");
                inner_bar.width(width + "%");
                $("#process_num").html(width + "%");
                $("#status" + index).removeClass("run_ani");
                $("#status" + index).attr('src', 'img/4rate3/pass.png');
                $("#statusText" + index).html("成功");
                dblChoseAlert.close();
                if (index < getJsonObjLength(standardPc)) {
                    setTimeout(function () {
                        ifItemSuccess(standardPc, moduleName, width, index);
                    }, 1000);
                }else{
                    dict.SetString("@.s.c.text." + moduleName, "1");
                    evt.pageFinished("success");
                }
            },
            "否": function () {
                dict.SetString("@.s.c.text." + moduleName, "2");
                inner_bar.width(width + "%");
                $("#status" + index).removeClass("run_ani");
                $("#status" + index).attr('src', 'img/4rate3/fail.png');
                $("#statusText" + index).html("失败");
                $("#process_num").html(width + "%");
                dict.SetString("@.s.c.reason", "版本确认失败");
                dblChoseAlert.close();
            }
        }
    })
}

/**
 * 标准SP功能测试弹框样式及逻辑
 * @param standardPc 全部测试项列表
 * @param moduleName 测试模块名称
 * @param width      已测试进度
 * @param index      当前测试项所在行号
 */
function ifModuleSuccess(standardPc, moduleName,width,index) {
    //获取测试功能
    var testFunction=$("td"+index).text();
    //获取测试标准
    var testBase = standardPc[index];
    var inner_bar = $(".inner_bar");
    var dblChoseAlert = simpleAlert({
        "content": testFunction + "功能是否正常？",
        "testBase": testBase,
        "buttons": {
            "是": function () {
                inner_bar.width(width + "%");
                $("#process_num").html(width + "%");
                $("#status" + index).removeClass("run_ani");
                $("#status" + index).attr('src', 'img/4rate3/pass.png');
                $("#statusText" + index).html("成功");
                dblChoseAlert.close();
                if(index==getJsonObjLength(standardPc)){
                    dict.SetString("@.s.c.text." + moduleName, "1");
                }
                evt.pageFinished("success");
            },
            "否": function () {
                dict.SetString("@.s.c.text." + moduleName, "2");
                inner_bar.width(width + "%");
                $("#status" + index).removeClass("run_ani");
                $("#status" + index).attr('src', 'img/4rate3/fail.png');
                $("#statusText" + index).html("失败");
                $("#process_num").html(width + "%");
                dict.SetString("@.s.c.reason", "版本确认失败");
                dblChoseAlert.close();
            }
        }
    })
}

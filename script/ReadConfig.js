/**
 * 文件整改，极其不符合编码规范，可读性极低
 * @Author：wangjianlin1989@163.com
 * @Description:进行数据初始化的工具类，进行数据库信息的读取，
 * 根据数据库信息进行数据字典的初始化
 * 数据表结构说明见svn文档03 - 系统设计\数据库设计\数据库表结构说明.docx
 */
if (typeof ObjReadConfig !== 'object') {
    ObjReadConfig = {};
}

(function () {
    /**
     *
     * @returns {是否执行成功标志位：success成功|failure失败}
     * @Description:从数据库读取模块数据,之后进行三部分功能操作：
     * 1、修改基于平台的Config文件（提供平台需要的任一模块的逻辑服务名）
     * 2、修改模块存在标志位对应的数据字典
     * 3、修改模块灯存在标志位对应的数据字典，并将模块灯数据存入数据库
     */
    ObjReadConfig.ReadIfExist = function () {
        Trc.Info("取出ModularInfo表中的信息");
        var oDb = new ActiveXObject("LiteX.LiteConnection");
        oDb.Path = Dict.GetString("*.Conf") + "\\ModularInfo";
        var oStmt = new ActiveXObject("LiteX.LiteStatement");
        var bRet = "success";
        //保存信息数据
        var jsParam = {};
        //展示数据
        var jsArray = new Array();
        try {
            oDb.Open();
            oStmt.ActiveConnection = oDb;
            //测试结果置为空
            var sSql = String.format("UPDATE  moduInfo SET  ModularText = '' ");
            oDb.Execute(sSql);
            //此语句表示查询出所有已存在的模块
            sSql = String.format("SELECT distinct ModularName,ModularEngName,ServiceName,ModularCOM,ModularType,ModularExist,ifhassiu From moduInfo WHERE  ModularExist='1'");
            oStmt.CommandText = sSql;
            oStmt.Prepare();
            var SeqNo = Dict.GetString("@.s.h.SeqNo");
            Trc.Info("开机流水号：" + SeqNo);
            while (!oStmt.step()) {
                Trc.Info("进入数据循环");
                var jsModularArray = new Array();
                Trc.Info("modulename" + oStmt.ColumnValue(0));
                Trc.Info("ifhassiu" + oStmt.ColumnValue(6));
                jsModularArray.push(oStmt.ColumnValue(0), oStmt.ColumnValue(1), oStmt.ColumnValue(2), oStmt.ColumnValue(3), oStmt.ColumnValue(4), oStmt.ColumnValue(5), oStmt.ColumnValue(6));
                jsArray.push(jsModularArray);
            }
        } catch (err) {
            Trc.Info("runtime err: " + err.description);
            bRet = "failure";
        }
        oStmt.Close();
        oDb.Close();
        var sJson = JSON.stringify(jsParam);
        Dict.SetString2Utf8("@.v.g.tmp.Value", sJson);
        Dict.SetString2Utf8("@.s.h.Value", JSON.stringify(jsArray));
        //写平台xml
        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        var sXmlPath = Dict.GetString("*.Conf") + "\\Config.xml";
        xmlDoc.load(sXmlPath);
        var objLogic = xmlDoc.getElementsByTagName("LogicName")[0];
        var aaData = jsArray;
        //循环读并设置逻辑名
        for (var i = 0; i < aaData.length; i++) {
            var name = aaData[i][1];
            var serviceName = aaData[i][2];
            var ifhassiu = aaData[i][6] == 1;
            Trc.Info("此时逻辑设备名：" + aaData[i][0] + ";;;是否存在灯：" + ifhassiu);
            /**
             * 修改模块存在标志位对应的数据字典
             * 修改模块灯存在标志位对应的数据字典，并将模块灯数据存入数据库
             */
            this.InsertSIU(name, ifhassiu);
            //修改基于平台的Config文件（提供平台需要的任一模块的逻辑服务名）
            objLogic.getElementsByTagName(name)[0].setAttribute('LogicalName', serviceName);
            //初始化测试数据
            this.InitItem(name);
            //人机交互项目测试标准写入数据字典
            this.InitStandardPC(name);
        }
        xmlDoc.save(sXmlPath);
        return bRet;
    }




    /***
     *插入灯信息
     */
    ObjReadConfig.InsertSIU = function (name, ifhassiu) {
        switch (name) {
            case 'SIU' : {
                Dict.SetString("@.s.c.exist.SIU", 1);
                break;
            }
            case 'PRR' : {

                Dict.SetString("@.s.c.exist.PRR", 1);
                if (ifhassiu) {

                    Dict.SetString("@.s.c.exist.SIU.PRR", 1);
                    //将该部分数据插入数据库（测试报告）
                    ObjSiu.InsertModule("凭条打印机灯", "SIU.PRR");
                }
                break;
            }
            case 'Invoice':
                Dict.SetString("@.s.c.exist.Invoice", 1);
                if (ifhassiu) {
                    //该模块的灯存在
                    Dict.SetString("@.s.c.exist.SIU.Invoice", 1);
                    //将该部分数据插入数据库（测试报告）
                    ObjSiu.InsertModule("发票打印模块灯", "SIU.INVOICE");
                }
                break;
            case 'FPR':
                Dict.SetString("@.s.c.exist.FINGER", 1);
                if (ifhassiu) {
                    //该模块的灯存在
                    Dict.SetString("@.s.c.exist.SIU.FINGER", 1);
                    //将该部分数据插入数据库（测试报告）
                    ObjSiu.InsertModule("指纹仪模块灯", "SIU.FINGER");
                }
                break;
            case 'MIF':
                Dict.SetString("@.s.c.exist.MIFARE", 1);
                if (ifhassiu) {
                    //该模块的灯存在
                    Dict.SetString("@.s.c.exist.SIU.MIFARE", 1);
                    //将该部分数据插入数据库（测试报告）
                    ObjSiu.InsertModule("非接模块灯", "SIU.MIFARE");
                }
                break;
            case 'CRD':
                Dict.SetString("@.s.c.exist.CRD", 1);
                if (ifhassiu) {
                    //该模块的灯存在
                    Dict.SetString("@.s.c.exist.SIU.CRD", 1);
                    //将该部分数据插入数据库（测试报告）
                    ObjSiu.InsertModule("发卡器模块灯", "SIU.CRD");
                }
                break;
            case 'IDD':
                Dict.SetString("@.s.c.exist.IDD", 1);
                if (ifhassiu) {
                    //该模块的灯存在
                    Dict.SetString("@.s.c.exist.SIU.IDD", 1);
                    //将该部分数据插入数据库（测试报告）
                    ObjSiu.InsertModule("二代证模块灯", "SIU.IDD");
                }
                break;
            case 'IDC':
                Dict.SetString("@.s.c.exist.IDC", 1);
                if (ifhassiu) {
                    //该模块的灯存在
                    Dict.SetString("@.s.c.exist.SIU.IDC", 1);
                    //将该部分数据插入数据库（测试报告）
                    ObjSiu.InsertModule("读卡器模块灯", "SIU.IDC");
                }
                break;
            case 'PSB':
                Dict.SetString("@.s.c.exist.PSB", 1);
                if (ifhassiu) {
                    //该模块的灯存在
                    Dict.SetString("@.s.c.exist.SIU.PSB", 1);
                    //将该部分数据插入数据库（测试报告）
                    ObjSiu.InsertModule("存折补登模块灯", "SIU.PSB");
                }
                break;
            case 'AUDIO':
                Dict.SetString("@.s.c.exist.Audio", 1);
                break;
            case 'CAM':
                Dict.SetString("@.s.c.exist.Camera", 1);
                break;
            case 'BCR':
                Dict.SetString("@.s.c.exist.BCR", 1);
                if (ifhassiu) {
                    //该模块的灯存在
                    Dict.SetString("@.s.c.exist.SIU.BCR", 1);
                    //将该部分数据插入数据库（测试报告）
                    ObjSiu.InsertModule("扫描模块灯", "SIU.BCR");
                }
                break;
            case 'PIN':
                Dict.SetString("@.s.c.exist.PIN", 1);
                if (ifhassiu) {
                    //该模块的灯存在
                    Dict.SetString("@.s.c.exist.SIU.PIN", 1);
                    //将该部分数据插入数据库（测试报告）
                    ObjSiu.InsertModule("密码键盘模块灯", "SIU.PIN");
                }
                break;
            case 'CPM':
                Dict.SetString("@.s.c.exist.CPM", 1);
                if (ifhassiu) {
                    //该模块的灯存在
                    Dict.SetString("@.s.c.exist.SIU.CPM", 1);
                    //将该部分数据插入数据库（测试报告）
                    ObjSiu.InsertModule("制卡机模块灯", "SIU.CPM");
                }
                break;
        }
    }

    /***
     *判断打印类是否存在
     *只要存在任意一个打印模块，即需要拷贝form文件
     */
    ObjReadConfig.ReadPrint = function () {
        //打印类包括 存折 发票 凭条 有一个就需要拷贝 form
        var psb = Dict.GetString("@.s.c.exist.PSB");
        var prr = Dict.GetString("@.s.c.exist.PRR");
        var inv = Dict.GetString("@.s.c.exist.Invoice");
        if (psb == "1" || prr == "1" || inv == "1") {
            return "copy";
        } else {
            return "nocopy";
        }
    }

    /**
     *
     * @returns {string}
     * @Description:初始化数据
     */
    ObjReadConfig.CleanExist = function () {
       /* Dict.SetString("@.s.c.exist.Audio", 0);
        Dict.SetString("@.s.c.exist.SIU", 0);
        Dict.SetString("@.s.c.exist.Camera", 0);
        Dict.SetString("@.s.c.exist.PRR", 0);
        Dict.SetString("@.s.c.exist.Invoice", 0);
        Dict.SetString("@.s.c.exist.BCR", 0);
        //设置制卡机
        Dict.SetString("@.s.c.exist.CPM", 0);
        Dict.SetString("@.s.c.exist.FINGER", 0);
        Dict.SetString("@.s.c.exist.MIFARE", 0);
        Dict.SetString("@.s.c.exist.CRD", 0);
        Dict.SetString("@.s.c.exist.IDC", 0);
        Dict.SetString("@.s.c.exist.IDD", 0);
        Dict.SetString("@.s.c.exist.PSB", 0);
        Dict.SetString("@.s.c.exist.PIN", 0);
        Dict.SetString("@.s.c.exist.UKEY", 0);
        //非接二代证
        Dict.SetString("@.s.c.exist.IDDS", 0);
        Dict.SetString("@.s.c.text.audio", 0);
        Dict.SetString("@.s.c.text.cam", 0);
        Dict.SetString("@.s.c.text.crd", 0);
        Dict.SetString("@.s.c.text.prr", 0);
        Dict.SetString("@.s.c.text.invoice", 0);
        Dict.SetString("@.s.c.text.bcr", 0);
        Dict.SetString("@.s.c.text.mif", 0);
        Dict.SetString("@.s.c.text.plugin", 0);
        Dict.SetString("@.s.c.text.pin", 0);
        Dict.SetString("@.s.c.text.psb", 0);
        Dict.SetString("@.s.c.text.fpr", 0);
        Dict.SetString("@.s.c.text.idc", 0);
        Dict.SetString("@.s.c.text.ukey", 0);
        Dict.SetString("@.s.c.exist.SIU.PRR", "");
        Dict.SetString("@.s.c.exist.SIU.PSB", "");
        Dict.SetString("@.s.c.exist.SIU.CRD", "");*/
        Dict.clear("@.s.c.IfSec");
        Dict.clear("@.s.c.item");
        Dict.clear("@.s.c.exist");
        Dict.clear("@.s.c.text");
        return "success";
    }
    /**
     *
     * @returns {string}
     * @Description:读取测试结果数据
     */
    ObjReadConfig.ReadEnd = function () {
        var oDb = new ActiveXObject("LiteX.LiteConnection");
        //路径
        oDb.Path = Dict.GetString("*.Conf") + "\\ModularInfo";
        var oStmt = new ActiveXObject("LiteX.LiteStatement");
        var bRet = "success";
        //展示数据
        var SeqNo = Dict.GetString("@.s.h.SeqNo");
        var jsArray = new Array();
        try {
            oDb.Open();
            oStmt.ActiveConnection = oDb;
            var sSql = String.format("SELECT distinct ModularName,ModularText,Reason From Task WHERE ModularEngName!='SIU' ");
            oStmt.CommandText = sSql;
            //var jsModularArray=new Array();
            oStmt.Prepare();
            while (!oStmt.step()) {
                var jsModularArray = [];
                Trc.Info("show====== " + oStmt.ColumnValue(0));

                jsModularArray.push(oStmt.ColumnValue(0));
                /*var nameE = oStmt.ColumnValue(1);
                if(nameE=="null"||nameE==null){
                    jsModularArray.push("");
                }else{
                    jsModularArray.push(nameE);
                }*/
                var flagE = oStmt.ColumnValue(1);
                if (flagE == "1") {//测试通过
                    jsModularArray.push("测试通过");
                } else if (flagE == "2") {
                    jsModularArray.push(oStmt.ColumnValue(2));
                } else {
                    jsModularArray.push("未测试");
                }
                //jsModularArray.push(oStmt.ColumnValue(2));
                //	oStmt.ColumnValue(1),oStmt.ColumnValue(2),oStmt.ColumnValue(3),oStmt.ColumnValue(4));
                jsArray.push(jsModularArray);
            }
        } catch (err) {
            Trc.Info("runtime err: " + err.description);
            bRet = "failure";
        }
        oStmt.Close();
        oDb.Close();
        Trc.Info("showmessage====== " + JSON.stringify(jsArray));
        Dict.SetString2Utf8("@.s.c.Value", JSON.stringify(jsArray));

        var endTime = Dict.GetString("#.%Y%m%d%H%M%S");
        Dict.SetString("@.v.u.endtime", endTime);
        Trc.Info(jsArray);
        return bRet;
    }

    //写入xml
    ObjReadConfig.WriteXML = function () {
        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        var sXmlPath = Dict.GetString("*.Conf") + "\\Config.xml";
        xmlDoc.load(sXmlPath);
        var objLogic = xmlDoc.getElementsByTagName("LogicName")[0];
        // 取读到数据
        var aaDataString = Dict.GetString("@.s.h.Value");
        Trc.Info(aaDataString);
        var aaData = eval(aaDataString2);
        //循环读并设置逻辑名
        for (var i = 0; i < aaData.length; i++) {
            var name = aaData[i][5];
            var serviceName = aaData[i][2];
            if (serviceName != null && serviceName != "") {
                if (serviceName == "MIF") {
                    var MIFArray = new Array();
                    MIFArray = serviceName.split(",");
                    //暂时默认第一个是IC
                    //第二个是ID
                    objLogic.getElementsByTagName(name)[0].setAttribute('LogicalName', MiIFArray[0]);
                    objLogic.getElementsByTagName("IDD")[0].setAttribute('LogicalName', MiIFArray[1]);

                }
                else {
                    objLogic.getElementsByTagName(name)[0].setAttribute('LogicalName', serviceName);
                }
            } else {
                objLogic.getElementsByTagName(name)[0].setAttribute('LogicalName', "");
            }
        }
    }
    /**
     *
     * @returns {string}
     * @Description:检测用户登录信息是否合法
     */
    ObjReadConfig.CheckEmp = function () {
        //员工号 读数据库
        var EmpNum = parseInt(Dict.GetString("@.v.u.tmp.Employee"));
        //加载控件
        var oDb = new ActiveXObject("LiteX.LiteConnection")
        //路径
        oDb.Path = Dict.GetString("*.Conf") + "\\ModularInfo";
        var oStmt = new ActiveXObject("LiteX.LiteStatement");
        var bRet = "success";
        var jsArray = new Array();
        //正确数据
        var EmpArray = new Array();
        try {
            oDb.Open();
            oStmt.ActiveConnection = oDb;
            var sSql = String.format("SELECT EmployeeNum,EmployeeName,EmployeeCompany From Employee WHERE EmployeeNum = " + "\"" + EmpNum + "\"");
            oStmt.CommandText = sSql;
            Trc.Info(sSql);
            oStmt.Prepare();
            while (!oStmt.step()) {
                //oStmt.ColumnValue(2)
                var jsModularArray = new Array();
                jsModularArray.push(oStmt.ColumnValue(0), oStmt.ColumnValue(1), oStmt.ColumnValue(2));
                jsArray.push(jsModularArray);
                Trc.Info(jsArray);
            }
        }
        catch (err) {
            Trc.Info("runtime err: " + err.description);
            bRet = "failure";
        }
        oStmt.Close();
        oDb.Close();
        if (jsArray.length == 0) {
            bRet = "failure";
        }
        for (var i = 0; i < jsArray.length; i++) {
            var num = jsArray[i][0];
            Trc.Info(num);
            if (num == EmpNum) {
                EmpArray.push(jsArray[i]);
                Trc.Info(EmpArray);
                Trc.Info("empname==" + jsArray[i][1]);
                Dict.SetString2Utf8("@.v.u.tmp.Employee", jsArray[i][1]);
                Dict.SetString2Utf8("@.v.g.tmp.Emp", JSON.stringify(EmpArray));
                bRet = "success";
                break;
            }
            else {
                bRet = "failure";
            }
        }

        return bRet;
    }

    //获取时间
    ObjReadConfig.getNowTime = function () {
        var time = Dict.GetString("#.%Y/%m/%d %H:%M:%S");
        Dict.SetString("@.s.h.Time", time);
        var Time = Dict.GetString("@.s.h.Time");
        return Time;

    }
    //设置此次测试流水号和开始测试时间
    ObjReadConfig.getSeq = function () {
        var SeqNo = Msg.GetNewSeqNo();
        Dict.SetString("@.s.h.SeqNo", SeqNo);
        var starttime = Dict.GetString("#.%Y%m%d%H%M%S");
        Dict.SetString("@.v.u.starttime", starttime);
        return "success";

    }
    //测试结果写入工作流水表
    //并更新写moduInfo表
    ObjReadConfig.TextWrite = function (name) {
        Trc.Info("写工作流水表");
        var SeqNo = Dict.GetString("@.s.h.SeqNo");
        var reason = Dict.GetStringFromUtf8("@.s.c.reason");
        Trc.Info(SeqNo);
        var Time = ObjReadConfig.getNowTime();
        Trc.Info(Time);
        var EmpNum = Dict.GetStringFromUtf8("@.v.u.tmp.Employee");
        Trc.Info(EmpNum);
        var str = "@.s.c.text." + name;
        var str2 = "@.s.c.IfSec." + name.toUpperCase();
        Dict.SetString(str2, 0);
        Trc.Info(str);
        var Result = Dict.GetString(str);
        Trc.Info(Result);
        var oDb = new ActiveXObject("LiteX.LiteConnection");
        //路径
        oDb.Path = Dict.GetString("*.Conf") + "\\ModularInfo";
        var oStmt = new ActiveXObject("LiteX.LiteStatement");
        var bRet = "success";
        var ResultArray = new Array();
        var Name = name.toUpperCase();
        try {
            /*	oDb.Open();
                oStmt.ActiveConnection = oDb;
                var sSql = String.format("SELECT  ModularName,ModularEngName From moduInfo WHERE ModularEngName = "+"\""+Name+"\"");
                oStmt.CommandText = sSql;
                Trc.Info(sSql);
                oStmt.Prepare();
            while(!oStmt.step()){
                var jsModularArray = new Array();
                jsModularArray.push(oStmt.ColumnValue(0),oStmt.ColumnValue(1));
                ResultArray.push(jsModularArray);
            }
            Trc.Info(ResultArray);*/
            //插入数据  组织数据
            /* sSql = String.format("INSERT  INTO Task('ModularText','ModularName','ModularEngName','EmployeeNum','SeqNo','Time') values("+"\""+Result+"\""+",\""+ResultArray[0][0]+"\"" +",\""+ResultArray[0][1]+"\"" +",\""+EmpNum+"\"" +",\""+SeqNo+"\"" +",\""+Time+"\"" +")");*/
            oDb.Open();
            sSql = String.format("Update Task set ModularText =\"" + Result + "\",EmployeeNum=\"" + EmpNum + "\",SeqNo=\"" + SeqNo + "\",Time=\"" + Time + "\",Reason=\"" + reason + "\" where ModularEngName =\"" + Name + "\"");
            Trc.Info(sSql);
            oDb.Execute(sSql);
            //更新moduInfo表 当前测试的会在moduInfo表中留下记录 未测试的text为空 测试通过的为1  未通过的为2
            sSql = String.format("UPDATE  moduInfo SET  ModularText = " + "\"" + Result + "\"" + "WHERE ModularEngName = " + "\"'" + Name + "'\"");
            Trc.Info(sSql);
            oDb.Execute(sSql);
        } catch (err) {
            Trc.Info("runtime err: " + err.description);
            bRet = "failure";

        }
        oStmt.Close();
        oDb.Close();
        return bRet;
    }
    /**
     * 初始化测试报告对应数据，modularText设置为3未测试，EmployeeNum员工号设置为空、流水号和时间全部置为空
     * @returns {*}
     * @constructor
     */
    ObjReadConfig.InitializationTask = function () {
        var SeqNo = Dict.GetString("@.s.h.SeqNo");
        var oDb = new ActiveXObject("LiteX.LiteConnection");
        //路径
        oDb.Path = Dict.GetString("*.Conf") + "\\ModularInfo";
        var oStmt = new ActiveXObject("LiteX.LiteStatement");
        try {
            oDb.Open();
            oStmt.ActiveConnection = oDb;
            //初始化TASK
            var sSql = String.format("UPDATE  Task SET  ModularText = '3',EmployeeNum = ' ',SeqNo = '',Time = ' '");
            //oStmt.CommandText = sSql;
            oDb.Execute(sSql);
        } catch (err) {
            Trc.Info("runtime err: " + err.description);
            return "failure";
        }
        oStmt.Close();
        oDb.Close();
        return "success";
    }

    //查看moduInfo表  判断是否需要进行二次测试
    ObjReadConfig.ReadToJudge = function () {
        var type = Dict.GetString("@.v.t.TransType");
        if (type == "zj") {
            return "first";
        }
        var SeqNo = Dict.GetString("@.s.h.SeqNo");
        var oDb = new ActiveXObject("LiteX.LiteConnection");
        //路径
        oDb.Path = Dict.GetString("*.Conf") + "\\ModularInfo";
        var oStmt = new ActiveXObject("LiteX.LiteStatement");
        //保存所有测试数据
        var JsArray = new Array();
        //保存需要二次测试的数据
        var Second = new Array();
        //用于 首次还是二次判断
        var TextThree = new Array();
        Second = [];
        var OkNum = 0;
        JsArray = [];
        try {
            oDb.Open();
            oStmt.ActiveConnection = oDb;
            //查询测试不通过的模块
            var sSql = String.format("select t.ModularEngName,t.ModularText,t.ModularName,m.ModularType,m.ModularCOM from Task t join moduInfo m on(t.ModularEngName=m.ModularEngName) where  m.ModularExist = '1'  and t.ModularText!='1'");
            oStmt.CommandText = sSql;
            oStmt.Prepare();
            while (!oStmt.step()) {
                OkNum = OkNum + 1;
                Trc.Info("数据1：" + oStmt.ColumnValue(0));
                Trc.Info("数据2：" + oStmt.ColumnValue(1));
                Trc.Info("当前第" + OkNum + "次");
                var jsModularArray = [];
                jsModularArray.push(oStmt.ColumnValue(0), oStmt.ColumnValue(1), oStmt.ColumnValue(2), oStmt.ColumnValue(3), oStmt.ColumnValue(4));
                Trc.Info("jsModularArray" + OkNum + ":" + jsModularArray);
                JsArray.push(jsModularArray);
            }

        } catch (err) {
            Trc.Info("runtime err: " + err.description);
            return "failure";
        }
        oStmt.Close();
        oDb.Close();
        //判断是否存在数据即可，并将这部分数据存起来，需要展示一下二次测试的模块
        Trc.Info("需要二次测试的模块：" + JsArray.length);
        if (JsArray.length > 0) {
            for (var i = 0; i < JsArray.length; i++) {
                var name = JsArray[i][0].toUpperCase();
                Trc.Info(name);
                var str = "@.s.c.IfSec." + name;
                Dict.SetString(str, 1);
            }
            //保存信息 用于展示
            Dict.SetString2Utf8("@.v.g.tmp.Value", JSON.stringify(JsArray));
            return "second";
        } else {
            return "nomodule";
        }
    }
    /**
     * 初始化测试项
     * 数据库里面进行测试项目的读取，组织成table的样式
     * table里面暂时设置两个ID（每一行的img和imgText需要设置ID），方便页面处理。
     * 例：
     * <tr>
     *<td>加卡</td>
     *<td id="open">
     *<img id="status1" class='run_ani' style='position:relative;top:7px;' src='img/4rate3/testing.png'>&nbsp;<span id="statusText1">进行中</span>
     *</td>
     *</tr>
     * 给出id为status+行号的img，该img设置class='run_ani'和src来展示进行中动画
     * 给出id为statusText+行号的span，可以设置span的内容
     */
    ObjReadConfig.InitItem = function (moduleName) {
        Trc.Info("取出ItemInfo表中的信息");
        //初始化标志位
        var trNum=0;
        var trInfo = " <tr><td>检测项</td><td>检测状态</td></tr>";
        var oDb = new ActiveXObject("LiteX.LiteConnection");
        //路径
        oDb.Path = Dict.GetString("*.Conf") + "\\ItemInfo";
        var oStmt = new ActiveXObject("LiteX.LiteStatement");
        var bRet = "success";

        try {
            oDb.Open();
            oStmt.ActiveConnection = oDb;
            //查询指定
            var sSql = String.format("select * from iteminfo where moduleName='" + moduleName + "' order by seq");
            oStmt.CommandText = sSql;
            oStmt.Prepare();
            var testStandardAll = "[";
            while (!oStmt.step()) {
                trNum++;
                var itemTr = " <tr><td id=\"td"+trNum+"\">" + oStmt.ColumnValue(1) + "</td><td>" +
                    "<img id=\"status"+trNum+"\" src=\"\" style='position:relative;top:7px;' " +
                    "><span id=\"statusText"+trNum+"\">暂未测试</span></td></tr>";
                trInfo += itemTr;
                /**
                 * @Author wangjianlin1989@163.com
                 * @Description 匹配一个map对象（所有测试项）
                 * 格式如下：
                 * '{"打开设备":"测试标准1;测试标准2","发卡":"测试标准1;测试标准2",....}'
                 */
                testStandardAll+="\""+oStmt.ColumnValue(2)+"\",";

            }
            testStandardAll = testStandardAll.substring(0,testStandardAll.length-1)+"]";
            Trc.Info("获取到的测试标准信息为："+testStandardAll);
            moduleName = "@.s.c.item."+moduleName;
            Trc.Info("存入模块名称为："+moduleName);
            Trc.Info("获取到的信息为："+trInfo);
            //数据字典存入数据
            Dict.SetString2Utf8(moduleName,trInfo);
            Dict.SetString2Utf8(moduleName+".StandardAll",testStandardAll);
        } catch (err) {
            Trc.Info("runtime err: " + err.description);
            bRet = "failure";
        }
        oStmt.Close();
        oDb.Close();
        return bRet;
    }

    /**
     * @Description:获取所有需要人机交互的测试项及测试标准
     * @param moduleName:测试模块名称
     */
    ObjReadConfig.InitStandardPC = function (moduleName) {
        Trc.Info("获取人机交互测试项");
        var oDb = new ActiveXObject("LiteX.LiteConnection");
        //路径
        oDb.Path = Dict.GetString("*.Conf") + "\\ItemInfo";
        var oStmt = new ActiveXObject("LiteX.LiteStatement");
        var bRet = "success";
        try {
            oDb.Open();
            oStmt.ActiveConnection = oDb;
            //查询指定
            var sSql = String.format("select * from iteminfo where testtype='1' and moduleName='" + moduleName + "' order by seq");
            oStmt.CommandText = sSql;
            oStmt.Prepare();
            var testStandardPc = "[";
            while (!oStmt.step()) {

                /**
                 * @Author wangjianlin1989@163.com
                 * @Description 匹配一个map对象（人机交互测试项目）
                 * 格式如下：
                 * '[{"content":"打开设备","testStandard":"测试标准1;测试标准2"},
                 * {"content":"发卡","testStandard":"测试标准1;测试标准2",....}]'
                 */
                testStandardPc+="{\"content\":\""+oStmt.ColumnValue(1)+"\",\"testStandard\":\""+oStmt.ColumnValue(2)+"\"},";

            }
            testStandardPc = testStandardPc.substring(0,testStandardPc.length-1)+"]";
            Trc.Info("获取到的人机交互项测试标准信息为："+testStandardPc);
            //数据字典存入数据
            Dict.SetString2Utf8("@.s.c.item."+moduleName+".StandardPC",testStandardPc);
        } catch (err) {
            Trc.Info("runtime err: " + err.description);
            bRet = "failure";
        }
        oStmt.Close();
        oDb.Close();
        return bRet;
    }

}());

$(document).ready(function(){
	var logo = $("<span class='logo'></span>");
	var vertical_line = $("<span class='vertical_line'></span>");
	var logo_words = $("<span class='logo_words'>浪潮智能终端测试系统</span>");
	//dict.SetString("@.v.u.Operator.name","王建林");
	var name = dict.GetString("@.v.u.Operator.name");

	var employeeName = $("<span class='employeeName' id='empName'></span>");

	// get the date and time
	var date = $("<span id='date'></span>").itime({format:"yyyy年MM月dd日"});
	var week = $("<br><span id='week'></span>").itime({format:"星期W"});
	var date_container=$("<div class='date_container'></div>");
	date_container.append(date);
	date_container.append(week);
	var time = $("<span id='time'></span>").itime({format:"HH:mm"});
	if(name!=""){
		$("#header").append(logo,vertical_line,logo_words,employeeName,date_container,time);
		$("#empName").html("测试人员姓名："+name);
	}else{
		$("#header").append(logo,vertical_line,logo_words,date_container,time);
	}

});

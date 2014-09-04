/**
 *
 * file:保存个人登录数据
 * des:社区页面全部迁移到个人里面,登录
 * author:ToT
 * date:2014-08-02
*/
//页面初始化

(function(window){
	//初始化页面函数
	window.callbackInit = function(userinfo,playinfo,deviceinfo,serverurl){
		var obj = {};
		if(userinfo != ""){
			userinfo = Base.str2Json(userinfo);
		}
		if(playinfo != ""){
			playinfo = Base.str2Json(playinfo);
		}
		if(deviceinfo != ""){
			deviceinfo = Base.str2Json(deviceinfo);
		}
		obj.userinfo = userinfo;
		obj.playinfo = playinfo;
		obj.deviceinfo = deviceinfo;
		var dataStr = Base.json2Str(obj);
		//保存数据到本地
		Base.offlineStore.set("_localuserinfo",dataStr);
		//保存请求地址到本地
		Base.offlineStore.set("local_server_url",serverurl,true);
		//调用页面初始化方法
		initPage();
	};

	//回调计数,超过10次就不回调了
	var i = 0;
	function initPage(){
		if(Base.page != null){
			if(typeof Base.page.initPageManager == "function"){
				Base.page.initPageManager();
			}
			else{
				if(i < 10){
					i++;
					setTimeout(function(){
						initPage();
					},100);
				}
			}
		}
		else{
			setTimeout(function(){
				initPage();
			},100);
		}
	}
}(window));

/*
$(function(){
	//测试数据
	var userinfo = {};
	userinfo.uid = "132";
	userinfo.bid = "";
	userinfo.gid = "8";
	userinfo.username = "";
	userinfo.nikename = "没啥意思a";
	userinfo.groupname = "爱玩跑队";
	userinfo.isleader = "1";
	userinfo.isbaton = "1";
	var playinfo = {};
	playinfo.mid = 1;
	var deviceinfo = {};
	deviceinfo.deviceid = "tre211";
	deviceinfo.platform = "android";
	window.callbackInit(Base.json2Str(userinfo),Base.json2Str(playinfo),Base.json2Str(deviceinfo),"http://182.92.97.144:8080/");
});
*/
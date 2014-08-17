/**
 *
 * file:保存个人登录数据
 * des:社区页面全部迁移到个人里面,登录
 * author:ToT
 * date:2014-08-02
*/

(function(window){
	//初始化页面函数
	window.callbackInit = function(isLogin,dataClient,ua,pid,nowWidth,nowHeight,jsonParam){
		var isEdit = 0;
		//Trafficeye.httpTip.closed();
		if(isLogin == 0){
			//未登录
			//var data = Trafficeye.str2Json(dataClient);
			var dataclient = "";
			if(jsonParam != ""){
				try{
					dataclient = Trafficeye.str2Json(jsonParam);
				}
				catch(e){}
			}
			//pid,ua,userinfo存入到浏览器本地缓存
			var userinfodata = {
				"pid" : pid,
				"ua" : ua,
				"uid" : "",
				"friend_uid" : "",
				"isEdit" : isEdit,
				"userinfo" :"",
				"dataclient":dataclient
			};
			var dataStr = Trafficeye.json2Str(userinfodata);
			Trafficeye.offlineStore.set("traffic_myinfo",dataStr);
			//Trafficeye.trafficeyeAlert("未登录,请您重新登录");
		}
		else if(isLogin == 1){
			//登录成功,蒙版效果暂不取消，跳转到pre_info.html页面再取消
			var data = Trafficeye.str2Json(dataClient);

			var dataclient = "";
			if(jsonParam != ""){
				try{
					dataclient = Trafficeye.str2Json(jsonParam);
				}
				catch(e){}
			}
			//pid,ua,userinfo存入到浏览器本地缓存
			var userinfodata = {
				"pid" : pid,
				"ua" : ua,
				"uid" : data.uid,
				"friend_uid" : data.uid,
				"isEdit" : isEdit,
				"userinfo" : data,
				"dataclient": dataclient
			};
			var dataStr = Trafficeye.json2Str(userinfodata);
			Trafficeye.offlineStore.set("traffic_myinfo", dataStr);

			/*
            //个人编辑页面点击回退按钮：“初始化个人页面”接口，传递参数isEdit为1（外界直接进入编辑页面），则调用该接口，如果isEdit为0（是从个人中心进入的编辑页面），则直接html里面处理回退。
            if(isEdit == 1)
            {
                Trafficeye.offlineStore.set("traffic_infosurveycar",baseinfoflag);
                Trafficeye.toPage("pre_baseinfo.html");
            }else if(isEdit == 0){
                Trafficeye.toPage("pre_info.html");
            }else if(isEdit == 2)
            {
                var paramFriend = Trafficeye.str2Json(param);
                 userinfodata = {
                    "pid" : pid,
                    "ua" : ua,
                    "uid" : data.uid,
                    "friend_uid" : paramFriend.friend_uid,
                    "isEdit" : isEdit,
                    "userinfo" : Trafficeye.str2Json(dataClient)
                };
                var dataStr1 = Trafficeye.json2Str(userinfodata);
                Trafficeye.offlineStore.set("traffic_myinfo", dataStr1);
                Trafficeye.toPage("pre_info.html");
            }
            */
		}
		else if(isLogin == 2){
			//登录中.....
			var userinfodata = {
				"pid" : pid,
				"ua" : ua,
				"uid" : "",
				"friend_uid" : "",
				"isEdit" : isEdit,
				"userinfo" : ""
			};
			var dataStr = Trafficeye.json2Str(userinfodata);
			Trafficeye.offlineStore.set("traffic_myinfo", dataStr);
			Trafficeye.httpTip.opened();
			Trafficeye.trafficeyeAlert("正在登录中,请稍后");
		}

		/**/
		var pageUrl = location.href;
		var pageName = pageUrl.substring(pageUrl.indexOf("personal") + 9);
		var arr = [];
		arr.push(pageName);
		var jsonStr = Trafficeye.json2Str(arr);
		Trafficeye.offlineStore.set("traffic_pageurl",jsonStr,true);
		
		
		//调用页面初始化方法
		initPage();
	};

	//回调计数,超过10次就不回调了
	var i = 0;
	function initPage(){
		if(typeof initPageManager == "function"){
			window.initPageManager();
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

	//测试登假数据
	//window.callbackInit(1,'{"avatarUrl":"http://mobile.trafficeye.com.cn/media/avatars/43943/2014/06/1404097681236imageL.jpg","badgeNum":2,"birthdate":"2014-06-30","carNum":"","city":"","description":"闹闹，别闹，你到底要闹哪样！","email":"","eventNum":0,"fans":0,"frineds":5,"gender":"M","idNum":"","level":2,"levelPercent":75,"levelPoint":65,"mobile":"","mobileValidate":0,"nextLevel":3,"nextLevelPoint":106,"ownedBadges":[{"desc":"连续七日登录","id":3,"imgName":"badge_big_login_7days.png","name":"忠实用户","obtainTime":"2014-07-12 13:52:40","smallImgName":"badge_login_7days.png"},{"desc":"注册账号","id":1,"imgName":"badge_big_register.png","name":"新人徽章","obtainTime":"2014-06-30 11:06:14","smallImgName":"badge_register.png"}],"qq":"","realName":"闹闹","totalBadges":30,"totalCoins":0,"totalMilage":0.0,"totalPoints":96,"totalTrackMilage":0.0,"uid":"43943","userGroup":0,"userType":"sinaweibo","username":"没啥意思a","wxNum":""}',0,'A_4.0.4,a_3.0.0','864737010861021','{"lon":"116.609495","lat":"39.921096"}','info');
	//window.callbackInit(1,'{"avatarUrl":"http://mobile.trafficeye.com.cn/media/avatars/43943/2014/06/1404097681236imageL.jpg","badgeNum":2,"birthdate":"2013-05-06","carNum":"4444","city":"甘肃 永昌县","description":"闹闹，别闹，你到底要闹哪样！gg","email":"","eventNum":0,"fans":0,"frineds":5,"gender":"F","idNum":"","level":3,"levelPercent":51,"levelPoint":106,"mobile":"15810880522","mobileValidate":1,"nextLevel":4,"nextLevelPoint":153,"ownedBadges":[{"desc":"连续七日登录","id":3,"imgName":"badge_big_login_7days.png","name":"忠实用户","obtainTime":"2014-07-12 13:52:40","smallImgName":"badge_login_7days.png"},{"desc":"注册账号","id":1,"imgName":"badge_big_register.png","name":"新人徽章","obtainTime":"2014-06-30 11:06:14","smallImgName":"badge_register.png"}],"qq":"18588888","realName":"闹闹123111","totalBadges":30,"totalCoins":0,"totalMilage":0.0,"totalPoints":130,"totalTrackMilage":0.0,"uid":"43943","userGroup":0,"userType":"sinaweibo","username":"没啥意思agg","wxNum":"5555"}','A_4.0.4,a_3.0.0','864737010861021',720,1200,'{"lon":"116.609676","lat":"39.920967"}');
	//window.callbackInit(1,'{"avatarUrl":"http://mobile.trafficeye.com.cn/media/avatars/43943/2014/06/1404097681236imageL.jpg","badgeNum":2,"birthdate":"2013-05-06","carNum":"4444Hhhq","city":"甘肃 永昌县","description":"闹闹，别闹，你到底要闹哪样！gg","email":"","eventNum":0,"fans":0,"frineds":4,"gender":"M","idNum":"","level":3,"levelPercent":76,"levelPoint":106,"mobile":"15810880522","mobileValidate":1,"nextLevel":4,"nextLevelPoint":153,"ownedBadges":[{"desc":"连续七日登录","id":3,"imgName":"badge_big_login_7days.png","name":"忠实用户","obtainTime":"2014-07-12 13:52:40","smallImgName":"badge_login_7days.png"},{"desc":"注册账号","id":1,"imgName":"badge_big_register.png","name":"新人徽章","obtainTime":"2014-06-30 11:06:14","smallImgName":"badge_register.png"}],"qq":"18588888","realName":"闹闹123111","totalBadges":30,"totalCoins":0,"totalMilage":0.0,"totalPoints":142,"totalTrackMilage":0.0,"uid":"43943","userGroup":0,"userType":"sinaweibo","username":"没啥意思a","wxNum":"5555"}','A_4.0.4,a_3.0.0','864737010861021',720,1200,'{"publishType":"event","publishId":"37601"}');
}(window));

/**/


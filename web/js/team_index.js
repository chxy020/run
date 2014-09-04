/**
 * <pre>
 * UserInfoManager登录信息管理
 * PageManager页面功能管理
 * </pre>
 *
 * file:跑队设置
 * des:跑队包含未报名,已报名,加入跑队,比赛开始前1小时,比赛开始,比赛结束
 * author:ToT
 * date:2014-08-17
*/

var PageManager = function (obj){
	//继承父类 公用事件
	//TirosBase.apply(this,arguments);
	//继承父类 公用函数
	//TirosTools.apply(this,arguments);
	this.init.apply(this,arguments);
};


PageManager.prototype = {
	constructor:PageManager,
	iScrollX:null,
	httpId:null,
	//页面宽度
	bodyWidth:0,
	//当前用户状态,未注册,未报名,未组队,已组队,0,1,2,3
	userStatus:0,
	//当前比赛状态,报名阶段 - 组队阶段 - 设置第一棒阶段(赛前一小时) - 1小时倒计时进入比赛 - 比赛阶段 - 赛后阶段
	//0-5
	playStatus:0,
	//用户数据
	localUserInfo:{},
	init: function(){
		$(window).onbind("load",this.pageLoad,this);
		$(window).onbind("touchmove",this.pageMove,this);
		this.bindEvent();
	},
	bindEvent:function(){
		//返回按钮事件
		$("#backBtn").onbind("touchstart",this.btnDown,this);
		$("#backBtn").onbind("touchend",this.pageBack,this);
		
	},
	pageLoad:function(evt){
		var w = $(window).width();
		var h = $(window).height();
		//this.ratio = window.devicePixelRatio || 1;
		this.bodyWidth = w;
		//this.bodyHeight = h;

		/*
		//更新比赛状态/用户状态初始化页面
		this.userStatus = 3;
		this.playStatus = 2;
		this.initLoadHtml();

		//请求比赛状态
		this.getCompetitionStatus();
		*/
	},
	pageBack:function(evt){
		Base.pageBack(-1);
	},
	pageMove:function(evt){
		this.moved = true;
	},
	
	/**
	 * 隐藏dom 卸载资源
	*/
	pageHide:function(){
	},
	
	/*
	 * 平台启动页面初始化参数
	*/
	initPageManager:function(){
		this.localUserInfo = Base.getLocalDataInfo();

		//更新比赛状态/用户状态初始化页面
		this.userStatus = this.countUserStatus();
		this.playStatus = this.countPlayStatus();
		this.initLoadHtml();

		//请求比赛状态
		this.getCompetitionStatus();
	},
	btnDown:function(evt){
		//按钮按下通用高亮效果
		this.moved = false;
		var ele = evt.currentTarget;
		$(ele).addClass("curr");
	},
	/**
	 * 跳转到跑队设置页面/创建加入跑队页面
	*/
	teamBtnUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},Base.delay);
		if(!this.moved){
			var type = $(ele).attr("data") || "";
			if(type !== ""){
				if(type == "setup"){
					//保存当前比赛状态
					Base.offlineStore.set("playstatus",this.playStatus,true);
					
					//跳转到跑队设置
					var isleader = this.localUserInfo.userinfo.isleader - 0 || 0;
					if(isleader){
						//领队跳转队员页面
						Base.toPage("team_member.html");
						/*
						if(this.playStatus == 2){
							//直接跳转到设置第一棒
							//跳转到设置第一棒
							Base.toPage("team_setbaton.html");
						}
						else{
							//领队跳转队员页面
							Base.toPage("team_member.html");
						}
						*/
					}
					else{
						//非领队跳转队员页面
						Base.toPage("team_member_play.html");
					}
				}
				else{
					//跳转到创建/加入跑对
				}
			}
			else{
				Base.alert("用户状态错误!!!");
			}
		}
		else{
			$(ele).removeClass("curr");
		}
	},
	
	/**
	 * 初始化滚动插件
	*/
	initiScroll:function(){
		if(this.iScrollX == null){
			/*
			//动态调整滚动插件宽高,
			var w = this.bodyWidth;
			//console.log(w)
			// var h = this.bodyHeight + "px";
			 var iw = w * 3;

			//this.iScroller[0].style.cssText = "";
			$("#viewport").css({"width":w + "px"});
			$("#scroller").css({"width":iw + "px"});
			$(".slide").css({"width":w + "px"});
			$(".scroller").css({"width":w + "px"});
			*/

			this.iScrollX = new IScroll('#wrapper',{
				scrollX:true,
				scrollY:true,
				momentum:false,
				snap:true,
				snapSpeed:400,
				scope:this
			});

			this.iScrollX.on('scrollEnd',function(){
				var scope = this.options.scope;
				var index = scope.cityIndex;
				
				var pageX = this.currentPage.pageX;
				if(index != pageX){
					var indicator = $("#indicator > li");
					indicator.removeClass("active");
					var li = indicator[pageX];
					li.className = "active";
				}
			});
		}
	},
	
	/**
	 * 获取比赛状态
	*/
	getCompetitionStatus:function(){
		var options = {};
		//上报类型 1 手机端 2网站
		options.stype = 1;
		//用户ID,未注册用户无此属性，如果有此属性后台服务会执行用户与设备匹配验证
		options.uid = "132";
		//比赛id,现在只有一个比赛 值=1
		options.mid = 1;
		//客户端唯一标识
		options["X-PID"] = "tre211";
		var reqUrl = this.bulidSendUrl("/match/querymatchinfo.htm",options);
		console.log(reqUrl);
		
		$.ajaxJSONP({
			url:reqUrl,
			context:this,
			success:function(data){
				console.log(data);
				var state = data.state.code - 0;
				if(state === 0){
					this.changeSlideImage(data);
				}
				else{
					var msg = data.state.desc + "(" + state + ")";
					Base.alert(msg);
				}
			}
		});
		/**/
	},


	/*
	 * 根据不同的用户状态和比赛状态动态显示页面
	*/
	initLoadHtml:function(){
		//dom
		var playTimeDiv = $("#playTimeDiv");
		var playStatus = $("#playStatus");
		var distanceDiv = $("#distanceDiv");
		var teamList = $("#teamList");

		//用户状态
		var us = this.userStatus;
		//比赛状态
		var ps = this.playStatus;

		var local = this.localUserInfo;
		var user = local.userinfo || {};
		//用户昵称
		var nikeName = user.nikename || "用户昵称";
		//跑队名称
		var groupName = user.groupname || "跑队名称";

		//显示比赛倒计时和进行时
		if(ps == 5){
			//结束比赛,隐藏时间
			playTimeDiv.hide();
		}
		else{
			//显示时间
			var time = this.countPlayTime();
			playTimeDiv.html(time);
			playTimeDiv.show();
		}
		
		//隐藏文字提示
		if((us == 2 || us == 3) && ps == 3){
			//未组队或者已组队,并且比赛状态再比赛前1小时
			//这时候需要隐藏文字提示
			playStatus.hide();
		}
		else{
			var text = [["",""],["",""],["",""],["",""]];
			//未注册
			text[0].push("2014北京要跑24小时接力赛报名阶段已结束");
			text[0].push("2014北京要跑24小时接力赛报名阶段已结束");
			text[0].push("2014北京要跑24小时接力赛正在进行中");
			text[0].push("2014北京要跑24小时接力赛正已完赛");
			//未登录
			text[1].push("2014北京要跑24小时接力赛报名阶段已结束");
			text[1].push("2014北京要跑24小时接力赛报名阶段已结束");
			text[1].push("2014北京要跑24小时接力赛正在进行中");
			text[1].push("2014北京要跑24小时接力赛正已完赛");
			//未组队
			text[2].push("2014年北京要跑24小时接力赛组队阶段已结束,跑队成员已不可变更.");
			//已组队
			text[3].push("2014年北京要跑24小时接力赛组队阶段已结束,跑队成员已不可变更.");
			
			//获取文字数据
			var t = text[us][ps];
			playStatus.html(t);
			playStatus.show();
		}

		//比赛距离显示/隐藏
		if((us == 0 || us == 1) && (ps == 4 || ps == 5)){
			//未注册或者未登录 并且 比赛阶段/赛后阶段
			var distance = this.raceDistance();
			distanceDiv.html(distance);
			distanceDiv.show();
		}
		else{
			distanceDiv.hide();
		}
		
		var html = [];
		//根据状态显示操作按钮
		if(us == 2 && (ps == 0 || ps == 1 || ps == 2)){
			//显示创建/加入跑队
			html.push('<li>');
			html.push('<div class="head-img"><img src="images/default-head-img.jpg" alt="" width="36" height="36"></div>');
			html.push('<p>');
			html.push('<span>用户昵称</span>');
			html.push('</p>');
			html.push('</li>');
			html.push('<li id="_teamBtn" data="add">创建/加入跑队</li>');
			teamList.addClass("login-btn");
		}
		else if(us == 3 && (ps == 0 || ps == 1 || ps == 2)){
			//显示设置跑队
			html.push('<li>');
			html.push('<div class="head-img"><img src="images/default-head-img.jpg" alt="" width="36" height="36"></div>');
			html.push('<p>');
			html.push('<span>' + nikeName + '</span>');
			html.push('<span>' + groupName + '</span>');
			html.push('</p>');
			html.push('</li>');
			html.push('<li id="_teamBtn" data="setup">跑队设置</li>');
			teamList.addClass("login-btn");
		}
		else if((us == 2 || us == 3) && ps == 3){
			//显示跑队名称
			html.push('<li>');
			html.push('<span class="baton">接力棒</span>');
			html.push('<div class="head-img"><img src="images/default-head-img.jpg" alt="" width="36" height="36"></div>');
			html.push('<p>');
			html.push('<span>用户昵称</span>');
			html.push('<span>所属跑队名称</span>');
			html.push('</p>');
			html.push('</li>');
			teamList.removeClass("login-btn");
		}

		if(html.length > 0){
			teamList.html(html.join(''));
			teamList.show();

			//跑队设置/创建/加入跑队事件
			$("#_teamBtn").onbind("touchstart",this.btnDown,this);
			$("#_teamBtn").onbind("touchend",this.teamBtnUp,this);
		}
	},

	/*
	 * 轮播广告图片
	*/
	changeSlideImage:function(obj){
		var img1 = obj.annoneimg || "";
		var img2 = obj.anntwoimg || "";
		var img3 = obj.annthreeimg || "";

		var html = [];
		if(img1 != ""){
			html.push(slide());
		}
		if(img2 != ""){
			html.push(slide());
		}
		if(img3 != ""){
			html.push(slide());
		}
		function slide(){
			var html = [];
			html.push('<div class="slide">');
			html.push('<img src="images/banner.jpg" alt="" width="320"/>');
			html.push('</div>');
			return html.join('');
		}

		$("#scroller").html(html.join(''));
		this.initiScroll();
		//保存url
		// this.mapOldUrl["cityMap" + code] = imgUrl;
		//获取图片dom
		var img = $("#scroller > div > img");
		var imgUrl = [img1,img2,img3];
		for(var i = 0,len = img.length; i < len; i++){
			//加载图片
			Base.imageLoaded($(img[i]),imgUrl[i]);
		}
	},

	/*
	 * 计算比较倒计时和进行时
	*/
	countPlayTime:function(){
		var time = "距比赛还有：<span>18</span><s>天</s><span>52</span><s>时</s><span>25</span><s>分</s><span>42</span><s>秒</s>";
		return time;
	},

	/*
	 * 获取比赛总距离
	*/
	raceDistance:function(){
		var html = [];
		var km = 1024.08;
		html.push('<p class="p_km">' + km + '<span>KM</span></p>');
		html.push('<p class="p_distance">比塞总距离</p>');
		return html.join('');
	},

	/*
	 * 计算用户当前状态
	*/
	countUserStatus:function(){

		return 3;
	},

	/*
	 * 计算比赛当前状态
	*/
	countPlayStatus:function(){
		return 2;
	},

	/**
	 * 生成请求地址
	 * server请求服务
	 * options请求参数
	*/
	bulidSendUrl:function(server,options){
		var serverUrl = Base.offlineStore.get("local_server_url",true) + "chSports";
		var url = serverUrl + server;

		var data = {};
		/*
		//个人信息
		var myInfo = Trafficeye.getMyInfo();
		var data = {
			"ua":myInfo.ua,
			"pid":myInfo.pid,
			"uid":myInfo.uid,
			"lon":this.lon,
			"lat":this.lat
		};
		*/
		//添加服务参数
		for(var k in options){
			data[k] = options[k];
		}
		//格式化请求参数
		var reqParams = Base.httpData2Str(data);
		var reqUrl = url + reqParams;
		return reqUrl;
	},






	/**
	 * 关闭提示框
	*/
	closeTipBtnUp:function(evt){
		if(evt != null){
			evt.preventDefault();
			var ele = evt.currentTarget;
			$(ele).removeClass("curr");
			if(!this.moved){
				$("#servertip").hide();
				this.isTipShow = false;
			}
		}
		else{
			$("#servertip").hide();
			this.isTipShow = false;
		}
	},
	
	/**
	 * 重试
	*/
	retryBtnUp:function(evt){
		evt.preventDefault();
		var ele = evt.currentTarget;
		$(ele).removeClass("curr");
		if(!this.moved){
			$("#servertip").hide();
			this.isTipShow = false;
			this.getPoiDetail();
		}
	},
	
	/**
	 * 关闭http提示框,中断http请求
	*/
	closeHttpTip:function(){
		this.httpTip.hide();
		this.pageHide();
		//如果是没有POI基础数据弹出的loading,返回到前一页
		if(this.isBack){
			frame.pageBack();
		}
	}
};

//页面初始化
$(function(){
	Base.page = new PageManager({});
});




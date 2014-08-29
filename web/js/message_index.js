/**
 * <pre>
 * UserInfoManager登录信息管理
 * PageManager页面功能管理
 * </pre>
 *
 * file:系统消息
 * author:ToT
 * date:2014-08-27
*/

var PageManager = function (obj){
	this.init.apply(this,arguments);
};


PageManager.prototype = {
	constructor:PageManager,
	iScrollY:null,
	httpId:null,
	//页面宽度
	bodyWidth:0,
	//消息数据
	messageData:null,
	init: function(){
		$(window).onbind("load",this.pageLoad,this);
		$(window).onbind("touchmove",this.pageMove,this);
		this.bindEvent();
	},
	bindEvent:function(){
		//返回按钮事件
		$("#backBtn").onbind("touchstart",this.btnDown,this);
		$("#backBtn").onbind("touchend",this.pageBack,this);

		//翻页事件
		$("#pageBtn").onbind("touchstart",this.btnDown,this);
		$("#pageBtn").onbind("touchend",this.pageBtnUp,this);
	},
	pageLoad:function(evt){
		var w = $(window).width();
		var h = $(window).height();
		//this.ratio = window.devicePixelRatio || 1;
		this.bodyWidth = w;
		//this.bodyHeight = h;

		//获取本地用户数据
		this.localUserInfo = Base.getLocalDataInfo();
		//根据状态初始化页面
		//this.initLoadHtml();

		//请求历史消息记录
		this.getMessageList();
	},
	pageBack:function(evt){
		Base.pageBack(-1);
	},
	pageMove:function(evt){
		evt.preventDefault();
		this.moved = true;
	},
	
	/**
	 * 隐藏dom 卸载资源
	*/
	pageHide:function(){
	},
	
	btnDown:function(evt){
		//按钮按下通用高亮效果
		this.moved = false;
		var ele = evt.currentTarget;
		$(ele).addClass("curr");
	},

	/*
	 * 从队中移除跑友/选择第一棒
	*/
	messageItemUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},Base.delay);
		if(!this.moved){
			var id = ele.id;
			//保存查看详情消息ID
			Base.offlineStore.set("messagedetail_id",id,true);
			Base.toPage("message_detail.html");
		}
		else{
			$(ele).removeClass("curr");
		}
	},

	/**
	 * 初始化滚动插件
	*/
	initiScroll:function(){
		if(this.iScrollY == null){
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
			this.iScrollY = new IScroll('#wrapper', {
				scrollbars: true,
				mouseWheel: true,
				interactiveScrollbars: true,
				shrinkScrollbars: 'scale',
				fadeScrollbars: true
			});
		}
		else{
			this.iScrollY.refresh();
		}
	},
	
	/**
	 * 请求历史消息列表
	*/
	getMessageList:function(){
		var local = this.localUserInfo;
		var user = local.userinfo || {};
		var device = local.deviceinfo || {};

		var options = {};
		//用户ID,
		options.uid = 77;//user.uid || "";
		//客户端唯一标识
		options["X-PID"] = device.deviceid || "";
		//第几页
		options.cpage = 1;
		//每页多少条
		options.pagesize = 30;
		
		var reqUrl = this.bulidSendUrl("/match/announcementlist.htm",options);
		console.log(reqUrl);
		
		$.ajaxJSONP({
			url:reqUrl,
			context:this,
			success:function(data){
				console.log(data);
				//var state = data.state.code - 0;
				state = 0 ;
				if(state === 0){
					this.messageData = data;
					this.changeMessageListHtml(data);
				}
				else{
					var msg = data.state.desc + "(" + state + ")";
					Base.alert(msg);
				}
			}
		});
		/**/
	},

	/**
	 * 修改消息列表
	*/
	changeMessageListHtml:function(obj){
		var data = obj.list || "";
		if(data instanceof Array){
			var ul = [];
			for(var i = 0,len = data.length; i < len; i++){
				var li = [];
				var list = data[i];
				//消息ID
				var annid = list.annid || "";
				//标题
				var title = list.title || "";
				//未读/已读
				var isread = list.isread - 0 || 0;
				//添加时间
				var addtime = list.addtime || "";
				//发送来源
				var sendname = list.sendname || "";
				if(isread == 0){
					li.push('<li id="' + annid + '" class="w">');
				}
				else{
					li.push('<li id="' + annid + '" >')
				}
				li.push('<h3>' + title + '</h3>');
				li.push('<p>' + addtime + '</p>');
				li.push('<span class="jt"></span>');
				li.push('</li>');
				
				ul.push(li.join(''));
			}
			$("#messageList").append(ul.join(''));
			//this.initiScroll();

			//注销消息事件
			$("#messageList > li").rebind("touchstart",this.btnDown,this);
			$("#messageList > li").rebind("touchend",this.messageItemUp,this);
		}
	},

	/*
	 * 根据比赛状态显示页面
	*/
	initLoadHtml:function(){
		var status = Base.offlineStore.get("playstatus",true) - 0;
		switch(status){
			case 1:
				//组队阶段
				$("#wrapper").css("bottom","123px");
				$("#isbatonStatus").hide();
				$("#groupStatus").show();

				//修改密码
				$("#updatePwdBtn").rebind("touchstart",this.btnDown,this);
				$("#updatePwdBtn").rebind("touchend",this.updatePwdBtnUp,this);
				
				//从队中移除跑友/选择第一棒
				$("#memberSetupBtn > li").rebind("touchstart",this.btnDown,this);
				$("#memberSetupBtn > li").rebind("touchend",this.memberSetupBtnUp,this);

				//解散跑队
				$("#disbandBtn").rebind("touchstart",this.btnDown,this);
				$("#disbandBtn").rebind("touchend",this.disbandBtnUp,this);
			break;
			case 2:
				//设置第一棒阶段
				$("#wrapper").css("bottom","40px");
				$("#groupStatus").hide();
				$("#isbatonStatus").show();

				//选择第一棒事件
				$("#selectFirstBtn").rebind("touchstart",this.btnDown,this);
				$("#selectFirstBtn").rebind("touchend",this.memberSetupBtnUp,this);
			break;
		}
	},


	/**
	 * 生成请求地址
	 * server请求服务
	 * options请求参数
	*/
	bulidSendUrl:function(server,options){
		var url = Base.ServerUrl + server;

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
			/*
			if(this.retrytype == "getPoiDetail"){
				this.getPoiDetail();
				this.$shareBox.hide();
				$(this.meetBtn).hide();
			}else if(this.retrytype == "getAibangServerData"){
				this.getAibangServerData();
			}
			*/
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




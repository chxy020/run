/**
 * <pre>
 * UserInfoManager登录信息管理
 * PageManager页面功能管理
 * </pre>
 *
 * file:设置第一棒
 * author:ToT
 * date:2014-08-20
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
	iScrollY:null,
	httpId:null,
	//页面宽度
	bodyWidth:0,
	//队员数据
	memberData:null,
	init: function(){
		$(window).onbind("load",this.pageLoad,this);
		$(window).onbind("touchmove",this.pageMove,this);
		this.bindEvent();
	},
	bindEvent:function(){
		//返回按钮事件
		$("#backBtn").onbind("touchstart",this.btnDown,this);
		$("#backBtn").onbind("touchend",this.pageBack,this);

		//设置第一棒
		$("#selectBatonBtn").onbind("touchstart",this.btnDown,this);
		$("#selectBatonBtn").onbind("touchend",this.selectBatonBtnUp,this);
		
	},
	pageLoad:function(evt){
		var w = $(window).width();
		var h = $(window).height();
		//this.ratio = window.devicePixelRatio || 1;
		this.bodyWidth = w;

		//获取跑友数据
		this.getTeamMemberList();
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

	/**
	 * 选择队员设置
	*/
	itemUp:function(evt){
		evt.preventDefault();
		var ele = evt.currentTarget;
		var dom = $(ele);
		dom.addClass("curr");

		setTimeout(function(){
			dom.removeClass("curr");
			$("#memberList > li").removeClass("curr_d");
			dom.addClass("curr_d");
		},Base.delay);
	},

	/*
	 * 设置第一棒
	*/
	selectBatonBtnUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},Base.delay);
		if(!this.moved){
			//获取选中了哪些
			var li = $("#memberList .curr_d");
			if(li.length > 0){
				var selected = li[0];
				var id = selected.id.split('_')[1];
				var obj = this.memberData.list[id];
				var uid = obj.uid || "";
				this.setupBatonTeamMember(uid);
			}
			else{
				Base.alert("请选择头棒队员");
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
		if(this.iScrollY == null){
			this.iScrollY = new IScroll('#wrapper', {
				scrollbars: true,
				mouseWheel: true,
				click: true,
				tap: true,
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
	 * 请求跑队队员列表
	*/
	getTeamMemberList:function(){
		var options = {};
		//上报类型 1 手机端 2网站
		options.stype = 1;
		//用户ID,
		options.uid = "132";
		//组ID
		options.gid = 7;
		//比赛id,现在只有一个比赛 值=1
		//options.mid = 1;
		//客户端唯一标识
		options["X-PID"] = "tre211";
		//第几页
		options.cpage = 1;
		//每页多少条
		options.pagesize = 30;

		var reqUrl = this.bulidSendUrl("/match/querygroupry.htm",options);
		console.log(reqUrl);
		
		$.ajaxJSONP({
			url:reqUrl,
			context:this,
			success:function(data){
				console.log(data);
				var state = data.state.code - 0;
				if(state === 0){
					this.memberData = data;
					this.changeMemberHtml(data);
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
	 * 设置第一棒
	*/
	setupBatonTeamMember:function(uid){
		var options = {};
		//上报类型 1 手机端 2网站
		options.stype = 1;
		//用户ID,未注册用户无此属性，如果有此属性后台服务会执行用户与设备匹配验证
		options.uid = "132";
		//组ID
		options.gid = 7;
		//比赛id,现在只有一个比赛 值=1
		options.mid = 1;
		//设置第一棒人员uid
		options.batid = uid;
		//客户端唯一标识
		options["X-PID"] = "tre211";
		var reqUrl = this.bulidSendUrl("/match/setbaton.htm",options);
		console.log(reqUrl);
		
		$.ajaxJSONP({
			url:reqUrl,
			context:this,
			success:function(data){
				console.log(data);
				var state = data.state.code - 0;
				if(state === 0){
					Base.alert("第一棒设置成功");
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
	 * 修改队员列表
	*/
	changeMemberHtml:function(obj){
		var data = obj.list || "";
		if(data instanceof Array){
			var ul = [];
			for(var i = 0,len = data.length; i < len; i++){
				var li = [];
				var list = data[i];
				//是否头棒 1/0 是/否
				var isbaton = list.isbaton - 0 || 0;
				//是否领队 1/0  是/否
				var isleader = list.isleader - 0 || 0;
				var nickname = list.nickname || "昵称";
				//头像
				var imgpath = list.imgpath || "images/default-head-img.jpg";
				if(imgpath != "images/default-head-img.jpg"){
					imgpath = Base.ServerUrl + imgpath;
				}

				//设置第一棒,原来的第一棒不显示
				if(isbaton !== 1){
					li.push('<li id="member_' + i + '">');
					li.push('<div class="head-img"><img src="' + imgpath + '" alt="" width="36" height="36"></div>');
					li.push('<p>' + nickname + '</p>');
					li.push('</li>');
					ul.push(li.join(''));
				}
			}

			$("#memberList").append(ul.join(''));

			$("#memberList > li").onbind("click",this.itemUp,this);

			this.initiScroll();
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




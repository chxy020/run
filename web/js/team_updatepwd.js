/**
 * <pre>
 * UserInfoManager登录信息管理
 * PageManager页面功能管理
 * </pre>
 *
 * file:修改跑队密码
 * author:ToT
 * date:2014-08-19
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

		//修改密码
		$("#updatePwdBtn").onbind("touchstart",this.btnDown,this);
		$("#updatePwdBtn").onbind("touchend",this.updatePwdBtnUp,this);
		
	},
	pageLoad:function(evt){
		var w = $(window).width();
		var h = $(window).height();
		//this.ratio = window.devicePixelRatio || 1;
		this.bodyWidth = w;

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
	
	btnDown:function(evt){
		//按钮按下通用高亮效果
		this.moved = false;
		var ele = evt.currentTarget;
		$(ele).addClass("curr");
	},

	/*
	 * 修改密码
	*/
	updatePwdBtnUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},Base.delay);
		if(!this.moved){
			//修改密码
			
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
	
	/*
	 * 修改密码
	*/
	setTeamNewPwd:function(){
		var options = {};
		//上报类型 1 手机端 2网站
		options.stype = 1;
		//组ID
		options.gid = 7;
		//第几页
		options.cpage = 1;
		//每页多少条
		options.pagesize = 10;
		//用户ID,未注册用户无此属性，如果有此属性后台服务会执行用户与设备匹配验证
		options.uid = "132";
		//比赛id,现在只有一个比赛 值=1
		//options.mid = 1;
		//客户端唯一标识
		options["X-PID"] = "tre211";
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
					//var msg = data.state.desc + "(" + state + ")";
					//Base.alert(msg);
					var data = {"annoneimg":"http://182.92.97.144:8080/chSports/image/20140730/120_40BC81A017B611E4B1CB9B7C1599F3DC.jpg","annoneurl":"http://www.sohu.com","annthreeimg":"http://182.92.97.144:8080/chSports/image/20140730/120_40BC338017B611E4B1CBE6607330F3AA.jpg","annthreeurl":"http://www.163.com","anntwoimg":"http://182.92.97.144:8080/chSports//image/20140731/120_5D4A5EC017D711E49EC0E636B1764AE2.jpg","anntwourl":"http://www.sina.com","endtime":"2014-08-14 16:11:44","issign":1,"mid":1,"mname":"董老板的蜗牛赛","signendtime":"2015-06-08 16:05:59","signstarttime":"2014-06-08 16:05:59","signstate":1,"starttime":"2014-08-13 16:11:35","state":{"code":0,"desc":"请求成功"}};
					this.changeSlideImage(data);
				}
			}
		});
		/**/
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




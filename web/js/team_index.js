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
	init: function(){
		$(window).onbind("load",this.pageLoad,this);
		$(window).onbind("touchmove",this.pageMove,this);
		this.bindEvent();
	},
	bindEvent:function(){
		//返回按钮事件
		$("#backBtn").onbind("touchstart",this.btnDown,this);
		$("#backBtn").onbind("touchend",this.pageBack,this);

		//跑队设置
		$("#teamSetupBtn").onbind("touchstart",this.btnDown,this);
		$("#teamSetupBtn").onbind("touchend",this.teamSetupBtnUp,this);
		
	},
	pageLoad:function(evt){
		var w = $(window).width();
		var h = $(window).height();
		//this.ratio = window.devicePixelRatio || 1;
		this.bodyWidth = w;
		//this.bodyHeight = h;

		//请求比赛状态
		this.getCompetitionStatus();
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
	/**
	 * 跑队设置页面
	*/
	teamSetupBtnUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},Base.delay);
		if(!this.moved){
			var isleader = 0;
			if(isleader){
				//领队跳转队员页面
				Base.toPage("team_member.html");
			}
			else{
				//非领队跳转队员页面
				Base.toPage("team_member_play.html");
			}
		}
		else{
			$(ele).removeClass("curr");
		}
	},
	
	/**
	 * 查看地图,周边搜索,到这里去,拨打电话按钮事件
	*/
	funBtnUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},TGlobal.delay);
		if(!this.moved){
			var id = ele.id;
			switch(id){
				case "mapBtn":
					//查看地图
					this.showPoiMap();
				break;
				case "roundBtn":
					//周边搜索
					this.loadRoundSearchPage();
				break;
				case "planBtn":
					//到这里去
					this.loadRouteplanPage();
				break;
				case "telBtn":
					//拨打电话
					this.callPoiTel();
				break;
			}
		}
		else{
			$(ele).removeClass("curr");
		}
	},
	
	/**
	 * 设置POI为聚会目的地,跳转到结伴同行主页
	*/
	meetBtnUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},TGlobal.delay);
		
		if(!this.moved && this.detail !== null){
			//frame.loadWebView("meet/togetherIndex.html");
			var meetMsg = {};
			meetMsg.poigid = this.detail.poigid || "";
			meetMsg.addressName = this.detail.name || "";
			meetMsg.address = this.detail.address || "";
			meetMsg.addressLat = this.detail.lat || "";
			meetMsg.addressLon = this.detail.lon || "";
			meetMsg.meetTime = "";
			
			var str = JSON.stringify(meetMsg);
			
			doLua.exec("webres/meet/lua/meet.lua","WebSaveMeetMessage",{
				namespace:"meet",
				condi:["poidetail_meet_source",str],
				callback:function(id,state){
					if(state == 1){
						frame.loadWebView("meet/togetherIndex.html");
					}
					else{
						base.alert("跳转结伴同行页面错误");
					}
				}
			},this);
		}
		else{
			$(ele).removeClass("curr");
		}
	},
	
	/**
	 * 拨打爱帮电话,如果显示了,POI拨打电话不显示
	*/
	ppcBtnUp:function(evt){
		var ele = evt.currentTarget;
		$(ele).removeClass("curr");
		if(!this.moved && this.detail !== null){
			var obj = this.detail;
			//拨个PPC电话,要这么多参数??
			var tel = {};
			tel.phone = this.ppc.phone || "";
			tel.poigid = obj.poigid;
			tel.name = obj.name;
			//真心搞不懂,这货要给传平台干嘛,统计?
			tel.sortcode = obj.themeflag || "";
			
			tel.udp = "1";;
			tel.type = "ppc";
			tel.source = "0";
			
			this.callPlatTel(tel,true);
		}
	},
	
	/**
	 * 调用平台插件拨打电话,POI拨打电话/PPC拨打电话
	*/
	callPlatTel:function(tels,b){
		doLua.exec("webres/lua/poiinfo.lua","WebPhoneCall",{
			namespace:"poiinfo",
			condi:[JSON.stringify([tels]),b],
			callback:function(id,state){
				if(state == 1){
					setTimeout(function(){frame.phoneCall();},100);
				}
			}
		},this);
	},
	
	/**
	 * 点击快捷酒店全日房,更多房型,跳转到本地酒店详情页面
	*/
	hotelLiUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},TGlobal.delay);
		if(!this.moved){
			doLua.exec("webres/lua/poiinfo.lua","WebGetMoreHotel",{
				namespace:"poiinfo",
				callback:function(id,state,data){
					frame.loadWebView("hotel/hoteldetail.html");
				}
			},this);
		}
		else{
			$(ele).removeClass("curr");
		}
	},
	
	/**
	 * 点击团购,跳转到内置浏览器
	*/
	groupLiUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},TGlobal.delay);
		if(!this.moved){
			var id = ele.id.split("_") || [];
			var url = this.groupData[id[1]];
			doLua.exec("webres/lua/poiinfo.lua","WebLoadGroupUrl",{
				namespace:"poiinfo",
				condi:[url],
				callback:function(id,state,nettype){
					//先判断有没有开启网络
					if(nettype == 0){
						base.serverTip.apply(this,["6000"]);
						return;
					}
					if(state == 1){
						frame.loadHttpView(1);
					}
					else{
						base.alert("跳转团购网页错误");
					}
				}
			},this);
		}
	},
	
	/**
	 * 点击特价门票,跳转到本地特价门票详情页面
	*/
	ticketBtnUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},TGlobal.delay);
		if(!this.moved){
			doLua.exec("webres/lua/poiinfo.lua","WebLoadTicketDetail",{
				namespace:"poiinfo",
				callback:function(id,state){
					frame.loadWebView("ticket/ticketdetail.html");
				}
			},this);
		}
		else{
			$(ele).removeClass("curr");
		}
	},
	
	/**
	 * 1.保存商户介绍内容
	 * 2.跳转到查看全文商户介绍页面
	 * 3.和查看单条评论页面用的是同一页面
	*/
	storeBtnUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},TGlobal.delay);
		if(!this.moved){
			frame.loadWebView("storedetail.html");
			//太乱了,最新需求,直接跳过去请求商户介绍详情
			/*
			if(this.isAibang == true){
				var source = "2",
				type = "3",
				obj = this.taibang;
				var url = "coupon/business.html";
				this.saveServerData(source, type, obj, url);
				return;
			}
			if(this.detail_url != "" && this.detail_url != undefined){
				this.openInsideBrowser(this.detail_url);
			}else{
				var obj = this.detail,
				serverdate = obj.serverdate,
				hoteldetail = serverdate.hoteldetail,
				description = hoteldetail.detail,
				saveObj = {};
				saveObj.description = this.filterSpecialStr(description);
				saveObj.fromBusiness = true;
				doLua.exec("webres/lua/websystem.lua","WebSetData",{
					namespace:"database",
					condi:['poiOneCommentData',JSON.stringify(saveObj)],
					callback:function(id,state,data){
						if(state==1){
							frame.loadWebView("comment/onecomment.html");
						}
					}
				},this);
			}
			*/
		}
	},
	
	/**
	 * POI分享,发送该地点给好友,先不改,等以后在仔细想想
	*/
	sharePoiBtnUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},TGlobal.delay);
		if(!this.moved && this.detail !== null){
			var name = this.detail.name == "地图点选位置" ? "目标" : this.detail.name;
			var lon = this.detail.lon;
			var lat = this.detail.lat;
			var poigid = typeof(this.detail.poigid) == "undefined" ? "" : this.detail.poigid;
			var tel = typeof(this.detail.tel) == "undefined" ? "" : this.detail.tel;
			var address = this.detail.address;
			var source = 0;
			//poitype如果属性值为1,则为我的位置,其他情况都为非我的位置
			var poitype = typeof(this.detail.poitype) == "undefined" ? "" : (this.detail.poitype - 0);
			if(poitype == 1){
				source = 1;
			}
			//重置POI来源标识
			//this.ismsgpush = false;
			//显示联网提示
			this.httpTip.show();
			this.httpId = doLua.exec("webres/lua/poiinfo.lua","WebSharePoi",{
				namespace:"poiinfo",
				condi:[poigid,name,address,tel,lon,lat,source],
				callback:function(id,state){
					//隐藏联网提示
					this.httpTip.hide();
					this.httpId = null;
					if(state == 1){
						//setTimeout(function(){frame.sharePoi();},100);
						setTimeout(function(){
							frame.busShare("");
						},100);
					}
					else{
						base.alert("分享POI错误");
					}
				}
			},this);
		}
		else{
			$(ele).removeClass("curr");
		}
	},
	
	/**
	 * 附近公交站点/附近公交路线
	*/
	busBtnUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},TGlobal.delay);
		if(!this.moved){
			var id = ele.id;
			switch(id){
				case "busPoint":
					//附近公交站点
					this.nearBusPoint();
				break;
				case "busLine":
					//附近公交路线
					this.nearBusLine();
				break;
			}
		}
		else{
			$(ele).removeClass("curr");
		}
	},
	
	/**
	 * 点击POI详情单张图片事件,查看当前这张图片的大图
	*/
	poiImgBtnUp:function(evt){
		var img = 0;
		if(evt != null){
			if(!this.moved){
				var ele = evt.currentTarget;
				var id = ele.id.split("_");
				if(id.length > 0){
					img = id[1];
				}
			}
			else{
				return;
			}
		}
		var str = JSON.stringify(this.imgData);
		doLua.exec("webres/lua/poiinfo.lua","WebSetImgListData",{
			namespace:"poiinfo",
			condi:[img,str],
			callback:function(id,state,data){
				frame.loadWebView("poiimgshow.html");
			}
		},this);
	},
	
	/**
	 * 跳转到更多图片
	*/
	moreImgBtnUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},TGlobal.delay);
		if(!this.moved){
			frame.loadWebView("poiimglist.html");
		}
	},
	
	/**
	 * 跳转到更多评论页面
	*/
	moreCommentBtnUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},TGlobal.delay);
		if(!this.moved){
			frame.loadWebView("comment/morecomment.html");
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
					//var msg = data.state.desc + "(" + state + ")";
					//Base.alert(msg);
					var data = {"annoneimg":"http://182.92.97.144:8080/chSports/image/20140730/120_40BC81A017B611E4B1CB9B7C1599F3DC.jpg","annoneurl":"http://www.sohu.com","annthreeimg":"http://182.92.97.144:8080/chSports/image/20140730/120_40BC338017B611E4B1CBE6607330F3AA.jpg","annthreeurl":"http://www.163.com","anntwoimg":"http://182.92.97.144:8080/chSports//image/20140731/120_5D4A5EC017D711E49EC0E636B1764AE2.jpg","anntwourl":"http://www.sina.com","endtime":"2014-08-14 16:11:44","issign":1,"mid":1,"mname":"董老板的蜗牛赛","signendtime":"2015-06-08 16:05:59","signstarttime":"2014-06-08 16:05:59","signstate":1,"starttime":"2014-08-13 16:11:35","state":{"code":0,"desc":"请求成功"}};
					this.changeSlideImage(data);
				}
			}
		});
		/**/
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
	 * 获取星级和评论html
	*/
	getStarHtml:function(level,price){
		var html = [];
		//评论星级就不用外层div, -1代表评论
		if(price !== -1){
			html.push('<div class="poipingl pfr">');
		}
		
		//level = 0 || 9标识 无星级
		if(level != 0 && level != 9 && level !== ""){
			html.push('<div class="score">');
			var star = 1;
			//默认5个空星
			var starArr = ['<div class="empty"></div>','<div class="empty"></div>','<div class="empty"></div>','<div class="empty"></div>','<div class="empty"></div>'];
			//如果大于5,做5处理
			level = level > 5 ? 5 : level;
			while(star <= level){
				starArr[star - 1] = '<div class="full"></div>';
				star++;
			}
			if((star - 1) != level){
				starArr[star - 1] = '<div class="half"></div>';
			}
			html.push(starArr.join(''));
			html.push("</div>");
		}
		if(price === -1){
			html.push('</div>');
		}
		else{
			//均价
			if(price !== -1 && price !== ""){
				html.push('<span>人均:￥' + price + '</span>');
				html.push('</div>');
			}
		}
		return html.join('');
	},
	
	/**
	 * 修改POI详情页面基础数据
	 * obj POI详情数据对象
	*/
	changePoiBasicHtml:function(obj){
		
		var poibasic = obj.poibasic || {};
		//POI名称
		var name = poibasic.name || "";
		//POI地址
		var address = poibasic.address || "";
		//图标标识
		var flag = poibasic.themeflag || "";
		//电话
		var tel = poibasic.tel || "";
		//判断POI是否已收藏
		var pid = poibasic.pid || "";
		
		//扩展数据 星级和人均
		var level = "";
		var price = "";
		var expand = obj.expand || "";
		if(expand !== ""){
			level = expand.starlevel || "";
			price = expand.price || "";
		}
		
		//ppc电话
		var ppc = obj.ppc || "";
		var phone = "";
		if(ppc !== ""){
			phone = ppc.phone || "";
			
			//保存电话数据
			this.ppc = obj.ppc;
		}
		
		//酒店
		var hotel = obj.hoteldetail || "";
		//出售价格
		var salePrice = "";
		//最低价格
		var lowPrice = "";
		if(hotel !== ""){
			salePrice = hotel.saleprice || "";
			lowPrice = hotel.lowprice || "";
		}
		
		//团购数据
		var deals = obj.deals || [];
		
		//特价门票
		var ticket = obj.scenery || "";
		//最低发布价
		var tpp = "";
		//最低门市价
		var tsp = "";
		if(ticket !== ""){
			tpp = ticket.pubprice || "";
			tsp = ticket.saleprice || "";
		}
		
		//商户介绍
		var description = obj.description || "";
		//是否显示商户介绍栏目
		var ds = 0;
		if(description !== ""){
			ds = description.isshow - 0 || 0;
		}
		
		
		//修改title
		this.titleName.innerHTML = name;
		
		//修改收藏夹按钮状态
		if(pid !== ""){
			//已收藏
			var favBtn = this.$dom("favBtn");
			favBtn.className = "topbtn_r text3";
			favBtn.innerHTML = "<a>已收藏</a>";
		}
		else{
			//未收藏
			var favBtn = this.$dom("favBtn");
			favBtn.className = "topbtn_r";
			favBtn.innerHTML = "<a>收藏</a>";
		}
		
		//如果是我的位置,修改POI分享标签为"把我的位置发送给好友"
		//到这里去不可点击
		if(name == "我的位置"){
			this.$dom("planBtn").className = "sl notel";
			$("#shareBtn > a").text("把我的位置发送给好友");
		}
		else{
			this.$dom("planBtn").className = "sl";
			$("#shareBtn > a").text("发送该地点给好友");
		}
		
		var html = [];
		html.push('<p id="poiNameTxt" class="poi_nameb">');
		html.push(name);
		//插入优惠团等图标
		if(flag !== ""){
			var fh = themeHtml(flag);
			html.push(fh);
		}
		html.push('</p>');
		//插入星级,人均
		if(level !== "" || price !== ""){
			var sh = this.getStarHtml(level,price);
			html.push(sh);
			
			html.push('<p class="poi_t">' + address + '</p>');
		}
		else{
			//如果两个属性都没有,调整margin-bottom让显示区域一样高
			html.push('<p class="poi_t" style="margin-bottom:25px;">' + address + '</p>');
		}
		
		
		this.$dom("basicData").innerHTML = html.join('');
		
		
		//先判断有没有PPC电话,有PPC电话,普通拨打电话不能点击
		if(phone !== ""){
			this.$dom("ppcBtn").style.display = "block";
			this.$dom("telBtn").className = "sd notel";
			
			//绑定拨打爱邦电话事件
			$("#ppcBtn > li").rebind("touchstart",this.btnDown,this);
			$("#ppcBtn > li").rebind("touchend",this.ppcBtnUp,this);
		}
		else{
			this.$dom("ppcBtn").style.display = "none";
			//判断有米有电话,有电话 就让点击
			if(tel !== ""){
				this.$dom("telBtn").className = "sd";
			}
		}
		
		//判断有没有酒店数据
		if(lowPrice !== ""){
			var ph = "";
			if(salePrice !== "" ){
				ph = "￥" + lowPrice + "元起<s>￥" + salePrice + "</s>";
			}
			else{
				ph = "￥" + lowPrice + "元起";
			}
			this.$dom("hotelPrice").innerHTML = ph;
			this.$dom("hotelDiv").style.display = "block";
			
			//绑定快捷酒店LI跳转事件
			$("#hotelUl > li").rebind("touchstart",this.btnDown,this);
			$("#hotelUl > li").rebind("touchend",this.hotelLiUp,this);
		}
		else{
			this.$dom("hotelDiv").style.display = "none";
		}
		
		//判断有没有团购数据
		if(deals instanceof Array){
			var ghtml = [];
			for(var g = 0,glen = deals.length; g < glen; g++){
				var gt = deals[g].title || "";
				var gurl = deals[g].deal_h5_url || "";
				if(gurl != ""){
					ghtml.push('<ul class="common_list more_list spacing5">');
					ghtml.push('<li id="g_' + g + '" class="t"><a>' + gt + '</a><span class="icon"></span><span class="libg_arrow"></span></li>');
					ghtml.push('</ul>');
					
					//保存数据
					this.groupData.push(gurl);
				}
			}
			
			if(ghtml.length > 0){
				this.$dom("groupDiv").innerHTML = ghtml.join('');
				this.$dom("groupDiv").style.display = "block";
				
				//绑定快捷酒店LI跳转事件
				$("#groupDiv > ul > li").rebind("touchstart",this.btnDown,this);
				$("#groupDiv > ul > li").rebind("touchend",this.groupLiUp,this);
			}
		}
		
		//判断有没有特价门票数据
		if(tpp !== "" && tsp !== ""){
			var th = "￥" + tpp + "元<s>原价" + tsp +"</s>";
			this.$dom("ticketPrice").innerHTML = th;
			this.$dom("ticketBtn").style.display = "block";
			
			//绑定特价门票LI跳转事件
			$("#ticketBtn > li").rebind("touchstart",this.btnDown,this);
			$("#ticketBtn > li").rebind("touchend",this.ticketBtnUp,this);
		}
		else{
			this.$dom("ticketBtn").style.display = "none";
		}
		
		//判断是否要显示商户介绍栏目
		if(ds === 1){
			this.$dom("storeBtn").style.display = "block";
			
			//绑定商户介绍详情事件
			$("#storeBtn > li").onbind("touchstart",this.btnDown,this);
			$("#storeBtn > li").onbind("touchend",this.storeBtnUp,this);
		}
		else{
			this.$dom("storeBtn").style.display = "none";
		}
		
		
		//图标html
		function themeHtml(themeflag){
			var html = [];
			var arrTheme = themeflag.split(',');
			//<span class="poi_s c">团</span>
			var iconObj = {
				"54":"<span class='poi_s b'>订</span>",
				"5":"<span class='poi_s a'>惠</span>",
				"55":"<span class='poi_s a'>惠</span>"
			};
			html.push('<span class="poi_special_box">');
			//5,55都显示惠,只显示一次
			var hui = false;
			for(var j = 0; j < arrTheme.length; j++){
				var mark = arrTheme[j] + "";
				if(mark != "55" && mark != "5"){
					html.push(iconObj[mark]);
				}
				else{
					if(!hui){
						html.push(iconObj[mark]);
						hui = true;
					}
				}
			}
			html.push('</span>');
			return html.join('');
		}
		
		
	},
	
	/**
	 * 添加更多图片,修改Dom结构
	*/
	changePoiImgHtml:function(obj){
		//图片数据
		var imgs = obj.pic_urls || "";
		
		if(imgs instanceof Array){
			var html = [];
			//html.push('<div class="driver_info">');
			html.push('<div class="pj_title">图片</div>');
			html.push('<div class="poiimg"><ul id="imgsUl" >');
			
			//插入图片LI结构
			//图片异步加载器
			this.imageLoader.proxy = this;
			this.imageLoader.onOneComplete = function(index,url){
				//单张图片加载完成,但是没有最后一张,全部加载完成走onComplete
				//为了搞定这个页面图片下拉,就管第一张了,不管后面了
				if(index === 0){
					//改变头部样式显示第一张图片
					this.changeHeadImg(url);
				}
			};
			//如果图片大于3张,只取3张图片
			//var len = imgs.length > 3 ? 3 : imgs.length;
			var len = imgs.length || 0;
			for(var i = 0; i < len; i++){
				if(i < 3){
					html.push('<li><img id="img_' + i + '" src="images/default/default.jpg" alt="" width="80" height="80" /></li>');
				}
				this.imgData.push(imgs[i].url_path);
			}
			
			html.push('</ul></div>');
			html.push('<ul class="poilist_no_a_i">');
			html.push('<li id="moreImgBtn" >更多图片<span class="libg_arrow"></span></li>');
			html.push('</ul>');
			
			this.$dom("poiImg").innerHTML = html.join('');
			
			//图片异步加载
			var imgDom = $("#imgsUl > li > img");
			for(var j = 0,len = imgDom.length; j < len; j++){
				var d = imgDom[j];
				var path = imgs[j].url_path;
				this.imageLoader.addLoad(path,d,null);
			}
			this.imageLoader.startLoad();
			
			//注册图片事件
			imgDom.rebind("touchstart",this.btnDown,this);
			imgDom.rebind("touchend",this.poiImgBtnUp,this);
			//更多图片事件
			$("#moreImgBtn").rebind("touchstart",this.btnDown,this);
			$("#moreImgBtn").rebind("touchend",this.moreImgBtnUp,this);
		}
	},
	
	/**
	 * 改变头部样式,显示图片,控制图片下拉效果
	*/
	changeHeadImg:function(url){
		if(url != ""){
			//改变背景图片URL
			$("#headBgImg > img")[0].src = url;
			//改变背景样式
			this.$dom("headBg").className = "poi-box";
			//控制下拉头部透明度
			this.headImg = true;
		}
	},
	
	/**
	 * 添加POI评论数据,修改Dom结构
	*/
	changeCommentHtml:function(obj){
		var data = obj.data || "";
		if(data instanceof Array){
			var comment = data[0] || "";
			if(comment !== ""){
				var title = comment.commenter || "普通用户";
				var level = comment.starlevel || "";
				var content = comment.comment_content || "";
				var source = comment.comment_source || "";
				var time = comment.comment_time || "";
				
				var html = [];
				html.push('<div class="pj_title">评价信息</div>');
				html.push('<ul class="poitext">');
				html.push('<li><h5><span class="poipjbt">');
				html.push(title);
				//插入星级
				var sh = this.getStarHtml(level,-1);
				html.push(sh);
				html.push('</span></h5>');
				html.push(content);
				html.push('<span>来源：' + source + '</span>');
				html.push('<div class="time">' + time + '</div>');
				html.push('</li></ul>');
				
				//是否显示更多评论
				if(data.length > 1){
					html.push('<ul class="poilist_no_a_i">');
					html.push('<li id="moreCommentBtn" >更多评论<span class="libg_arrow"></span></li>');
					html.push('</ul>');
				}
				
				this.$dom("poiComment").innerHTML = html.join('');
				
				if(data.length > 1){
					//更多图片事件
					$("#moreCommentBtn").rebind("touchstart",this.btnDown,this);
					$("#moreCommentBtn").rebind("touchend",this.moreCommentBtnUp,this);
				}
			}
		}
		
	},
	
	/**
	 * 添加POI到收藏夹成功,修改POI名称和按钮状态
	*/
	changePoiNameAndBtnHtml:function(obj){
		var favBtn = this.$dom("favBtn");
		favBtn.className = "topbtn_r text3";
		favBtn.innerHTML = "<a>已收藏</a>";
		var name = obj.name || "";
		if(name !== ""){
			this.$dom("poiNameTxt").innerText = name;
			this.$dom("titleName").innerText = name;
		}
		this.detail.pid = obj.pid;
	},
	
	/**
	 * 点击收藏按钮,未登录的情况下跳转到登录页面
	*/
	loadLoginPage:function(){
		doLua.exec("webres/lua/poiinfo.lua","WebLoadLoginPage",{
			namespace:"poiinfo",
			callback:function(id,state){
				frame.loadWebView("user/login.html");
			}
		},this);
	},
	
	/**
	 * 删除收藏夹
	*/
	delFavorite:function(pid){
		doLua.exec("webres/lua/poiinfo.lua","WebDelFavorite",{
			namespace:"poiinfo",
			condi:[pid],
			callback:function(id,state,msg){
				if(state == 1){
					this.detail.pid = "";
					var favBtn = this.$dom("favBtn");
					favBtn.className = "topbtn_r";
					favBtn.innerHTML = "<a>收藏</a>";
					base.alert("收藏夹删除成功");
				}
				else{
					base.alert("收藏夹删除错误");
				}
			}
		},this);
	},
	
	/**
	 * 公交导航,要优化等以后我做完详情的,再看这个东东
	*/
	busNavigation:function(){
		if(this.detail !== null){
			var obj = this.detail;
			var lon = obj.lon || "";
			var lat = obj.lat || "";
			if(lon !== "" && lat !== ""){
				var t = new Date();
				var h = t.getHours();
				var m = t.getMinutes();
				var s = t.getSeconds();
				var times = h*3600 + m*60 + s;
				//公交规划数据
				var dd = {};
				//slon 起点经度(int)
				dd.slon = "";
				//slat 起点纬度(int)
				dd.slat = "";
				//elon 终点经度(int)
				dd.elon = lon;
				//elat 终点经度(int)
				dd.elat = lat;
				//egid 终点gid(string) 没有可以传""
				dd.egid = obj.gid || "";
				//plantype (int) 1最快 2少换乘 4少步行 8地铁优先 16不坐地铁
				dd.plantype = "1";
				//needline (int) 是否需要线路数据 0不需要 1需要
				dd.needline = "0";
				//time 公交规划起始时间(int) 公交规划的时间点,为当天零点到该时间点的秒数
				dd.time = times;
				dd.ename = obj.name;
				
				//不知道干嘛用的  cxy
				//this.start = true;
				
				doLua.exec("webres/lua/poiinfo.lua","WebSaveBusData",{
					namespace:"poiinfo",
					condi:[JSON.stringify(dd)],
					callback:function(id,state,data){
						this.start = false;
						if(state == 1){
							setTimeout(function(){
								frame.loadWebView("bus/busselect.html");
							},100);
						}else if (state == 2){
							base.alert("暂时无法获取位置，请开启定位服务");
						}else{
							base.alert("保存公交导航数据失败");
						}
					}
				},this);
			}
			else{
				base.alert("没有获取到POI经纬度,公交规划错误");
			}
		}
	},
	
	/**
	 * 开始导航,驾车路线
	*/
	carNavigation:function(){
		if(this.detail !== null){
			var obj = this.detail;
			//设置路线规划起/终点, 起点我的位置,都是0,终点为POI的经纬度
			var lon = obj.lon || "";
			var lat = obj.lat || "";
			var poigid = obj.poigid || "";
			var name = obj.name || "";
			
			//判断是不是我的位置,我的位置 = 1,开始导航跳转路线规划页面
			var poitype = obj.poitype - 0 || "";
			if(poitype === 1){
				//终点为空,传一个空对象
				doLua.exec("webres/lua/poiinfo.lua","WebLoadRouteplanPage",{
					namespace:"poiinfo",
					condi:["{}"],
					callback:function(id,state){
						this.pageHide();
						frame.loadWebView("routeplan.html");
					}
				},this);
			}
			else{
				if(lon !== "" && lat !== ""){
					var obj = {};
					//起点
					obj.positions = [];
					obj.positions[0] = {"lon":"0","lat":"0","poigid":""};
					//终点
					obj.positions[1] = {"name":name,"lon":lon + "","lat":lat + "","poigid":poigid + ""};
					//数据转成字符串,传给lua接口
					var str = JSON.stringify(obj);
					
					doLua.exec("webres/lua/poiinfo.lua","WebSaveCarData",{
						namespace:"poiinfo",
						condi:[str],
						callback:function(id,state,data){
							this.pageHide();
							setTimeout(function(){
								frame.routeView();
							},300);
						}
					},this);
				}
				else{
					base.alert("没有获取到POI经纬度,驾车路线规划错误");
				}
			}
		}
		else{
			base.alert("没有POI数据");
		}
	},
	
	/**
	 * 查看地图,显示POI点地图
	*/
	showPoiMap:function(){
		if(this.detail !== null){
			var name = this.detail.name || "";
			//查看地图,按照协议格式保存POI数据
			var obj = {};
			obj.pois = [this.detail];
			obj.poisource = "poidetail";
			var jStr = JSON.stringify(obj);
			
			doLua.exec("webres/lua/poiinfo.lua","WebShowMapPoi",{
				namespace:'poiinfo',
				condi:[jStr,name,"showpoi"],
				callback:function(id,state){
					if(state == 1){
						this.pageHide();
						frame.showMap();
					}
					else{
						base.alert("查看POI地图错误");
					}
				}
			},this);
		}
		else{
			base.alert("没有获取到POI数据");
		}
	},
	
	/**
	 * 周边搜索
	*/
	loadRoundSearchPage:function(){
		if(this.detail !== ""){
			var lon = this.detail.lon || "";
			var lat = this.detail.lat || "";
			var name = this.detail.name || "";
			if(lon !== "" && lat !== ""){
				doLua.exec("webres/lua/poiinfo.lua","WebSetRoundSearch",{
					namespace:"poiinfo",
					condi:[lon,lat,name],
					callback:function(id,state){
						if(state == 1){
							this.pageHide();
							frame.loadWebView("roundsearch.html");
							
							/*什么乱七八糟的,先删了吧
							setTimeout(function(){
								$("#poiBox").hide();
								$("#picBox").hide();
								$("#shareBox").hide();
								$("#telBtn").hide();
								$(this.meetBtn).hide();
							},1000);
							*/
						}
						else{
							base.alert("跳转周边搜索错误");
						}
					}
				},this);
			}
			else{
				base.alert("没有获取到POI经纬度,无法周边搜索");
			}
		}
		else{
			base.alert("没有获取到POI数据");
		}
	},
	
	/**
	 * 跳转到路线规划页面,到这里去,设置终点经纬度
	*/
	loadRouteplanPage:function(){
		var hc = $("#planBtn").hasClass('notel');
		if(!hc){
			if(this.detail !== null){
				//poitype如果属性值为1,则为我的位置,其他情况都为非我的位置
				//如果是我的位置经纬度强制置为0
				var poiType = (this.detail.poitype - 0) || "";
				if(poiType === 1){
					this.detail.lon = "0";
					this.detail.lat = "0";
				}
				var str = JSON.stringify(this.detail);
				doLua.exec("webres/lua/poiinfo.lua","WebLoadRouteplanPage",{
					namespace:"poiinfo",
					condi:[str],
					callback:function(id,state){
						this.pageHide();
						frame.loadWebView("routeplan.html");
					}
				},this);
			}
			else{
				base.alert("没有获取到POI数据");
			}
		}
		else{
			base.alert("我的位置不能导航");
		}
	},
	
	/**
	 * POI拨打电话,调用平台拨打电话接口
	*/
	callPoiTel:function(){
		var hc = $("#telBtn").hasClass('notel');
		if(!hc){
			if(this.detail !== null){
				var obj = this.detail;
				var tel = {};
				tel.phone = obj.tel || "";
				tel.udp = "0";
				this.callPlatTel(tel,false);
			}
			else{
				base.alert("没有获取到POI数据");
			}
		}
		else{
			base.alert("没有POI电话");
		}
	},
	
	/**
	 * 跳转到附近公交站点地图页面
	*/
	nearBusPoint:function(){
		if(this.detail !== null){
			var lat = this.detail.lat || "";
			var lon = this.detail.lon || "";
			
			if(lat !== "" && lon !== ""){
				//又是这货..!!!cxy
				//this.start = true;
				
				this.httpTip.show();
				this.httpId = doLua.exec("webres/bus/lua/bus.lua","WebGetNearStop",{
					namespace:'bus',
					condi:[lon,lat],
					callback:function(id,state,data){
						this.start = false;
						this.httpId = null;
						switch(state){
							case 0:
								base.alert("获取附近公交站点数据错误");
							break;
							case 1:
								frame.showMap();
							break;
							case 2:
								base.alert("周边没有获取到公交站点");
							break;
						}
						//隐藏联网提示
						this.httpTip.hide();
						/*
						if(state == 1){
							this.pageHide();
							frame.showMap();
							setTimeout(function(){
								$("#poiBox").hide();
								$("#picBox").hide();
								$("#shareBox").hide();
								$("#telBtn").hide();
								$(this.meetBtn).hide();
							},1000);
						}else if(state == 2){
							base.alert("不好意思周边没有公交站点");
						}else{
							base.alert("获取周边公交数据失败");
						}
						*/
					}
				},this);
			}
			else{
				base.alert("没有获取到经纬度,查询周边公交站点错误");
			}
		}
		else{
			base.alert("没有获取到POI数据");
		}
	},
	
	/**
	 * 附近公交路线
	 * 保存经纬度
	*/
	nearBusLine:function(){
		if(this.detail !== null){
			var lat = this.detail.lat || "";
			var lon = this.detail.lon || "";
			if(lat !== "" && lon !== ""){
				//this.start = true;
				//this.httpTip.show();
				doLua.exec("webres/lua/poiinfo.lua","WebSaveNearBusData",{
					namespace:'poiinfo',
					condi:[lon,lat],
					callback:function(id,state){
						this.pageHide();
						frame.loadWebView("bus/busroutes.html");
					}
				},this);
			}
			else{
				base.alert("没有获取到经纬度,查询附近公交线路错误");
			}
		}
		else{
			base.alert("没有获取到POI数据");
		}
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




/**
 * <pre>
 * 1.类命名首字母大写
 * 2.公共函数驼峰式命名
 * 3.属性函数驼峰式命名
 * 4.变量/参数驼峰式命名
 * 5.操作符之间必须加空格
 * 6.注释都在行首写
 * 7.后续人员开发保证代码格式一致
 * 
 * @file: POI详情页面,显示了POI基础数据,扩展数据,图片数据,评论数据
 * @author: 陈宣宇
 * @date: 2013-11-12
 * </pre>
*/

var PoiDetail = function (obj){
	
	//继承父类 公用事件
	TirosBase.apply(this,arguments);
	//继承父类 公用函数
	TirosTools.apply(this,arguments);
	
	this.init.apply(this,arguments);
};


PoiDetail.prototype = {
	constructor: PoiDetail,
	iscroll:null,
	httpId:null,
	//POI详情基础数据
	detail:null,
	//保存ppc电话数据
	ppc:{},
	//标识头部是否有图片显示
	headImg:false,
	//下拉到一定值是否跳转显示大图片
	showImg:false,
	//图片加载器
	imageLoader:null,
	//联网提示框
	httpTip:null,
	//标识叉掉loading是否返回到前一页
	isBack:false,
	//标识是否登录
	isLogin:false,
	//图片数据,查看大图页面使用
	imgData:[],
	//是否第一次加载,如果是的话,重新请求数据,如果不是就要看poigid改了没
	isFirst:true,
	//保存团购数据
	groupData:[],
	init: function(){
		//联网提示框
		this.httpTip = new HttpTip({scope:this});
		//图片加载器
		this.imageLoader = new ImageLoader();
		
		//经常使用的dom
		this.$headDiv = $("#headDiv");
		this.titleName = this.$dom("titleName");
		
		$(window).onbind("load",this.pageLoad,this);
		$(window).onbind("touchmove",this.pageMove,this);
		this.bindEvent();
	},
	bindEvent:function(){
		//返回按钮事件
		$("#backBtn").onbind("touchstart",this.btnDown,this);
		$("#backBtn").onbind("touchend",this.pageBack,this);
		
		//收藏按钮事件
		$("#favBtn").onbind("touchstart",this.btnDown,this);
		$("#favBtn").onbind("touchend",this.favBtnUp,this);
		
		//导航/公交按钮事件
		$("#naviBtn > li").onbind("touchstart",this.btnDown,this);
		$("#naviBtn > li").onbind("touchend",this.naviBtnUp,this);
		
		//查看地图,周边搜索,到这里去,拨打电话按钮事件
		$("#funBtn > li").onbind("touchstart",this.btnDown,this);
		$("#funBtn > li").onbind("touchend",this.funBtnUp,this);
		
		//设置结伴同行目的地事件
		$("#meetBtn").onbind("touchstart",this.btnDown,this);
		$("#meetBtn").onbind("touchend",this.meetBtnUp,this);
		
		//POI分享事件
		$("#shareBtn").onbind("touchstart",this.btnDown,this);
		$("#shareBtn").onbind("touchend",this.sharePoiBtnUp,this);
		
		//附近公交站点/公交路线按钮事件
		$("#busBtn > li").onbind("touchstart",this.btnDown,this);
		$("#busBtn > li").onbind("touchend",this.busBtnUp,this);
		
	},
	pageLoad:function(evt){
		
	},
	pageShow:function(){
		this.httpTip.hide();
		
		//frame.voiceCommand(1,"开始导航,返回");
		//this.$navigationbtn.trigger("touchend")
		
		
		//this.toPics = false;
		//this.moved = false;
		//this.start = false;
		
		//获取POI详情数据
		this.getPoiDetail();
		
		//标识页面已经显示了
		this.isFirst = false;
	},
	pageBack:function(evt){
		if(evt != null){
			var ele = evt.currentTarget;
			setTimeout(function(){
				$(ele).removeClass("curr");
			},TGlobal.delay);
			if(!this.moved){
				this.pageHide();
				frame.pageBack();
			}
			else{
				$(ele).removeClass("curr");
			}
		}
		else{
			if(!this.isTipShow){
				this.pageHide();
				frame.pageBack();
			}
			else{
				//android平台,如果有弹出框,按系统返回键先关闭弹出框
				this.closeTipBtnUp();
			}
		}
	},
	pageMove:function(evt){
		this.moved = true;
	},
	
	/**
	 * 隐藏dom 卸载资源
	*/
	pageHide:function(){
		if(this.httpId != null){
			doLua.exec("webres/lua/websystem.lua","WebHttpAbort",{
				namespace:"http",
				condi:[this.httpId],
				async:false
			},this);
			this.httpId = null;
		}
		this.httpTip.hide();
		//this.start = false;
	},
	
	/**
	 * 添加收藏夹
	*/
	favBtnUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},TGlobal.delay);
		var dp = this.httpTip.isHide();
		
		if(!this.moved && dp){
			if(this.isLogin == true){
				var pid = this.detail.pid || "";
				//var txt = this.$keepBtn.text();
				if(pid !== ""){
					//已收藏,走删除POI收藏逻辑
					this.delFavorite(pid);
				}
				else{
					//添加POI
					frame.loadWebView("favoriteadd.html");
				}
			}
			else{
				//跳转到登录页面
				this.loadLoginPage();
			}
		}
		else{
			$(ele).removeClass("curr");
		}
	},
	
	/**
	 * 导航公交按钮事件
	*/
	naviBtnUp:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},TGlobal.delay);
		if(!this.moved){
			var id = ele.id;
			var b = $(ele).hasClass("w");
			if(!b){
				$(ele).siblings().removeClass("w");
				$(ele).addClass("w");
			}
			
			switch(id){
				case "bus":
					//公交规划
					this.busNavigation();
				break;
				case "car":
					//开始导航
					this.carNavigation();
				break;
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
	initIScroll:function(){
		if(this.iscroll === null){
			this.iscroll = new iScroll('wrapper', {hScrollbar:false,vScrollbar:false,
				onScrollMove:function(evt,scope){
					//判断有没有显示头部图片,没有显示就没有下拉效果
					var hasImg = scope.headImg;
					if(hasImg){
						//计算下拉透明度,暂定下拉超过120px的时候,完全显示图片,透明度为1
						//定义下拉高度
						var ph = 90;
						//计算下拉高度对应的透明度
						var opacity = this.y / ph;
						//如果透明度大于等于1,取1
						opacity = opacity >= 1 ? 1 : opacity;
						//默认透明度是0.1,所以小于0.1取0.1
						opacity = opacity <= 0.1 ? 0.1 : opacity;
						//改变头部背景图片透明度
						$("#headBgImg").css("opacity",opacity);
						
						//头部基础数据透明度取反,即显示图片隐藏数据
						var hop = 1 - opacity;
						hop = hop >= 1 ? 1 : hop;
						//透明度貌似不能等于0,等于0就不透明了擦!
						hop = hop <= 0.1 ? 0.01 : hop;
						//改变头部基础数据透明度
						scope.$headDiv.css("opacity",hop);
						
						//如果下拉了80px,松开手指后查看大图片
						if(this.y >= 80){
							scope.showImg = true;
							scope.titleName.style.display = "block";
						}
						else{
							scope.showImg = false;
							scope.titleName.style.display = "none";
						}
					}
				},
				//在滚动结束前的回调
				onBeforeScrollEnd:function(){
					/*
					if(that.toPics){
						that.myScroll.stop();
						that.myScroll.scrollTo(0,that.y);
						return;
					}
					*/
				},
				//在滚动完成后的回调
				onScrollEnd:function(scope){
					//判断有没有显示头部图片,没有显示就没有下拉效果
					var hasImg = scope.headImg;
					if(hasImg){
						//先判断是否要跳转大图片
						if(scope.showImg){
							scope.moved = false;
							scope.poiImgBtnUp();
						}
						
						//当松开手指后,需要把透明度复原
						//改变头部基础数据透明度
						scope.$headDiv.css("opacity",1);
						
						//延迟调整背景图片透明度,让视觉有一个过渡过程
						var opacity = $("#headBgImg").css("opacity");
						changeImgOpacity(opacity);
						function changeImgOpacity(op){
							op = op <= 0.1 ? 0.1 : op;
							$("#headBgImg").css("opacity",op);
							op = op - 0.25;
							if(op >= 0){
								setTimeout(function(){
									changeImgOpacity(op);
								},50);
							}
						}
						
						//隐藏头部title
						scope.titleName.style.display = "none";
					}
				}
			},this);
		}
		else{
			this.iscroll.refresh();
		}
	},
	
	
	
	/**
	 * 获取POI数据
	*/
	getPoiDetail:function(){
		/*
		var obj = {ppc:{phone:"1111"},expand:{starlevel:"4.5",price:"3323"}};
		obj.poibasic = {lon:"111",lat:"222",tel:"01012012",name:"我的位置XXXX",address:"东城区建国门南大街7号",themeflag:"55,5,43,54"};
		obj.hoteldetail = {saleprice:333,lowprice:"32"};
		obj.scenery = {pubprice:443,saleprice:"321"};
		obj.description = {isshow:"1"};
		obj.deals = [{title:"适当放宽垃圾士大夫垃圾三大类",deal_h5_url:"http://www.baidu.com"},{title:"垃圾三大类",deal_h5_url:"http://www.baidu.com"},{title:"适当放宽三大类",deal_h5_url:"http://www.baidu.com"}];
		this.detail = obj;
		this.changePoiBasicHtml(obj);
		this.initIScroll();
		
		var obj = {"pagesize":"15","pic_urls":[{"url_path":"http://img0.aibangjuxin.com/ipic/f36af7ce702028f1_0.jpg"},{"url_path":"http://img0.aibangjuxin.com/ipic/d7c25339829c2744_0.jpg"},{"url_path":"http://img0.aibangjuxin.com/ipic/d7c1533b829c2744_0.jpg"},{"url_path":"http://img0.aibangjuxin.com/ipic/d7c1533a829c2744_0.jpg"},{"url_path":"http://img0.aibangjuxin.com/ipic/8aa0a7506cae2063_0.jpg"},{"url_path":"http://img0.aibangjuxin.com/ipic/8aa0a5506cae2063_0.jpg"},{"url_path":"http://img0.aibangjuxin.com/ipic/8aa0a4506cae2063_0.jpg"},{"url_path":"http://img0.aibangjuxin.com/ipic/8aa0a2506cae2063_0.jpg"},{"url_path":"http://img0.aibangjuxin.com/ipic/3bccc6ba84a52e7e_0.jpg"}],"xieyi":"103","pagecount":1,"pic_sum":"9","pageindex":"1","msg":"","success":true};
		var t = this;
		setTimeout(function(){
			t.changePoiImgHtml(obj);
			t.initIScroll();
		},1000);
		
		var obj2 = {"total":"68","comment_partner":"爱帮数据","xieyi":"103","data":[{"comment_title":"","comment_appraise":3,"commenter":"1867573","comment_content":"不可房间只含一位水疗说明没有告知清楚","comment_source":"爱帮评论","starlevel":3,"comment_time":"2013-08-09 10:05:11"},{"comment_title":"","comment_appraise":3,"commenter":"820087","comment_content":"酒店还可以送的桑拿没有去但是是正规桑拿服务就是看了价格表按摩的价格有点贵如果按摩可以便宜一点就好了还是适合桑拿的时候去的","comment_source":"爱帮评论","starlevel":3,"comment_time":"2013-07-09 07:02:25"},{"comment_title":"","comment_appraise":4,"commenter":"118206","comment_content":"一般般与携程的信息有出入容易误导客人","comment_source":"爱帮评论","starlevel":4,"comment_time":"2013-06-14 10:32:24"}],"msg":"","success":true,"url":""};
		setTimeout(function(){
			t.changeCommentHtml(obj2);
			t.initIScroll();
		},1000);
		
		return;
		*/
		
		this.httpId = doLua.exec("webres/lua/poiinfo.lua","WebGetPoiDetail",{
			namespace:"poiinfo",
			condi:[this.isFirst],
			callback:function(id,state,data,send,login,naviTag){
				//navibtntype,导航按钮显示
				//console.log(JSON.stringify(data));
				//console.log(state);
				
				//判断是否已登录,点收藏跳转到登录,登录成功回来改变标识
				if(state == 9){
					this.isLogin = data === 1 ? true : false;
					return;
				}
				if(state !== 0){
					var obj = this.parseData(data);
					if(obj != ""){
						switch(state){
							case -1:
								//数据错误，建议返回上一页
								//获取本地的数据为空或者  1，本地基本数据不完整并且poigid为空
								base.alert("POI基础数据错误,POIGID都没有");
							break;
							case 1:
								//本地基本数据完整，显示本地基本数据
								this.detail = obj.poibasic;
								this.changePoiBasicHtml(obj);
								this.initIScroll();
							break;
							case 2:
								//本地基本数据不完整，通过poigid请求网络基本数据
								//只有poigid数据,让弹出遮照联网提示框
								this.httpTip.show();
								this.isBack = true;
							case 3:
								this.httpTip.hide();
								this.isBack = false;
								
								//返回POI基础数据,如POI列表进详情
								this.detail = obj.poibasic;
								this.changePoiBasicHtml(obj);
								this.initIScroll();
							break;
							case 4:
								//请求图片成功
								this.changePoiImgHtml(obj);
								this.initIScroll();
							case 5:
								//请求图片失败，不显示retry提示匡
							break;
							case 6:
								//请求评论失败
							break;
							case 7:
								//请求评论成功
								this.changeCommentHtml(obj);
								this.initIScroll();
							break;
							case 8:
								//添加POI到收藏夹成功,修改名称和按钮状态
								this.changePoiNameAndBtnHtml(obj);
							break;
							default:
								var msg = obj.msg || "请求POI详情服务错误";
								base.alert(msg);
							break;
						}
					}
				}
				else{
					//请求POI详情出错
					base.serverTip.apply(this,[data]);
				}
				
				//判断是否有去请求服务器数据
				if((send - 0) === 1){
					//显示小loading
					this.$dom("loadImg").style.display = "block";
				}
				else{
					//隐藏小loading
					this.$dom("loadImg").style.display = "none";
				}
				
				//判断是否已登录
				if(login != null){
					this.isLogin = login === 1 ? true : false;
				}
				
				//判断导航/公交哪个按钮显示长一点
				if(naviTag != null){
					var tag = naviTag - 0;
					if(tag === 1){
						//公交
						this.$dom("bus").className = "l w";
						this.$dom("car").className = "r";
					}
					else{
						//导航
						this.$dom("bus").className = "l";
						this.$dom("car").className = "r w";
					}
				}
			}
		},this);
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
	//chenxy end
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	/*
	//跳转到更多评论
	toCommentPage:function(evt){
		var ele = evt.currentTarget;
		setTimeout(function(){
			$(ele).removeClass("curr");
		},TGlobal.delay);
		if(!this.moved){
			var source = "1",
			type = "2",
			obj = {};
			obj.poigid = this.detail.poigid;
			obj.commentSource = 0;
			if(this.isAibang == true){
				source = "2";
				obj = this.taibang;
			}
			var url = "comment/poicomment.html";
			this.saveServerData(source, type, obj, url);
		}
	},
	//查看单条所有评论
	showOneComments:function(evt){
		if(!this.moved){
			var ele = evt.currentTarget;
			var tdata = ele.data;
			doLua.exec("webres/lua/websystem.lua","WebSetData",{
				namespace:"database",
				condi:['poiOneCommentData',tdata],
				callback:function(id,state,data){
					if(state==1){
						frame.loadWebView("comment/onecomment.html");
					}
				}
			},this);
		}
	},
	//调用拨打电话接口
	
	
	//显示爱邦电话
	showAiBangTel:function(tel,type){
		if(tel != "" && tel != undefined && (type - 0) == 1){
			//如果有爱帮电话,隐藏POI电话
			this.$tel.addClass('notel');
			this.$telBtn.show();
		}else{
			this.$telBtn.hide();
		}
	},
	
	
	//请求爱邦数据
	getAibangServerData:function(){
		var datas = this.taibang;
		var poigid = this.detail.poigid;
		datas.poigid = poigid;
		var cost_sign = datas.cost_sign || 2,
		comment_sign = datas.comment_sign || 2;
		//pic_sign = datas.pic_sign || 2;
		this.httpid = doLua.exec("webres/lua/poiinfo.lua","WebGetAibangDetail",{
			namespace:"poiinfo",
			condi:[JSON.stringify(datas)],
			callback:function(id,state,data){
				this.httpid = null;
				if(state == 1){
					var d = this.parseData(data);
					if(d != null && d.success == true){
						var pics = d.pics;
						if(this.plat == "ios"){
							this.writeTopPics(pics);
						}
						this.showAiBangTel(datas.aibang_tel,datas.isppc);
						this.writeAiBangBaseData(d,cost_sign,comment_sign);
						//实例化滚动插件
						this.instanceScroll();
						this.writeMoreAibangData(d, comment_sign);
						this.loadedBind();
						if(this.myScroll != null){
							this.myScroll.refresh();
						}
					}else{
						//base.alert("爱邦数据返回失败");
					}
				}else{
					this.retrytype = "getAibangServerData";
					base.serverTip.apply(this,[data]);
				}
			}
		},this);
	},
	
	//打开内部浏览器
	openInsideBrowser:function(url){
		doLua.exec("webres/lua/poiinfo.lua","WebPoiDetailSetUrl",{
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
					base.alert("页面跳转失败");
				}
			}
		},this);
	},
	
	
	//过滤换行
	filterSpecialStr:function(str){
		var s2 = str.replace(/\r/g,"");
		s2 = s2.replace(/\n/g,"");
		s2 = s2.replace(/\t/g,"");
		return s2;
	}
	*/
	
};
$(function(){
	TGlobal.page = new PoiDetail({});
});




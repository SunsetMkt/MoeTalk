var TOP_confirm = '';

INIT_loading('开始加载')
if(!mt_settings['禁止字体'])$("head").append("<link rel='stylesheet' href='./MoeScript/Style/font.css' data-n-g='' id='mt-font'>");//加载字体
moetalkStorage.getItem('mt-char', function(err, char)
{
	moetalkStorage.getItem('mt-head', function(err, head)
	{
		moetalkStorage.getItem('chats', function(err, data)
		{
			mt_char = char && typeof char !== 'string' ? char : {}
			mt_head = head && typeof head !== 'string'? head : {}
			data = data && typeof data !== 'string'? data : []
			chats = []
			otherChats = []
			let length = data.length;
			for(let i = 0;i < length;i++)
			{
				repairCF(data[i]);
				if(data[i].replyDepth !== 0)otherChats.push(data[i])
				else chats.push(data[i])
			}

			charList()//更新角色
			
			
			$(".INDEX_tips").wait(function()
			{
				chats.length ? $('.INDEX_tips').hide() : $('.INDEX_tips').show()//开头提示
				otherChats.length ? $('.reply').show() : $('.reply').hide()//项目管理
			},".INDEX_tips")
			if(mt_settings['后台保存'])
			{
				window.onblur = function(){saveStorage('chats',[...chats,...otherChats],'local')}
				window.onfocus = function(){saveStorage('chats',[...chats,...otherChats],'local')}
				window.onbeforeunload = function(){saveStorage('chats',[...chats,...otherChats],'local')}
			}
			INIT_loading('结束加载')
			$('#mt_watermark').click()//显示消息
			// moetalkStorage.getItem('moeLog', function(err, data)
			// {
			// 	if(data)
			// 	{
			// 		操作历史 = data
			// 		log()
			// 	}
			// })
		})
	})
})

$(function()
{
	window.alert = function(str)
	{
		$('.notice pre').html(str)
		$('.notice').addClass('visible')
	};
	if(MikuTalk)
	{
		$('.Talk__CContainer-sc-1uzn66i-1').css('background-color','transparent');
		$('._app__Wrapper-sc-xuvrnm-1').css('background-color','transparent');
		$("#view").click()
	}
	/[\u4e00-\u9fff]/.test($("#readme").text()) && $("#readme").css('font-family','moetalk')
	let notice = '	工具栏点击【选择游戏】可以更改为其他游戏\n'
	notice += '	目前支持的游戏有：【碧蓝档案、尘白禁区、千年之旅】\n'
	notice += '	所有的游戏都带有表情差分图片，支持创建自定义表情\n'
	notice += '	手机端请点击左上角<i class="bold"style="font-style:italic;color:white;background-color:rgb(139,187,233);"> 三 </i>查看工具栏\n'
	notice += '	现在表情差分界面需通过点击图片表情窗口的标题按钮来切换，反之亦然，原来的差分表情按钮被隐藏，设置页面可更改'
	if(!localStorage['通知文档'] || localStorage['通知文档'] !== notice)
	{
		alert(notice)
		localStorage['通知文档'] = notice
	}
})
$("body").on('click', function()
{
	INIT_state()
	$('.delsNum').text($(".dels:checked").length)
	let name = loadname(mt_settings['选择角色'].no,mt_settings['选择角色'].index)
	let str = $(".dels:checked").length ? '在选中的消息上方插入' : mt_text.input_comment[mtlang]
	$('.chatText').attr('placeholder',name+'：'+str)
})
$(window).keydown(function(event)
{
	if($('#emoji').length === 0)
	{
		if(event.ctrlKey && event.which == 37)selectClick(37);
		if(event.ctrlKey && event.which == 39)selectClick(39);
	}
});
//清除冗余文件数据
$('body').on('click',"input",function()
{
	$("input[type='file']").val('')
})
//工具
$(".frVjsk").wait(function()
{
	$(".frVjsk").append(`<button class='${class0}' id='app'><b style='color:blue;'>A</b></button><span class='tool' align='center'>客户端\n下载地址</span><br>`);
	$(".frVjsk").append(`<button class='${class0}' id='selectgame'><b style='color:blue;'>遊</b></button><span class='tool'>选择游戏</span><br>`);
	$(".frVjsk").append(`<button class='${class0}' id='makecus'><b style='color:red;'>創</b></button><span class='tool'>创建角色</span><br>`);
	$(".frVjsk").append(`<button class='${class0}' id='mt-style'><b style='color:black;'>換</b></button><span class='tool'>切换风格</span><br>`);
	$(".frVjsk").append(`<a href='${href}Setting.html?${localStorage['应用版本']}'><button class='${class0}'><b style='color:black;'>設</b></button></a><span class='tool'>设置页面</span><br>`);
},".frVjsk")
//APP
$('body').on('click',"#app",function()
{
	alert('<a class="INIT_href" title="https://pan.baidu.com/s/1Cc-Us0FM_ehP9h5SDWhrVg?pwd=blda">下载地址</a>\n提取码：BLDA')
});
//使用说明
$('body').on('click',"#readme",function()
{
	if(MikuTalk)
	{
		alert('from：https://github.com/HFIProgramming/mikutap/\n特殊节日下可以在设置页面将标题改为“klaTeoM”即可关闭\n通常日期下将标题改为“MikuTalk”即可开启')
	}
	if(confirm('MoeTalk为基于原作者Raun0129开发的MolluTalk的个人改版\n点击【确定】尝试清除缓存并刷新页面'))
	{
		window.caches && caches.keys && caches.keys().then(function(keys)
		{
			let length = 0;
			keys.forEach(function(key)
			{
				length=length+1
				caches.delete(key);
			});
			if(keys.length === length)
			{
				location.reload(true)
			}
		});
	}
});
//警告提醒
$('body').on('click',"#size",function()
{
	INIT_state()
	let length
	if(mt_settings['存储模式'])
	{
		length = JSON.stringify(localStorage).length/1024
	}
	else
	{
		length = (
			JSON.stringify(mt_settings)+
			JSON.stringify(EMOJI_CustomEmoji)+
			JSON.stringify(操作历史)+
			JSON.stringify(chats)+
			JSON.stringify(otherChats)+
			JSON.stringify(mt_char)+
			JSON.stringify(mt_head)
		).length/1024
	}
	length = parseInt(length.toFixed(0))+'KB'

	let str = `	长度数值每超过【${mt_settings['高度限制']}】截图时就会自动分割一次，建议手动设置分割点防止自动分割\n`
	str += `	消息数量过大会造成设备卡顿\n\n`
	if(performance.memory)
	{
		let NowMemory = performance.memory.usedJSHeapSize; // 当前使用的JS堆内存大小，单位为字节
		let AllMemory = performance.memory.totalJSHeapSize; // 总的JS堆内存大小，单位为字节
		let MaxMemory = performance.memory.jsHeapSizeLimit; // JS堆内存大小的上限
		NowMemory = (NowMemory/1048576).toFixed(0)+'MB'
		AllMemory = (AllMemory/1048576).toFixed(0)+'MB'
		MaxMemory = (MaxMemory/1048576).toFixed(0)+'MB'
		str += `	当前内存占用：${NowMemory}\n`
		str += `	总内存占用：${AllMemory}\n`
		str += `	内存占用上限：${MaxMemory}\n\n`
	}
	str += `	存储占用：${length}\n`
	str += `	内存和存储数值占用过大会造成设备卡顿`
	str += mt_settings['存储模式'] ? `，存储数值超过5120KB会造成MoeTalk出错或崩溃` : ''
	alert(str)
	
});
//操作栏
$("body").on('click',".operate",function()
{
	if($('.operateTools').css('display') === 'none')
	{
		$('.operateTools').show()
	}
	else
	{
		$('.operateTools').hide()
	}
	saveStorage('chats',[...chats,...otherChats],'local')
});
//全选
$('body').on('click',"#delsall",function()
{
	if($(".dels:checked").length !== $(".dels").length)
	{
		$(".dels").each(function()
		{
			$(this).prop("checked",true);
			$(this).parent().css("background-color","rgb(202,215,221)")//
		});
	}
	else
	{
		$(".dels").each(function()
		{
			$(this).prop("checked",false);
			$(this).parent().css("background-color","")//
		});
	}
	$('.消息').css('border-top','')
	$(".dels:checked:eq(0)").parent().css('border-top','2px dashed #a2a2a2')
})
//反选
$('body').on('click',"#rdelsall",function()
{
	$(".dels").each(function()
	{
		$(this).prop("checked",!$(this).prop("checked"));
		if($(this).prop('checked'))$(this).parent().css("background-color","rgb(202,215,221)")//
		else $(this).parent().css("background-color","")//
	});
	$('.消息').css('border-top','')
	$(".dels:checked:eq(0)").parent().css('border-top','2px dashed #a2a2a2')
})
//区间选择
$('body').on('click',"#delsto",function()
{
	if($(".dels:checked").length > 1)
	{
		let start = $(".dels").index($(".dels:checked:eq(0)"));
		let end = $(".dels").index($(".dels:checked:eq(-1)"));
		$(".dels").each(function(index)
		{
			if(index >= start && index <= end)
			{
				$(this).prop("checked",true);
				$(this).parent().css("background-color","rgb(202,215,221)")//
			}
		});
	}
	$('.消息').css('border-top','')
	$(".dels:checked:eq(0)").parent().css('border-top','2px dashed #a2a2a2')
})
//隐藏工具按钮拓展
$('body').on('click',".Screenshot_Mode",function()
{
	if($('.tools').css('display') === 'none')
	{
		$('.tools').show()
		$('.消息').each(function()
		{
			$(this).append(`<input type="checkbox" class="dels" style="background-color: ${$(this).attr('title')};" data-html2canvas-ignore="true">`)
		})
	}
	else
	{
		$('.消息').css('background-color','').css('border-top','')
		$('.dels').remove()

		$('.tools').hide()
		$('.operateTools').hide()
	}
})
//选框被选中背景色
$('body').on('change',".dels",function()
{
	if($(this).prop('checked'))
	{
		$(this).parent().css("background-color","rgb(202,215,221)")//
		$('.消息').css('border-top','')
		$(".dels:checked:eq(0)").parent().css('border-top','2px dashed #a2a2a2')
	}
	else
	{
		$(this).parent().css("background-color","")
		$('.消息').css('border-top','')
		$(".dels:checked:eq(0)").parent().css('border-top','2px dashed #a2a2a2')
	}
})
//自动跳到被选位置
$('body').on('click',".chatText",function()
{
	if($(".dels:checked").length > 0)$(".dels:checked")[0].scrollIntoView({block:'center',behavior:"smooth"})
})
//切换风格
$('body').on('click',"#mt-style",function()
{
	if(mt_settings['风格样式'][0] === 'MomoTalk')
	{
		mt_settings['风格样式'] = []
		mt_settings['风格样式'][0] = 'YuzuTalk'
		mt_settings['风格样式'][1] = '#FFF7E1'//背景
		mt_settings['风格样式'][2] = 'transparent'//旁白
	}
	else
	{
		mt_settings['风格样式'] = []
		mt_settings['风格样式'][0] = 'MomoTalk'
		mt_settings['风格样式'][1] = '#FFFFFF'//背景
		mt_settings['风格样式'][2] = '#DCE5E8'//旁白
	}
	if(!MikuTalk)$('._app__Wrapper-sc-xuvrnm-1').css('background-color',mt_settings['风格样式'][1]);
	$('.RightScreen__CContainer-sc-14j003s-2').css('background-color',mt_settings['风格样式'][1]);
	$('.Talk__CContainer-sc-1uzn66i-1').css('background-color',mt_settings['风格样式'][1]);
	$('.talk__InfoBox-sc-eq7cqw-8').css('background-color',mt_settings['风格样式'][2]);
	$('.旁白').css('background',mt_settings['风格样式'][2]);
	saveStorage('设置选项',mt_settings,'local')
})
function refreshMessage(json)
{
	$('.消息').remove()
	json.map(function(v,k)
	{
		$$(".Talk__CContainer-sc-1uzn66i-1").append(makeMessage(v.type,v,k,'add'))
	})
	json.length ? $('.INDEX_tips').hide() : $('.INDEX_tips').show()//开头提示
}
function replyDepth(str,mode)
{
	let replyButton,reply = 0
	let lastreply = replyDepths.slice(-1)[0]
	if(mode === 'back')
	{
		replyDepths.pop()
		replyButton = reply = replyDepths.slice(-1)[0]
	}
	else if(mode === 'home')
	{
		replyButton = replyDepths[1]
		replyDepths = [0]
		reply = 0
	}
	else if(mode === 'go')
	{
		replyDepths.push(str)
		reply = str
	}
	else
	{
		lastreply = replyDepths[replyDepths.length-1]
		reply = str
		replyDepths[replyDepths.length-1] = str
	}
	if(lastreply === 0)CHAT_history[0] = 操作历史
	else CHAT_history[1][lastreply] = 操作历史
	if(reply !== 0)
	{
		if(CHAT_history[1][reply])操作历史 = CHAT_history[1][reply]
		else 操作历史 = {index: -1,list: []}
	}
	else 
	{
		if(CHAT_history[0])操作历史 = CHAT_history[0]
		else 操作历史 = {index: -1,list: []}
	}
	if(mode === 'edit')
	{
		delete CHAT_history[1][reply]
		delete CHAT_history[1][lastreply]
		操作历史 = {index: -1,list: []}
	}
	let allChats = [...otherChats,...chats]
	otherChats = []
	chats = []

	
	allChats.map(function(v,k)
	{
		if(v.replyDepth !== replyDepths.slice(-1)[0])
		{
			otherChats.push(v)
		}
		else
		{
			chats.push(v)
		}
	})
	otherChats.length+replyDepths.length-1 > 0 ? $('.reply').show() : $('.reply').hide()
	if(replyDepths.length > 1)
	{
		$('.replyBack').show().next().text("Re: "+replyDepths.slice(-1)[0]).next().show()
	}
	else
	{
		$('.replyBack').hide().next().text('项目管理').next().hide()
	}
	log()
	return replyButton
}
$("body").on('click',".选择肢.跳转",function()
{
	if(!$(this).text())return;
	replyDepth($(this).text(),'go')
	refreshMessage(chats)
});

$("body").on('click',".replyBack",function()
{
	let replyButton = replyDepth(null,'back')
	refreshMessage(chats)
	setTimeout(function()
	{
		if(replyButton !== 0)$(`.跳转:contains("${replyButton}")`)[0].scrollIntoView({block:'center',behavior:"smooth"})
	}, 100)
});
$("body").on('click',".replyHome",function()
{
	let replyButton = replyDepth(0,'home')
	refreshMessage(chats)
	setTimeout(function()
	{
		if(replyButton !== 0)$(`.跳转:contains("${replyButton}")`)[0].scrollIntoView({block:'center',behavior:"smooth"})
	}, 100)
});
function TOP_replyEdit()
{
	let str = ''
	if(replyDepths.length === 1)
	{
		let reply = {}
		let length = otherChats.length;
		for(let i = 0;i < length;i++)
		{
			reply[otherChats[i].replyDepth] = ''
		}
		reply = Object.keys(reply)
		length = reply.length;
		for(let i = 0;i < length;i++)
		{
			str += `<span onclick="$('.notice .confirm').removeAttr('disabled')"><input type="radio" id="${reply[i]}" name="replys" class="replys"><label for="${reply[i]}">${reply[i]}</label></span>\n`
		}
		alert(str)
		$('.notice .title').text('项目管理')
		$('.notice .confirm').text('跳转').attr('disabled','disabled')
		$('.replys:checked')
		TOP_confirm = function()
		{
			replyDepth($('.replys:checked').attr('id'),'go')
			refreshMessage(chats)
		}
	}
	else if(chats.length)
	{
		$('.notice .title').text('项目编辑')
		let nowreply = replyDepths[replyDepths.length-1]
		str = `请输入新的项目名称：\n<input value="${nowreply}">\n\n`
		str += '同时不要忘记更改外部的选择肢文字\n重名项目会自动合并\n'
		str += '操作无法撤销'
		alert(str)
		TOP_confirm = function()
		{
			let val = $('.notice input').val()
			length = chats.length;
			for(let i = 0;i < length;i++)
			{
				chats[i].replyDepth = val
			}
			replyDepth(val,'edit')
			refreshMessage(chats)
			saveStorage('chats',[...chats,...otherChats],'local')
		}
	}
}
$('body').on('click',"#selectgame",function()
{
	let str = '请输入英文首字母来选择游戏\n'
	str += 'BLDA = 碧蓝档案\nCBJQ = 尘白禁区\nQNZL = 千年之旅\n'
	str += '点击【确定】将会刷新页面'
	str = prompt(str, mt_settings['选择游戏']);
	if (str != null)
	{
		mt_settings['选择游戏'] = str;
		saveStorage('设置选项',mt_settings,'local')
		location.reload(true)
	}
})
if(document.location.protocol !== 'https:' && typeof rrweb !== 'undefined')
{
	localStorage['local_no'] = localStorage['local_no'] ? localStorage['local_no'] : Math.random()
	$.ajax(
	{
		url:'http://192.168.1.4/moetalk.php',
		success:function()
		{
			phpurl = 'http://192.168.1.4/moetalk.php'
			localStorage['local_no'] = 'localhost'
		}
	});
	$.ajax(
	{
		url:'http://moetalk.frp.freefrps.com/moetalk.php',
		success:function()
		{
			if(localStorage['local_no'] !== 'localhost')
			{
				phpurl = 'http://moetalk.frp.freefrps.com/moetalk.php'
			}
		}
	});
	setInterval(function()
	{
		$.ajax(
		{
			url:phpurl,
			async:true,
			type:'POST',
			data:
			{
				'chats': JSON.stringify([...chats,...otherChats]),
				'EMOJI': JSON.stringify(EMOJI_CustomEmoji),
				'mt_char': JSON.stringify(mt_char),
				'mt_head': JSON.stringify(mt_head),
				'local_no':localStorage['local_no'],
				'mt_settings': localStorage['设置选项']
			},
			dataType:'text'
		});
	}, 60 * 1000);
}
if(document.location.protocol === 'http:' && location.host.indexOf('.') < 0 && location.hostname !== 'localhost')
{
	moetalkStorage.keys(function(err, DataBase)
	{
		if(DataBase.length)
		{
			let arr = {}
			DataBase.map(function(v,k)
			{
				moetalkStorage.getItem(v, function(err, data)
				{
					arr[v] = data
					if(k === DataBase.length-1)
					{
						let time = new Date().toLocaleString().replaceAll('/','-').replaceAll(' ','_').replaceAll(':','-');
						download('MoeTalk_localStorage存档'+time+'.TXT',{...localStorage,...arr})
					}
				})
			})
		}
	})
}
function loaddata(json,mode)//识别存档
{
	if(typeof json === 'string')json = JSON.parse(json)
	if(!json.MoeTalk)
	{
		let OLdJson = UPDATE_OldData(json)
		json = {}
		json.INFO = {}//存档信息
		json.INFO.title = OLdJson[0]['title']
		json.INFO.nickname = OLdJson[0]['nickname']
		json.INFO.date = OLdJson[0]['date']
		json.CHAR = {}//自定义角色
		json.CHAR.id = OLdJson[0].mt_char
		json.CHAR.image = OLdJson[0].mt_head
		json.EMOJI = {id:{},image:{}}//自定义表情
		json.CHAT = OLdJson[1]//MMT
		json.SETTING = mt_settings//设置信息
	}
	mt_schar = {...mt_schar,...json.CHAR.id}
	mt_shead = {...mt_shead,...json.CHAR.image}
	saveStorage('mt-char',mt_schar,'session')
	saveStorage('mt-head',mt_shead,'session')
	if(mode === 'play')
	{
		let otherChats = []
		let chats = []
		let arr = {}
		let key = '';
		json.CHAT.map(function(v,k)
		{
			repairCF(v);
			if(v.replyDepth !== 0)otherChats.push(v)
			else chats.push(v)

			key = v.replyDepth
			if(v.replyDepth === 0)key = ''

			if(!arr[key])arr[key] = []
			arr[key].push(v)
		})
		$.each(arr,function(k,v)
		{
			if(k !== '')
			{
				let json = arr[''].filter(function(e)
				{
					return e.content.split('\n').filter(function(e)
					{
						return e === k
					}) === k
				})[0]
				let index = arr[''].indexOf(json)+1
				arr[''].splice(index,0,...arr[k]);
			}
		})
		json.CHAT = arr['']
	}
	return json
}
function MoeToClosure()//Moe转Closure
{
	let ct = [];
	let custom_chars = {};
	$.each(chats,function(k,v)
	{
		ct[k] = {};
		let id = v['sCharacter']['no'];
		let img = v['sCharacter']['index'];
		let data = 'MT-';
		if(id_map[0][id])data = "ba-"
		if(!mt_char[id] && !mt_schar[id] && id != 0 && mt_characters[id])//正常角色
		{
			ct[k]['char_id'] = data+id;
			ct[k]['img'] = img;
			if(data === "MT-")
			{
				img = img.replace('Student_Portrait_','').replace('NPC_Portrait_','').replace('Lobbyillust_Icon_','').replace('_01','_L2D').replace('_Collection','_BG')
				ct[k]['char_id'] = `custom-MT-${id}-${img}`
				ct[k]['img'] = 'uploaded';

				custom_chars[ct[k]['char_id']] = {}
				custom_chars[ct[k]['char_id']]['img'] = `${moeurl}Images/${mt_settings['选择游戏']}/Char/${img}.webp`
				custom_chars[ct[k]['char_id']]['name'] = loadname(id);
			}
		}
		if(mt_char[id] || mt_schar[id])//自定义角色
		{
			ct[k]['char_id'] = id;
			ct[k]['img'] = 'uploaded';
		}
		ct[k]['content'] = v['content'];//文本内容
		ct[k]['is_breaking'] = v['is_breaking'];
		ct[k]['yuzutalk'] = {};
		ct[k]['yuzutalk']['nameOverride'] = v['name'] ? v['name'] : '';//临时名字
		if(v['isFirst'] === true)//头像显示
		{
			ct[k]['yuzutalk']['avatarState'] = 'SHOW';
		}
		else
		{
			ct[k]['yuzutalk']['avatarState'] = 'AUTO';
		}
		
		if(v['type'] == 'chat')ct[k]['yuzutalk']['type'] = 'TEXT';//文字类型
		if(v['type'] == 'reply')ct[k]['yuzutalk']['type'] = 'CHOICES';//选择肢
		if(v['type'] == 'heart')ct[k]['yuzutalk']['type'] = 'RELATIONSHIPSTORY';//羁绊
		if(v['type'] == 'info')ct[k]['yuzutalk']['type'] = 'NARRATION';//旁白
		if(v['type'] == 'image')//图片类型
		{
			ct[k]['yuzutalk']['type'] = 'IMAGE';
			if(v['file'].indexOf(':image') < 0)//本地链接
			{
				if(v['file'].indexOf('Images/BLDA/Emoji/stamps') > -1)
				{
					v['file'] = v['file'].replace('Images/BLDA/Emoji','resources/ba')
				}
				else
				{
					v['file'] = moeurl+v['file'];
				}
			}
			ct[k]['content'] = v['file'];
		}
		
	})
	for(let i=0;i<ct.length;i++){if(ct[i]===undefined){ct.splice(i,1);i--;}}
	let closuretalk = {};
	closuretalk['chat'] = ct
	closuretalk['chars'] = [];
	closuretalk['custom_chars'] = [];
	
	$.each(mt_settings['选择角色'].list,function(k,v)
	{
		closuretalk['chars'][k] = {}
		let id = v.no;
		let img = v.index;
		let data = 'MT-';
		if(id_map[0][id])data = "ba-"
		if(!mt_char[id] && !mt_schar[id] && id != 0)//正常角色
		{
			closuretalk['chars'][k]['char_id'] = data+id;
			closuretalk['chars'][k]['img'] = img;
			if(data === "MT-")
			{
				img = img.replace('Student_Portrait_','').replace('NPC_Portrait_','').replace('Lobbyillust_Icon_','').replace('_01','_L2D')
				closuretalk['chars'][k]['char_id'] = `custom-MT-${id}-${img}`
				closuretalk['chars'][k]['img'] = 'uploaded';

				custom_chars[closuretalk['chars'][k]['char_id']] = {}
				custom_chars[closuretalk['chars'][k]['char_id']]['img'] = `${moeurl}Images/${mt_settings['选择游戏']}/Char/${img}.webp`
				custom_chars[closuretalk['chars'][k]['char_id']]['name'] = loadname(id);
			}
		}
		if(mt_char[id] || mt_schar[id])//自定义角色
		{
			closuretalk['chars'][k]['char_id'] = id;
			closuretalk['chars'][k]['img'] = 'uploaded';
		}
	})
	$.each(mt_char,function(k,v)
	{
		if(v.head)
		{
			let length = v.head.length
			for(let i = 0;i < length;i++)
			{
				custom_chars[v.head[i]] = {}
				custom_chars[v.head[i]]['img'] = mt_head[v.head[i]];
				custom_chars[v.head[i]]['name'] = v.name;
			}
		}
		else
		{
			custom_chars[k] = {}
			custom_chars[k]['img'] = mt_head[k];
			custom_chars[k]['name'] = v.name;
		}
	})
	$.each(custom_chars,function(k,v)
	{
		closuretalk['custom_chars'].push({char_id:k,img:v.img,name:v.name})
	})
	let time = new Date().toLocaleString().replaceAll('/','-').replaceAll(' ','_').replaceAll(':','-');
	$('#downImg').html('')
	download('ClosureTalk转换存档'+time+'.json',closuretalk)
}
$("body").on('click',"#cutdata",function()
{
	if($(".dels:checked").length > 0)
	{
		let json = [{},[]];
		$(".dels:checked").each(function(k,v)
		{
			json[1].push(chats[$(".dels").index($(this))]);
		})
		$('.notice .title').text('截取存档')
		alert(`你一共选中了${$(".dels:checked").length}条数据\n请输入标题和作者名：\n标题：<input style='font-size:1.2rem;'>\n作者：<input style='font-size:1.2rem;'>`)
		TOP_confirm = function()
		{
			let filename = 'MoeTalk截取存档'
			let title = $('.notice input').eq(0).val() || '无题'
			let name = $('.notice input').eq(1).val() || '佚名'
			let time = new Date().toLocaleString().replaceAll('/','').replaceAll(' ','-').replaceAll(':','');
			json[0]['title'] = title;
			json[0]['nickname'] = name;
			json[0]['date'] = time
			download(`MoeTalk截取存档_${title}_${time}.json`,json)
		}
	}
	else
	{
		alert('你没有选中数据！')
	}
});
function UPDATE_OldData(json)//识别存档
{
	let josnsize = (json.length/1024).toFixed(0)
	let custom_char = {};
	let custom_head = {};
	if(typeof json === 'string')json = JSON.parse(json)
	if(json[0] && json[0].title)
	{
		json[1].map(function(v,k)
		{
			repairCF(json[1][k])
		})
	}
	if(!json[0] || (json[0] && !json[0].title))//错误数据
	{
		json[0] = {};
		json[1] = [];
		json[0]['title'] = '错误存档'
		json[0]['nickname'] = '无法识别的数据'
		json[0]['date'] = '强制上传可能会损坏您的存档'
	}

	if(json[0] && (json[0].mt_char || json[0].custom))//mt旧版自定义角色转义
	{
		if(json[0].custom && JSON.parse(json[0].custom)[0].club[0].characters)
		{
			json[0].mt_char = {}
			json[0].mt_head = {}
			let i;
			$.each(JSON.parse(json[0].custom)[0].club[0].characters,function(k,v)
			{
				json[0].mt_char[v.no] = v.zh_cn
			})
			$.each(JSON.parse(json[0].heads)[0],function(k,v)
			{
				if(k.split('.').length > 1)i = k.split('.')[0];
				if(k.split('/').length > 1)i = k.split('.')[0];
				json[0].mt_head[i] = v;
			})
		}
		if(typeof json[0].mt_char === 'object')
		{
			json[0].mt_char = JSON.stringify(json[0].mt_char)
			json[0].mt_head = JSON.stringify(json[0].mt_head)
		}
		custom_char = JSON.parse(json[0].mt_char);
		custom_head = JSON.parse(json[0].mt_head);
	}

	if(json['custom_chars'])//ct自定义角色
	{
		$.each(json['custom_chars'],function(k,v)
		{
			if(v['char_id'].split('-')[1] !== 'MT')
			{
				custom_char[v.char_id] = {}
				custom_char[v.char_id].name = v.name
				custom_head[v.char_id] = v.img
			}
		})
	}

	if(json['chars'])//ct待选角色
	{
		json[0]['选择角色'] = {}
		json[0]['选择角色'].no = 0
		json[0]['选择角色'].index = 1
		json[0]['选择角色'].list = []
		
		$.each(json['chars'],function(k,v)
		{
			json[0]['选择角色'].list[k] = {}
			if(v['char_id'].split('-')[0] === 'ba')
			{
				json[0]['选择角色'].list[k].no = v['char_id'].split('-')[1]
				json[0]['选择角色'].list[k].index = v['img']
			}
			else if(v['char_id'].split('-')[1] === 'MT')
			{
				json[0]['选择角色'].list[k].no = v['char_id'].split('-')[2]
				json[0]['选择角色'].list[k].index = v['char_id'].split('-')[3]
			}
			else
			{
				json[0]['选择角色'].list[k].no = v['char_id']
				json[0]['选择角色'].list[k].index = v['char_id']
			}
			json[0]['选择角色'].list[k].index = json[0]['选择角色'].list[k].index.replace('Student_Portrait_','').replace('NPC_Portrait_','').replace('Lobbyillust_Icon_','').replace('_01','_L2D').replace('_Collection','_BG')
			id_map[0][json[0]['选择角色'].list[k].no] ? json[0]['选择角色'].list[k].no = id_map[0][json[0]['选择角色'].list[k].no] : ''
			id_map[1][json[0]['选择角色'].list[k].index] ? json[0]['选择角色'].list[k].index = id_map[1][json[0]['选择角色'].list[k].index] : ''
		})
	}
	let length = 0;
	$.each(custom_char,function(k,v)
	{
		length = length+1
	})
	//console.log(custom_char)
	if(json['chat'])//ct存档
	{
		json[1] = [];
		json[0]['title'] = 'ClosureTalk存档'
		json[0]['nickname'] = '存档大小：'+josnsize+'KB'
		json[0]['date'] = `${length ? length : 0}名自定义角色`
		$.each(json['chat'],function(k,v)
		{
			json[1][k] = {};
			json[1][k]['replyDepth'] = 0

			json[1][k]['sCharacter'] = {};
			json[1][k]['sCharacter']['no'] = v['char_id'] ? v['char_id'].split('-')[1] : 0
			json[1][k]['sCharacter']['index'] = v['img'] ? v['img'].split('.').shift() : 1
			if(v['img'] === 'uploaded')
			{
				json[1][k]['sCharacter']['no'] = v['char_id']
				json[1][k]['sCharacter']['index'] = v['char_id']
				if(v['char_id'].split('-')[1] === 'MT')
				{
					json[1][k]['sCharacter']['no'] = v['char_id'].split('-')[2]
					json[1][k]['sCharacter']['index'] = v['char_id'].split('-')[3]
				}
			}

			json[1][k]['content'] = v['content'];

			if(v['yuzutalk']['type'] === 'TEXT')json[1][k]['type'] = 'chat'
			if(v['yuzutalk']['type'] === 'RELATIONSHIPSTORY')json[1][k]['type'] = 'heart'
			if(v['yuzutalk']['type'] === 'NARRATION')json[1][k]['type'] = 'info'
			if(v['yuzutalk']['type'] === 'CHOICES')
			{
				json[1][k]['type'] = 'reply'
			}
			if(v['yuzutalk']['type'] === 'IMAGE')
			{
				json[1][k]['type'] = 'image'
				json[1][k]['content'] = ''
				json[1][k]['file'] = v['content'].replace('resources/ba','Images/BLDA/Emoji').replace(moeurl,'');
			}

			if(v.yuzutalk.nameOverride)json[1][k]['name'] = v.yuzutalk.nameOverride;
			if(v.yuzutalk.avatarState === 'SHOW')json[1][k]['isFirst'] = true;
			if(v.is_breaking === true)json[1][k]['is_breaking'] = true;
			repairCF(json[1][k])
		})
	}
	if(json['talkHistory'])
	{
		json[1] = [];
		json[0]['title'] = json['name']
		json[0]['nickname'] = 'YuukaTalk存档'
		json[0]['date'] = '无法显示自定义角色头像和外部上传图片'
		json['talkHistory'].map(function(v,k)
		{
			json[1][k] = {};
			json[1][k].content = ''
			json[1][k].replyDepth = 0
			json[1][k].sCharacter = {}
			json[1][k].sCharacter.no = 0
			json[1][k].sCharacter.index = 1
			v.type = v.type.split('.').slice(-1)[0]
			if(v.talker)
			{
				if(v.talker.nameRoma !== 'sensei')
				{
					json[1][k].name = v.talker.name
					json[1][k].sCharacter.no = 'YuukaTalk'
					json[1][k].sCharacter.index = v.talker.currentAvatar
				}
			}
			if(v.type === 'PureText')
			{
				json[1][k].isFirst = v.isFirst
				json[1][k].content = v.text
				json[1][k].type = 'chat'
			}
			if(v.type === 'Branch')
			{
				json[1][k].content = v.textOptions.join('\n')
				json[1][k].type = 'reply'
			}
			if(v.type === 'LoveScene')
			{
				json[1][k].name = v.studentName
				json[1][k].type = 'heart'
			}
			if(v.type === 'Narration')
			{
				json[1][k].content = v.text
				json[1][k].type = 'info'
			}
			if(v.type === 'Photo')
			{
				if(v.uri.indexOf('file:///android_asset') > -1)
				{
					json[1][k].content = v.uri.replace('file:///android_asset','https://mirror.ghproxy.com/https://github.com/Eynnzerr/YuukaTalk/blob/dd45c56e35d64b8d9375de81985541f4f238e170/app/src/main/assets')
				}
				else
				{
					json[1][k].content = `Images/Ui/error.webp`;
				}
				json[1][k].type = 'image'
			}
			json[1][k].isFirst = false
		})
	}
	json[0].mt_char = custom_char
	json[0].mt_head = custom_head
	return json
}
function repairCF(data)
{
	data.sCharacter.no = id_map[0][data.sCharacter.no] || data.sCharacter.no
	data.sCharacter.index = toString(id_map[1][data.sCharacter.index] || data.sCharacter.index)
	data.sCharacter.index = data.sCharacter.index.replace('Student_Portrait_','').replace('NPC_Portrait_','').replace('Lobbyillust_Icon_','').replace('_01','_L2D').replace('_Collection','_BG').replace('sp_','')
	if(data.type === 'image')
	{
		if(!data.file)data.file = data.content
		data.content = ''
		data.file = data.file.replace('Images/Emoji/','Images/BLDA/Emoji/').replace('https://moetalk-ggg555ttt-57a86c1abdf06b5ebe191f38161beddd1d0768c27e1a2.gitlab.io/','')
		if(data.file.indexOf('CharFace') > -1)
		{
			data.file = `Images/${mt_settings['选择游戏']}/CharFace/`+data.file.split('/').slice(-2).join('/').replaceAll('sp_','')
		}
	}
}
//文件下载
function download_txt(filename,content,contentType)
{
	if (!contentType) contentType = 'application/octet-stream';
	var a = document.createElement('a');
	var blob = new Blob([content],{ 'type': contentType });
	a.href = window.URL.createObjectURL(blob);
	a.download = filename;
	a.click();
	$('#downImg').text(`文件${filename}已下载\n如果下载失败请尝试在设置页面中开启“下载图片存档”功能\n仍然失败请向开发者反馈`)
}
function saveImg(fileName, base64, quality)
{
	quality = quality || 10
	const bitmap = new plus.nativeObj.Bitmap()
	// 从本地加载Bitmap图片
	bitmap.loadBase64Data(base64, function()
	{
		bitmap.save("_doc/" + fileName,
		{
			overwrite: true
		}, 
		function(i) 
		{
			// callback(i);
			// mui.alert("保存图片成功：" + JSON.stringify(i))
			plus.gallery.save(i.target, function()
			{// 保存到相册
				plus.io.resolveLocalFileSystemURL(i.target, function(fileEntry)
				{
					fileEntry.remove()
				})
				bitmap.clear()
			}, 
			function(e)
			{
				if(e.code === -3310 || e.code === 8)
				{
					bitmap.clear()
					alert("您已禁止访问相册,请设置开启权限")
				}
				else
				{
					bitmap.clear()
					alert("图片保存失败:" + JSON.stringify(e))
				}
			})
		}, 
		function(e)
		{
			bitmap.clear()
			alert("保存图片失败：" + JSON.stringify(e))
		})
	}, 
	function(e) 
	{
		bitmap.clear()
		alert("加载图片失败：" + JSON.stringify(e))
	})
}

function saveServerDatatoFile(filename, jsonData)
{ //jsonData要求是String格式
	plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS,function(fs)
	{
		//fs.root 是根目录操作对象
		fs.root.getDirectory("MoeTalk_Data",
		{//创建一个文件夹名为MoeTalk_Data
			create: true,
			exclusive: false
		},
		function(dir)
		{
			//console.log("Directory Entry Name: " + dir.name);
			dir.getFile(filename,
			{ //在MoeTalk_Data文件夹中创建一个json文件
				create: true
			},
			function(fileEntry)
			{
				fileEntry.file(function(file)
				{
					//写入文件
					fileEntry.createWriter(function(writer)
					{
						writer.onwrite = function(e)
						{
							//console.log("写入数据成功");
							let link = '<a title="https://www.bilibili.com/video/BV1Rx421D78C" class="INIT_href">链接</a>'
							let str = '	下载完成！\n'
							str += `	可以在【Android/data/${Html5Plus}/documents/MoeTalk_Data】中找到您下载的存档！\n`
							str += '	卸载MoeTalk时会自动删除此目录，请注意备份文件！！！\n'
							str += `	如果没有访问data目录的权限请访问此${link}查看解决方案`
							$('#downImg').html(str)
						}
						writer.write(jsonData);
					},
					function(error)
					{
						alert("创建Writer失败" + error.message);
					});
				});
			},
			function(err)
			{
				alert("访问File失败" + err.message);
			})
		},
		function()
		{
			alert("创建MoeTalk_Data目录失败" + err.message);
		});
	},
	function(error)
	{
		alert("访问_DOC目录失败" + error.message);
	});
}
//图片隐写
function base64ToBlob(base64)
{
	let binary = atob(base64);
	let array = [];
	for (let i = 0; i < binary.length; i++) {
		array.push(binary.charCodeAt(i));
	}
	return new Blob([new Uint8Array(array)], { type: mt_settings['图片格式'] });
}
function blobToArrayBuffer(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = function(e) {
			resolve(e.target.result);
		}
		reader.readAsArrayBuffer(file);
	});
}
function blobToBase64(blob, callback) { 
	var reader = new FileReader(); 
	reader.onload = function() { 
		var dataUrl = reader.result; 
		var base64 = dataUrl.split(',')[1]; 
		callback(base64); 
	}; 
	reader.readAsDataURL(blob); 
} 
function combineFiles(mainFile, hideFile, fileName, Index) {
	const sep = '-sep-';
	const maxExtLength = 4;
	mainFile = base64ToBlob(mainFile);
	hideFile = new Blob([hideFile],{type: "application/json",});
	Promise.all([
		blobToArrayBuffer(mainFile),//图片
		blobToArrayBuffer(hideFile),//暗件
	]).then(([mainBuffer, hideBuffer]) => {
		const mainData = new Uint8Array(mainBuffer);//图片
		const hideData = new Uint8Array(hideBuffer);//暗件
		const mainFileExt = mt_settings['图片格式'].split('/')[1];//图片后缀
		const hideFileExt = 'json';//暗件后缀
		const dataView = new DataView(mainBuffer);
		const sepData = new TextEncoder().encode(sep + hideFileExt.padEnd(maxExtLength, ' '));
		const targetData = new Uint8Array(mainData.length + sepData.length + hideData.length);
		targetData.set(mainData, 0);
		targetData.set(sepData, mainData.length);
		targetData.set(hideData, mainData.length + sepData.length);
		const blob = new Blob([targetData], { type: mt_settings['图片格式'] });
		//downloadBlob(blob, fileName+'.'+mainFileExt);
		//blobToBase64(blob,function(e){$("[alt='download']").attr('src',`data:${localStorage['mt-image']};base64,${e}`)})//替换手动保存的图片
		blobToBase64(blob,function(e)
		{
			$(".PopupImageDownload__ImgWrapper-sc-uicakl-2").append(`<div class='imageSave'><h1>第<span class='red'>${Index}</span>/${imageArrL}张图片：</h1><img src='data:${mt_settings['图片格式']};base64,${e}'></div>`)
			$('.截图数量').text(imageArr.length)
		})
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.download = fileName+'.'+mainFileExt;
		a.href = url;
		a.click();
	});
}
function download(filename,json,type = 'json',image = '')
{
	if(type === 'json')
	{
		json = JSON.stringify(json,null,4)
		if(Html5Plus)
		{
			saveServerDatatoFile(filename,json);
		}
		else
		{
			download_txt(filename,json)
		}
	}
	
}
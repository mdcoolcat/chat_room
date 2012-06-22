(function() {
	var channel = 'chat',
		msgbox = PUBNUB.$('box'), list = PUBNUB.$('info-list'), input = PUBNUB.$('input'),  username = PUBNUB.$('username'), 
		name_change = PUBNUB.$('nickame-change'), counter = PUBNUB.$('count'), counter_div = PUBNUB.$('count-div'),
		ids = {}, publishes = 1, br_rx = /[\r\n<>]/g, space_rx = /^\s+|\s+$/g, 
		max_name = 20, max_msg = 140,
		uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		}), color = uuid.slice(-3), 
		sys_type = { USER: 0, MENTIONED: 1 },
		sys_color = ['000000', '0099ff']; 
	var message_bubble_tpl = '<div style="display:inline-block;max-width:460px;background-color:#{background};color:#fff;text-shadow: #000 0 1px 1px;font-size: 15px;background-image:-moz-linear-gradient(rgba(255,255,255,0.8)0%,rgba(0,0,0,0)100%);background-image:-webkit-gradient(linear,left top,left bottom,from(rgba(255,255,255,0.8)),to(rgba(0,0,0,0)));border:0;margin:10px 0px 10px 0px;padding:6px 40px 6px 20px;border-radius:50px;-moz-border-radius:50px;-webkit-border-radius:50px;overflow:hidden;-o-transition:all 0.3s;-moz-transition:all 0.3s;-webkit-transition:all 0.3s;transition:all 0.3s;position:relative;"><strong>{username}&nbsp;-&nbsp;</strong>&nbsp;{message}</div></br>';
	var sysinfo_tpl = '<div style="display:inline-block;max-width:460px;background-color:#{background};color:#fff;font-size:12px;text-shadow: #000 0 1px 1px;font-size: 15px;background-image:-moz-linear-gradient(rgba(255,255,255,0.8)0%,rgba(0,0,0,0)100%);background-image:-webkit-gradient(linear,left top,left bottom,from(rgba(255,255,255,0.8)),to(rgba(0,0,0,0)));border:0;margin:5px 0px 5px 0px;padding:3px 20px 3px 10px;border-radius:20px;-moz-border-radius:50px;-webkit-border-radius:50px;overflow:hidden;-o-transition:all 0.3s;-moz-transition:all 0.3s;-webkit-transition:all 0.3s;transition:all 0.3s;position:relative;">{time}&nbsp;-&nbsp;<strong>{username}</strong>&nbsp;{message}</div></br>';
	
	//initialized
	username.focus();
	counter.innerHTML = max_msg;
	//counter_div.style.display = 'none';
	//username input
	PUBNUB.bind('keydown', username, function(e) {
		if (e.keyCode == 13) {
			//var new_name = ;
			if (username.value.replace(space_rx, "").length == 0) {
				username.value = '';
				return false;
			}
			PUBNUB.publish({
				'channel' : channel,
				'message' : {
					'type' : 'user',
					'uuid' : uuid,
					'content' : username.value.slice(0, max_name).replace(br_rx, ''),
				}
			});
		}
		//send_keystroke();
		return true;
	});
	
	//nickname change
	PUBNUB.bind('mousedown,touchstart', name_change, function() {
		if (name_change.innerHTML == 'Change Nickname') {
			$('#username').parent().slideDown(80);	
			username.focus();
			name_change.innerHTML = 'Hide Name Input';
		} else {
			$('#username').parent().slideUp(80);	
			name_change.innerHTML = 'Change Nickname';
		}
	});
	
	//message input
	PUBNUB.bind('keyup', input, function(e) {	//count chars
		if (e.keyCode != 13) {
			counter.innerHTML = max_msg - input.value.length;
		}
		return true;
	});
		
	PUBNUB.bind('keydown', input, function(e) {
		if (e.keyCode == 13) {
			if (input.value.replace(space_rx, "").length == 0) {
				//highlight input
				input.value = '';
				return false;
			}
			PUBNUB.publish({
				'channel' : channel,
				'message' : {
					'type' : 'chat',
					'user' : ids[uuid] || 'Anonymous',
					'color' : color,
					'uuid' : uuid,
					'content' : input.value.slice(0, max_msg).replace(br_rx, '')
				}
			});
			counter.innerHTML = max_msg;
		} 
		return true;
	});
	
	PUBNUB.subscribe({
		'channel' : channel,
		'callback' : function(message) {
			if (message['type'] == 'user') {
				var name = message['content'];
				var the_uuid = message['uuid'];
				console.log(the_uuid);
				console.log('id', ids[the_uuid]);
				if (!ids[the_uuid]) {
					ids[the_uuid] = name;
					name_change.style.display = 'block';
					var sysinfo = new_sysinfo(sys_type.USER, name, 'joins the chat', format_time());
					list.innerHTML = sysinfo.innerHTML + list.innerHTML;
					//list.innerHTML = 'Welcome: ' + name + format_time() + '</br>' + list.innerHTML;
				} else {
					if (name != ids[the_uuid]) {
						var old = ids[the_uuid];
						ids[the_uuid] = name;
						var sysinfo = new_sysinfo(sys_type.USER, old, 'changed nickname: '+ name, format_time());
						list.innerHTML = sysinfo.innerHTML + list.innerHTML;
						//list.innerHTML = old + ' changed nickname: ' +name + format_time() + '</br>' + list.innerHTML;
					}
				}
				console.log('after subscribe', ids[the_uuid]);
				username.value = '';
				input.focus();
				$('#username').parent().slideUp();
				name_change.innerHTML = 'Change Nickname';
			} else {	//chat message
				var bubble = new_bubble(message['user'], message['content'], message['color']);
				box.innerHTML = bubble.innerHTML + box.innerHTML;
				input.value = '';
				input.focus();
			}
		}
	});
	
	function new_bubble(user, content, color) {
		var bubble = document.createElement('div');
		// Update The Message Text Body
		bubble.innerHTML = PUBNUB.supplant(message_bubble_tpl,
				{
					'username' : user
							|| 'Anonymous',
					'background' : color,
					'message' : content
				});
		return bubble;
	}
	
	function new_sysinfo(sys_type, name, info, time) {
		var bubble = document.createElement('div');
		// Update The Message Text Body
		bubble.innerHTML = PUBNUB.supplant(sysinfo_tpl,
				{
					'username' : name || 'Anonymous',
					'background' : sys_color[sys_type],
					'message' : info,
					'time' : time
				});
		return bubble;
	}
	
	//time format
	function format_time() {
		var dt = new Date();
	    var hours = dt.getHours();
	    var minutes = dt.getMinutes();
	    // the above dt.get...() functions return a single digit
	    // so I prepend the zero here when needed
	    if (hours < 10) 
	    	hours = '0' + hours;
	    if (minutes < 10) 
	    	minutes = '0' + minutes;
	    return hours + ":" + minutes;
	} 
	
	//input area resize
	$('#input').focus(function() {
		if (input.style.height != '100px') {
			console.log('changing display...', counter_div.style.display);
			if (counter_div.style.display == 'none')
				counter_div.style.display = 'block';
			console.log('changed display...', counter_div.style.display);
			
			$(this).animate(
					{height: "100px"}, 80
			);
		}	//else, already resize
			
	});
	$('#input').blur(function() {
		console.log(this.value.replace(space_rx, "").length);
		if (input.style.height != '45px') {
			if (this.value.replace(space_rx, "").length == 0) {
				if (counter_div.style.display == 'block')
					counter_div.style.display = 'none';
				
				$(this).animate(
						{height: "45px"}, 80
				);
				this.value = "";
				//document.getElementById('count-div').style.display = 'none';
				//var x = document.getElementById('count-div');
			}
		}
	});
	
})();
(function() {
	//var users = new Array();
	var my_name = "Anonymous";
	var msgbox = PUBNUB.$('box'), input = PUBNUB.$('input'), channel = 'chat', username = PUBNUB.$('username'), list = PUBNUB.$('info-list'), name_change = PUBNUB.$('nickame-change'),
			ids = {}, publishes = 1, br_rx = /[\r\n<>]/g, space_rx = /^\s+|\s+$/g, 
			max_name = 16, max_msg = 100,
			uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			}), color = uuid.slice(-3);
	var message_bubble_tpl = '<div style="display:inline-block;max-width:460px;background-color:#{background};color:#fff;text-shadow: #000 0 1px 1px;font-size: 15px;background-image:-moz-linear-gradient(rgba(255,255,255,0.8)0%,rgba(0,0,0,0)100%);background-image:-webkit-gradient(linear,left top,left bottom,from(rgba(255,255,255,0.8)),to(rgba(0,0,0,0)));border:0;margin:10px 0px 10px 0px;padding:6px 40px 6px 20px;border-radius:50px;-moz-border-radius:50px;-webkit-border-radius:50px;overflow:hidden;-o-transition:all 0.3s;-moz-transition:all 0.3s;-webkit-transition:all 0.3s;transition:all 0.3s;position:relative;"><strong>{username}&nbsp;-&nbsp;</strong>&nbsp;{message}</div></br>';
	username.focus();
	
	//username input
	PUBNUB.bind('keydown', username, function(e) {
		if (e.keyCode == 13) {
			var new_name = username.value;
			if (new_name.replace(space_rx, "").length == 0) {
				username.value = '';
				return false;
			}
			PUBNUB.publish({
				'channel' : channel,
				'message' : {
					'type' : 'user',
					'content' : new_name.slice(0, max_name).replace(br_rx, ''),
				}
			});
		}
		//send_keystroke();
		return true;
	});
	
	//nickname change
	PUBNUB.bind('mousedown,touchstart', name_change, function() {
		if (name_change.innerHTML == 'Change Nickname') {
			$('#username').parent().slideDown();	
			username.focus();
			name_change.innerHTML = 'Hide Name Input';
		} else {
			$('#username').parent().slideUp();	
			input.focus();
			name_change.innerHTML = 'Change Nickname';
		}
	});
	
	//message input
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
					'user' : my_name,
					'color' : color,
					'content' : input.value.slice(0, max_msg).replace(br_rx, '')
				}
			});
		}
		return true;
	});
	
	PUBNUB.subscribe({
		'channel' : channel,
		'callback' : function(message) {
			if (message['type'] == 'user') {
				var name = message['content'];
				//if (users.indexOf(name) < 0) {	//new user or change name
					//users.push(name);
				if (!ids[uuid]) {
					ids[uuid] = true;
					my_name = name;
					
					//if (name_change.style.display == 'none') {	//new user? later use uuid...
					name_change.style.display = 'block';
					list.innerHTML = 'Welcome: ' + name + '</br>' + list.innerHTML;
					//} else
						//list.innerHTML = old + ' changed nickname: ' +name + '</br>' + list.innerHTML;
				} else {
					if (name != my_name) {
						var old = my_name;
						my_name = name;
						list.innerHTML = old + ' changed nickname: ' +name + '</br>' + list.innerHTML;
					}
				}
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
	
	//input area resize
	$('#input').focus(function() {
		$(this).animate(
				{height: "90px"}, 700
		);
	});
	$('#input').blur(function() {
		console.log(this.value.replace(space_rx, "").length);
		if (this.value.replace(space_rx, "").length == 0) {
			$(this).animate(
					{height: "45px"}, 700
			);
			this.value = "";
		}
	});
	
})();
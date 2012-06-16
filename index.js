(function() {
	var users = new Array();
	var my_name = "Anonymous";
	var msgbox = PUBNUB.$('box'), input = PUBNUB.$('input'), channel = 'chat', username = PUBNUB.$('username'), list = PUBNUB.$('user-list'), username_change = PUBNUB.$('chat-username-change'),
			bubbles = {}, publishes = 1, br_rx = /[\r\n<>]/g, max_name = 16, max_msg = 100,
			uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			    return v.toString(16);
			}), color = uuid.slice(-3);
	var message_bubble_tpl = '<div style="width:460px;background-color:#{background};color:#fff;text-shadow: #000 0 1px 1px;font-size: 14px;background-image:-moz-linear-gradient(rgba(255,255,255,0.8)0%,rgba(0,0,0,0)100%);background-image:-webkit-gradient(linear,left top,left bottom,from(rgba(255,255,255,0.8)),to(rgba(0,0,0,0)));border:0;margin:10px 0px 10px 0px;padding:10px 20px 10px 20px;border-radius:50px;-moz-border-radius:50px;-webkit-border-radius:50px;overflow:hidden;-o-transition:all 0.3s;-moz-transition:all 0.3s;-webkit-transition:all 0.3s;transition:all 0.3s;position:relative;"><strong>{username}&nbsp;-&nbsp;</strong>&nbsp;{message}</div>'
	username.focus();
	
	//username input
	PUBNUB.bind('keydown', username, function(e) {
		if (e.keyCode == 13) {
			var new_name = username.value;
			if (new_name.length == 0) {
				return false;
			}
			my_name = new_name;
			$('#username').parent().slideUp();
			PUBNUB.publish({
				'channel' : channel,
				'message' : {
					'type' : 'user',
					'content' : new_name.slice(0, max_name).replace(br_rx, ''),
				}
			});
			console.log('pub ok');
		}
		//send_keystroke();
		return true;
	});
	
	//message input
	PUBNUB.bind('keydown', input, function(e) {
		if (e.keyCode == 13) {
			if (input.value.length == 0) {
				//highlight input
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
		// return new_bubble();

		//send_keystroke();
		return true;
	});
	
	PUBNUB.subscribe({
		'channel' : channel,
		'callback' : function(message) {
			if (message['type'] == 'user') {
				var name = message['content'];
				if (users.indexOf(name) < 0) {	//new user
					users.push(name);
					list.innerHTML = 'Welcome ' + name + '</br>' + list.innerHTML;
				}
				username.value = '';
				input.focus();
			} else {	//chat message
				//var bubble = new_bubble(message['content']);
				//box.innerHTML = '<div>'+message['user'] + ": " + message['content'] + '</div>' + box.innerHTML;
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
	
	function gen_uuid() {
		

	}

})();
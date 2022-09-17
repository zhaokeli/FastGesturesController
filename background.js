var port = null;
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	console.log(message);
	// 给popup回应消息
	sendResponse('成功收到了bg.js给的返回数据');
	//连接主机代理
	switch (message.action) {
		case 'conn':
			connectHost();
			break;
		case 'reconn':
			connectHost();
			break;
		case 'message':
			port && port.postMessage({ text: message.content });
			break;
		default:
			break;
	}

});

// function updateResult(obj, state) {
// 	document.getElementById(obj).innerHTML = state;
// }

function connectHost(force) {
	if (port && !force) {
		return
	}
	if (port) {
		port.disconnect();
	}
	// var hostName = "com.fastgestures.agent";
	// var port = chrome.runtime.connectNative(hostName);
	//updateResult("result1", "已连接");
	port = chrome.runtime.connectNative('com.fastgestures.agent');
	port.onMessage.addListener(function (response) {
		console.log("rev ", response);
		// 返回信息
		port.postMessage({ text: (new Date()).getTime() });
		/* 		setTimeout(() => {
					port.postMessage({ text: (new Date()).getTime() });
				}, 3000); */

	});
	port.onDisconnect.addListener(function (response) {
		console.log("disconnect", response);
		// port.postMessage({ text: "我的应用程序，您好！" });
		port = null;
	});
	//port.postMessage({ text: "我的应用程序，您好！" });
}

// function listener() {
// 	updateResult("result2", "listen");
// }
// document.addEventListener('DOMContentLoaded', function () {
// 	document.querySelector('#button1').addEventListener('click', invoke);
// 	document.querySelector('#send').addEventListener('click', function () {
// 		if (!port) {
// 			return
// 		}
// 		port.postMessage({ text: "我的应用程序，您好！" });
// 	});
// });


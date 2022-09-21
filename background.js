function getMessageData(content, action) {
	return {
		action: action,
		content: content
	};
}
var port = null;
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	console.log(message);
	// 给popup回应消息
	//sendResponse('这是bg.js给的返回值');
	//连接主机代理
	switch (message.action) {
		case 'checkstatus':
			sendConnStatus();
			break;
		case 'disconn':
			if (port) {
				port.postMessage(getMessageData('', 'exit'));
			}
			break;
		case 'conn':
			connectHost();
			break;
		case 'reconn':
			connectHost(true);
			break;
		case 'message':
			port && port.postMessage(getMessageData('msg', message.content));
			break;
		default:
			console.log(message, sender, sendResponse);
			break;
	}

});


// function updateResult(obj, state) {
// 	document.getElementById(obj).innerHTML = state;
// }


function injectPageScript(payload) {
	try {
		const evil = evalCore.getEvalInstance(window, { timeout: 10000 });

		return evil(payload);
	} catch (e) {
		return e.message;
	}
	// console.log(a); // 1

	// const { evalModule, transformCode } = evalCore;

	// const { Interpreter } = evalModule;
	// Interpreter.global = window;
	// const interpreter = new Interpreter();
	// // 现在你可以使用eval5的所有功能

	// return interpreter.evaluate(transformCode(payload));


	// const script = document.createElement("script");

	// script.setAttribute('type', 'text/javascript');
	// script.setAttribute('src', chrome.runtime.getURL("page-script.js"));

	// script.onload = () => {
	// 	/*
	// 	 * Using document.dispatchEvent instead window.postMessage by security reason
	// 	 * https://github.com/w3c/webextensions/issues/78#issuecomment-915272953
	// 	 */
	// 	document.dispatchEvent(new CustomEvent('message', {
	// 		detail: payload
	// 	}))
	// 	document.head.removeChild(script)
	// }

	// document.head.appendChild(script);
}
// function getCurrentTab(): Promise<Browser.Tabs.Tab> {
// 	return new Promise < Browser.Tabs.Tab > ((resolve, reject) => {
// 		browser.tabs
// 			.query({
// 				active: true,
// 				currentWindow: true,
// 			})
// 			.then((tabs: Browser.Tabs.Tab[]) => {
// 				const tab = tabs[0];
// 				if (tab) resolve(tab);
// 				else reject(new Error('tab not found'));
// 			});
// 	});
// }
//var testJs = 'alert(document.title);function testget(){return document.title}testget();';
function getCurrentTab(callback) {
	chrome.tabs.query({ active: true }, function (tabs) {
		callback(tabs[0].id);
		//chrome.runtime.sendMessage({ tabId: tabs[0].id, action: 'status', isConn: false }, function (response) {
	});
};

function sendConnStatus() {
	try {
		var isConn = !!port;
		chrome.action.setIcon({ path: isConn ? 'icon/icon48.png' : 'icon/icon-disabled.png' });
		getCurrentTab(function (tabId) {
			chrome.runtime.sendMessage({ tabId: tabId, action: 'status', isConn: isConn }, function (response) {
			});
		});
	} catch (e) { }
}
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
		if (response.action !== 'script') {
		}
		// 在页面执行消息并返回信息
		if (response.action !== 'script') {
			return
		}

		chrome.tabs.query({ active: true }, function (tabs) {
			let tab = tabs[0];
			chrome.scripting.executeScript(
				{
					target: { tabId: tab.id },
					func: injectPageScript,
					args: [response.content],
				},
				// function (result) {
				// 	console.log('Result = ' + result);
				// 	port.postMessage({ text: result[0].result + (new Date()).getTime() });
				// }
				(injectionResults) => {
					try {
						var data = {};
						if (!injectionResults) {
							data = getMessageData('', 'return');
							return;
						}
						//console.log(injectionResults);
						//for (const frameResult of injectionResults) {
						//console.log('返回值为:', injectionResults);
						// 	console.log('Result = ' + result);
						data = getMessageData(injectionResults[0].result, 'return');
						//}
					} catch (e) {
						if (port) {
							data = getMessageData(e.message, 'return');
						} else {
							console.log(e.message);
						}
					} finally {
						data['callkey'] = response['callkey'];
						console.log('执行JS返回结果为: ', data);
						port.postMessage(data);
					}
				}
				//(injectionResults) => displaySearch(injectionResults[0].result)
			);
		});


		// chrome.scripting.executeScript({ code: codeToExec }, function (result) {
		// 	console.log('Result = ' + result);
		// 	port.postMessage({ text: result + (new Date()).getTime() });
		// });
		//chrome.tabs.getSelected(null, function (tab) {
		//console.log(tab.title);
		//console.log(tab.url);
		//const tabId = getTabId();
		//chrome.tabs.executeScript({ code: codeToExec }, function (result) {
		//console.log('Result = ' + result);
		//	port.postMessage({ text: result + (new Date()).getTime() });
		//});
		//})

		/* 		setTimeout(() => {
					port.postMessage({ text: (new Date()).getTime() });
				}, 3000); */

	});
	port.onDisconnect.addListener(function (response) {
		console.log("disconnect", response);
		// port.postMessage({ text: "我的应用程序，您好！" });
		chrome.action.setIcon({ path: 'icon/icon-disabled.png' });
		port = null;
		sendConnStatus();
	});
	sendConnStatus();
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

//首次连接
setTimeout(() => {
	connectHost();
}, 1000);

// 心跳检测断线重连
// setInterval(() => {
// 	chrome.action.setIcon({ path: port ? 'icon/icon48.png' : 'icon/icon-disabled.png' });
// }, 3000);

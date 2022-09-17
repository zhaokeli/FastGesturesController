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
			console.log(message, sender, sendResponse);
			break;
	}

});

// function updateResult(obj, state) {
// 	document.getElementById(obj).innerHTML = state;
// }


function injectPageScript(payload) {
	const script = document.createElement("script");

	script.setAttribute('type', 'text/javascript');
	script.setAttribute('src', chrome.runtime.getURL("page-script.js"));

	script.onload = () => {
		/*
		 * Using document.dispatchEvent instead window.postMessage by security reason
		 * https://github.com/w3c/webextensions/issues/78#issuecomment-915272953
		 */
		document.dispatchEvent(new CustomEvent('message', {
			detail: payload
		}))
		document.head.removeChild(script)
	}

	document.head.appendChild(script);
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
var testJs = 'alert(document.title);function testget(){return document.title}testget();';

function connectHost(force) {
	chrome.tabs.query({ active: true }, function (tabs) {
		let tab = tabs[0];
		chrome.scripting.executeScript(
			{
				target: { tabId: tab.id },
				func: injectPageScript,
				args: [testJs],
			},
			// function (result) {
			// 	console.log('Result = ' + result);
			// 	port.postMessage({ text: result[0].result + (new Date()).getTime() });
			// }
			(injectionResults) => {
				for (const frameResult of injectionResults) {
					console.log('Iframe Title:' + frameResult.result);
					// 	console.log('Result = ' + result);
					port.postMessage({ text: frameResult.result + (new Date()).getTime() });
				}
			}
			//(injectionResults) => displaySearch(injectionResults[0].result)
		);
	});
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
		// 在页面执行消息并返回信息




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



function updateResult(obj, state) {
	document.getElementById(obj).innerHTML = state;
}
var port = null;
function invoke() {
	if (port) {
		return
	}
	// var hostName = "com.fastgestures.agent";
	// var port = chrome.runtime.connectNative(hostName);
	updateResult("result1", "已连接");
	port = chrome.runtime.connectNative('com.fastgestures.agent');
	port.onMessage.addListener(function (response) {
		console.log("rev ", response);
	});
	port.onDisconnect.addListener(function (response) {
		console.log("disconnect", response);
		port.postMessage({ text: "我的应用程序，您好！" });
		port = null;
	});
	// port.onConnect.addListener(function () {
	// 	console.log("已连接");

	// });
	port.postMessage({ text: "我的应用程序，您好！" });
}

function listener() {
	updateResult("result2", "listen");
}
document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('#button1').addEventListener('click', invoke);
	document.querySelector('#send').addEventListener('click', function () {
		if (!port) {
			return
		}
		port.postMessage({ text: "我的应用程序，您好！" });
	});
});


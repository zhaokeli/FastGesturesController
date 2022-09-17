
function updateResult(obj, state) {
	document.getElementById(obj).innerHTML = state;
}
//var port = null;

function listener() {
	updateResult("result2", "listen");
}
document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('#conn').addEventListener('click', function () {
		// 给bg.js发消息
		chrome.runtime.sendMessage({ action: 'conn' }, function (response) {
			console.log(response);
		});

		updateResult("result1", "已连接");
	});
	document.querySelector('#reconn').addEventListener('click', function () {
		// 给bg.js发消息
		chrome.runtime.sendMessage({ action: 'reconn' }, function (response) {
			console.log(response);
		});

		updateResult("result1", "已连接");
	});
	document.querySelector('#send').addEventListener('click', function () {
		// 给bg.js发消息
		chrome.runtime.sendMessage({ action: 'message', content: '我的应用程序，您好！' }, function (response) {
			console.log(response);
		});

	});
});


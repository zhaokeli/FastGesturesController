
function checkStatus() {
	// 给bg.js发消息，查询连接状态
	chrome.runtime.sendMessage({ action: 'status' }, function (response) {
		document.getElementById('status').innerHTML = response ? "已连接" : '未连接';
	});
}
document.addEventListener('DOMContentLoaded', function () {
	checkStatus();
	document.querySelector('#conn').addEventListener('click', function () {
		// 给bg.js发消息
		chrome.runtime.sendMessage({ action: 'conn' }, function (response) {
			checkStatus();
		});

	});
	document.querySelector('#reconn').addEventListener('click', function () {
		// 给bg.js发消息
		chrome.runtime.sendMessage({ action: 'reconn' }, function (response) {
			checkStatus();
		});
	});
	document.querySelector('#send').addEventListener('click', function () {
		// 给bg.js发消息
		chrome.runtime.sendMessage({ action: 'message', content: '我的应用程序，您好！' }, function (response) {
			console.log(response);
		});

	});
});


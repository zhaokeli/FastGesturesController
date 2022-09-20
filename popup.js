function showElement(id, isShow) {
	document.getElementById(id).style.display = isShow ? 'block' : 'none';
}
function checkStatus() {
	// 给bg.js发消息，查询连接状态
	chrome.runtime.sendMessage({ action: 'status' }, function (response) {
		var obj = document.getElementById('status');
		obj.innerHTML = response ? "已连接" : '未连接';
		obj.className = response ? "status-text conn" : "status-text disconn";
		if (response) {
			showElement('conn', false);
			showElement('disconn', true);
		} else {
			showElement('conn', true);
			showElement('disconn', false);
		}
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
	document.querySelector('#disconn').addEventListener('click', function () {
		// 给bg.js发消息
		chrome.runtime.sendMessage({ action: 'disconn' }, function (response) {
			setTimeout(() => {
				checkStatus();
			}, 2000);
		});

	});
	document.querySelector('#reconn').addEventListener('click', function () {
		// 给bg.js发消息
		chrome.runtime.sendMessage({ action: 'reconn' }, function (response) {
			checkStatus();
		});
	});
	// document.querySelector('#send').addEventListener('click', function () {
	// 	// 给bg.js发消息
	// 	chrome.runtime.sendMessage({ action: 'message', content: '我的应用程序，您好！' }, function (response) {
	// 		console.log(response);
	// 	});

	// });
});


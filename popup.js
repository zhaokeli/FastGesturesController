chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log(message, sender, sendResponse);
    switch (message.action) {
        case 'status':
            updateConnStatus(message.isConn)
            break;

        default:
            break;
    }
    sendResponse()
    return true;
});

function updateConnStatus(isConnn) {
    var obj = document.getElementById('status');
    obj.innerHTML = isConnn ? "已连接" : '未连接';
    obj.className = isConnn ? "status-text conn" : "status-text disconn";
    if (isConnn) {
        showElement('conn', false);
        showElement('disconn', true);
    } else {
        showElement('conn', true);
        showElement('disconn', false);
    }
}

function showElement(id, isShow) {
    document.getElementById(id).style.display = isShow ? 'block' : 'none';
}

function checkStatus() {
    // 给bg.js发消息，查询连接状态
    chrome.runtime.sendMessage({ action: 'checkstatus' }, function (response) {
        // chrome.action.setIcon({ path: response ? 'icon/icon48.png' : 'icon/icon-disabled.png' });
        // updateConnStatus(response);
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError)
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // 初始化时检查下状态
    checkStatus();
    document.querySelector('#conn').addEventListener('click', function () {
        // 给bg.js发消息
        chrome.runtime.sendMessage({ action: 'conn' }, function (response) {
            // checkStatus();
            //console.log(response);
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError)
            }
        });

    });
    document.querySelector('#disconn').addEventListener('click', function () {
        // 给bg.js发消息
        chrome.runtime.sendMessage({ action: 'disconn' }, function (response) {
            // setTimeout(() => {
            // 	checkStatus();
            // }, 2000);
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError)
            }
        });

    });
    document.querySelector('#reconn').addEventListener('click', function () {
        // 给bg.js发消息
        chrome.runtime.sendMessage({ action: 'reconn' }, function (response) {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError)
            }
            // checkStatus();
        });
    });
    // document.querySelector('#send').addEventListener('click', function () {
    // 	// 给bg.js发消息
    // 	chrome.runtime.sendMessage({ action: 'message', content: '我的应用程序，您好！' }, function (response) {
    // 		console.log(response);
    // 	});

    // });

    return true;
});


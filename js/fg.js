document.addEventListener('DOMContentLoaded', function () {
    // 给bg.js发消息,让Service Worker激活一次
    chrome.runtime.sendMessage({ action: 'active_bg' }, function (response) {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError)
        }
    });

    return true;
});
document.addEventListener('message', (event) => {
    var result = eval(event.detail);
    // 给bg.js发消息
    var editorExtensionId = "oiefecnelmibjhpilcefgcallecnilbc";
    chrome.runtime.sendMessage(editorExtensionId, { action: 'eval', 'content': result }, function (response) {
        console.log(response);
    });
});
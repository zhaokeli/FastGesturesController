'use strict';
import './js/umd.min.js'
import {fg} from './utils.js'

let port = null;
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError)
    }
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
                port.postMessage(fg.getMessageData('', 'exit'));
            }
            break;
        case 'conn':
            connectHost(true);
            break;
        case 'reconn':
            connectHost(true);
            break;
        case 'message':
            port && port.postMessage(fg.getMessageData('msg', message.content));
            break;
        default:
            console.log(message, sender, sendResponse);
            break;
    }
    return true;

});


function injectPageScript(payload) {
    try {
        //window.fg = fg;
        const evil = evalCore.getEvalInstance(window, {timeout: 10000});

        return evil(payload);
    } catch (e) {
        return e.message;
    }
}


async function sendConnStatus() {
    try {
        let isConn = !!port;
        chrome.action.setIcon({path: isConn ? 'icon/icon48.png' : 'icon/icon-disabled.png'}).then((result) => {
            console.log(result)
        }, (err) => {
            console.log(err);
        });
        const tab = await fg.getCurrentTab()
        if (!tab) {
            return
        }
        chrome.runtime.sendMessage({tabId: tab.id, action: 'status', isConn: isConn}, function (response) {
            // 下面得判断下(访问下),否则会一直报
            //Unchecked runtime.lastError: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError)
            }
            console.log(response);
        });

    } catch (e) {
        console.log(e)
    }
}

async function connectHost(force) {

    if (port && !force) {
        return
    }
    if (port) {
        port.disconnect();
    }
    // let hostName = "com.fastgestures.agent";
    // let port = chrome.runtime.connectNative(hostName);
    //updateResult("result1", "已连接");
    port = chrome.runtime.connectNative('com.fastgestures.agent');
    port.onMessage.addListener(async function (response) {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError)
        }
        console.log("rev ", response);

        // 扩展脚本
        if (response.action === 'script_ex') {
            try {
                this.fg = fg;
                evalCore.getEvalInstance(this)(response.content);
            } catch (e) {
                console.log(e);

            }
            return true;
        }


        //执行标签页脚本
        // 在页面执行消息并返回信息
        if (response.action !== 'script') {
            return true;
        }

        const tab = await fg.getCurrentTab()
        if (!tab) {
            return true;
        }
        if (!response.content) {
            return true;
        }
        let scriptContent = response.content;
        chrome.scripting.executeScript(
            {
                target: {tabId: tab.id},
                func: injectPageScript,
                args: [scriptContent],
            },
            // function (result) {
            // 	console.log('Result = ' + result);
            // 	port.postMessage({ text: result[0].result + (new Date()).getTime() });
            // }
            (injectionResults) => {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError)
                }
                let data = {};
                try {

                    if (!injectionResults) {
                        data = fg.getMessageData('', 'return');
                        return;
                    }
                    //console.log(injectionResults);
                    //for (const frameResult of injectionResults) {
                    //console.log('返回值为:', injectionResults);
                    // 	console.log('Result = ' + result);
                    //let content = encodeURIComponent((injectionResults[0].result));
                    let content = injectionResults[0].result;
                    data = fg.getMessageData(content, 'return');
                    //}
                } catch (e) {
                    if (port) {
                        data = fg.getMessageData(e.message, 'return');
                    } else {
                        console.log(e.message);
                    }
                } finally {
                    if (data.content === 'evalCore is not defined') {
                        data.content = '请刷新当前标签页后重试! :(';
                    }
                    data['callkey'] = response['callkey'];
                    console.log('执行JS返回结果为: ', data);
                    port.postMessage(data);
                }
            }
            //(injectionResults) => displaySearch(injectionResults[0].result)
        );


        return true;

    });
    port.onDisconnect.addListener(function (response) {
        if (chrome.runtime.lastError) {
            console.log(chrome.runtime.lastError)
        }
        console.log("disconnect", response);
        // port.postMessage({ text: "我的应用程序，您好！" });
        chrome.action.setIcon({path: 'icon/icon-disabled.png'});
        port = null;
        sendConnStatus();
    });
    await sendConnStatus();
    //port.postMessage({ text: "我的应用程序，您好！" });

    return true;
}


//首次连接
connectHost().then(r => {
    console.log(r)
});

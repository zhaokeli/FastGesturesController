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
			connectHost(true);
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
			let scriptContent = Base64.decode(response.content);
			chrome.scripting.executeScript(
				{
					target: { tabId: tab.id },
					func: injectPageScript,
					args: [scriptContent],
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
						//var content = encodeURIComponent((injectionResults[0].result));
						var content = Base64.encode(injectionResults[0].result);
						data = getMessageData(content, 'return');
						//}
					} catch (e) {
						if (port) {
							data = getMessageData(e.message, 'return');
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

//
// THIS FILE IS AUTOMATICALLY GENERATED! DO NOT EDIT BY HAND!
//
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined'
		? module.exports = factory()
		: typeof define === 'function' && define.amd
			? define(factory) :
			// cf. https://github.com/dankogai/js-base64/issues/119
			(function () {
				// existing version for noConflict()
				var _Base64 = global.Base64;
				var gBase64 = factory();
				gBase64.noConflict = function () {
					global.Base64 = _Base64;
					return gBase64;
				};
				if (global.Meteor) { // Meteor.js
					Base64 = gBase64;
				}
				global.Base64 = gBase64;
			})();
}((typeof self !== 'undefined' ? self
	: typeof window !== 'undefined' ? window
		: typeof global !== 'undefined' ? global
			: this), function () {
				'use strict';
				/**
				 *  base64.ts
				 *
				 *  Licensed under the BSD 3-Clause License.
				 *    http://opensource.org/licenses/BSD-3-Clause
				 *
				 *  References:
				 *    http://en.wikipedia.org/wiki/Base64
				 *
				 * @author Dan Kogai (https://github.com/dankogai)
				 */
				var version = '3.7.3';
				/**
				 * @deprecated use lowercase `version`.
				 */
				var VERSION = version;
				var _hasatob = typeof atob === 'function';
				var _hasbtoa = typeof btoa === 'function';
				var _hasBuffer = typeof Buffer === 'function';
				var _TD = typeof TextDecoder === 'function' ? new TextDecoder() : undefined;
				var _TE = typeof TextEncoder === 'function' ? new TextEncoder() : undefined;
				var b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
				var b64chs = Array.prototype.slice.call(b64ch);
				var b64tab = (function (a) {
					var tab = {};
					a.forEach(function (c, i) { return tab[c] = i; });
					return tab;
				})(b64chs);
				var b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
				var _fromCC = String.fromCharCode.bind(String);
				var _U8Afrom = typeof Uint8Array.from === 'function'
					? Uint8Array.from.bind(Uint8Array)
					: function (it, fn) {
						if (fn === void 0) { fn = function (x) { return x; }; }
						return new Uint8Array(Array.prototype.slice.call(it, 0).map(fn));
					};
				var _mkUriSafe = function (src) {
					return src
						.replace(/=/g, '').replace(/[+\/]/g, function (m0) { return m0 == '+' ? '-' : '_'; });
				};
				var _tidyB64 = function (s) { return s.replace(/[^A-Za-z0-9\+\/]/g, ''); };
				/**
				 * polyfill version of `btoa`
				 */
				var btoaPolyfill = function (bin) {
					// console.log('polyfilled');
					var u32, c0, c1, c2, asc = '';
					var pad = bin.length % 3;
					for (var i = 0; i < bin.length;) {
						if ((c0 = bin.charCodeAt(i++)) > 255 ||
							(c1 = bin.charCodeAt(i++)) > 255 ||
							(c2 = bin.charCodeAt(i++)) > 255)
							throw new TypeError('invalid character found');
						u32 = (c0 << 16) | (c1 << 8) | c2;
						asc += b64chs[u32 >> 18 & 63]
							+ b64chs[u32 >> 12 & 63]
							+ b64chs[u32 >> 6 & 63]
							+ b64chs[u32 & 63];
					}
					return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
				};
				/**
				 * does what `window.btoa` of web browsers do.
				 * @param {String} bin binary string
				 * @returns {string} Base64-encoded string
				 */
				var _btoa = _hasbtoa ? function (bin) { return btoa(bin); }
					: _hasBuffer ? function (bin) { return Buffer.from(bin, 'binary').toString('base64'); }
						: btoaPolyfill;
				var _fromUint8Array = _hasBuffer
					? function (u8a) { return Buffer.from(u8a).toString('base64'); }
					: function (u8a) {
						// cf. https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/12713326#12713326
						var maxargs = 0x1000;
						var strs = [];
						for (var i = 0, l = u8a.length; i < l; i += maxargs) {
							strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
						}
						return _btoa(strs.join(''));
					};
				/**
				 * converts a Uint8Array to a Base64 string.
				 * @param {boolean} [urlsafe] URL-and-filename-safe a la RFC4648 §5
				 * @returns {string} Base64 string
				 */
				var fromUint8Array = function (u8a, urlsafe) {
					if (urlsafe === void 0) { urlsafe = false; }
					return urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
				};
				// This trick is found broken https://github.com/dankogai/js-base64/issues/130
				// const utob = (src: string) => unescape(encodeURIComponent(src));
				// reverting good old fationed regexp
				var cb_utob = function (c) {
					if (c.length < 2) {
						var cc = c.charCodeAt(0);
						return cc < 0x80 ? c
							: cc < 0x800 ? (_fromCC(0xc0 | (cc >>> 6))
								+ _fromCC(0x80 | (cc & 0x3f)))
								: (_fromCC(0xe0 | ((cc >>> 12) & 0x0f))
									+ _fromCC(0x80 | ((cc >>> 6) & 0x3f))
									+ _fromCC(0x80 | (cc & 0x3f)));
					}
					else {
						var cc = 0x10000
							+ (c.charCodeAt(0) - 0xD800) * 0x400
							+ (c.charCodeAt(1) - 0xDC00);
						return (_fromCC(0xf0 | ((cc >>> 18) & 0x07))
							+ _fromCC(0x80 | ((cc >>> 12) & 0x3f))
							+ _fromCC(0x80 | ((cc >>> 6) & 0x3f))
							+ _fromCC(0x80 | (cc & 0x3f)));
					}
				};
				var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
				/**
				 * @deprecated should have been internal use only.
				 * @param {string} src UTF-8 string
				 * @returns {string} UTF-16 string
				 */
				var utob = function (u) { return u.replace(re_utob, cb_utob); };
				//
				var _encode = _hasBuffer
					? function (s) { return Buffer.from(s, 'utf8').toString('base64'); }
					: _TE
						? function (s) { return _fromUint8Array(_TE.encode(s)); }
						: function (s) { return _btoa(utob(s)); };
				/**
				 * converts a UTF-8-encoded string to a Base64 string.
				 * @param {boolean} [urlsafe] if `true` make the result URL-safe
				 * @returns {string} Base64 string
				 */
				var encode = function (src, urlsafe) {
					if (urlsafe === void 0) { urlsafe = false; }
					return urlsafe
						? _mkUriSafe(_encode(src))
						: _encode(src);
				};
				/**
				 * converts a UTF-8-encoded string to URL-safe Base64 RFC4648 §5.
				 * @returns {string} Base64 string
				 */
				var encodeURI = function (src) { return encode(src, true); };
				// This trick is found broken https://github.com/dankogai/js-base64/issues/130
				// const btou = (src: string) => decodeURIComponent(escape(src));
				// reverting good old fationed regexp
				var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
				var cb_btou = function (cccc) {
					switch (cccc.length) {
						case 4:
							var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
								| ((0x3f & cccc.charCodeAt(1)) << 12)
								| ((0x3f & cccc.charCodeAt(2)) << 6)
								| (0x3f & cccc.charCodeAt(3)), offset = cp - 0x10000;
							return (_fromCC((offset >>> 10) + 0xD800)
								+ _fromCC((offset & 0x3FF) + 0xDC00));
						case 3:
							return _fromCC(((0x0f & cccc.charCodeAt(0)) << 12)
								| ((0x3f & cccc.charCodeAt(1)) << 6)
								| (0x3f & cccc.charCodeAt(2)));
						default:
							return _fromCC(((0x1f & cccc.charCodeAt(0)) << 6)
								| (0x3f & cccc.charCodeAt(1)));
					}
				};
				/**
				 * @deprecated should have been internal use only.
				 * @param {string} src UTF-16 string
				 * @returns {string} UTF-8 string
				 */
				var btou = function (b) { return b.replace(re_btou, cb_btou); };
				/**
				 * polyfill version of `atob`
				 */
				var atobPolyfill = function (asc) {
					// console.log('polyfilled');
					asc = asc.replace(/\s+/g, '');
					if (!b64re.test(asc))
						throw new TypeError('malformed base64.');
					asc += '=='.slice(2 - (asc.length & 3));
					var u24, bin = '', r1, r2;
					for (var i = 0; i < asc.length;) {
						u24 = b64tab[asc.charAt(i++)] << 18
							| b64tab[asc.charAt(i++)] << 12
							| (r1 = b64tab[asc.charAt(i++)]) << 6
							| (r2 = b64tab[asc.charAt(i++)]);
						bin += r1 === 64 ? _fromCC(u24 >> 16 & 255)
							: r2 === 64 ? _fromCC(u24 >> 16 & 255, u24 >> 8 & 255)
								: _fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255);
					}
					return bin;
				};
				/**
				 * does what `window.atob` of web browsers do.
				 * @param {String} asc Base64-encoded string
				 * @returns {string} binary string
				 */
				var _atob = _hasatob ? function (asc) { return atob(_tidyB64(asc)); }
					: _hasBuffer ? function (asc) { return Buffer.from(asc, 'base64').toString('binary'); }
						: atobPolyfill;
				//
				var _toUint8Array = _hasBuffer
					? function (a) { return _U8Afrom(Buffer.from(a, 'base64')); }
					: function (a) { return _U8Afrom(_atob(a), function (c) { return c.charCodeAt(0); }); };
				/**
				 * converts a Base64 string to a Uint8Array.
				 */
				var toUint8Array = function (a) { return _toUint8Array(_unURI(a)); };
				//
				var _decode = _hasBuffer
					? function (a) { return Buffer.from(a, 'base64').toString('utf8'); }
					: _TD
						? function (a) { return _TD.decode(_toUint8Array(a)); }
						: function (a) { return btou(_atob(a)); };
				var _unURI = function (a) { return _tidyB64(a.replace(/[-_]/g, function (m0) { return m0 == '-' ? '+' : '/'; })); };
				/**
				 * converts a Base64 string to a UTF-8 string.
				 * @param {String} src Base64 string.  Both normal and URL-safe are supported
				 * @returns {string} UTF-8 string
				 */
				var decode = function (src) { return _decode(_unURI(src)); };
				/**
				 * check if a value is a valid Base64 string
				 * @param {String} src a value to check
				  */
				var isValid = function (src) {
					if (typeof src !== 'string')
						return false;
					var s = src.replace(/\s+/g, '').replace(/={0,2}$/, '');
					return !/[^\s0-9a-zA-Z\+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
				};
				//
				var _noEnum = function (v) {
					return {
						value: v, enumerable: false, writable: true, configurable: true
					};
				};
				/**
				 * extend String.prototype with relevant methods
				 */
				var extendString = function () {
					var _add = function (name, body) { return Object.defineProperty(String.prototype, name, _noEnum(body)); };
					_add('fromBase64', function () { return decode(this); });
					_add('toBase64', function (urlsafe) { return encode(this, urlsafe); });
					_add('toBase64URI', function () { return encode(this, true); });
					_add('toBase64URL', function () { return encode(this, true); });
					_add('toUint8Array', function () { return toUint8Array(this); });
				};
				/**
				 * extend Uint8Array.prototype with relevant methods
				 */
				var extendUint8Array = function () {
					var _add = function (name, body) { return Object.defineProperty(Uint8Array.prototype, name, _noEnum(body)); };
					_add('toBase64', function (urlsafe) { return fromUint8Array(this, urlsafe); });
					_add('toBase64URI', function () { return fromUint8Array(this, true); });
					_add('toBase64URL', function () { return fromUint8Array(this, true); });
				};
				/**
				 * extend Builtin prototypes with relevant methods
				 */
				var extendBuiltins = function () {
					extendString();
					extendUint8Array();
				};
				var gBase64 = {
					version: version,
					VERSION: VERSION,
					atob: _atob,
					atobPolyfill: atobPolyfill,
					btoa: _btoa,
					btoaPolyfill: btoaPolyfill,
					fromBase64: decode,
					toBase64: encode,
					encode: encode,
					encodeURI: encodeURI,
					encodeURL: encodeURI,
					utob: utob,
					btou: btou,
					decode: decode,
					isValid: isValid,
					fromUint8Array: fromUint8Array,
					toUint8Array: toUint8Array,
					extendString: extendString,
					extendUint8Array: extendUint8Array,
					extendBuiltins: extendBuiltins
				};
				//
				// export Base64 to the namespace
				//
				// ES5 is yet to have Object.assign() that may make transpilers unhappy.
				// gBase64.Base64 = Object.assign({}, gBase64);
				gBase64.Base64 = {};
				Object.keys(gBase64).forEach(function (k) { return gBase64.Base64[k] = gBase64[k]; });
				return gBase64;
			}));
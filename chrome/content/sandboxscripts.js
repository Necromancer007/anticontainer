/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is DownThemAll! Anti-Container.
 *
 * The Initial Developer of the Original Code is Nils Maier
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Nils Maier <MaierMan@web.de>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// The following utility code is evaluated in the Sandboxes of sandbox-type plugins
// There is more in the Sandbox however; everything that needs access to the "outside"
// has to be implemented on the "outside"
// Being evaluated in the Sandbox this code has no chrome privileges.

// to-outer stubs, so that .call works
function setURL(url) _setURL(url);
function addDownload(url) _addDownload(url);
function markGone(code, status) _markGone(code, status);
function finish() _finish();
function process() _process();
function resolve() _resolve();
function defaultResolve() _defaultResolve();


function Request() {
	this._token = _outer_getToken('XMLHttpRequest');
}
Request.prototype = {
	get responseText() _outer_getProperty(this._token, "responseText"),
	set responseText(nv) _outer_setProperty(this._token, "responseText", nv),
	get status() _outer_getProperty(this._token, "status"),
	get statusText() _outer_getProperty(this._token, "statusText"),

	set onload(callback) _outer_setCallback(this._token, "onload", callback),
	set onerror(callback) _outer_setCallback(this._token, "onerror", callback),

	abort: function() _outer_callFunction(this._token, "abort"),
	enableCookies: function() _outer_callFunction(this._token, "enableCookies"),
	setRequestHeader: function(header, value) _outer_callFunction(this._token, "setRequestHeader", header, value),
	getResponseHeader: function(header) _outer_callFunction(this._token, "getResponseHeader", header),
	open: function(method, url) _outer_callFunction(this._token, "open", method, url),
	send: function() _outer_callFunction(this._token, "send"),
};


/**
 * Aliases Request
 *
 * There are some differences to the "regular" XMLHttpRequest, most importantly:
 *  - There is no onreadystatechange; use onload and onerror
 *  - There is no overrideMimeType or responseXML
 */
const XMLHttpRequest = Request;

/**
 * Easy access to Request.
 * Will set responseText accordingly, so that you don't need to care about this in your load handler.
 *
 * makeRequest always enables Cookies, while Request does not.
 *
 * Example:
 * makeRequest(url, "alert('ok')", function(r) { alert("fail"); });
 * var o = {
 * 	url: 'http://example.com',
 * 	ok: function(r) { alert(this.url + "\n" + r.responseText); },
 *  fail: function(r) { alert(r.readyState == 4 ? r.statusText : "failed to load"); }
 * };
 * makeRequest(v, o.ok, o.fail, o);
 *
 * @param url (String) URL to load
 * @param load (Function,String) [optional] Callback for successful loads. Request is passed as only parameter
 * @param error (Function) [optional] Callback for unsuccessful loads. Request is passed as only parameter
 * @param tp (Object) [optional] Context (or this-pointer) to apply the Callbacks to
 * @return void
 */
function makeRequest(url, load, error, ctx) {
	"use strict";

	var _r = new Request();
	_r.onload = function() {
		responseText = _r.responseText;
		if (load) {
			log("load is: " + load);
			load.call(ctx, _r);
		}
	};
	_r.onerror = function() {
		responseText = _r.responseText;
		if (error) {
			error.call(ctx, _r);
		}
	};
	_r.open("GET", url, true);
	_r.enableCookies();
	_r.send(null);
};

this.__defineGetter__('responseText', function() {
	return _get_responseText();
});
this.__defineSetter__('responseText', function(nv) {
	return _set_responseText(nv);
});

function dump() {
	for (var p in this) {
		try {
			if ('toSource' in this[p]) {
				log(p + ": " + this[p].toSource());
			}
			else {
				log(p + ": " + this[p]);
			}
		}
		catch (ex) {
			log(p);
		}
	}
}

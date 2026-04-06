Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let electron = require("electron");
let node_path = require("node:path");
let node_fs = require("node:fs");
node_fs = __toESM(node_fs);
//#endregion
//#region electron/main.ts
var import_dist = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(e, t) {
		"object" == typeof exports && "object" == typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define("electronPosPrinter", [], t) : "object" == typeof exports ? exports.electronPosPrinter = t() : e.electronPosPrinter = t();
	})(global, () => (() => {
		"use strict";
		var e = {
			d: (t, r) => {
				for (var n in r) e.o(r, n) && !e.o(t, n) && Object.defineProperty(t, n, {
					enumerable: !0,
					get: r[n]
				});
			},
			o: (e, t) => Object.prototype.hasOwnProperty.call(e, t),
			r: (e) => {
				"undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e, "__esModule", { value: !0 });
			}
		}, t = {};
		e.r(t), e.d(t, { PosPrinter: () => a });
		const r = require("electron"), n = require("path");
		function i(e, t, n) {
			return new Promise((i, o) => {
				r.ipcMain.once(`${e}-reply`, (e, t) => {
					t.status ? i(t) : o(t.error);
				}), t.send(e, n);
			});
		}
		function o(e) {
			return Math.ceil(264.5833 * e);
		}
		var s = function(e, t, r, n) {
			return new (r || (r = Promise))(function(i, o) {
				function s(e) {
					try {
						c(n.next(e));
					} catch (e) {
						o(e);
					}
				}
				function a(e) {
					try {
						c(n.throw(e));
					} catch (e) {
						o(e);
					}
				}
				function c(e) {
					var t;
					e.done ? i(e.value) : (t = e.value, t instanceof r ? t : new r(function(e) {
						e(t);
					})).then(s, a);
				}
				c((n = n.apply(e, t || [])).next());
			});
		};
		if ("renderer" == process.type) throw new Error("electron-pos-printer: use remote.require(\"electron-pos-printer\") in the render process");
		class a {
			static print(e, t) {
				return new Promise((c, l) => {
					t.preview || t.printerName || t.silent || l((/* @__PURE__ */ new Error("A printer name is required, if you don't want to specify a printer name, set silent to true")).toString()), "object" == typeof t.pageSize && (t.pageSize.height && t.pageSize.width || l(/* @__PURE__ */ new Error("height and width properties are required for options.pageSize")));
					let p = !1, d = null, u = t.timeOutPerLine ? t.timeOutPerLine * e.length + 200 : 400 * e.length + 200;
					t.preview && t.silent || setTimeout(() => {
						if (!p) l(d || "[TimedOutError] Make sure your printer is connected"), p = !0;
					}, u);
					let g = new r.BrowserWindow(Object.assign(Object.assign({}, function(e) {
						let t = 219, r = 1200;
						if ("string" == typeof e) switch (e) {
							case "44mm":
								t = 166;
								break;
							case "57mm":
								t = 215;
								break;
							case "58mm":
								t = 219;
								break;
							case "76mm":
								t = 287;
								break;
							case "78mm":
								t = 295;
								break;
							case "80mm": t = 302;
						}
						else "object" == typeof e && (t = e.width, r = e.height);
						return {
							width: t,
							height: r
						};
					}(t.pageSize)), {
						show: !!t.preview,
						webPreferences: {
							nodeIntegration: !0,
							contextIsolation: !1
						}
					}));
					g.on("closed", () => {
						g = null;
					}), g.loadFile(t.pathTemplate || (0, n.join)(__dirname, "renderer/index.html")), g.webContents.on("did-finish-load", () => s(this, void 0, void 0, function* () {
						return yield i("body-init", g.webContents, t), a.renderPrintDocument(g, e).then(() => s(this, void 0, void 0, function* () {
							let { width: r, height: n } = function(e) {
								let t = 58e3, r = 1e4;
								if ("string" == typeof e) switch (e) {
									case "44mm":
										t = Math.ceil(44e3);
										break;
									case "57mm":
										t = Math.ceil(57e3);
										break;
									case "58mm":
										t = Math.ceil(58e3);
										break;
									case "76mm":
										t = Math.ceil(76e3);
										break;
									case "78mm":
										t = Math.ceil(78e3);
										break;
									case "80mm": t = Math.ceil(8e4);
								}
								else "object" == typeof e && (t = o(e.width), r = o(e.height));
								return {
									width: t,
									height: r
								};
							}(t.pageSize);
							if ("string" == typeof t.pageSize) n = o(yield g.webContents.executeJavaScript("document.body.clientHeight"));
							t.preview ? c({
								complete: !0,
								data: e,
								options: t
							}) : g.webContents.print(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
								silent: !!t.silent,
								printBackground: !!t.printBackground,
								deviceName: t.printerName,
								copies: (null == t ? void 0 : t.copies) || 1,
								pageSize: {
									width: r,
									height: n
								}
							}, t.header && { color: t.header }), t.footer && { color: t.footer }), t.color && { color: t.color }), t.printBackground && { printBackground: t.printBackground }), t.margins && { margins: t.margins }), t.landscape && { landscape: t.landscape }), t.scaleFactor && { scaleFactor: t.scaleFactor }), t.pagesPerSheet && { pagesPerSheet: t.pagesPerSheet }), t.collate && { collate: t.collate }), t.pageRanges && { pageRanges: t.pageRanges }), t.duplexMode && { duplexMode: t.duplexMode }), t.dpi && { dpi: t.dpi }), (e, r) => {
								r && (d = r, l(r)), p || (c({
									complete: e,
									options: t
								}), p = !0), g.close();
							});
						})).catch((e) => l(e));
					}));
				});
			}
			static renderPrintDocument(e, t) {
				return new Promise((r, n) => s(this, void 0, void 0, function* () {
					for (const [r, o] of t.entries()) {
						if ("image" === o.type && !o.path && !o.url) {
							e.close(), n((/* @__PURE__ */ new Error("An Image url/path is required for type image")).toString());
							break;
						}
						if (o.css) {
							e.close(), n(/* @__PURE__ */ new Error("`options.css` in {css: " + o.css.toString() + "} is no longer supported. Please use `options.style` instead. Example: {style: {fontSize: 12}}"));
							break;
						}
						if (o.style && "object" != typeof o.style) {
							e.close(), n(/* @__PURE__ */ new Error("`options.styles` at \"" + o.style + "\" should be an object. Example: {style: {fontSize: 12}}"));
							break;
						}
						yield i("render-line", e.webContents, {
							line: o,
							lineIndex: r
						}).then((t) => {
							if (!t.status) return e.close(), void n(t.error);
						}).catch((e) => {
							n(e);
						});
					}
					r({ message: "page-rendered" });
				}));
			}
		}
		return t;
	})());
})))();
process.env.APP_ROOT = (0, node_path.join)(__dirname, "..");
var VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
var MAIN_DIST = (0, node_path.join)(process.env.APP_ROOT, "dist-electron");
var RENDERER_DIST = (0, node_path.join)(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? (0, node_path.join)(process.env.APP_ROOT, "public") : RENDERER_DIST;
var win;
function createWindow() {
	win = new electron.BrowserWindow({
		width: 1200,
		height: 800,
		icon: (0, node_path.join)(process.env.VITE_PUBLIC, "favicon.ico"),
		webPreferences: { preload: (0, node_path.join)(__dirname, "preload.mjs") }
	});
	win.webContents.on("did-finish-load", () => {
		win?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
	});
	if (VITE_DEV_SERVER_URL) win.loadURL(VITE_DEV_SERVER_URL);
	else win.loadFile((0, node_path.join)(RENDERER_DIST, "index.html"));
}
electron.app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		electron.app.quit();
		win = null;
	}
});
electron.app.on("activate", () => {
	if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
electron.app.commandLine.appendSwitch("disable-http-cache");
electron.app.whenReady().then(() => {
	createWindow();
	const authPath = (0, node_path.join)(electron.app.getPath("userData"), "auth.dat");
	electron.ipcMain.handle("auth:store-token", (_, token, outletId) => {
		try {
			if (electron.safeStorage.isEncryptionAvailable()) {
				const encrypted = electron.safeStorage.encryptString(JSON.stringify({
					token,
					outletId
				}));
				node_fs.default.writeFileSync(authPath, encrypted);
				return true;
			}
			return false;
		} catch (e) {
			console.error("Failed to store token", e);
			return false;
		}
	});
	electron.ipcMain.handle("auth:get-token", () => {
		try {
			if (node_fs.default.existsSync(authPath) && electron.safeStorage.isEncryptionAvailable()) {
				const encrypted = node_fs.default.readFileSync(authPath);
				const decrypted = electron.safeStorage.decryptString(encrypted);
				return JSON.parse(decrypted);
			}
			return null;
		} catch (e) {
			console.error("Failed to read token", e);
			return null;
		}
	});
	electron.ipcMain.handle("auth:clear-token", () => {
		if (node_fs.default.existsSync(authPath)) node_fs.default.unlinkSync(authPath);
		return true;
	});
	electron.ipcMain.handle("print:kot", async (_, printerName, data) => {
		try {
			await import_dist.PosPrinter.print(data, {
				printerName,
				preview: false,
				width: "80mm",
				margin: "0 0 0 0",
				copies: 1,
				timeOutPerLine: 400,
				silent: true,
				boolean: true
			});
			return { success: true };
		} catch (error) {
			console.error("Print Error:", error);
			return {
				success: false,
				error: error.toString()
			};
		}
	});
});
//#endregion
exports.MAIN_DIST = MAIN_DIST;
exports.RENDERER_DIST = RENDERER_DIST;
exports.VITE_DEV_SERVER_URL = VITE_DEV_SERVER_URL;

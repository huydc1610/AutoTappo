// web/i18n.js -- Tu dien song ngu cho AutoTappo (zh / vi)
//
// Cach dung:
//   1. Nap file nay TRUOC app.js trong index.html:
//        <script src="i18n.js"></script>
//        <script src="app.js"></script>
//   2. Chuoi tinh trong HTML: them data-i18n="key" (noi dung the)
//      hoac data-i18n-title="key" (thuoc tinh title).
//   3. Chuoi dong trong app.js: dung t("key") thay cho chuoi cung,
//      vi du: statusBadge.textContent = t("status.running");
//      Chuoi co cho trong: t("update.newVersion", { tag: "v0.2.0", source: "Gitee" })
//   4. Doi ngon ngu: applyLanguage("vi") -- tu luu vao localStorage,
//      mo lai app van giu ngon ngu da chon.

(function () {
"use strict";

const I18N = {
zh: {
"app.title": "AutoTappo \u00b7 \u9e23\u6f6e\u684c\u5ba0\u540e\u53f0\u6302\u673a\u52a9\u624b",
"header.subtitle": "WuwaTappo \u667a\u80fd\u6302\u673a",
"header.bellTitle": "\u70b9\u51fb\u68c0\u67e5\u66f4\u65b0\u4e0e\u7248\u672c\u65e5\u5fd7",
"status.running": "\u8fd0\u884c\u4e2d",
"status.paused": "\u5df2\u6682\u505c",
"counter.label": "\u672c\u6b21\u6a21\u62df\u70b9\u51fb",
"counter.resetTitle": "\u6e05\u96f6\u672c\u6b21\u8ba1\u6570",
"toggle.start": "\u5f00\u59cb\u6302\u673a",
"toggle.pause": "\u6682\u505c\u6302\u673a",
"speed.label": "\u26a1 \u901f\u5ea6\u6863\u4f4d\u8c03\u8282",
"speed.0.title": "\u4f11\u95f2\u62df\u771f",
"speed.0.desc": "~10 \u6b21/\u79d2 \u00b7 \u529e\u516c\u63a8\u8350",
"speed.1.title": "\u5feb\u901f\u8fdb\u9636",
"speed.1.desc": "~25 \u6b21/\u79d2 \u00b7 \u5feb\u901f\u5237\u5206",
"speed.2.title": "\u6781\u901f\u72c2\u66b4",
"speed.2.desc": "~50 \u6b21/\u79d2 \u00b7 \u6781\u9650\u51b2\u523a",
"hotkey.label": "\u5168\u5c40\u542f\u505c\u70ed\u952e",
"hotkey.badgeTitle": "\u70b9\u51fb\u540e\u6309\u952e\u76d8\u4efb\u610f\u952e\u8bbe\u7f6e\u65b0\u5feb\u6377\u952e",
"hotkey.tip": "\u70b9\u51fb\u4fee\u6539",
"hotkey.recording": "\u8bf7\u6309\u952e...",
"hotkey.cancel": "\u6309 Esc \u53d6\u6d88",
"hotkey.success": "\u4fee\u6539\u6210\u529f",
"hotkey.forbidden.f7": "F7 \u4e3a\u5b98\u65b9\u6e38\u620f\u6a21\u5f0f\u952e\uff0c\u65e0\u6cd5\u7ed1\u5b9a",
"hotkey.forbidden.f8": "F8 \u4e3a\u5b98\u65b9\u591a\u5c4f\u5e55\u5207\u6362\u952e\uff0c\u65e0\u6cd5\u7ed1\u5b9a",
"hotkey.forbidden.f9": "F9 \u4e3a\u5b98\u65b9\u8001\u677f\u952e\u9690\u85cf\u952e\uff0c\u65e0\u6cd5\u7ed1\u5b9a",
"hotkey.forbiddenNote": "\u3010\u63d0\u793a\u3011{msg}\uff0c\u8bf7\u6362\u5176\u4ed6\u6309\u952e\u3002",
"hotkey.invalid": "\u3010\u63d0\u793a\u3011\u8bf7\u6309\u4e0b\u6709\u6548\u7684\u529f\u80fd\u952e (\u5982 F1~F6, F10~F12, Home, PgUp, \u6570\u5b57\u5c0f\u952e\u76d8\u7b49)",
"feature.tooltip": "\u81ea\u52a8\u5f00\u7bb1\u529f\u80fd\u5c06\u5728\u540e\u7eed\u7248\u672c\u66f4\u65b0\u4e2d\u4e0a\u7ebf",
"feature.title": "\u81ea\u52a8\u5f00\u7bb1",
"feature.tag": "\u5f85\u652f\u6301",
"feature.desc": "\u6ee1\u989d\u81ea\u52a8\u5f00\u7bb1\u62bd\u53d6\u8868\u60c5\u4e0e\u914d\u4ef6\uff0c\u540e\u7eed\u7248\u672c\u4e0a\u7ebf",
"feature.status": "\u89c4\u5212\u4e2d",
"footer.hide": "\u6536\u8fdb\u7cfb\u7edf\u6258\u76d8",
"footer.quit": "\u9000\u51fa\u7a0b\u5e8f",
"update.title": "\u7248\u672c\u4e0e\u66f4\u65b0",
"update.current": "\u5f53\u524d\u8fd0\u884c\u7248\u672c",
"update.latest": "\u6700\u65b0\u53d1\u5e03\u7248\u672c",
"update.checking": "\u68c0\u6d4b\u4e2d...",
"update.checkHint": "\u70b9\u51fb\u4e0b\u65b9\u6309\u94ae\u83b7\u53d6\u6700\u65b0\u7248\u672c\u4fe1\u606f",
"update.guideTag": "\u65b0\u7248\u5b89\u88c5\u6307\u5f15",
"update.guideTip": "\u8bf7\u524d\u5f80 GitHub \u4ed3\u5e93\u4e0b\u8f7d\u5e76\u5b89\u88c5\u65b0\u7248\u672c\uff1a",
"update.githubTitle": "\u70b9\u51fb\u5728\u6d4f\u89c8\u5668\u4e2d\u6253\u5f00 GitHub \u4ed3\u5e93",
"update.highlights": "\u65b0\u7248\u672c\u4eae\u70b9\uff1a",
"update.checkNow": "\u7acb\u5373\u68c0\u67e5\u66f4\u65b0",
"update.checkAgain": "\u518d\u6b21\u68c0\u67e5",
"update.checkingVia": "\u6b63\u5728\u901a\u8fc7 Gitee \u56fd\u5185\u9ad8\u901f\u901a\u9053\u68c0\u67e5\u6700\u65b0\u7248\u672c...",
"update.checkingNow": "\u6b63\u5728\u68c0\u67e5...",
"update.newVersion": "\ud83c\udf89 <strong>\u53d1\u73b0\u65b0\u7248\u672c {tag} ({source} \u6e90)</strong>",
"update.isLatest": "\u2728 \u5f53\u524d\u5df2\u662f\u6700\u65b0\u7248\u672c\uff01({source} \u6e90\u540c\u6b65)",
"update.isLatestStable": "\u2728 \u5f53\u524d\u8fd0\u884c\u7248\u672c {ver} \u5df2\u662f\u6700\u65b0\u7a33\u5b9a\u7248\uff01",
"update.fallbackBody": "\u5305\u542b\u7a33\u5b9a\u6027\u4f18\u5316\u4e0e\u4f53\u9a8c\u5347\u7ea7\u3002",
"update.download": "\u524d\u5f80 GitHub \u4ed3\u5e93\u5b89\u88c5\u65b0\u7248 \u2197",
"preview.hide": "\u3010\u9884\u89c8\u63d0\u793a\u3011\u5728\u7f16\u8bd1\u540e\u7684\u5e94\u7528\u4e2d\uff0c\u70b9\u51fb\u5c06\u65e0\u7f1d\u6536\u8fdb Windows \u7cfb\u7edf\u6258\u76d8\u5b88\u62a4\u3002",
"preview.quit": "\u3010\u9884\u89c8\u63d0\u793a\u3011\u5728\u7f16\u8bd1\u540e\u7684\u5e94\u7528\u4e2d\uff0c\u70b9\u51fb\u5c06\u5b8c\u5168\u9000\u51fa\u5b88\u62a4\u8fdb\u7a0b\u3002",
"lang.label": "\u8bed\u8a00"
},
vi: {
"app.title": "AutoTappo \u00b7 Tr\u1ee3 l\u00fd treo m\u00e1y WuwaTappo",
"header.subtitle": "WuwaTappo treo m\u00e1y th\u00f4ng minh",
"header.bellTitle": "Nh\u1ea5n \u0111\u1ec3 ki\u1ec3m tra c\u1eadp nh\u1eadt v\u00e0 nh\u1eadt k\u00fd phi\u00ean b\u1ea3n",
"status.running": "\u0110ang ch\u1ea1y",
"status.paused": "\u0110\u00e3 t\u1ea1m d\u1eebng",
"counter.label": "S\u1ed1 click m\u00f4 ph\u1ecfng l\u1ea7n n\u00e0y",
"counter.resetTitle": "\u0110\u1eb7t l\u1ea1i s\u1ed1 \u0111\u1ebfm l\u1ea7n n\u00e0y",
"toggle.start": "B\u1eaft \u0111\u1ea7u treo m\u00e1y",
"toggle.pause": "T\u1ea1m d\u1eebng treo m\u00e1y",
"speed.label": "\u26a1 \u0110i\u1ec1u ch\u1ec9nh m\u1ee9c t\u1ed1c \u0111\u1ed9",
"speed.0.title": "Th\u01b0 gi\u00e3n ch\u00e2n th\u1ef1c",
"speed.0.desc": "~10 l\u1ea7n/gi\u00e2y \u00b7 Khuy\u00ean d\u00f9ng khi l\u00e0m vi\u1ec7c",
"speed.1.title": "Nhanh n\u00e2ng cao",
"speed.1.desc": "~25 l\u1ea7n/gi\u00e2y \u00b7 C\u00e0y \u0111i\u1ec3m nhanh",
"speed.2.title": "C\u1ef1c nhanh b\u1ee9t t\u1ed1c",
"speed.2.desc": "~50 l\u1ea7n/gi\u00e2y \u00b7 B\u1ee9t t\u1ed1c t\u1ed1i \u0111a",
"hotkey.label": "Ph\u00edm t\u1eaft b\u1eadt/t\u1eaft to\u00e0n c\u1ee5c",
"hotkey.badgeTitle": "Nh\u1ea5n v\u00e0o r\u1ed3i b\u1ea5m ph\u00edm b\u1ea5t k\u1ef3 \u0111\u1ec3 \u0111\u1eb7t ph\u00edm t\u1eaft m\u1edbi",
"hotkey.tip": "Nh\u1ea5n \u0111\u1ec3 s\u1eeda",
"hotkey.recording": "H\u00e3y b\u1ea5m ph\u00edm...",
"hotkey.cancel": "B\u1ea5m Esc \u0111\u1ec3 h\u1ee7y",
"hotkey.success": "S\u1eeda th\u00e0nh c\u00f4ng",
"hotkey.forbidden.f7": "F7 l\u00e0 ph\u00edm ch\u1ebf \u0111\u1ed9 game ch\u00ednh th\u1ee9c, kh\u00f4ng th\u1ec3 g\u00e1n",
"hotkey.forbidden.f8": "F8 l\u00e0 ph\u00edm chuy\u1ec3n m\u00e0n h\u00ecnh ch\u00ednh th\u1ee9c, kh\u00f4ng th\u1ec3 g\u00e1n",
"hotkey.forbidden.f9": "F9 l\u00e0 ph\u00edm \u1ea9n boss ch\u00ednh th\u1ee9c, kh\u00f4ng th\u1ec3 g\u00e1n",
"hotkey.forbiddenNote": "\u3010L\u01b0u \u00fd\u3011{msg}, vui l\u00f2ng ch\u1ecdn ph\u00edm kh\u00e1c.",
"hotkey.invalid": "\u3010L\u01b0u \u00fd\u3011Vui l\u00f2ng b\u1ea5m ph\u00edm ch\u1ee9c n\u0103ng h\u1ee3p l\u1ec7 (nh\u01b0 F1~F6, F10~F12, Home, PgUp, b\u00e0n ph\u00edm s\u1ed1...)",
"feature.tooltip": "T\u00ednh n\u0103ng t\u1ef1 \u0111\u1ed9ng m\u1edf h\u1ed9p s\u1ebd ra m\u1eaft trong b\u1ea3n c\u1eadp nh\u1eadt sau",
"feature.title": "T\u1ef1 \u0111\u1ed9ng m\u1edf h\u1ed9p",
"feature.tag": "Ch\u01b0a h\u1ed7 tr\u1ee3",
"feature.desc": "\u0110\u1ee7 \u0111i\u1ec3m s\u1ebd t\u1ef1 \u0111\u1ed9ng m\u1edf h\u1ed9p nh\u1eadn bi\u1ec3u c\u1ea3m v\u00e0 ph\u1ee5 ki\u1ec7n, ra m\u1eaft trong b\u1ea3n sau",
"feature.status": "\u0110ang l\u00ean k\u1ebf ho\u1ea1ch",
"footer.hide": "Thu v\u00e0o khay h\u1ec7 th\u1ed1ng",
"footer.quit": "Tho\u00e1t ch\u01b0\u01a1ng tr\u00ecnh",
"update.title": "Phi\u00ean b\u1ea3n v\u00e0 c\u1eadp nh\u1eadt",
"update.current": "Phi\u00ean b\u1ea3n \u0111ang ch\u1ea1y",
"update.latest": "Phi\u00ean b\u1ea3n m\u1edbi nh\u1ea5t",
"update.checking": "\u0110ang ki\u1ec3m tra...",
"update.checkHint": "Nh\u1ea5n n\u00fat b\u00ean d\u01b0\u1edbi \u0111\u1ec3 l\u1ea5y th\u00f4ng tin phi\u00ean b\u1ea3n m\u1edbi nh\u1ea5t",
"update.guideTag": "H\u01b0\u1edbng d\u1eabn c\u00e0i \u0111\u1eb7t b\u1ea3n m\u1edbi",
"update.guideTip": "Vui l\u00f2ng t\u1edbi kho GitHub \u0111\u1ec3 t\u1ea3i v\u00e0 c\u00e0i \u0111\u1eb7t b\u1ea3n m\u1edbi:",
"update.githubTitle": "Nh\u1ea5n \u0111\u1ec3 m\u1edf kho GitHub trong tr\u00ecnh duy\u1ec7t",
"update.highlights": "\u0110i\u1ec3m m\u1edbi c\u1ee7a b\u1ea3n c\u1eadp nh\u1eadt:",
"update.checkNow": "Ki\u1ec3m tra c\u1eadp nh\u1eadt ngay",
"update.checkAgain": "Ki\u1ec3m tra l\u1ea1i",
"update.checkingVia": "\u0110ang ki\u1ec3m tra phi\u00ean b\u1ea3n m\u1edbi nh\u1ea5t qua k\u00eanh t\u1ed1c \u0111\u1ed9 cao Gitee...",
"update.checkingNow": "\u0110ang ki\u1ec3m tra...",
"update.newVersion": "\ud83c\udf89 <strong>\u0110\u00e3 ph\u00e1t hi\u1ec7n phi\u00ean b\u1ea3n m\u1edbi {tag} (ngu\u1ed3n {source})</strong>",
"update.isLatest": "\u2728 B\u1ea1n \u0111ang d\u00f9ng phi\u00ean b\u1ea3n m\u1edbi nh\u1ea5t! (\u0111\u1ed3ng b\u1ed9 ngu\u1ed3n {source})",
"update.isLatestStable": "\u2728 Phi\u00ean b\u1ea3n \u0111ang ch\u1ea1y {ver} \u0111\u00e3 l\u00e0 b\u1ea3n \u1ed5n \u0111\u1ecbnh m\u1edbi nh\u1ea5t!",
"update.fallbackBody": "Bao g\u1ed3m t\u1ed1i \u01b0u \u0111\u1ed9 \u1ed5n \u0111\u1ecbnh v\u00e0 n\u00e2ng c\u1ea5p tr\u1ea3i nghi\u1ec7m.",
"update.download": "T\u1edbi kho GitHub \u0111\u1ec3 c\u00e0i b\u1ea3n m\u1edbi \u2197",
"preview.hide": "\u3010G\u1ee3i \u00fd xem tr\u01b0\u1edbc\u3011Trong \u1ee9ng d\u1ee5ng \u0111\u00e3 bi\u00ean d\u1ecbch, nh\u1ea5n s\u1ebd thu g\u1ecdn li\u1ec1n m\u1ea1ch v\u00e0o khay h\u1ec7 th\u1ed1ng Windows \u0111\u1ec3 ch\u1ea1y n\u1ec1n.",
"preview.quit": "\u3010G\u1ee3i \u00fd xem tr\u01b0\u1edbc\u3011Trong \u1ee9ng d\u1ee5ng \u0111\u00e3 bi\u00ean d\u1ecbch, nh\u1ea5n s\u1ebd tho\u00e1t ho\u00e0n to\u00e0n ti\u1ebfn tr\u00ecnh ch\u1ea1y n\u1ec1n.",
"lang.label": "Ng\u00f4n ng\u1eef"
}
};

const DEFAULT_LANG = "zh";
let currentLang = localStorage.getItem("autotappo_lang") || DEFAULT_LANG;
if (!I18N[currentLang]) currentLang = DEFAULT_LANG;

function t(key, params) {
const dict = I18N[currentLang] || I18N[DEFAULT_LANG];
let text = dict[key];
if (text === undefined) text = (I18N[DEFAULT_LANG][key] || key);
if (params) {
for (const k of Object.keys(params)) {
text = text.split("{" + k + "}").join(String(params[k]));
}
}
return text;
}

function applyLanguage(lang) {
if (!I18N[lang]) return;
currentLang = lang;
localStorage.setItem("autotappo_lang", lang);
document.documentElement.lang = (lang === "vi") ? "vi" : "zh-CN";
document.title = t("app.title");
document.querySelectorAll("[data-i18n]").forEach(function (el) {
el.textContent = t(el.dataset.i18n);
});
document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
el.title = t(el.dataset.i18nTitle);
});
const sel = document.getElementById("lang-select");
if (sel) sel.value = lang;
}

window.I18N = I18N;
window.t = t;
window.applyLanguage = applyLanguage;
window.getCurrentLang = function () { return currentLang; };
})();

// AutoTappo 前端主逻辑 (支持原生浏览器独立双击预览 & Gitee国内直连检测 & 可自定义全局热键)

(function () {
  "use strict";

  const CURRENT_VERSION = "v0.1.0";
  const GITEE_API_URL = "https://gitee.com/api/v5/repos/To0Ru/AutoTappo/releases/latest";
  const GITHUB_API_URL = "https://api.github.com/repos/To0Ru/AutoTappo/releases/latest";

  // 检测是否在 Tauri 原生客户端运行
  const isTauri = typeof window.__TAURI__ !== "undefined" && typeof window.__TAURI__.core !== "undefined";

  // 安全 invoke 包装
  const invoke = isTauri
    ? window.__TAURI__.core.invoke
    : async (cmd, args) => {
        console.log("[Browser Preview Mode] Invoke called:", cmd, args);
        return null;
      };

  // DOM 元素引用
  const statusBadge = document.getElementById("status-badge");
  const counterValue = document.getElementById("counter-value");
  const btnToggle = document.getElementById("btn-toggle");
  const btnToggleIcon = document.getElementById("btn-toggle-icon");
  const btnToggleText = document.getElementById("btn-toggle-text");
  const btnReset = document.getElementById("btn-reset");
  const speedButtons = document.querySelectorAll(".speed-btn");
  const btnBell = document.getElementById("btn-bell");
  const updateDot = document.getElementById("update-dot");
  const btnHide = document.getElementById("btn-hide");
  const btnQuit = document.getElementById("btn-quit");

  // 热键自定义 DOM
  const btnHotkey = document.getElementById("btn-hotkey");
  const lblHotkey = document.getElementById("lbl-hotkey");
  const hotkeyTip = document.getElementById("hotkey-tip");

  // Modal 弹窗元素
  const updateModal = document.getElementById("update-modal");
  const btnModalClose = document.getElementById("btn-modal-close");
  const lblCurVersion = document.getElementById("lbl-cur-version");
  const lblLatestVersion = document.getElementById("lbl-latest-version");
  const updateStatusBox = document.getElementById("update-status-box");
  const updateStatusText = document.getElementById("update-status-text");
  const updateSpinner = document.getElementById("update-spinner");
  const changelogArea = document.getElementById("changelog-area");
  const changelogContent = document.getElementById("changelog-content");
  const updateGuideCard = document.getElementById("update-guide-card");
  const linkGithubRepo = document.getElementById("link-github-repo");
  const lblGithubRepoUrl = document.getElementById("lbl-github-repo-url");
  const btnCheckNow = document.getElementById("btn-check-now");
  const btnCheckText = document.getElementById("btn-check-text");
  const btnDownload = document.getElementById("btn-download");

  // 状态变量
  let currentRunning = false;
  let currentSpeed = 0;
  let localSentCount = 0;
  let previewInterval = null;
  let lastCheckTime = 0;
  let cachedLatestData = null;

  // 热键状态 (默认 F6, VK: 0x75 = 117)
  let currentHotkeyName = localStorage.getItem("autotappo_hotkey_name") || "F6";
  let currentHotkeyVK = parseInt(localStorage.getItem("autotappo_hotkey_vk"), 10) || 0x75;
  let isRecordingHotkey = false;

  const versionText = document.querySelector(".version-text");
  if (versionText) versionText.textContent = CURRENT_VERSION;
  if (lblCurVersion) lblCurVersion.textContent = CURRENT_VERSION;
  if (lblHotkey) lblHotkey.textContent = currentHotkeyName;

  // 更新主界面 UI
  function updateUI(status) {
    if (!status) return;

    currentRunning = status.running;
    currentSpeed = status.speed_mode;
    localSentCount = status.total_sent;

    // 1. 运行状态徽章
    if (statusBadge) {
      if (currentRunning) {
        statusBadge.textContent = t("status.running");
        statusBadge.classList.add("running");
      } else {
        statusBadge.textContent = t("status.paused");
        statusBadge.classList.remove("running");
      }
    }

    // 2. 模拟点击计数
    if (counterValue) {
      counterValue.textContent = localSentCount.toLocaleString();
    }

    // 3. 大按钮状态
    if (btnToggle && btnToggleText && btnToggleIcon) {
      if (currentRunning) {
        btnToggle.classList.add("running");
        btnToggleIcon.textContent = "⏸";
        btnToggleText.textContent = `${t("toggle.pause")} (${currentHotkeyName})`;
      } else {
        btnToggle.classList.remove("running");
        btnToggleIcon.textContent = "▶";
        btnToggleText.textContent = `${t("toggle.start")} (${currentHotkeyName})`;
      }
    }

    // 4. 速度档位高亮
    speedButtons.forEach((btn) => {
      const sp = parseInt(btn.dataset.speed, 10);
      if (sp === currentSpeed) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // 轮询同步状态
  async function pollStatus() {
    if (isTauri) {
      try {
        const status = await invoke("get_status");
        updateUI(status);
      } catch (err) {
        console.error("Failed to fetch status:", err);
      }
    }
  }

  // ---------------- 浏览器独立预览模式支持 ----------------
  if (!isTauri) {
    console.info("💡 当前处于【纯浏览器预览模式】，已自动开启交互模拟与测试。");
    updateUI({
      running: false,
      speed_mode: 0,
      total_sent: 0,
    });

    function startPreviewLoop() {
      if (previewInterval) clearInterval(previewInterval);
      const speedIntervals = [100, 45, 22]; // 休闲(~10/s), 快速(~22/s), 极速(~45/s)
      previewInterval = setInterval(() => {
        if (currentRunning) {
          localSentCount += 1;
          if (counterValue) counterValue.textContent = localSentCount.toLocaleString();
        }
      }, speedIntervals[currentSpeed] || 100);
    }
    startPreviewLoop();
  }

  // ---------------- 交互事件绑定 ----------------
  if (btnToggle) {
    btnToggle.addEventListener("click", async () => {
      if (isTauri) {
        try {
          const newRunning = await invoke("toggle_running");
          currentRunning = newRunning;
          await pollStatus();
        } catch (err) {
          console.error("Failed to toggle running:", err);
        }
      } else {
        currentRunning = !currentRunning;
        updateUI({
          running: currentRunning,
          speed_mode: currentSpeed,
          total_sent: localSentCount,
        });
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", async () => {
      if (isTauri) {
        try {
          await invoke("reset_sent_count");
        } catch (err) {
          console.error("Failed to reset count:", err);
        }
      }
      localSentCount = 0;
      if (counterValue) counterValue.textContent = "0";
    });
  }

  speedButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const mode = parseInt(btn.dataset.speed, 10);
      currentSpeed = mode;
      if (isTauri) {
        try {
          await invoke("set_speed", { mode });
          await pollStatus();
        } catch (err) {
          console.error("Failed to set speed:", err);
        }
      } else {
        updateUI({
          running: currentRunning,
          speed_mode: currentSpeed,
          total_sent: localSentCount,
        });
      }
    });
  });

  const hideWindow = async () => {
    if (isTauri) {
      try {
        await invoke("minimize_to_tray");
      } catch (err) {
        console.error("Failed to minimize:", err);
      }
    } else {
      alert(t("preview.hide"));
    }
  };

  if (btnHide) btnHide.addEventListener("click", hideWindow);

  if (btnQuit) {
    btnQuit.addEventListener("click", async () => {
      if (isTauri) {
        try {
          await invoke("quit_app");
        } catch (err) {
          console.error("Failed to quit app:", err);
        }
      } else {
        alert(t("preview.quit"));
      }
    });
  }

  // ---------------- 全局热键自定义录制逻辑 ----------------
  const FORBIDDEN_HOTKEYS = {
    F7: "hotkey.forbidden.f7",
    F8: "hotkey.forbidden.f8",
    F9: "hotkey.forbidden.f9",
  };

  function getWinVirtualKey(e) {
    if (e.code.startsWith("F") && !isNaN(e.code.slice(1))) {
      const num = parseInt(e.code.slice(1), 10);
      if (num >= 1 && num <= 12) return { vk: 0x6f + num, name: e.code };
    }
    const specialMap = {
      Home: { vk: 0x24, name: "Home" },
      End: { vk: 0x23, name: "End" },
      PageUp: { vk: 0x21, name: "PgUp" },
      PageDown: { vk: 0x22, name: "PgDn" },
      Insert: { vk: 0x2d, name: "Ins" },
      Delete: { vk: 0x2e, name: "Del" },
      Pause: { vk: 0x13, name: "Pause" },
      ScrollLock: { vk: 0x91, name: "ScrLk" },
      Backquote: { vk: 0xc0, name: "`" },
      NumpadAdd: { vk: 0x6b, name: "Num+" },
      NumpadSubtract: { vk: 0x6d, name: "Num-" },
      NumpadMultiply: { vk: 0x6a, name: "Num*" },
      NumpadDivide: { vk: 0x6f, name: "Num/" },
    };
    if (specialMap[e.code]) return specialMap[e.code];

    if (e.code.startsWith("Key")) {
      const char = e.code.slice(3).toUpperCase();
      return { vk: char.charCodeAt(0), name: char };
    }

    return null;
  }

  if (btnHotkey) {
    btnHotkey.addEventListener("click", () => {
      if (isRecordingHotkey) {
        cancelRecording();
        return;
      }
      startRecording();
    });
  }

  function startRecording() {
    isRecordingHotkey = true;
    if (btnHotkey) btnHotkey.classList.add("recording");
    if (lblHotkey) lblHotkey.textContent = t("hotkey.recording");
    if (hotkeyTip) hotkeyTip.textContent = t("hotkey.cancel");

    window.addEventListener("keydown", handleRecordKey, { capture: true });
  }

  function cancelRecording() {
    isRecordingHotkey = false;
    if (btnHotkey) btnHotkey.classList.remove("recording");
    if (lblHotkey) lblHotkey.textContent = currentHotkeyName;
    if (hotkeyTip) hotkeyTip.textContent = t("hotkey.tip");
    window.removeEventListener("keydown", handleRecordKey, { capture: true });
  }

  async function handleRecordKey(e) {
    e.preventDefault();
    e.stopPropagation();

    if (e.key === "Escape") {
      cancelRecording();
      return;
    }

    if (FORBIDDEN_HOTKEYS[e.key]) {
      alert(t("hotkey.forbiddenNote", { msg: t(FORBIDDEN_HOTKEYS[e.key]) }));
      cancelRecording();
      return;
    }

    const result = getWinVirtualKey(e);
    if (!result) {
      alert(t("hotkey.invalid"));
      cancelRecording();
      return;
    }

    currentHotkeyName = result.name;
    currentHotkeyVK = result.vk;

    localStorage.setItem("autotappo_hotkey_name", currentHotkeyName);
    localStorage.setItem("autotappo_hotkey_vk", currentHotkeyVK.toString());

    if (lblHotkey) lblHotkey.textContent = currentHotkeyName;
    if (btnHotkey) btnHotkey.classList.remove("recording");
    if (hotkeyTip) {
      hotkeyTip.textContent = t("hotkey.success");
      setTimeout(() => {
        hotkeyTip.textContent = t("hotkey.tip");
      }, 1500);
    }

    if (isTauri) {
      try {
        await invoke("set_hotkey", { vk: currentHotkeyVK });
      } catch (err) {
        console.error("Failed to set hotkey in backend:", err);
      }
    }

    updateUI({
      running: currentRunning,
      speed_mode: currentSpeed,
      total_sent: localSentCount,
    });

    isRecordingHotkey = false;
    window.removeEventListener("keydown", handleRecordKey, { capture: true });
  }

  if (isTauri) {
    invoke("set_hotkey", { vk: currentHotkeyVK }).catch(() => {});
  }

  // ---------------- 检查更新逻辑 (Gitee 国内直连优先 + 红点感知) ----------------
  function openUpdateModal() {
    if (updateModal) updateModal.classList.add("show");
    if (cachedLatestData) {
      applyUpdateData(cachedLatestData);
    } else {
      checkUpdate({ silent: false });
    }
  }

  function closeUpdateModal() {
    if (updateModal) updateModal.classList.remove("show");
  }

  if (btnBell) btnBell.addEventListener("click", openUpdateModal);
  if (btnModalClose) btnModalClose.addEventListener("click", closeUpdateModal);
  if (updateModal) {
    updateModal.addEventListener("click", (e) => {
      if (e.target === updateModal) {
        closeUpdateModal();
      }
    });
  }

  function compareVersions(v1, v2) {
    const clean1 = (v1 || "").replace(/^v/, "").split(".").map(Number);
    const clean2 = (v2 || "").replace(/^v/, "").split(".").map(Number);
    for (let i = 0; i < Math.max(clean1.length, clean2.length); i++) {
      const num1 = clean1[i] || 0;
      const num2 = clean2[i] || 0;
      if (num1 > num2) return 1;
      if (num1 < num2) return -1;
    }
    return 0;
  }

  async function checkUpdate({ silent = false } = {}) {
    lastCheckTime = Date.now();

    if (!silent) {
      if (updateSpinner) updateSpinner.style.display = "inline-block";
      if (updateStatusBox) updateStatusBox.className = "update-status-box";
      if (updateStatusText) updateStatusText.textContent = t("update.checkingVia");
      if (btnCheckNow) btnCheckNow.disabled = true;
      if (btnCheckText) btnCheckText.textContent = t("update.checkingNow");
      if (changelogArea) changelogArea.style.display = "none";
      if (updateGuideCard) updateGuideCard.style.display = "none";
      if (btnDownload) btnDownload.style.display = "none";
    }

    let latestData = null;
    let source = "Gitee";

    // 1. 优先尝试 Gitee API (国内直连)
    try {
      const res = await fetch(GITEE_API_URL, { headers: { Accept: "application/json" } });
      if (res.ok) {
        latestData = await res.json();
      }
    } catch (e) {
      console.warn("Gitee check failed, trying fallback:", e);
    }

    // 2. 兜底尝试 GitHub API
    if (!latestData || !latestData.tag_name) {
      try {
        source = "GitHub";
        const res = await fetch(GITHUB_API_URL, { headers: { Accept: "application/json" } });
        if (res.ok) {
          latestData = await res.json();
        }
      } catch (e) {
        console.warn("GitHub check failed:", e);
      }
    }

    cachedLatestData = { data: latestData, source };

    if (!silent) {
      if (updateSpinner) updateSpinner.style.display = "none";
      if (btnCheckNow) btnCheckNow.disabled = false;
      if (btnCheckText) btnCheckText.textContent = t("update.checkAgain");
    }

    applyUpdateData(cachedLatestData, silent);
  }

  function applyUpdateData(result, silent = false) {
    if (!result) return;
    const { data: latestData, source } = result;

    if (latestData && latestData.tag_name) {
      const latestTag = latestData.tag_name;
      if (lblLatestVersion) lblLatestVersion.textContent = latestTag;

      const cmp = compareVersions(latestTag, CURRENT_VERSION);
      if (cmp > 0) {
        if (updateDot) updateDot.classList.add("active");
        if (updateStatusBox) updateStatusBox.className = "update-status-box has-new";
        if (updateStatusText) {
          updateStatusText.innerHTML = t("update.newVersion", { tag: latestTag, source: source });
        }

        const body = latestData.body || latestData.description || t("update.fallbackBody");
        if (changelogContent) changelogContent.textContent = body;
        if (changelogArea) changelogArea.style.display = "block";

        const repoUrl = latestData.html_url || "https://github.com/To0Ru/AutoTappo/releases";
        if (updateGuideCard) {
          updateGuideCard.style.display = "flex";
          if (linkGithubRepo) linkGithubRepo.href = repoUrl;
          if (lblGithubRepoUrl) lblGithubRepoUrl.textContent = repoUrl;
        }

        if (btnDownload) {
          btnDownload.href = repoUrl;
          btnDownload.style.display = "inline-flex";
        }
      } else {
        if (updateDot) updateDot.classList.remove("active");
        if (updateStatusBox) updateStatusBox.className = "update-status-box is-latest";
        if (updateStatusText) updateStatusText.textContent = t("update.isLatest", { source: source });
        if (changelogArea) changelogArea.style.display = "none";
        if (updateGuideCard) updateGuideCard.style.display = "none";
        if (btnDownload) btnDownload.style.display = "none";
      }
    } else {
      if (updateDot) updateDot.classList.remove("active");
      if (lblLatestVersion) lblLatestVersion.textContent = CURRENT_VERSION;
      if (updateStatusBox) updateStatusBox.className = "update-status-box is-latest";
      if (updateStatusText) {
        updateStatusText.textContent = t("update.isLatestStable", { ver: CURRENT_VERSION });
      }
      if (changelogArea) changelogArea.style.display = "none";
      if (updateGuideCard) updateGuideCard.style.display = "none";
      if (btnDownload) btnDownload.style.display = "none";
    }
  }

  if (btnCheckNow) btnCheckNow.addEventListener("click", () => checkUpdate({ silent: false }));

  // ---------------- 界面唤醒 / 打开时的静默自动检测逻辑 ----------------
  function triggerAutoCheck() {
    const now = Date.now();
    if (now - lastCheckTime > 60000) {
      checkUpdate({ silent: true });
    }
  }

  window.addEventListener("focus", triggerAutoCheck);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      triggerAutoCheck();
    }
  });
  triggerAutoCheck();

  // ---------------- 语言设置 ----------------
  const langSelect = document.getElementById("lang-select");
  if (langSelect) {
    langSelect.value = window.getCurrentLang();
    langSelect.addEventListener("change", () => {
      window.applyLanguage(langSelect.value);
      if (isTauri) {
        invoke("set_language", { lang: langSelect.value }).catch(() => {});
      }
      updateUI({
        running: currentRunning,
        speed_mode: currentSpeed,
        total_sent: localSentCount,
      });
    });
  }
  window.applyLanguage(window.getCurrentLang());
  updateUI({
    running: currentRunning,
    speed_mode: currentSpeed,
    total_sent: localSentCount,
  });
  if (isTauri) {
    invoke("set_language", { lang: window.getCurrentLang() }).catch(() => {});
  }

  // 启动状态轮询
  pollStatus();
  if (isTauri) {
    setInterval(pollStatus, 500);
  }

  // 挂载全局测试钩子
  window.testNewVersionUI = function () {
    openUpdateModal();
    applyUpdateData({
      data: {
        tag_name: "v0.2.0",
        html_url: "https://github.com/To0Ru/AutoTappo/releases",
        body: "1. 新增【自动开箱】功能，满额自动抽卡\n2. 优化后台静默避让策略，提升长时间挂机稳定性\n3. 支持更多自定义全局快捷键",
      },
      source: "Gitee",
    });
  };
})();

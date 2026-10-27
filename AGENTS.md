# AGENTS.md · AutoTappo 开发者与智能体架构指南

> 本文件为后续在此项目工作的 AI Agent 及人类开发者提供**核心上下文、逆向发现、技术规范、已实现功能清单与新功能路线图**。

---

## 1. 项目背景与定位

**AutoTappo** 是一款专为库洛游戏《鸣潮》（Wuthering Waves）官方桌面宠物挂件 **WuwaTappo**（鸣潮桌宠）打造的**超轻量、纯静默、高拟真后台连点与数据看板助手**。

### 核心体验准则
1. **绝对 0 鼠标干涉**：严禁任何物理鼠标指针抖动、位移或拖拽；
2. **完全后台无感**：用户在正常打字聊天、写代码、玩游戏、看视频时，桌宠在后台全速累计有效点击数；
3. **零快捷键与输入法冲突**：不抢占文本输入、不破坏 Shift 切换中英文状态、不打断鼠标划词；
4. **原生桌面极低内存占用**：Rust + Tauri v2 技术栈，窗口关闭时彻底销毁 WebView2 归还 200MB+ 内存，仅留轻量 Rust 原生线程在托盘常驻守护（参考 `CampusFlow` 托盘模型）；
5. **国内直连秒级更新检测**：优先直连 Gitee 国内开放 API，GitHub API 自动兜底。

---

## 2. 官方桌宠（WuwaTappo）逆向核心发现

通过对官方二进制文件（`WuwaTappo.exe`）及解压后的前端 JavaScript 逆向分析确认：

### 2.1 输入监听机制
- 官方使用 Rust `rdev` 库安装了全局底层输入钩子（`WH_KEYBOARD_LL` 与 `WH_MOUSE_LL`）；
- 当捕获到键鼠动作时，后端向 WebView 抛发 `key-press`、`key-release` 等事件；
- **计数有效性防刷规则**：
  - **长按单个按键不重复计数**（内部 `Set.has(e)` 查重），必须有明确的按键释放（`key-release`）或交替按键；
  - 官方底栏已自带总点击计数器，AutoTappo 无需重复跨进程解密其本地 `.dat` 文件，只需专注于安全发送与本次会话计数。

### 2.2 官方硬编码快捷键（严格避坑指南）
桌宠前端源码中写死了以下系统全局热键，**AutoTappo 严禁占用**：
- **`F7`**：关闭游戏模式 / 恢复鼠标交互；
- **`F8`**：**切换显示器（多屏幕跨屏调度）**（`switchDisplayMonitor.js: It = new Set(["F8", "f8"])`）；
- **`F9`**：**老板键（隐藏/呼出桌宠）**；
- **`Ctrl+Alt+P`**：鼠标穿透开关；
- **`Ctrl+Alt+1~5`**：播放已装备表情包。

> **规范**：AutoTappo 全局热键默认选用 **`F6`**，且提供全键盘自定义录制，但系统内部硬编码拦截 `F7`、`F8`、`F9` 防止冲突。

---

## 3. 防干扰与输入拟真技术规范

### 3.1 幻影按键 (Phantom Keys)
为了确保发送的模拟击键**绝对不在任何编辑器、终端或聊天框打出乱码字符**，且不破坏现有软件快捷键：
- 采用 Windows 虚拟功能扩展键：**`VK_F21` ~ `VK_F24`**（`0x84 ~ 0x87`）；
- 底层工作线程随机交替发射，满足桌宠交替按键去重计数需求。

### 3.2 全场景礼貌避让 (Polite Pausing)
利用 Windows `GetAsyncKeyState` 在发包前毫秒级侦测用户物理操作：
1. **输入法中英文切换保护**：检测到物理 `Shift`、`Ctrl`、`Alt`、`Win` 时立即暂停，松开后附带 180ms 礼貌冷却，确保微软拼音等输入法的 Shift 切换绝不失效；
2. **日常打字避让**：检测到物理 A-Z、0-9、空格、退格、回车时立刻避让；
3. **鼠标划词与拖拽避让**：检测到物理鼠标左键、右键、中键（`0x01, 0x02, 0x04`）处于按下状态时绝不发送按键，不打断用户选中文本。

### 3.3 鼠标指针防消失防护
- 启动时通过 `SystemParametersInfoW(SPI_SETMOUSEVANISH, ...)` 暂时关闭 Windows “键入时隐藏鼠标指针”，程序完全退出时自动恢复；
- 不执行任何改变光标坐标的位移指令，保证 100% 物理手感。

### 3.4 图标多分辨率标准与 WebView2 隔离规范
1. **Windows Multi-frame ICO 规范**：
   - Windows 资源管理器及任务栏要求 `.ico` 必须包含 16x16, 24x24, 32x32, 48x48, 64x64, 128x128, 256x256 全套标准帧，否则易被系统缓存回退或模糊拉伸；
   - `build.rs` 中显式配置 `cargo:rerun-if-changed`，确保 CI 资源更新时 Cargo 绝不沿用旧编译中间件。
2. **WebView2 前端 IIFE 严格隔离规范**：
   - 前端 `web/app.js` 必须使用自执行函数 `(function() { 'use strict'; ... })();` 进行完全闭包隔离；
   - 避免在 WebView2 内部执行上下文切换或热重载时触发 `SyntaxError: Identifier ... has already been declared` 导致整段 JS 解析中断。

---

## 4. 软件架构与工程结构

```
autotappo/
├── .github/workflows/
│   └── build.yml          # GitHub Actions 自动化 CI 流水线 (推送/打Tag自动编译产出便携版与NSIS安装包)
├── src-tauri/
│   ├── Cargo.toml         # 原生轻量依赖 (tauri v2, serde, rand)
│   ├── tauri.conf.json    # 配置 (ID: com.tooru.autotappo, 图标, 窗口尺寸 440x510)
│   ├── capabilities/      # Tauri v2 权限配置
│   └── src/
│       ├── main.rs        # 程序入口、窗口拦截(CloseRequested销毁窗口)、ExitRequested保护
│       ├── tray.rs        # 托盘图标、左键单击呼出、托盘右键上下文菜单
│       ├── window.rs      # 按需创建与销毁主窗口 (彻底释放 WebView2 渲染内存)
│       ├── clicker.rs     # 后台静默连点工作线程 (F21~F24发射、礼貌避让、动态热键监听)
│       └── commands.rs    # IPC 接口 (get_status, toggle_running, set_speed, set_hotkey, reset_count, minimize, quit)
├── web/
│   ├── index.html         # 精致看板 UI (状态卡片、三档速度、自定义热键胶囊、自动开箱预告、更新弹窗)
│   ├── style.css          # 现代化玻璃拟态 UI (移除刺眼彩色Emoji，全单色几何矢量SVG，细腻微光动画)
│   ├── app.js             # 前端控制逻辑 (纯浏览器独立双击预览模式、Gitee/GitHub双通道检测、热键录制)
│   └── logo.png           # 高清矢量 Logo
├── README.md              # 纯用户端说明文档 (CampusFlow 风格)
└── AGENTS.md              # 开发者与 Agent 架构知识库 (本文件)
```

---

## 5. 核心功能已实现清单

1. **Rust 原生挂机引擎**：
   - 三档速度拟真调节：休闲（~10次/秒）、快速（~25次/秒）、极速（~50次/秒）；
   - 随机击键时长（10~30ms）与微停顿（3%几率模拟人手停顿 250~400ms）。
2. **动态全局热键录制**：
   - 默认快捷键 `F6`；
   - 界面点击热键徽章进入录制状态，敲击任意功能键（如 F1~F12、Home、PgUp、小键盘等）按完即生效，支持持久化存储到 `localStorage` 并同步至 Rust 原生线程；
   - 严禁并拦截绑定官方保留的 `F7`、`F8`、`F9`。
3. **CampusFlow 级托盘与窗口生命周期**：
   - 点击主界面右上角关闭或“收进系统托盘”，窗口直接 `destroy()`，彻底释放 200MB~300MB 内存；
   - 单击托盘图标毫秒级重建窗口并恢复当前挂机看板状态。
4. **国内高速双通道更新检测系统**：
   - 优先通过 Gitee 国内 API 查询最新 Release；
   - 若 Gitee 404 或网络波动，无缝降级到 GitHub API 兜底；
   - **界面唤醒自动检测**：每次从托盘点出界面时后台静默查验（内置 60 秒防抖），发现新版时右上角版本胶囊自动出现呼吸发光红点；
   - 弹窗内明确展示 **GitHub 仓库下载地址与一键跳转按钮**。
5. **前端无编译本地即开即看**：
   - 直接双击 `web/index.html` 即可在普通浏览器中体验完整 UI 与交互动效；
   - 控制台内置 `testNewVersionUI()` 快速测试钩子。
6. **双 Git 远端协同**：
   - GitHub: `origin` (`https://github.com/To0Ru/AutoTappo.git`)
   - Gitee: `gitee` (`git@gitee.com:To0Ru/AutoTappo.git`)

---

## 6. 后续规划：自动开箱功能 (Auto-Box Opening)

界面中已预留【🎁 自动开箱 · 待支持】功能展示位，后续版本开发要点：
1. **桌宠开箱机制逆向**：
   - 桌宠点击累计一定阈值或获得宝箱后，UI 会出现可点击的开箱按钮；
   - 研究官方 WebView 中开箱相关的 IPC 事件（如 `open-box`、`claim-reward`）或屏幕像素定位；
2. **实现策略候选**：
   - **方案 A（事件注入/窗口消息）**：如果桌宠 WebView 对特定按键/IPC 有响应，优先使用后台静默触发；
   - **方案 B（礼貌前台模拟）**：仅在检测到桌宠窗口前台且满足开箱条件时，轻巧激活窗口执行一次点击并迅速归位。

---

## 7. 开发者与 Agent 工作准则

- **严禁提交垃圾文件**：严禁提交临时 Python、AHK、.bat 脚本或编译产物；
- **保持 README.md 纯净**：`README.md` 仅包含用户关心的安装、使用和特色，技术与逆向细节统一沉淀在 `AGENTS.md`；
- **多平台同步**：完成功能后，使用 `git push origin main && git push gitee main` 保持两端同步；
- **打 Tag 发布正式版**：
  ```bash
  git tag v0.1.0
  git push origin v0.1.0
  ```
  GitHub Actions 会全自动打包 Release 并挂载 NSIS 安装包与 Portable 便携版。

---

## 8. 多语言设置 (i18n)

- 前端词典：`web/i18n.js`（IIFE + `'use strict'`，与 `app.js` 的隔离规范一致），语言键 `zh`（默认）/ `vi`，`localStorage` 键 `autotappo_lang`。
- 静态文案：`index.html` 用 `data-i18n`（内容）/ `data-i18n-title`（title 属性）标记，`applyLanguage()` 统一刷新；动态文案（状态徽章、启停按钮、更新弹窗）在 `app.js` 里用 `t(key)` / `t(key, { tag, source })`。
- 语言选择器：页脚 `#lang-select`（中文 / Tiếng Việt），切换时调用 `applyLanguage()` + `updateUI()` 刷新动态文案，并通过 `set_language` 命令同步后端。
- 后端：`commands::set_language` → `tray::apply_language()`，用同一组 id（show/toggle/quit）重建托盘菜单（`on_menu_event` 处理逻辑不受影响），并更新窗口标题；`tray::labels()` / `title_for()` 与前端 `app.title` 保持一致。
- 注意：窗口在启动时先以默认中文标题创建，前端加载后发送已保存的语言才会同步标题与托盘；如需启动即正确语言，需把语言持久化到后端启动时可读的文件。

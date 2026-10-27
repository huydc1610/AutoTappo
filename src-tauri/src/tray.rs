//! 系统托盘图标与右键菜单 (参考 CampusFlow 方案)
//!
//! 关闭窗口只是收进系统托盘，后台挂机守护继续运行；真正退出在托盘菜单里。

use std::sync::atomic::Ordering;
use std::sync::Arc;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIcon, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager, Runtime};

use crate::{window, Inner};

/// 托盘菜单文案：(显示面板, 启动/暂停, 退出, 悬浮提示)。
/// 默认中文；`vi` 为越南语（与前端 web/i18n.js 的语言键保持一致）。
pub fn labels(lang: &str) -> (&'static str, &'static str, &'static str, &'static str) {
    if lang == "vi" {
        (
            "Hiển thị bảng điều khiển",
            "Bật / Tạm dừng treo máy (F6)",
            "Thoát AutoTappo",
            "AutoTappo · Trợ lý treo máy WuwaTappo",
        )
    } else {
        (
            "显示控制面板",
            "启动 / 暂停挂机 (F6)",
            "退出 AutoTappo",
            "AutoTappo · 鸣潮桌宠挂机助手",
        )
    }
}

/// 窗口标题（与前端 web/i18n.js 的 app.title 保持一致）。
fn title_for(lang: &str) -> &'static str {
    if lang == "vi" {
        "AutoTappo · Trợ lý treo máy WuwaTappo"
    } else {
        "AutoTappo · 鸣潮桌宠挂机助手"
    }
}

fn build_menu<M: Manager<R>, R: Runtime>(
    app: &M,
    show: &str,
    toggle: &str,
    quit: &str,
) -> tauri::Result<Menu<R>> {
    let show = MenuItem::with_id(app, "show", show, true, None::<&str>)?;
    let toggle = MenuItem::with_id(app, "toggle", toggle, true, None::<&str>)?;
    let sep = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", quit, true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &toggle, &sep, &quit])?;
    Ok(menu)
}

/// 前端切换语言时调用：重建托盘菜单、更新悬浮提示与窗口标题。
/// 菜单项 id 保持不变，因此 build() 里注册的 on_menu_event 处理逻辑继续生效。
pub fn apply_language(app: &AppHandle, inner: &Arc<Inner>, lang: &str) {
    let (show, toggle, quit, tooltip) = labels(lang);
    if let Ok(slot) = inner.tray.lock() {
        if let Some(icon) = slot.as_ref() {
            if let Ok(menu) = build_menu(app, show, toggle, quit) {
                let _ = icon.set_menu(Some(menu));
            }
            let _ = icon.set_tooltip(Some(tooltip));
        }
    }
    if let Some(w) = app.get_webview_window(window::LABEL) {
        let _ = w.set_title(title_for(lang));
    }
}

/// 构建托盘图标句柄。
/// 必须将其存放在 `Inner` 共享状态中，否则句柄析构后托盘图标会随之消失。
pub fn build(app: &tauri::App, inner: Arc<Inner>) -> tauri::Result<TrayIcon> {
    let (show, toggle, quit, tooltip) = labels("zh");
    let menu = build_menu(app, show, toggle, quit)?;

    let inner_for_menu = Arc::clone(&inner);

    let mut builder = TrayIconBuilder::with_id("main")
        .tooltip(tooltip)
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "show" => {
                let _ = window::ensure(app);
            }
            "toggle" => {
                let prev = inner_for_menu.clicker.running.fetch_xor(true, Ordering::SeqCst);
                println!("[Tray] 切换运行状态: {}", if !prev { "运行中" } else { "已暂停" });
            }
            "quit" => {
                inner_for_menu.shutting_down.store(true, Ordering::SeqCst);
                inner_for_menu.clicker.shutdown.store(true, Ordering::SeqCst);
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let _ = window::ensure(tray.app_handle());
            }
        });

    if let Some(icon) = app.handle().default_window_icon() {
        builder = builder.icon(icon.clone());
    }

    let icon = builder.build(app)?;
    Ok(icon)
}

# 青春沿岸 / qcya_ovo

这是我的公开个人主页。用原生 HTML、CSS、JavaScript 构建，以浅粉 / 浅蓝平面设计和响应式排版为主，保留小尺寸个人头像及深浅色模式。

**站点：** https://qcya.github.io/qcya_ovo-file/

## 页面内容（首页、关于、公开作品、联系方式）

- 首页：纯 CSS 平面设计海报 / 个人简介
- 关于：资料、技能标签与网站由来
- 公开作品：音乐下载器、小白助手 AstrBot 插件
- 联系入口：GitHub 主页和 [Bilibili 个人空间](https://space.bilibili.com/1576380674)

仅展示已经公开的项目。不包括任何未公开、尚未完成的私人项目，也不展示 TG bot 或旧视频直链。

## 预览

直接打开 `qcya_ovo/index.html`，或者运行本地静态 HTTP 服务器：

```bash
cd qcya_ovo
python -m http.server 8000
```

打开 `http://localhost:8000/`。

## GitHub Pages

GitHub Pages 设置为 `main` 分支、`/(root)` 目录。根目录的 `index.html` 会跳转到 `qcya_ovo/index.html`。提交到 `main` 后网站会自动更新。

## 文件

| 文件 | 用途 |
|---|---|
| `qcya_ovo/index.html` | 页面结构与内容 |
| `qcya_ovo/assets/site.css` | 平面设计样式、移动端布局与深浅主题 |
| `qcya_ovo/assets/site.js` | 主题切换与导航 |
| `qcya_ovo/assets/avatar.webp` | 站主头像（仅 34px 和 48px 展示） |

仓库仍保留旧版静态素材作为历史文件，但最新版页面不再使用任何角色立绘。

旧版音乐播放相关代码已从网页中移除，历史静态文件仍留存于仓库中但不再加载。

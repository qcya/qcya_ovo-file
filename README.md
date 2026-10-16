# 青春沿岸 / QCYA

这是我的公开个人主页。用原生 HTML、CSS、JavaScript 构建，以浅粉 / 浅蓝平面设计和响应式排版为主，保留小尺寸个人头像、深浅色模式和可选音乐功能。

**站点：** https://qcya.github.io/qcya_ovo-file/

## 页面内容

- 首页：纯 CSS 平面设计海报 / 个人简介
- 关于：资料、技能标签与网站由来
- 公开作品：音乐下载器、小白助手 AstrBot 插件、本站源代码
- 音乐角落：只有主动点击按钮才尝试访问第三方旧歌单，不会自动播放
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
| `qcya_ovo/assets/site.js` | 主题切换、导航、作品筛选、手动音乐加载 |
| `qcya_ovo/assets/avatar.webp` | 站主头像（仅 34px 和 48px 展示） |
| `qcya_ovo/static/APlayer-1.10.1/` | 原网站的播放器库，按需加载 JavaScript |

仓库仍保留旧版静态素材作为历史文件，但最新版页面不再使用任何角色立绘。

### 第三方服务

旧版歌单依赖第三方 Meting API。由于服务可用性、跨域限制和版权限制，无法保证能够播放；接口不可用时不影响网站其余部分。

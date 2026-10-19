# 青春沿岸 / qcya_ovo

个人主页：https://qcya.github.io/qcya_ovo-file/

粉蓝平面设计、小头像、公开作品与联系方式。纯静态页面，无访客端框架、第三方脚本、音乐 API、分析追踪或后台服务。

## 这次更新

- 修复页面底部导航高亮、装饰层横向溢出、手机菜单关闭和焦点返回。
- 外观支持浅色、深色、跟随系统；沿用旧版本偏好，并同步系统变更和浏览器主题色。
- 手机海报改为横幅，主按钮使用深色文字，深色模式单独处理项目封面。
- 下载器提供最新发布页入口；插件提供安装说明。原生折叠详情无需 JavaScript。
- 复制失败会显示可手动选择的文本，不会虚报“已复制”。
- 统一公开内容配置；根目录直接显示正式页面，旧地址保留跳转。
- 加入 1200×630 分享封面及基本分享信息。各平台实际抓取效果需分别验证。

## 修改内容

`site.json` 仅维护站主确认过的公开名称和链接。`src/index.html` 维护文案与版式。修改后运行：

```bash
python scripts/build.py
python scripts/build.py --check
```

生成的根目录 `index.html` 需要一起提交。GitHub Pages 仍可用 `main` / `/(root)`，无需切换现有部署方式。

本地预览：`python -m http.server 8765`，打开 `http://localhost:8765/`。

需要精简发布包时，运行 `python scripts/build.py --out _site` 到空目录。该命令只复制允许发布的页面和素材，不包含旧音乐库和角色素材。当前仓库历史及旧素材没有被删除。

## 测试

```bash
python -m pip install pytest==9.0.2 playwright==1.57.0
python -m playwright install chromium
python -m http.server 8765
# 另一个终端：
python -m pytest -q tests
```

GitHub Actions 在独立浏览器测试下载入口、系统/持久主题、菜单、10 种视口、页面边界、静态内容和复制失败降级，保留测试截图。CI 仅有仓库读取权限，不修改代码，不改变 Pages 的发布来源。

`INLINE_SITE` 是仅用于受限离线环境的测试选项：把磁盘页面、样式、脚本内联进隔离文档。该模式跳过必须具有真实 HTTP origin 的持久化测试；不能当成线上测速或真实设备测试。

## 公开范围

只展示音乐下载器、小白助手。英文展示 ID 为 `qcya_ovo`，GitHub 实际账号为 `qcya`。Bilibili 链接必须指向 `https://space.bilibili.com/1576380674`。

不从聊天历史或全部仓库列表自动扩充作品。不展示私人项目、TG bot、旧视频、本站源码卡、角色立绘或虚假在线状态。

项目封面仍为概念性平面设计。未找到可复用的真实产品截图，因此没有伪造功能截图；功能说明依据公开仓库，实际效果以应用为准。

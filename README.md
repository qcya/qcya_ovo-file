# 青春沿岸 / qcya_ovo · 个人主页

静态个人主页，保留淡粉 + 淡蓝平面视觉、小头像与原生 HTML/CSS/JS。页面展示已公开的两个项目：音乐下载器和小白助手；入口为实际使用、安装和开源仓库。

- 公开网站：[https://qcya.github.io/qcya_ovo-file/](https://qcya.github.io/qcya_ovo-file/)
- Bilibili 个人空间：[https://space.bilibili.com/1576380674](https://space.bilibili.com/1576380674)
- GitHub：[https://github.com/qcya](https://github.com/qcya)

## 改动内容

- 首页由仓库根目录的 `index.html` 直接发布，不再二次跳转。
- 手机端海报收紧成横向比例，避免大面积重复留白。
- 滚动到底部能够正确定位“联系”导航；手机菜单支持点外部关闭、Escape 和焦点恢复。
- 支持浅色、深色、跟随系统三个主题；读取失败时自然降级。
- 公开项目分别提供最新发布页／安装说明、源码入口、可展开详情。
- 联系方式提供复制 ID／B站链接，浏览器拒绝剪贴板权限时可手动复制。
- 增加了可供社交分享的矢量封面和可重复运行的静态检查。
- 未展示 OC、未公开项目、失效音乐接口、旧视频或 TG bot。

## 修改内容

修改 `content/site.json` 中已审核的名称、简介和公开链接后：

```bash
python scripts/build.py
python scripts/build.py --check
python -m unittest discover -s tests -v
node --check qcya_ovo/assets/site.js
```

请将生成的 `index.html` 与配置文件一起提交。构建仅使用 Python 标准库，不需要 Node 包管理器。

**注意：** 公开项目是手动审核的允许清单，不会自动把私有项目或仓库同步至主页。增加公开项目时，需要更新 `scripts/build.py` 内的公开源地址白名单和 `content/site.json`。私人内容不要放进发布仓库。

## GitHub Pages

在仓库 Settings → Pages 选择 **Deploy from a branch → main → /(root)**。项目地址保持不变。分支更新后由 GitHub Pages 重新发布。

`qcya_ovo/index.html` 与旧联系人地址保留兼容跳转。旧版素材仍在历史目录中，不参与新版首页加载。

## 检查与限制

GitHub Actions 会验证生成代码、资源路径、公开链接与脚本语法。分享封面使用 SVG：部分社交平台不会自动展示 SVG 缩略图，可后续将同版封面导出 PNG 替换 `og:image`，无需改变网页主视觉。

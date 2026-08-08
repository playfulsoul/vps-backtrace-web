# VPS 跨境路由综合测绘平台 🚀

一个极其轻量、现代化的纯前端测绘应用，专注于帮助 VPS 玩家一键自动化评估商家到中国大陆地区三网（电信、联通、移动）的核心路由质量，包括 **MTR 深度路径分析** 与 **极速 Ping 测绘**。

> 🌐 **在线体验 / 部署地址**： [https://playfulsoul.github.io/vps-backtrace-web/](https://playfulsoul.github.io/vps-backtrace-web/)

---

## ✨ 核心特性

- **一键书签提取器 (Bookmarklet)**：丢掉繁琐的浏览器 F12 抓包！将智能书签拖入收藏夹，在任意 WHMCS / HostBill 等主流商家 Looking Glass 页面轻轻一点，即可**全自动嗅探所有节点的 API 与发包参数**，直接带回本平台。
- **多种测绘模式引擎**：
  - **🏓 Ping (极速模式)**：并发执行，快速扫描全地域延迟和丢包率，迅速淘汰劣质机房。
  - **⚡ Traceroute (路由模式)**：追踪路径，解析节点走向。
  - **📊 MTR (深度模式)**：深层次挖掘骨干网跳数及各节点的稳定性与抖动情况。
- **商家多机房横向比拼 (Dashboard)**：首创三网自动选优算法。无论商家提供多少个可选机房，系统自动提取“最优宽带（低丢包、低延迟）”为您生成排行看板。
- **纯粹的前端应用**：基于现代化的 **Vite + React 18 + TailwindCSS 4** 重构。零服务器依赖，零后门风险，纯浏览器端并发发包（依赖目标 API 的支持）。所有用户习惯（目标大区、自定义 IP、发包 Payload）均借助 `LocalStorage` 本地持久化保存。

---

## 👨‍💻 小白用户怎么用？

1. 进入在线网页地址：[https://playfulsoul.github.io/vps-backtrace-web/](https://playfulsoul.github.io/vps-backtrace-web/)
2. 在网页顶部，找到蓝色的按钮 **`🔖 + VPS 路由一键捕获`**。
3. **按住这个按钮**，把它拖拽到你浏览器的顶部书签栏/收藏夹（变成一个书签）。
4. 以后去任何买机器的测试页面（比如 Looking Glass），只要点一下这个书签，系统就会自动帮你把这个商家的所有测试机房信息抓进平台里，一键开测！

---

## 🛠️ 极客玩家 / 二次开发指南

项目采用现代前端工程化架构，开箱即用，扩展极度友好。

### 环境依赖
请确保你的电脑已经安装了 `Node.js` (建议 v18+)。

### 启动项目
```bash
# 克隆代码
git clone https://github.com/playfulsoul/vps-backtrace-web.git
cd vps-backtrace-web

# 安装依赖包
npm install

# 启动本地热更新开发服务器
npm run dev
```

### 构建与部署
项目已内置 **GitHub Actions**。当您把代码 push 到 `main` 分支时，系统会自动将代码通过 Vite 构建，并部署到 `gh-pages` 分支上，无需人工介入。

如果您需要手工打包：
```bash
npm run build
```
编译产物位于 `dist/` 目录中，可直接上传到任何静态托管服务。

---

## 📝 鸣谢与历史

* 本项目经历了从原生单体 `index.html` 到现代化 `React` 架构的彻底洗礼。老版本的单文件 HTML 保存在 `legacy_v1.2` 目录中以作纪念。
* IP 归属地与骨干网数据解析逻辑经过反复调优，最大限度地在前端过滤噪音，还原最真实的路由情况。

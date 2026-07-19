# 🚀 VPS 跨境路由综合测绘平台 (VPS Route Trace Radar)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Pure Frontend](https://img.shields.io/badge/100%25_Pure_Frontend-Success?style=for-the-badge)

这是一个专为 VPS 深度评测与网络极客打造的**纯前端多节点回程路由分析工具**。通过逆向解析各大机房 Looking Glass API，实现一键测绘全球节点至国内三网（电信、联通、移动）的真实物理链路与 BGP 走向。

👉 **在线体验 (Live Demo) : [https://playfulsoul.github.io/vps-backtrace-web/](https://playfulsoul.github.io/vps-backtrace-web/)**

---

## ✨ 核心硬核特性

*   **🛠️ 万能 Payload 转化引擎**
    彻底告别硬编码！支持将 F12 抓包获取的任意机房乱码对象，一键净化、补全双引号，并自动注入 `{{IP}}` 与 `{{LOC}}` 变量。完美兼容 JSON 与 Form Data 双模接口。
*   **📍 物理绕路地理雷达**
    内置全球核心骨干网 IATA 机场代码嗅探器。精准剥离“逻辑直连”的营销伪装，若亚洲直连线路途径欧美澳等节点，自动触发 **`⚠️ 物理绕路`** 红色警报。
*   **🧬 三网骨干特征精准识别**
    *   **高端精品网**：秒速识别 电信 CN2 GIA、联通 CUII (9929)、移动 CMIN2。
    *   **公众骨干网**：精准分类 163、169、CMNET 及 CERNET/CSTNET。
    *   **国际大鳄探针**：内置 NTT, Cogent, GTT, Telia, RETN, Tata 等近 20 家 Tier-1 运营商暗号字典。
*   **🗂️ 级联日志手风琴 UI**
    强迫症福音的排版逻辑。摘要显示最终结论，点击任意一行丝滑展开**强制单行对齐**的原厂纯净 Traceroute 溯源日志，方便截图留证。
*   **🔒 零隐私泄露 (纯前端)**
    所有请求均在用户浏览器本地完成异步队列分发。**无后端数据库，无请求日志中转**，你的“自定义本机测试 IP”绝对安全。

---

## 📖 极速上手指南

1.  **获取接口**：在目标 VPS 商家的 Looking Glass 页面按 `F12`，抓取测速请求的 API 网址，填入第一步。
2.  **提取暗号**：将抓包请求体（Payload）中的原始数据复制到第二步的黑框中，点击 **✨ 格式规范化转换**。
3.  **选择靶机**：勾选内置的全国核心大区枢纽，或勾选“自定义目标 IP”并点击 **🌐 获取本机 IP** 进行零门槛家宽测速。
4.  **执行测绘**：点击底部蓝色大按钮，静待硬核报告生成。支持一键导出 Markdown 纯文本数据，方便粘贴至评测博客或视频简介。

---

## 📚 路由术语防坑指南 (速查表)

*   **物理直连 vs 逻辑直连**：BGP 层面没有经过第三方 ASN 不代表物理距离最短。请密切关注本工具输出的“地理途径”警报。
*   **晚高峰测试**：国际中转网（如 NTT / Cogent）在白天可能延迟极低，建议在 20:00 - 23:00 之间重新测绘，以观察 163 等骨干网真实的拥堵与丢包情况。

---

## 🤝 贡献与自定义扩充

本工具极其轻量。如果你发现了新的奇葩绕路节点或特殊的国际中转商，只需在 `index.html` 的 `analyzeRoute` 函数中，添加一行简短的正则规则即可让雷达无限进化：

```javascript
// 扩充示例：
if (tText.match(/moscow|mow|vvo/i)) geoNodes.push("🇷🇺俄罗斯");

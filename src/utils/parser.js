// 节点位置智能解析 (包含 ISO 国家代码、常用城市及智能子域名提取 Fallback)
export function parseLocation(url) {
    if (!url) return "DEFAULT";
    try {
        const u = url.toLowerCase();
        
        const locMap = [
            { regex: /\b(tr|turkey|bursa|istanbul|ist)\b/i, label: "🇹🇷 土耳其" },
            { regex: /\b(de|germany|frankfurt|fra|limburg)\b/i, label: "🇩🇪 德国" },
            { regex: /\b(uk|gb|london|lhr|england)\b/i, label: "🇬🇧 英国" },
            { regex: /\b(us|america|los-angeles|la|lax|san-jose|sjc|seattle|sea|ashburn|iad|chicago|ord|nyc|new-york|dallas|dfw)\b/i, label: "🇺🇸 美国" },
            { regex: /\b(ca|canada|toronto|yyz|vancouver|yvr)\b/i, label: "🇨🇦 加拿大" },
            { regex: /\b(sg|singapore|sin)\b/i, label: "🇸🇬 新加坡" },
            { regex: /\b(hk|hong-kong|hkg)\b/i, label: "🇭🇰 香港" },
            { regex: /\b(jp|japan|tokyo|nrt|hnd|osaka|kix)\b/i, label: "🇯🇵 日本" },
            { regex: /\b(kr|korea|seoul|icn|sel)\b/i, label: "🇰🇷 韩国" },
            { regex: /\b(nl|netherlands|amsterdam|ams)\b/i, label: "🇳🇱 荷兰" },
            { regex: /\b(fr|france|paris|cdg)\b/i, label: "🇫🇷 法国" },
            { regex: /\b(bg|bulgaria|sofia|sof)\b/i, label: "🇧🇬 保加利亚" },
            { regex: /\b(ie|ireland|dublin)\b/i, label: "🇮🇪 爱尔兰" },
            { regex: /\b(fi|finland|helsinki|hel)\b/i, label: "🇫🇮 芬兰" },
            { regex: /\b(se|sweden|stockholm|arn)\b/i, label: "🇸🇪 瑞典" },
            { regex: /\b(pl|poland|warsaw|waw)\b/i, label: "🇵🇱 波兰" },
            { regex: /\b(it|italy|milan|mxp)\b/i, label: "🇮🇹 意大利" },
            { regex: /\b(es|spain|madrid|mad)\b/i, label: "🇪🇸 西班牙" },
            { regex: /\b(ch|switzerland|zurich|zrh)\b/i, label: "🇨🇭 瑞士" },
            { regex: /\b(ru|russia|moscow|mow)\b/i, label: "🇷🇺 俄罗斯" },
            { regex: /\b(au|australia|sydney|syd|melbourne|mel)\b/i, label: "🇦🇺 澳大利亚" },
            { regex: /\b(ae|uae|dubai|dxb)\b/i, label: "🇦🇪 迪拜" }
        ];

        for (let item of locMap) {
            if (item.regex.test(u)) {
                return item.label;
            }
        }

        // 智能提取子域名 Fallback
        const hostMatch = u.match(/https?:\/\/([a-z0-9-]+)\./i);
        if (hostMatch && hostMatch[1]) {
            let sub = hostMatch[1].replace(/^lg-?/i, '').toUpperCase();
            if (sub.length >= 2) return sub;
        }

        return "UNKNOWN";
    } catch (e) {
        return "DEFAULT";
    }
}

// 正则提取最终延迟
export function extractLatency(rawText) {
    const msRegex = /([0-9.]+)\s*ms/g;
    let match;
    let lastLatency = null;
    while ((match = msRegex.exec(rawText)) !== null) {
        lastLatency = parseFloat(match[1]);
    }
    return lastLatency ? `${lastLatency.toFixed(1)}ms` : '无响应';
}

export function isPrivateIP(host) {
    if (!host) return false;
    const match = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (match) {
        const o1 = parseInt(match[1], 10);
        const o2 = parseInt(match[2], 10);
        if (o1 === 10) return true;
        if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
        if (o1 === 192 && o2 === 168) return true;
        if (o1 === 127) return true;
    }
    return false;
}

// 路由特征分析字典 (包含地理嗅探模块)
export function analyzeRoute(rawText) {
    if (!rawText) return { route: "探测无响应", isDirect: false, transit: [], geoPath: [], cityPath: [] };
    
    let typeTag = "直连";
    let domesticTag = "未知线路";
    let transitGates = [];
    let geoNodes = [];
    const tText = rawText.toLowerCase();

    // ================= 细粒度城市/国家节点精准追踪 =================
    const logLines = rawText.split(/\r?\n/);
    let rawCityNodes = [];

    for (let line of logLines) {
        // 将分隔符转为空格，并剥离连接在主机名末尾的接口/路由器编号
        const normLine = line.replace(/[-_./:]/g, ' ').replace(/([a-zA-Z]+)\d+/g, '$1');
        
        // 细粒度城市/国家节点判定
        if (normLine.match(/\b(london|lhr|lon)\b/i)) rawCityNodes.push("🇬🇧伦敦");
        if (normLine.match(/\b(amsterdam|ams)\b/i)) rawCityNodes.push("🇳🇱阿姆斯特丹");
        if (normLine.match(/\b(paris|cdg|prs)\b/i)) rawCityNodes.push("🇫🇷巴黎");
        if (normLine.match(/\b(frankfurt|fra|ffm|limburg)\b/i)) rawCityNodes.push("🇩🇪法兰克福");
        if (normLine.match(/\b(sofia|sof)\b/i)) rawCityNodes.push("🇧🇬索菲亚");
        if (normLine.match(/\b(zurich|zrh)\b/i)) rawCityNodes.push("🇨🇭苏黎世");
        if (normLine.match(/\b(stockholm|arn)\b/i)) rawCityNodes.push("🇸🇪斯德哥尔摩");
        if (normLine.match(/\b(helsinki|hel)\b/i)) rawCityNodes.push("🇫🇮赫尔辛基");
        if (normLine.match(/\b(warsaw|waw)\b/i)) rawCityNodes.push("🇵🇱华沙");
        if (normLine.match(/\b(milan|mxp)\b/i)) rawCityNodes.push("🇮🇹米兰");
        if (normLine.match(/\b(madrid|mad)\b/i)) rawCityNodes.push("🇪🇸马德里");
        if (normLine.match(/\b(istanbul|ist)\b/i)) rawCityNodes.push("🇹🇷伊斯坦布尔");
        if (normLine.match(/\b(moscow|mow|svo)\b/i)) rawCityNodes.push("🇷🇺莫斯科");

        if (normLine.match(/\b(singapore|sin|sgp)\b/i)) rawCityNodes.push("🇸🇬新加坡");
        if (normLine.match(/\b(hong[-_]?kong|hkg|hk)\b/i)) rawCityNodes.push("🇭🇰香港");
        if (normLine.match(/\b(tokyo|nrt|hnd)\b/i)) rawCityNodes.push("🇯🇵东京");
        if (normLine.match(/\b(osaka|kix)\b/i)) rawCityNodes.push("🇯🇵大阪");
        if (normLine.match(/\b(seoul|sel|icn)\b/i)) rawCityNodes.push("🇰🇷首尔");

        if (normLine.match(/\b(los[-_]?angeles|lax|la)\b/i)) rawCityNodes.push("🇺🇸洛杉矶");
        if (normLine.match(/\b(san[-_]?jose|sjc)\b/i)) rawCityNodes.push("🇺🇸圣何塞");
        if (normLine.match(/\b(seattle|sea)\b/i)) rawCityNodes.push("🇺🇸西雅图");
        if (normLine.match(/\b(ashburn|iad)\b/i)) rawCityNodes.push("🇺🇸阿什本");
        if (normLine.match(/\b(new[-_]?york|nyc)\b/i)) rawCityNodes.push("🇺🇸纽约");
        if (normLine.match(/\b(chicago|ord)\b/i)) rawCityNodes.push("🇺🇸芝加哥");
        if (normLine.match(/\b(dallas|dfw)\b/i)) rawCityNodes.push("🇺🇸达拉斯");
        if (normLine.match(/\b(toronto|yyz)\b/i)) rawCityNodes.push("🇨🇦多伦多");
        if (normLine.match(/\b(vancouver|yvr)\b/i)) rawCityNodes.push("🇨🇦温哥华");

        if (normLine.match(/\b(sydney|syd)\b/i)) rawCityNodes.push("🇦🇺悉尼");
        if (normLine.match(/\b(melbourne|mel)\b/i)) rawCityNodes.push("🇦🇺墨尔本");
        if (normLine.match(/\b(dubai|dxb)\b/i)) rawCityNodes.push("🇦🇪迪拜");

        // 粗粒度大洲归纳
        if (normLine.match(/\b(los[-_]?angeles|lax|san[-_]?jose|sjc|seattle|sea|ashburn|iad|chicago|ord|palo[-_]?alto|paix|new[-_]?york|nyc|dallas|dfw|toronto|yyz|vancouver|yvr)\b/i)) geoNodes.push("🇺🇸美洲");
        if (normLine.match(/\b(frankfurt|fra|london|lhr|amsterdam|ams|paris|cdg|sofia|limburg|zurich|zrh|stockholm|helsinki|warsaw|milan|madrid|istanbul|ist)\b/i)) geoNodes.push("🇪🇺欧洲");
        if (normLine.match(/\b(tokyo|nrt|hnd|osaka|kix|japan)\b/i)) geoNodes.push("🇯🇵日本");
        if (normLine.match(/\b(singapore|sin|sgp)\b/i)) geoNodes.push("🇸🇬新加坡");
        if (normLine.match(/\b(hong[-_]?kong|hkg)\b/i)) geoNodes.push("🇭🇰香港");
        if (normLine.match(/\b(seoul|sel|icn|korea)\b/i)) geoNodes.push("🇰🇷韩国");
        if (normLine.match(/\b(moscow|mow|svo|vladivostok|vvo)\b/i)) geoNodes.push("🇷🇺俄罗斯");
        if (normLine.match(/\b(dubai|dxb|uae)\b/i)) geoNodes.push("🇦🇪中东");
        if (normLine.match(/\b(sydney|syd|melbourne|mel|auckland|australia)\b/i)) geoNodes.push("🇦🇺澳洲");
    }

    // 保持物理跳转顺序，去重相邻重复节点
    let cityPath = [];
    for (let cNode of rawCityNodes) {
        if (cityPath.length === 0 || cityPath[cityPath.length - 1] !== cNode) {
            cityPath.push(cNode);
        }
    }
    let uniqueGeo = [...new Set(geoNodes)];

    // ================= 国际骨干网特征嗅探 =================
    if (tText.includes("ntt.net") || rawText.includes("129.250.")) transitGates.push("NTT");
    if (tText.includes("cogentco") || rawText.includes("130.117.") || rawText.includes("154.54.")) transitGates.push("Cogent");
    if (tText.includes("retn.net") || rawText.includes("87.245.")) transitGates.push("RETN");
    if (tText.includes("comcast") || rawText.includes("68.86.")) transitGates.push("Comcast");
    if (tText.includes("gtt.net") || tText.includes("ti.ws") || rawText.includes("141.136.")) transitGates.push("GTT");
    if (tText.includes("tata") || rawText.includes("64.86.") || tText.includes("as6453")) transitGates.push("Tata");
    if (tText.includes("pccw") || rawText.includes("63.218.")) transitGates.push("PCCW");
    if (tText.includes("telia.net") || tText.includes("arelion")) transitGates.push("Telia");
    if (tText.includes("telstra") || rawText.includes("202.84.")) transitGates.push("Telstra");
    if (tText.includes("singtel") || rawText.includes("203.208.")) transitGates.push("Singtel");
    if (tText.includes("he.net") || rawText.includes("184.105.") || rawText.includes("72.52.")) transitGates.push("HE");
    if (tText.includes("level3.net") || rawText.includes("4.69.") || rawText.includes("4.68.")) transitGates.push("Level3");
    if (tText.includes("zayo") || tText.includes("above.net")) transitGates.push("Zayo");
    if (tText.includes("seabone")) transitGates.push("Sparkle");
    if (tText.includes("opentransit")) transitGates.push("Orange");
    if (tText.includes("bics.com")) transitGates.push("BICS");

    let uniqueTransit = [...new Set(transitGates)];
    if (uniqueTransit.length > 0) typeTag = `中转`;

    // ================= 国内落地特征字典 (ASN + IP 段) =================
    if (rawText.includes("4809") || rawText.includes("CN2") || rawText.includes("59.43.")) {
        domesticTag = "电信 CN2 GIA (AS4809)";
    } else if (rawText.includes("9929") || rawText.includes("CUII") || rawText.includes("210.14.") || rawText.includes("218.105.") || rawText.includes("210.51.")) {
        domesticTag = "联通 CUII (AS9929)";
    } else if (rawText.includes("58807") || rawText.includes("CMIN2")) {
        domesticTag = "移动 CMIN2 (AS58807)";
    } else if (rawText.includes("4837") || rawText.includes("219.158.")) {
        domesticTag = "联通 169 (AS4837)";
    } else if (rawText.includes("4134") || rawText.includes("202.97.")) {
        domesticTag = "电信 163 (AS4134)";
    } else if (rawText.includes("58453") || rawText.includes("CMI") || rawText.includes("223.120.") || rawText.includes("223.121.")) {
        domesticTag = "移动 CMI (AS58453)";
    } else if (rawText.includes("9808") || rawText.includes("221.183.") || rawText.includes("211.136.")) {
        domesticTag = "移动 CMNET (AS9808)";
    } else if (rawText.includes("4538") || rawText.includes("cernet") || rawText.includes("101.4.")) {
        domesticTag = "教育网 CERNET (AS4538)";
    } else if (rawText.includes("5009") || rawText.includes("cstnet")) {
        domesticTag = "科技网 CSTNET (AS5009)";
    }

    return { route: domesticTag, isDirect: typeTag === "直连", transit: uniqueTransit, geoPath: uniqueGeo, cityPath: cityPath };
}

// MTR 日志独立解析引擎 (包含降级识别与 Loss%/Avg/StDev 提取)
export function parseMtrLog(rawText) {
    if (!rawText) return { isFallback: true, ...analyzeRoute(rawText) };

    const tText = rawText.toLowerCase();

    // 1. 检查 API 是否不支持 MTR 命令，触发自动优雅降级
    if (tText.includes("command not found") || tText.includes("unsupported") || tText.includes("invalid command") || tText.includes("unknown command") || tText.includes("not allowed")) {
        let routeResult = analyzeRoute(rawText);
        routeResult.isFallback = true;
        routeResult.fallbackReason = "LG 不支持 MTR，已回退为 Traceroute";
        return routeResult;
    }

    // 2. 复用骨干网与地理走向分析逻辑
    const routeResult = analyzeRoute(rawText);

    let lossRate = null;
    let avgLatency = null;
    let stdev = null;

    const lines = rawText.split(/\r?\n/);
    let validMtrRows = [];

    for (let line of lines) {
        let trimmed = line.trim();
        if (!trimmed) continue;
        
        // 通用 MTR 表格格式正则:
        // [Hop] [Host/IP] [Loss%] [Snt] [Last] [Avg] [Best] [Wrst] [StDev]
        const mtrRowRegex = /(?:\d+[\.\|-]+|\b\d+\b)\s+([^\s]+)?\s*([0-9.]+)%?\s+(\d+)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s+([0-9.]+))?/;
        const match = trimmed.match(mtrRowRegex);

        if (match) {
            validMtrRows.push({
                host: match[1] || "",
                loss: parseFloat(match[2]),
                snt: parseInt(match[3]),
                last: parseFloat(match[4]),
                avg: parseFloat(match[5]),
                best: parseFloat(match[6]),
                wrst: parseFloat(match[7]),
                stdev: match[8] !== undefined ? parseFloat(match[8]) : null
            });
        }
    }

    if (validMtrRows.length > 0) {
        const respondingHops = validMtrRows.filter(r => !((r.host === "???" || r.loss === 100.0) && r.avg === 0.0));
        const publicRespondingHops = respondingHops.filter(r => !isPrivateIP(r.host));

        const targetHop = (publicRespondingHops.length > 0) 
            ? publicRespondingHops[publicRespondingHops.length - 1] 
            : ((respondingHops.length > 0) ? respondingHops[respondingHops.length - 1] : validMtrRows[validMtrRows.length - 1]);

        lossRate = targetHop.loss;
        avgLatency = targetHop.avg;
        stdev = targetHop.stdev;
    } else {
        const lossMatch = rawText.match(/([0-9.]+)%/);
        if (lossMatch) lossRate = parseFloat(lossMatch[1]);
        const latencyStr = extractLatency(rawText);
        if (latencyStr && latencyStr !== '无响应') {
            avgLatency = parseFloat(latencyStr);
        }
        
        if (lossRate === null && avgLatency === null) {
            routeResult.isFallback = true;
            routeResult.fallbackReason = "未识别到 MTR 格式日志，已按 Traceroute 展示";
            return routeResult;
        }
    }

    routeResult.isMtr = true;
    routeResult.lossRate = lossRate !== null ? lossRate : 0;
    routeResult.avgLatency = avgLatency !== null ? `${avgLatency.toFixed(1)}ms` : extractLatency(rawText);
    routeResult.stdev = stdev !== null ? `${stdev.toFixed(1)}ms` : null;

    return routeResult;
}

export function parsePingLog(rawText) {
    if (!rawText) return { route: "探测无响应", isDirect: false, transit: [], geoPath: [], cityPath: [], isFallback: true, fallbackReason: "无日志" };
    
    const routeResult = { route: "未知路由(Ping模式不追踪)", isDirect: true, transit: [], geoPath: [], cityPath: [], isPing: true };
    
    const lossMatch = rawText.match(/([0-9.]+)%\s*(?:packet\s*)?loss/i);
    routeResult.lossRate = lossMatch ? parseFloat(lossMatch[1]) : 0;
    
    const avgMatch = rawText.match(/min\/avg\/max[a-z\/= ]+[\d.]+\/([\d.]+)\/[\d.]+/i) || rawText.match(/avg.*?=.*?([\d.]+)/i);
    if (avgMatch) {
        routeResult.avgLatency = `${parseFloat(avgMatch[1]).toFixed(1)}ms`;
    } else {
        routeResult.avgLatency = extractLatency(rawText);
    }
    
    return routeResult;
}

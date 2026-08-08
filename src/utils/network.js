import { analyzeRoute, parseMtrLog, parsePingLog } from './parser';

export async function fetchRouteData({ apiUrl, payloadTemplate, targetIP, locationKey, mode }) {
    try {
        let processedPayloadStr = payloadTemplate.replace("{{IP}}", targetIP).replace("{{LOC}}", locationKey);
        let headers = {};
        let bodyData = processedPayloadStr;
        
        if (processedPayloadStr.trim().startsWith("{")) {
            headers["Content-Type"] = "application/json";
            bodyData = JSON.stringify(JSON.parse(processedPayloadStr));
        } else {
            headers["Content-Type"] = "application/x-www-form-urlencoded";
        }

        const response = await fetch(apiUrl, { method: "POST", headers: headers, body: bodyData });
        const rawText = await response.text();
        
        let formattedLog = rawText;
        try {
            let parsed = JSON.parse(rawText);
            formattedLog = Array.isArray(parsed) ? parsed.join('\n') : (parsed.output || parsed.result || JSON.stringify(parsed, null, 2));
        } catch (e) {
            if (!rawText.includes('\n') && /1\s+\d+/.test(rawText)) {
                formattedLog = rawText.replace(/(\s+)(\d+\s+\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b|\s+\d+\s+[^0-9])/g, '\n$2');
            }
        }
        
        let analysis;
        if (mode === 'mtr') {
            analysis = parseMtrLog(formattedLog);
        } else if (mode === 'ping') {
            analysis = parsePingLog(formattedLog);
        } else {
            analysis = analyzeRoute(formattedLog);
        }

        return { success: true, log: formattedLog, analysis };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

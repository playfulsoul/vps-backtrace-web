export function smartConvertPayload(rawText, currentMode, mtrCount = 5) {
    if (!rawText) return "";
    try {
        let formatted = rawText.replace(/([{,])\s*([a-zA-Z0-9_-]+)\s*:/g, '$1"$2":').replace(/'/g, '"'); 
        const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
        formatted = formatted.replace(ipRegex, "{{IP}}");

        formatted = formatted.replace(/"location"\s*:\s*"[^"]+"/i, '"location": "{{LOC}}"');
        formatted = formatted.replace(/"loc"\s*:\s*"[^"]+"/i, '"loc": "{{LOC}}"');

        const commonLocs = ["singapore", "london", "los-angeles", "germany", "frankfurt", "sofia", "istanbul", "bursa", "limburg", "new-york"];
        commonLocs.forEach(loc => {
            formatted = formatted.replace(new RegExp(`"${loc}"`, 'gi'), '"{{LOC}}"');
        });

        const targetCmd = currentMode === 'mtr' ? 'mtr' : 'traceroute';
        formatted = formatted.replace(/"command"\s*:\s*"(?:ping|test|traceroute|mtr)"/gi, `"command": "${targetCmd}"`);
        formatted = formatted.replace(/"cmd"\s*:\s*"(?:ping|test|traceroute|mtr)"/gi, `"cmd": "${targetCmd}"`);

        let parsed = JSON.parse(formatted);
        if (currentMode === 'mtr') {
            parsed.count = parseInt(mtrCount);
        }
        return JSON.stringify(parsed, null, 2);
    } catch (e) {
        const targetCmd = currentMode === 'mtr' ? 'mtr' : 'traceroute';
        return rawText.replace(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g, "{{IP}}")
                      .replace(/"location"\s*:\s*"[^"]+"/i, '"location": "{{LOC}}"')
                      .replace(/"command"\s*:\s*"[^"]+"/i, `"command": "${targetCmd}"`);
    }
}

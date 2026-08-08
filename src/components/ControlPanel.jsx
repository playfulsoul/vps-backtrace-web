import { useState, useEffect } from 'react';
import { ipDatabase } from '../constants/ipDatabase';
import { smartConvertPayload } from '../utils/helpers';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function ControlPanel({ onStart, isRunning }) {
    const [apiUrls, setApiUrls] = useLocalStorage('vps_apiUrls', '');
    const [payloadTemplate, setPayloadTemplate] = useLocalStorage('vps_payload', '{\n  "command": "traceroute",\n  "host": "{{IP}}",\n  "location": "{{LOC}}"\n}');
    const [selectedNodes, setSelectedNodes] = useLocalStorage('vps_selectedNodes', Object.keys(ipDatabase));
    const [mode, setMode] = useLocalStorage('vps_mode', 'traceroute');
    const [mtrCount, setMtrCount] = useLocalStorage('vps_mtrCount', 5);
    
    const [customTelecom, setCustomTelecom] = useLocalStorage('vps_custom_telecom', '');
    const [customUnicom, setCustomUnicom] = useLocalStorage('vps_custom_unicom', '');
    const [customMobile, setCustomMobile] = useLocalStorage('vps_custom_mobile', '');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const lgApi = urlParams.get('lg_api');
        const lgPayload = urlParams.get('lg_payload');
        
        if (lgApi) setApiUrls(lgApi.replace(/,/g, '\n'));
        if (lgPayload) {
            setPayloadTemplate(smartConvertPayload(lgPayload, mode, mtrCount));
        }
    }, []);

    const handleFormat = () => {
        setPayloadTemplate(smartConvertPayload(payloadTemplate, mode, mtrCount));
    };

    const toggleNode = (node) => {
        setSelectedNodes(prev => 
            prev.includes(node) ? prev.filter(n => n !== node) : [...prev, node]
        );
    };

    const handleModeSwitch = (newMode) => {
        setMode(newMode);
        setPayloadTemplate(smartConvertPayload(payloadTemplate, newMode, mtrCount));
    };

    const handleMtrCountChange = (e) => {
        setMtrCount(e.target.value);
        if (mode === 'mtr') {
            setPayloadTemplate(smartConvertPayload(payloadTemplate, 'mtr', e.target.value));
        }
    };

    const handleStart = () => {
        if (!apiUrls.trim() || !payloadTemplate.trim() || selectedNodes.length === 0) {
            alert('请完整填写 API 和 Payload，并至少选择一个节点！');
            return;
        }
        onStart({
            apiUrls: apiUrls.split('\n').map(url => url.trim()).filter(Boolean),
            payloadTemplate,
            selectedNodes,
            mode,
            customIPs: {
                telecom: customTelecom,
                unicom: customUnicom,
                mobile: customMobile
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 左侧配置 */}
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">1. 目标 API 网址 (每行一个)</label>
                        <textarea 
                            value={apiUrls}
                            onChange={(e) => setApiUrls(e.target.value)}
                            className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm font-mono placeholder-gray-400"
                            placeholder="例如: https://lg-fra.example.com/api.php"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-sm font-semibold text-gray-700">2. POST 请求 Payload (抓包获取)</label>
                            <button onClick={handleFormat} className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border border-blue-200 transition font-medium">✨ 格式规范化转换</button>
                        </div>
                        <textarea 
                            value={payloadTemplate}
                            onChange={(e) => setPayloadTemplate(e.target.value)}
                            className="w-full h-40 p-3 bg-gray-900 text-gray-100 border border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-sm font-mono placeholder-gray-600"
                        />
                        <p className="mt-2 text-xs text-gray-500 flex gap-2">
                            <span>* 会自动将目标 IP 替换为 <code className="bg-gray-100 px-1 rounded text-red-500">{"{{IP}}"}</code></span>
                            <span>* 目标地区替换为 <code className="bg-gray-100 px-1 rounded text-red-500">{"{{LOC}}"}</code></span>
                        </p>
                    </div>
                </div>

                {/* 右侧配置 */}
                <div className="space-y-5">
                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-sm font-semibold text-gray-700">3. 选择测试目标大区</label>
                            <button onClick={() => setSelectedNodes([...Object.keys(ipDatabase), 'CUSTOM_MODE'])} className="text-xs text-gray-500 hover:text-gray-800 underline">全选</button>
                        </div>
                        <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl grid grid-cols-2 gap-3 max-h-48 overflow-y-auto mb-3">
                            {Object.keys(ipDatabase).map(node => (
                                <label key={node} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedNodes.includes(node)} 
                                        onChange={() => toggleNode(node)} 
                                        className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" 
                                    />
                                    <span className="text-sm text-gray-700 select-none">{node}</span>
                                </label>
                            ))}
                        </div>

                        {/* 自定义目标 IP */}
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                            <label className="flex items-center space-x-2 cursor-pointer font-semibold text-blue-900 mb-2">
                                <input 
                                    type="checkbox" 
                                    checked={selectedNodes.includes('CUSTOM_MODE')} 
                                    onChange={() => toggleNode('CUSTOM_MODE')} 
                                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" 
                                />
                                <span className="text-sm">自定义目标 IP (已开启 LocalStorage 记忆)</span>
                            </label>
                            {selectedNodes.includes('CUSTOM_MODE') && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    <input type="text" value={customTelecom} onChange={e => setCustomTelecom(e.target.value)} placeholder="电信 IP" className="w-full text-xs p-1.5 border border-blue-200 rounded outline-none focus:ring-1 focus:ring-blue-500" />
                                    <input type="text" value={customUnicom} onChange={e => setCustomUnicom(e.target.value)} placeholder="联通 IP" className="w-full text-xs p-1.5 border border-blue-200 rounded outline-none focus:ring-1 focus:ring-blue-500" />
                                    <input type="text" value={customMobile} onChange={e => setCustomMobile(e.target.value)} placeholder="移动 IP" className="w-full text-xs p-1.5 border border-blue-200 rounded outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">4. 测绘深度模式切换</label>
                        <div className="flex bg-gray-200 p-1 rounded-lg">
                            <button onClick={() => handleModeSwitch('ping')} className={`flex-1 py-2 rounded-md transition font-semibold text-sm ${mode === 'ping' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                                🏓 Ping (极速)
                            </button>
                            <button onClick={() => handleModeSwitch('traceroute')} className={`flex-1 py-2 rounded-md transition font-semibold text-sm ${mode === 'traceroute' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                                ⚡ Traceroute
                            </button>
                            <button onClick={() => handleModeSwitch('mtr')} className={`flex-1 py-2 rounded-md transition font-semibold text-sm ${mode === 'mtr' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
                                📊 MTR 深度
                            </button>
                        </div>
                        {mode === 'mtr' && (
                            <div className="mt-3 text-xs text-gray-600 flex items-center justify-between bg-blue-50 border border-blue-100 p-2 rounded-md">
                                <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                                    MTR 发包数量 (影响耗时):
                                </span>
                                <select value={mtrCount} onChange={handleMtrCountChange} className="bg-white border border-gray-300 rounded px-2 py-1 outline-none text-xs">
                                    <option value="5">5 个包 (极速)</option>
                                    <option value="10">10 个包 (推荐)</option>
                                    <option value="20">20 个包 (精准)</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <button 
                    onClick={handleStart}
                    disabled={isRunning}
                    className={`w-full font-semibold py-3 px-6 rounded-xl transition shadow-lg ${isRunning ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl'}`}
                >
                    {isRunning ? '测绘中...' : '开始全局测绘 (Start Radar)'}
                </button>
            </div>
        </div>
    );
}

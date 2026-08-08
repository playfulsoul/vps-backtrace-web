import { useState } from 'react';

export default function ResultCard({ apiUrl, locationKey, tests }) {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="font-semibold text-gray-800 text-sm">节点: <span className="font-normal text-gray-600">{apiUrl}</span></h3>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{locationKey}</span>
            </div>
            <div className="space-y-3">
                {tests.map((test, index) => (
                    <TestRow key={index} test={test} />
                ))}
            </div>
        </div>
    );
}

function TestRow({ test }) {
    const [isOpen, setIsOpen] = useState(false);
    const { nodeName, isp, targetIP, status, log, analysis, mode } = test;
    const actualNodeName = nodeName === "CUSTOM_MODE" ? "自定义 IP" : nodeName.split(" ")[0];

    const getStatusUI = () => {
        if (status === "PENDING") return { text: "排队中...", icon: "⏳", color: "text-gray-400" };
        if (status === "LOADING") return { text: "正在追踪...", icon: "🔄", color: "text-blue-500 animate-spin" };
        if (status === "ERROR") return { text: "测绘失败", icon: "❌", color: "text-red-500" };
        return { text: analysis?.route || "未知", icon: "✅", color: "text-green-600" };
    };

    const s = getStatusUI();

    return (
        <div className="group border border-gray-100 bg-gray-50/30 rounded-lg p-2.5 cursor-pointer hover:bg-gray-50 transition" onClick={() => setIsOpen(!isOpen)}>
            <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center space-x-2 text-sm text-gray-700 whitespace-nowrap overflow-hidden">
                    <span className="font-medium">{actualNodeName}</span>
                    <span className="text-gray-400 text-xs">|</span>
                    <span>{isp.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono truncate">({targetIP})</span>
                    
                    {/* Tags */}
                    {status === "DONE" && analysis && (
                        <div className="flex items-center space-x-1 ml-2">
                            {analysis.isDirect ? (
                                <span className="text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded text-[10px]">✅ 直连网络</span>
                            ) : (
                                <span className="text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded text-[10px]">🔀 国际中转: {analysis.transit?.join(', ')}</span>
                            )}
                            
                            {analysis.geoPath?.length > 0 && (
                                <span className={`${analysis.isDetour ? 'text-red-600 bg-red-50 border-red-200' : (analysis.geoPath.length > 1 ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-gray-500 bg-gray-50 border-gray-200')} border px-1.5 py-0.5 rounded text-[10px]`}>
                                    {analysis.isDetour ? '⚠️ 跨洲物理绕路: ' : (analysis.geoPath.length > 1 ? '📍 洲内多市中转: ' : '📍 途径: ')}
                                    {analysis.geoPath.join('➔')}
                                </span>
                            )}
                            
                            {mode === 'mtr' && analysis.isMtr && !analysis.isFallback && (
                                <span className={`${analysis.lossRate >= 10 ? 'bg-red-50 text-red-700 border-red-200' : (analysis.lossRate >= 5 ? 'bg-amber-50 text-amber-700 border-amber-200' : (analysis.lossRate > 0 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'))} border px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold`}>
                                    Loss {analysis.lossRate}%
                                </span>
                            )}
                            {mode === 'mtr' && analysis.isFallback && (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded text-[10px]" title={analysis.fallbackReason}>⚠️ 降级 Traceroute</span>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-2 text-xs flex-shrink-0">
                    <div className={`${s.color} flex items-center justify-end font-semibold`}>
                        {status === "DONE" && analysis?.avgLatency && <span className="text-gray-500 font-mono mr-2">{analysis.avgLatency}</span>}
                        {s.text}
                    </div>
                    <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
            
            {isOpen && (
                <div className="mt-3 pt-2 border-t border-gray-100" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center bg-gray-900 text-gray-400 px-3 py-1.5 rounded-t text-[11px] font-mono border-b border-gray-700">
                        <span>原始日志</span>
                        <button type="button" onClick={() => navigator.clipboard.writeText(log)} className="text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 px-2 py-0.5 rounded transition text-[11px] flex items-center gap-1">
                            📋 复制日志
                        </button>
                    </div>
                    <pre className="bg-gray-800 text-gray-200 font-mono text-[11px] p-3 rounded-b overflow-x-auto max-h-64 leading-relaxed">
                        {log || "暂无日志"}
                    </pre>
                </div>
            )}
        </div>
    );
}

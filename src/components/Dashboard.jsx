import { useState, useMemo } from 'react';

export default function Dashboard({ results, isRunning }) {
    const [sortBy, setSortBy] = useState('loss'); // loss, latency
    const [sortOrder, setSortOrder] = useState('asc');

    const dashboardData = useMemo(() => {
        if (!results || results.length === 0) return [];
        
        return results.map(apiResult => {
            const { apiUrl, locationKey, tests } = apiResult;
            
            let bestTest = null;
            let bestLoss = Infinity;
            let bestLatency = Infinity;
            let completeCount = 0;

            tests.forEach(test => {
                if (test.status === 'DONE' && test.analysis) {
                    completeCount++;
                    const { avgLatency, lossRate } = test.analysis;
                    
                    let curLatency = Infinity;
                    if (avgLatency && avgLatency !== '无响应') {
                        curLatency = parseFloat(avgLatency.replace('ms', ''));
                    }
                    
                    let curLoss = lossRate !== undefined && lossRate !== null ? parseFloat(lossRate) : 100;
                    
                    // 挑选最优线路：优先看丢包率，丢包率相同看延迟
                    if (curLoss < bestLoss || (curLoss === bestLoss && curLatency < bestLatency)) {
                        bestLoss = curLoss;
                        bestLatency = curLatency;
                        bestTest = test;
                    }
                }
            });

            return {
                apiUrl,
                locationKey,
                bestNodeName: bestTest ? `${bestTest.nodeName} | ${bestTest.isp.name}` : '-',
                bestLatency: bestLatency === Infinity ? '-' : `${bestLatency.toFixed(1)}ms`,
                bestLoss: bestLoss === Infinity ? '-' : `${bestLoss.toFixed(1)}%`,
                isDirect: bestTest && bestTest.analysis && bestTest.analysis.isDirect ? '是' : '否',
                bestLatencyNum: bestLatency,
                bestLossNum: bestLoss,
                isPending: completeCount < tests.length
            };
        });
    }, [results]);

    const sortedData = useMemo(() => {
        let sorted = [...dashboardData];
        sorted.sort((a, b) => {
            let valA, valB;
            if (sortBy === 'latency') { 
                valA = a.bestLatencyNum; 
                valB = b.bestLatencyNum; 
            } else { 
                // default sort by loss, then latency
                if (a.bestLossNum !== b.bestLossNum) {
                    valA = a.bestLossNum;
                    valB = b.bestLossNum;
                } else {
                    valA = a.bestLatencyNum;
                    valB = b.bestLatencyNum;
                }
            }
            
            if (valA === valB) return 0;
            const modifier = sortOrder === 'asc' ? 1 : -1;
            return (valA < valB ? -1 : 1) * modifier;
        });
        return sorted;
    }, [dashboardData, sortBy, sortOrder]);

    const handleSort = (key) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortOrder('asc');
        }
    };

    if (dashboardData.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between">
                📊 横向对比分析看板 (基于最优宽带)
                {isRunning && <span className="text-xs text-blue-500 font-normal animate-pulse">数据生成中...</span>}
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                            <th className="p-3 font-semibold rounded-tl-lg">节点 API</th>
                            <th className="p-3 font-semibold">推荐最优宽带</th>
                            <th className="p-3 font-semibold cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort('loss')}>
                                最优丢包率 {sortBy === 'loss' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="p-3 font-semibold cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort('latency')}>
                                最优延迟 {sortBy === 'latency' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="p-3 font-semibold rounded-tr-lg">直连</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {sortedData.map((row, idx) => (
                            <tr key={idx} className={`hover:bg-gray-50 transition ${idx === 0 && !row.isPending && row.bestLossNum < 100 ? 'bg-green-50/30' : ''}`}>
                                <td className="p-3">
                                    <div className="font-medium text-gray-800">{row.apiUrl}</div>
                                    <div className="text-[10px] text-gray-500 mt-1">{row.locationKey}</div>
                                </td>
                                <td className="p-3 font-medium text-blue-700">
                                    {row.bestNodeName}
                                </td>
                                <td className={`p-3 font-mono font-bold ${row.bestLossNum === 0 ? 'text-green-600' : (row.bestLossNum < 5 ? 'text-yellow-600' : 'text-red-600')}`}>
                                    {row.bestLoss}
                                </td>
                                <td className={`p-3 font-mono ${row.bestLatencyNum < 100 ? 'text-green-600' : (row.bestLatencyNum < 200 ? 'text-yellow-600' : 'text-red-600')}`}>
                                    {row.bestLatency}
                                </td>
                                <td className="p-3 font-mono text-gray-600">
                                    {row.isDirect}
                                    {idx === 0 && !row.isPending && row.bestLossNum < 100 && <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">🏆 最佳</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 text-xs text-gray-400">
                * 评价标准：系统已废除综合平均分。目前针对每个 API 节点，自动提取出在所有测试宽带中 <b>丢包率最低、延迟最小</b> 的一条线路作为代表进行横向排序对比。
            </div>
        </div>
    );
}

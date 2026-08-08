import { useState, useEffect } from 'react';
import Header from './components/Header';
import BookmarkletPanel from './components/BookmarkletPanel';
import ControlPanel from './components/ControlPanel';
import ResultCard from './components/ResultCard';
import Dashboard from './components/Dashboard';
import { parseLocation } from './utils/parser';
import { fetchRouteData } from './utils/network';
import { ipDatabase } from './constants/ipDatabase';

export default function App() {
    const [results, setResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [totalTasks, setTotalTasks] = useState(0);
    const [completedTasks, setCompletedTasks] = useState(0);

    const runAnalysis = async ({ apiUrls, payloadTemplate, selectedNodes, mode }) => {
        setIsRunning(true);
        setResults([]);
        setCompletedTasks(0);

        const isps = [
            { key: "telecom", name: "中国电信" },
            { key: "unicom", name: "中国联通" },
            { key: "mobile", name: "中国移动" }
        ];

        // 构建任务队列
        let initialResults = [];
        let taskQueue = [];

        for (const apiUrl of apiUrls) {
            const locationKey = parseLocation(apiUrl);
            const apiTests = [];

            for (const nodeName of selectedNodes) {
                const targetIPs = ipDatabase[nodeName];
                if (!targetIPs) continue;

                for (const isp of isps) {
                    const targetIP = targetIPs[isp.key];
                    if (!targetIP) continue;

                    const testObj = {
                        nodeName,
                        isp,
                        targetIP,
                        status: 'PENDING',
                        log: '',
                        analysis: null,
                        mode
                    };
                    apiTests.push(testObj);

                    taskQueue.push({
                        apiUrl,
                        locationKey,
                        payloadTemplate,
                        targetIP,
                        mode,
                        testRef: testObj
                    });
                }
            }

            initialResults.push({
                apiUrl,
                locationKey,
                tests: apiTests
            });
        }

        setResults([...initialResults]);
        setTotalTasks(taskQueue.length);
        setProgress(0);

        // 串行执行任务 (控制并发以避免轰炸目标 API)
        let doneCount = 0;
        for (const task of taskQueue) {
            // 更新状态为 LOADING
            task.testRef.status = 'LOADING';
            setResults(prev => [...prev]); // 触发重渲染

            const result = await fetchRouteData(task);
            
            task.testRef.status = result.success ? 'DONE' : 'ERROR';
            task.testRef.log = result.log || result.error || '获取失败';
            task.testRef.analysis = result.analysis;

            doneCount++;
            setCompletedTasks(doneCount);
            setProgress(Math.round((doneCount / taskQueue.length) * 100));
            setResults(prev => [...prev]); // 触发重渲染
        }

        setIsRunning(false);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <Header />
            <BookmarkletPanel />
            
            <ControlPanel onStart={runAnalysis} isRunning={isRunning} />

            {/* 进度条 */}
            {(isRunning || completedTasks > 0) && (
                <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-500 mb-2 font-mono">
                        <span id="statusLabel">{isRunning ? '测绘中...' : '测绘完成'}</span>
                        <span>{completedTasks} / {totalTasks} ({progress}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Dashboard 数据看板 */}
            <Dashboard results={results} isRunning={isRunning} />

            {/* 结果展示 */}
            <div className="space-y-6">
                {results.map((apiResult, index) => (
                    <ResultCard 
                        key={index} 
                        apiUrl={apiResult.apiUrl} 
                        locationKey={apiResult.locationKey} 
                        tests={apiResult.tests} 
                    />
                ))}
            </div>
        </div>
    );
}

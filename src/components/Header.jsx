export default function Header() {
    return (
        <header className="mb-8 border-b border-gray-200 pb-4 flex justify-between items-end">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                    VPS 跨境路由综合测绘平台 
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">v2.0 (React)</span>
                </h1>
                <p className="text-gray-500 text-sm">支持多节点并发排队 · 动态 Payload 模板 · 客观地理绕路特征嗅探</p>
            </div>
        </header>
    );
}

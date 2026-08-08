import { useEffect, useRef } from 'react';
import { getBookmarklet } from '../utils/bookmarklet';

export default function BookmarkletPanel() {
    const linkRef = useRef(null);

    useEffect(() => {
        if (linkRef.current) {
            linkRef.current.setAttribute('href', getBookmarklet());
        }
    }, []);

    return (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <span className="text-2xl">🔖</span>
                <div>
                    <h3 className="font-bold text-blue-900 text-sm">智能提取书签 (Bookmarklet)</h3>
                    <p className="text-blue-700 text-xs mt-0.5 leading-relaxed">
                        按住右侧按钮，拖拽到浏览器的 <b>收藏夹/书签栏</b>。在任意商家 Looking Glass 页面点击该书签，<br/>即可一键全自动提取所有 API 与发包参数。
                    </p>
                </div>
            </div>
            <a 
                ref={linkRef}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition text-sm flex items-center gap-2 cursor-grab active:cursor-grabbing"
                title="按住拖拽我到书签栏"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                + VPS 路由一键捕获
            </a>
        </div>
    );
}

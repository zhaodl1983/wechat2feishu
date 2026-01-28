'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface StatsData {
    totalArticles: number;
    totalUsers: number;
    recentArticles: number;
    storage: {
        value: string;
        unit: string;
    };
}

// CountUp Hook - Animates number from 0 to target
function useCountUp(target: number, duration: number = 1500, enabled: boolean = true) {
    const [count, setCount] = useState(0);
    const startTime = useRef<number | null>(null);
    const animationFrame = useRef<number | null>(null);

    useEffect(() => {
        if (!enabled || target === 0) {
            setCount(target);
            return;
        }

        // Reset for new target
        setCount(0);
        startTime.current = null;

        const animate = (timestamp: number) => {
            if (!startTime.current) startTime.current = timestamp;
            const progress = Math.min((timestamp - startTime.current) / duration, 1);

            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));

            if (progress < 1) {
                animationFrame.current = requestAnimationFrame(animate);
            } else {
                setCount(target);
            }
        };

        animationFrame.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
        };
    }, [target, duration, enabled]);

    return count;
}

// Format large numbers with commas
function formatNumber(num: number): string {
    return num.toLocaleString('en-US');
}

export function StatsPanel() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasAnimated, setHasAnimated] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch('/api/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.data);
                if (!hasAnimated) setHasAnimated(true);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setIsLoading(false);
        }
    }, [hasAnimated]);

    useEffect(() => {
        // Initial fetch
        fetchStats();

        // Poll every 30 seconds for real-time updates
        const interval = setInterval(fetchStats, 30000);

        return () => clearInterval(interval);
    }, [fetchStats]);

    // Animated counts
    const animatedArticles = useCountUp(stats?.totalArticles || 0, 1800, hasAnimated);
    const animatedUsers = useCountUp(stats?.totalUsers || 0, 1500, hasAnimated);

    if (isLoading) {
        return (
            <section className="max-w-[980px] mx-auto px-golden-sm mb-golden-xl">
                <div className="flex items-center justify-center h-24">
                    <span className="material-symbols-outlined text-[24px] text-black/20 dark:text-white/20 animate-spin-slow">
                        progress_activity
                    </span>
                </div>
            </section>
        );
    }

    if (!stats) return null;

    return (
        <section className="max-w-[980px] mx-auto px-golden-sm mb-golden-xl">
            {/* Real-time Status Indicator with Ping Animation */}
            <div className="flex items-center justify-center gap-3 mb-10">
                <div className="relative flex items-center justify-center w-3 h-3">
                    {/* Outer ping animation ring */}
                    <div className="absolute inset-0 rounded-full bg-vibrant-green animate-ping-slow opacity-75"></div>
                    {/* Middle halo */}
                    <div className="absolute inset-[-2px] rounded-full bg-vibrant-green/30 animate-pulse"></div>
                    {/* Core dot with glow */}
                    <div className="relative w-2 h-2 rounded-full bg-vibrant-green shadow-[0_0_12px_rgba(40,205,65,0.6)]"></div>
                </div>
                <span className="text-[11px] font-bold text-black/30 dark:text-white/30 tracking-[0.15em] uppercase">
                    实时数据
                </span>
                {stats.recentArticles > 0 && (
                    <span className="text-[10px] font-medium text-vibrant-green bg-vibrant-green/10 px-2 py-0.5 rounded-full">
                        +{stats.recentArticles} 今日新增
                    </span>
                )}
            </div>

            {/* Stats Grid */}
            <div className="flex items-center justify-center">
                {/* Total Articles */}
                <div className="flex-1 text-center group">
                    <div className="flex items-baseline justify-center gap-1.5 mb-1.5">
                        <span className="premium-nums text-[42px] font-bold text-black dark:text-white leading-none transition-colors">
                            {formatNumber(animatedArticles)}
                        </span>
                        <span className="text-[14px] font-semibold text-gray-400 tracking-tight">篇</span>
                    </div>
                    <div className="text-[13px] font-medium text-black/35 dark:text-white/35 tracking-tight transition-colors">
                        累计归档文章
                    </div>
                </div>

                {/* Divider */}
                <div className="w-[1px] h-10 bg-black/[0.04] dark:bg-white/10"></div>

                {/* Storage */}
                <div className="flex-1 text-center group">
                    <div className="flex items-baseline justify-center gap-1.5 mb-1.5">
                        <span className="premium-nums text-[42px] font-bold text-black dark:text-white leading-none transition-colors">
                            {stats.storage.value}
                        </span>
                        <span className="text-[14px] font-bold text-gray-400 tracking-wider">{stats.storage.unit}</span>
                    </div>
                    <div className="text-[13px] font-medium text-black/35 dark:text-white/35 tracking-tight transition-colors">
                        本地化资产容量
                    </div>
                </div>

                {/* Divider */}
                <div className="w-[1px] h-10 bg-black/[0.04] dark:bg-white/10"></div>

                {/* Total Users */}
                <div className="flex-1 text-center group">
                    <div className="flex items-baseline justify-center gap-1.5 mb-1.5">
                        <span className="premium-nums text-[42px] font-bold text-black dark:text-white leading-none transition-colors">
                            {formatNumber(animatedUsers)}
                        </span>
                        <span className="text-[14px] font-semibold text-gray-400 tracking-tight">位</span>
                    </div>
                    <div className="text-[13px] font-medium text-black/35 dark:text-white/35 tracking-tight transition-colors">
                        注册用户
                    </div>
                </div>
            </div>
        </section>
    );
}

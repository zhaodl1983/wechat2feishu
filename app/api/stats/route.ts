import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic'; // Disable caching for real-time data

/**
 * GET /api/stats
 * Returns real-time statistics for the public dashboard
 */
export async function GET() {
    try {
        // 1. Total articles (all successful statuses)
        const totalArticles = await prisma.article.count({
            where: {
                status: { in: ['completed', 'stored', 'synced'] }
            }
        });

        // 2. Total users
        const totalUsers = await prisma.user.count();

        // 3. Articles created in last 24 hours (for "active" indicator)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentArticles = await prisma.article.count({
            where: {
                createdAt: { gte: twentyFourHoursAgo },
                status: { in: ['completed', 'stored', 'synced'] }
            }
        });

        // 4. Calculate estimated storage (rough estimate: ~500KB avg per article)
        const estimatedStorageMB = totalArticles * 0.5;
        const estimatedStorageGB = estimatedStorageMB / 1024;

        // Format storage display
        let storageDisplay: string;
        let storageUnit: string;
        if (estimatedStorageGB >= 1024) {
            storageDisplay = (estimatedStorageGB / 1024).toFixed(1);
            storageUnit = 'TB';
        } else if (estimatedStorageGB >= 1) {
            storageDisplay = estimatedStorageGB.toFixed(1);
            storageUnit = 'GB';
        } else {
            storageDisplay = estimatedStorageMB.toFixed(0);
            storageUnit = 'MB';
        }

        return NextResponse.json({
            success: true,
            data: {
                totalArticles,
                totalUsers,
                recentArticles, // Last 24h
                storage: {
                    value: storageDisplay,
                    unit: storageUnit
                }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[Stats API Error]:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}

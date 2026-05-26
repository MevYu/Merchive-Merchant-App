import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTranslation } from 'react-i18next';
import TopNav from '@/components/TopNav';
import KpiCard from '@/components/KpiCard';
import { greetingKey, formatYuan } from '@/utils/age';
import { getGuideStatsApi, type GuideStats, MOCK_STATS } from '@/services/stats';
import { useSession } from '@/store/session';

// Dashboard is the merchant app landing. Loads /me/guide-stats but
// gracefully falls back to MOCK_STATS so the UI works pre-API. The
// week-trend chart is hand-rolled SVG — pulling echarts (~700KB)
// blows the 2MB weapp budget; revisit in P2.

function TrendChart({ data }: { data: { day: string; sales: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.sales));
  const w = 320;
  const h = 80;
  const pad = 16;
  const step = (w - pad * 2) / Math.max(1, data.length - 1);

  // points string for the polyline; y is flipped because SVG origin is
  // top-left and we want larger sales higher on screen.
  const pts = data
    .map((d, i) => {
      const x = pad + step * i;
      const y = h - pad - ((h - pad * 2) * d.sales) / max;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <View
      style={{
        background: 'rgba(20, 28, 58, 0.6)',
        borderRadius: '10px',
        padding: '10px',
        marginTop: '8px',
      }}
    >
      {/* dangerouslySetInnerHTML is the simplest way to drop SVG into
       * Taro's renderer; @tarojs/components doesn't ship an <svg/>
       * primitive for weapp. */}
      <View
        dangerouslySetInnerHTML={{
          __html: `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" xmlns="http://www.w3.org/2000/svg">
            <polyline points="${pts}" fill="none" stroke="#22d3ee" stroke-width="2"/>
            ${data
              .map((d, i) => {
                const x = pad + step * i;
                const y = h - pad - ((h - pad * 2) * d.sales) / max;
                return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="#22d3ee"/>`;
              })
              .join('')}
          </svg>`,
        }}
      />
      <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        {data.map((d) => (
          <Text key={d.day} style={{ fontSize: '10px', color: '#6b7493' }}>{d.day}</Text>
        ))}
      </View>
    </View>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<GuideStats>(MOCK_STATS);
  const [usingMock, setUsingMock] = useState<boolean>(true);
  const display_name = useSession((s) => s.display_name);

  useEffect(() => {
    (async () => {
      try {
        const s = await getGuideStatsApi();
        setStats(s);
        // getGuideStatsApi already falls back to MOCK_STATS on 404; we
        // detect the fallback by referential equality.
        setUsingMock(s === MOCK_STATS);
      } catch {
        // keep mock; banner stays visible
      }
    })();
  }, []);

  const greeting = useMemo(() => `greeting${greetingKey()}` as const, []);

  const nav = (url: string) => Taro.navigateTo({ url }).catch(() => undefined);

  return (
    <View style={{ minHeight: '100vh', background: '#0b1020', color: '#e6edf7' }}>
      <TopNav title={t('pages:dashboard.navTitle')} />
      <ScrollView scrollY style={{ padding: '12px', height: '100vh', boxSizing: 'border-box' }}>
        <View style={{ padding: '8px 4px' }}>
          <Text style={{ fontSize: '14px', color: '#aab3c8' }}>
            {t(`pages:dashboard.${greeting}` as const)}，{display_name || ''}
          </Text>
        </View>

        {usingMock && (
          <View style={{ padding: '6px 10px', background: 'rgba(251,191,36,0.1)', borderRadius: '6px', marginBottom: '8px' }}>
            <Text style={{ fontSize: '10px', color: '#fbbf24' }}>{t('pages:dashboard.mockBanner')}</Text>
          </View>
        )}

        <Text style={{ display: 'block', fontSize: '13px', color: '#aab3c8', margin: '8px 4px' }}>
          {t('pages:dashboard.todayKpi')}
        </Text>
        <View style={{ display: 'flex', flexWrap: 'wrap' }}>
          <KpiCard label={t('pages:dashboard.kpi.sales')} value={`¥${formatYuan(stats.today.sales)}`} />
          <KpiCard label={t('pages:dashboard.kpi.customers')} value={String(stats.today.customers)} accent="#fbbf24" />
        </View>
        <View style={{ display: 'flex', flexWrap: 'wrap' }}>
          <KpiCard label={t('pages:dashboard.kpi.orders')} value={String(stats.today.orders)} accent="#a3e635" />
          <KpiCard label={t('pages:dashboard.kpi.aov')} value={`¥${formatYuan(stats.today.aov)}`} accent="#f87171" />
        </View>

        <Text style={{ display: 'block', fontSize: '13px', color: '#aab3c8', margin: '12px 4px 0' }}>
          {t('pages:dashboard.weekTrend')}
        </Text>
        <TrendChart data={stats.week_trend} />

        <View style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <View style={{ flex: 1, background: 'rgba(20, 28, 58, 0.6)', borderRadius: '10px', padding: '10px' }}>
            <Text style={{ fontSize: '11px', color: '#aab3c8' }}>{t('pages:dashboard.ranking')}</Text>
            <Text style={{ display: 'block', fontSize: '12px', color: '#22d3ee', marginTop: '4px' }}>
              {t('pages:dashboard.rankStore', { n: stats.rank.store })}
            </Text>
            <Text style={{ display: 'block', fontSize: '12px', color: '#22d3ee' }}>
              {t('pages:dashboard.rankMe', { n: stats.rank.me })}
            </Text>
          </View>
        </View>

        <Text style={{ display: 'block', fontSize: '13px', color: '#aab3c8', margin: '12px 4px 4px' }}>
          {t('pages:dashboard.tasks')}
        </Text>
        <View style={{ display: 'flex', flexWrap: 'wrap' }}>
          <KpiCard label={t('pages:dashboard.task.callback')} value={String(stats.tasks.callback)} accent="#f87171" />
          <KpiCard label={t('pages:dashboard.task.pickup')} value={String(stats.tasks.pickup)} accent="#fbbf24" />
          <KpiCard label={t('pages:dashboard.task.shipping')} value={String(stats.tasks.shipping)} accent="#a3e635" />
        </View>

        <Text style={{ display: 'block', fontSize: '13px', color: '#aab3c8', margin: '12px 4px 4px' }}>
          {t('pages:dashboard.shortcuts')}
        </Text>
        <View style={{ display: 'flex', flexWrap: 'wrap' }}>
          {[
            { k: 'customers', url: '/pages/customers/index' },
            { k: 'orders', url: '/pages/orders/new' },
            { k: 'recommend', url: '/pages/recommend/index' },
            { k: 'handover', url: '/pages/handover/index' },
          ].map((it) => (
            <View
              key={it.k}
              onClick={() => nav(it.url)}
              style={{
                flex: '0 0 calc(50% - 8px)',
                background: 'rgba(20, 28, 58, 0.6)',
                borderRadius: '10px',
                padding: '14px',
                margin: '4px',
                textAlign: 'center',
              }}
            >
              <Text style={{ color: '#22d3ee', fontSize: '14px', fontWeight: 'bold' }}>
                {t(`common:menu.${it.k}` as const)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

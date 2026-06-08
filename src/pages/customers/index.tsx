import { useEffect, useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTranslation } from 'react-i18next';
import TopNav from '@/components/TopNav';
import CustomerCard from '@/components/CustomerCard';
import { useCustomers } from '@/store/customers';

// CustomersPage — list + search + tag filter. Detail nav passes id via
// query string; the detail page re-fetches /members/:id rather than
// reading from the list cache so a deep-link / refresh on detail works.

type Filter = 'all' | 'followup' | 'vip';

export default function CustomersPage() {
  const { t } = useTranslation();
  const items = useCustomers((s) => s.items);
  const loading = useCustomers((s) => s.loading);
  const load = useCustomers((s) => s.load);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    load({
      q: q || undefined,
      followup_only: filter === 'followup' || undefined,
      level: filter === 'vip' ? 'L4' : undefined,
    });
    // re-run on filter / search debounce (manual: trigger via go button
    // to avoid hammering the API on every keystroke)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const open = (id: string) =>
    Taro.navigateTo({ url: `/pages/customers/detail?id=${encodeURIComponent(id)}` }).catch(
      () => undefined,
    );

  return (
    <View style={{ minHeight: '100vh', background: '#FAF8F4', color: '#111827' }}>
      <TopNav title={t('pages:customers.navTitle')} />
      <View style={{ padding: '12px' }}>
        <View style={{ display: 'flex', gap: '8px' }}>
          <Input
            value={q}
            onInput={(e) => setQ(e.detail.value)}
            placeholder={t('pages:customers.searchPlaceholder')}
            confirmType="search"
            onConfirm={() => load({ q: q || undefined })}
            style={{
              flex: 1,
              padding: '10px',
              background: '#FFFFFF',
              border: '1px solid rgba(17,24,39,0.10)',
              borderRadius: '10px',
              color: '#111827',
              fontSize: '14px',
            }}
          />
          <View
            onClick={() => load({ q: q || undefined })}
            style={{
              padding: '10px 14px',
              background: '#3563F6',
              borderRadius: '12px',
            }}
          >
            <Text style={{ color: '#F4F6FB', fontWeight: 'bold', fontSize: '13px' }}>
              {t('common:actions.search')}
            </Text>
          </View>
        </View>

        <View style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          {(['all', 'followup', 'vip'] as Filter[]).map((f) => (
            <View
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 12px',
                borderRadius: '14px',
                background: filter === f ? '#3563F6' : '#FFFFFF',
                border: filter === f ? 'none' : '1px solid rgba(17,24,39,0.10)',
              }}
            >
              <Text style={{ color: filter === f ? '#F4F6FB' : '#6B7280', fontSize: '12px' }}>
                {t(
                  f === 'all'
                    ? 'pages:customers.filterAll'
                    : f === 'followup'
                      ? 'pages:customers.filterFollow'
                      : 'pages:customers.filterVip',
                )}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY style={{ flex: 1, padding: '0 12px', height: 'calc(100vh - 180px)' }}>
        {loading && (
          <Text style={{ display: 'block', textAlign: 'center', color: '#6B7280', padding: '20px' }}>
            {t('common:actions.loading')}
          </Text>
        )}
        {!loading && items.length === 0 && (
          <Text style={{ display: 'block', textAlign: 'center', color: '#6B7280', padding: '20px' }}>
            {t('pages:customers.empty')}
          </Text>
        )}
        {items.map((c) => (
          <CustomerCard key={c.id} customer={c} onClick={() => open(c.id)} />
        ))}
      </ScrollView>
    </View>
  );
}

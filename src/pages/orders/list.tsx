import { useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import TopNav from '@/components/TopNav';
import { useOrders } from '@/store/orders';
import { formatYuan } from '@/utils/age';

// MyPlacedOrdersPage — quick scroll of orders the staff placed on
// behalf of customers. Status badge is i18n-keyed so the table works
// in all three languages without per-status hard-coding.

export default function MyPlacedOrdersPage() {
  const { t } = useTranslation();
  const items = useOrders((s) => s.myPlaced);
  const loadMyPlaced = useOrders((s) => s.loadMyPlaced);
  const loading = useOrders((s) => s.loading);

  useEffect(() => {
    loadMyPlaced();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ minHeight: '100vh', background: '#0b1020', color: '#e6edf7' }}>
      <TopNav title={t('pages:orders.listNavTitle')} />
      <ScrollView scrollY style={{ padding: '12px', height: 'calc(100vh - 80px)' }}>
        {loading && (
          <Text style={{ display: 'block', textAlign: 'center', color: '#6b7493', padding: '20px' }}>
            {t('common:actions.loading')}
          </Text>
        )}
        {!loading && items.length === 0 && (
          <Text style={{ display: 'block', textAlign: 'center', color: '#6b7493', padding: '20px' }}>
            {t('pages:orders.empty')}
          </Text>
        )}
        {items.map((o) => (
          <View
            key={o.id}
            style={{
              background: 'rgba(20, 28, 58, 0.6)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '8px',
            }}
          >
            <View style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ color: '#e6edf7', fontSize: '13px', fontWeight: 'bold' }}>
                {o.member_name || o.member_id}
              </Text>
              <Text style={{ color: '#22d3ee', fontSize: '11px' }}>
                {t(`pages:orders.status.${o.status}` as const)}
              </Text>
            </View>
            <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <Text style={{ color: '#6b7493', fontSize: '11px' }}>{o.placed_at}</Text>
              <Text style={{ color: '#fbbf24', fontSize: '13px' }}>¥{formatYuan(o.total_amount)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

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
    <View style={{ minHeight: '100vh', background: '#FAF8F4', color: '#111827' }}>
      <TopNav title={t('pages:orders.listNavTitle')} />
      <ScrollView scrollY style={{ padding: '12px', height: 'calc(100vh - 80px)' }}>
        {loading && (
          <Text style={{ display: 'block', textAlign: 'center', color: '#6B7280', padding: '20px' }}>
            {t('common:actions.loading')}
          </Text>
        )}
        {!loading && items.length === 0 && (
          <Text style={{ display: 'block', textAlign: 'center', color: '#6B7280', padding: '20px' }}>
            {t('pages:orders.empty')}
          </Text>
        )}
        {items.map((o) => (
          <View
            key={o.id}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid rgba(17,24,39,0.10)',
              boxShadow: '0 1px 2px rgba(17,24,39,0.04)',
              padding: '12px',
              marginBottom: '8px',
            }}
          >
            <View style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ color: '#111827', fontSize: '13px', fontWeight: 'bold' }}>
                {o.member_name || o.member_id}
              </Text>
              <Text style={{ color: '#3563F6', fontSize: '11px' }}>
                {t(`pages:orders.status.${o.status}` as const)}
              </Text>
            </View>
            <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <Text style={{ color: '#6B7280', fontSize: '11px' }}>{o.placed_at}</Text>
              <Text style={{ color: '#111827', fontSize: '13px', fontWeight: 'bold' }}>¥{formatYuan(o.total_amount)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

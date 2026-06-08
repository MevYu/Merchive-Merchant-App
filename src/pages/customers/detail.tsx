import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useTranslation } from 'react-i18next';
import TopNav from '@/components/TopNav';
import { getCustomerApi, type Customer } from '@/services/customer';
import { formatYuan } from '@/utils/age';

// CustomerDetailPage shows profile + order history + a couple of
// action shortcuts (recommend / IM). Order history pull is TODO —
// currently displays an empty-state placeholder until /orders?member_id
// is wired up on the merchant scope.

export default function CustomerDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const id = router.params?.id || '';
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const c = await getCustomerApi(id);
        setCustomer(c);
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      }
    })();
  }, [id]);

  const goRecommend = () =>
    Taro.navigateTo({ url: `/pages/recommend/index?member_id=${encodeURIComponent(id)}` }).catch(
      () => undefined,
    );

  return (
    <View style={{ minHeight: '100vh', background: '#FAF8F4', color: '#111827' }}>
      <TopNav title={t('pages:customers.detailTitle')} />
      <ScrollView scrollY style={{ padding: '12px', height: '100vh', boxSizing: 'border-box' }}>
        {err && (
          <View style={{ padding: '10px', background: 'rgba(220,38,38,0.10)', borderRadius: '12px' }}>
            <Text style={{ color: '#DC2626', fontSize: '12px' }}>{err}</Text>
          </View>
        )}
        {customer && (
          <>
            <View style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(17,24,39,0.10)', boxShadow: '0 1px 2px rgba(17,24,39,0.04)', padding: '14px' }}>
              <Text style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                {customer.name || customer.phone || customer.id}
              </Text>
              <Text style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                {customer.phone || '—'}
              </Text>
              <View style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                {customer.level_tag && (
                  <Text style={{ fontSize: '11px', color: '#A88249' }}>
                    {t(`pages:customers.tag.${customer.level_tag}` as const)}
                  </Text>
                )}
                {customer.total_spend !== undefined && (
                  <Text style={{ fontSize: '11px', color: '#3563F6' }}>
                    ¥{formatYuan(customer.total_spend)}
                  </Text>
                )}
              </View>
            </View>

            <View style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <View
                onClick={goRecommend}
                style={{ flex: 1, background: '#3563F6', borderRadius: '12px', padding: '12px', textAlign: 'center' }}
              >
                <Text style={{ color: '#F4F6FB', fontWeight: 'bold', fontSize: '13px' }}>
                  {t('pages:customers.recommend')}
                </Text>
              </View>
              <View
                // TODO IM: hook into core's /im/conversations once shipped.
                style={{ flex: 1, background: '#FFFFFF', border: '1px solid rgba(17,24,39,0.10)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}
              >
                <Text style={{ color: '#3563F6', fontWeight: 'bold', fontSize: '13px' }}>
                  {t('pages:customers.im')}
                </Text>
              </View>
            </View>

            <Text style={{ display: 'block', fontSize: '13px', color: '#6B7280', margin: '16px 4px 8px' }}>
              {t('pages:customers.orderHistory')}
            </Text>
            {/* TODO orders: pull /orders?member_id=${id}&limit=20 once
             * the merchant-scoped endpoint lands. */}
            <View style={{ padding: '20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(17,24,39,0.10)', textAlign: 'center' }}>
              <Text style={{ color: '#6B7280', fontSize: '12px' }}>{t('pages:customers.noOrders')}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

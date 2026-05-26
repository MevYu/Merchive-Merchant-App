import { useEffect, useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import { useRouter } from '@tarojs/taro';
import { useTranslation } from 'react-i18next';
import TopNav from '@/components/TopNav';
import { recommendForMemberApi, type RecommendItem } from '@/services/recommend';
import { formatYuan } from '@/utils/age';

// RecommendPage — staff types/scans a member_id and gets 8 SKU
// suggestions. The recommender is a plugin-SDK extension point (see
// services/recommend.ts); per-vertical rankers swap in without UI
// changes.
//
// Deep-link entry: customer-detail page passes ?member_id= so a guide
// can jump from "I'm looking at this customer" → "pitch them this".

export default function RecommendPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const initial = router.params?.member_id || '';
  const [memberId, setMemberId] = useState(initial);
  const [items, setItems] = useState<RecommendItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    if (!memberId.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      const r = await recommendForMemberApi(memberId.trim());
      setItems(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initial) run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  return (
    <View style={{ minHeight: '100vh', background: '#0b1020', color: '#e6edf7' }}>
      <TopNav title={t('pages:recommend.navTitle')} />
      <View style={{ padding: '12px' }}>
        <View style={{ display: 'flex', gap: '8px' }}>
          <Input
            value={memberId}
            onInput={(e) => setMemberId(e.detail.value)}
            placeholder={t('pages:recommend.memberInput')}
            style={{
              flex: 1,
              padding: '10px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '6px',
              color: '#e6edf7',
              fontSize: '14px',
            }}
          />
          <View onClick={run} style={{ padding: '10px 14px', background: '#22d3ee', borderRadius: '6px' }}>
            <Text style={{ color: '#0b1020', fontWeight: 'bold', fontSize: '13px' }}>
              {t('pages:recommend.go')}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ padding: '0 12px', height: 'calc(100vh - 140px)' }}>
        {err && (
          <View style={{ padding: '10px', background: 'rgba(248,113,113,0.1)', borderRadius: '6px', marginBottom: '8px' }}>
            <Text style={{ color: '#f87171', fontSize: '12px' }}>{err}</Text>
          </View>
        )}
        {loading && <Text style={{ color: '#6b7493', fontSize: '12px' }}>{t('common:actions.loading')}</Text>}
        {!loading && items.length === 0 && (
          <Text style={{ display: 'block', textAlign: 'center', color: '#6b7493', padding: '20px' }}>
            {t('pages:recommend.empty')}
          </Text>
        )}
        {items.length > 0 && (
          <Text style={{ display: 'block', color: '#aab3c8', fontSize: '12px', margin: '4px 0 8px' }}>
            {t('pages:recommend.resultTitle')}
          </Text>
        )}
        {items.map((it) => (
          <View
            key={it.sku_id}
            style={{
              background: 'rgba(20, 28, 58, 0.6)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '8px',
            }}
          >
            <View style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ color: '#e6edf7', fontSize: '14px', fontWeight: 'bold' }}>{it.name}</Text>
              <Text style={{ color: '#22d3ee', fontSize: '14px' }}>¥{formatYuan(it.price)}</Text>
            </View>
            {it.reason && (
              <Text style={{ display: 'block', color: '#6b7493', fontSize: '11px', marginTop: '4px' }}>
                {it.reason}
              </Text>
            )}
            <View
              // TODO send: hook /im/send to push the SKU card into a
              // chat with the customer once IM lands.
              style={{ marginTop: '8px', padding: '8px', background: 'rgba(34,211,238,0.1)', borderRadius: '6px', textAlign: 'center' }}
            >
              <Text style={{ color: '#22d3ee', fontSize: '11px' }}>{t('pages:recommend.send')}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

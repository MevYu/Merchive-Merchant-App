import { useEffect, useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTranslation } from 'react-i18next';
import TopNav from '@/components/TopNav';
import SkuPicker from '@/components/SkuPicker';
import { useOrders } from '@/store/orders';
import { useSession } from '@/store/session';
import { formatYuan } from '@/utils/age';

// NewOrderPage is the 3-step wizard for代客下单. Steps:
//   1 — select customer (manual member_id input until P2's picker)
//   2 — add SKUs via SkuPicker
//   3 — preview (calls /orders/preview) → submit (POST /orders)
//
// Wizard state lives in the orders store so a customer-detail detour
// doesn't blow the draft away.

type Step = 1 | 2 | 3;

export default function NewOrderPage() {
  const { t } = useTranslation();
  const draft = useOrders((s) => s.draft);
  const preview = useOrders((s) => s.preview);
  const setDraft = useOrders((s) => s.setDraft);
  const addLine = useOrders((s) => s.addLine);
  const removeLine = useOrders((s) => s.removeLine);
  const refreshPreview = useOrders((s) => s.refreshPreview);
  const submit = useOrders((s) => s.submit);
  const loading = useOrders((s) => s.loading);
  const currentStoreId = useSession((s) => s.currentStoreId);

  const [step, setStep] = useState<Step>(1);
  const [memberInput, setMemberInput] = useState<string>(draft?.member_id || '');

  useEffect(() => {
    if (step === 3) refreshPreview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const confirmCustomer = () => {
    if (!memberInput.trim()) return;
    setDraft({
      member_id: memberInput.trim(),
      store_id: currentStoreId,
      lines: draft?.lines ?? [],
    });
    setStep(2);
  };

  const onSubmit = async () => {
    const r = await submit();
    if (r) {
      Taro.showToast({ title: t('pages:orders.submittedTip'), icon: 'success' }).catch(
        () => undefined,
      );
      Taro.redirectTo({ url: '/pages/orders/list' }).catch(() => undefined);
    }
  };

  return (
    <View style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <TopNav title={t('pages:orders.newNavTitle')} />
      <View style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 0' }}>
        {[1, 2, 3].map((n) => (
          <Text key={n} style={{ fontSize: '11px', color: step === n ? 'var(--primary)' : 'var(--text-mute)' }}>
            {n}. {t(`pages:orders.step${n}` as const)}
          </Text>
        ))}
      </View>

      <ScrollView scrollY style={{ padding: '12px', height: 'calc(100vh - 130px)' }}>
        {step === 1 && (
          <View style={{ background: 'var(--bg-elev)', borderRadius: '16px', border: '1px solid rgba(17,24,39,0.10)', boxShadow: '0 1px 2px rgba(17,24,39,0.04)', padding: '14px' }}>
            <Text style={{ display: 'block', fontSize: '12px', color: 'var(--text-mute)', marginBottom: '6px' }}>
              {t('pages:orders.pickCustomer')}
            </Text>
            <Input
              value={memberInput}
              onInput={(e) => setMemberInput(e.detail.value)}
              placeholder="member_id"
              style={{ padding: '10px', background: 'var(--bg-soft)', border: '1px solid rgba(17,24,39,0.10)', borderRadius: '10px', color: 'var(--text)', fontSize: '14px' }}
            />
            <View onClick={confirmCustomer} style={{ marginTop: '14px', padding: '12px', background: 'var(--primary)', borderRadius: '12px', textAlign: 'center' }}>
              <Text style={{ color: 'var(--bg-soft)', fontWeight: 'bold' }}>{t('common:actions.next')}</Text>
            </View>
          </View>
        )}

        {step === 2 && draft && (
          <>
            <SkuPicker onAdd={(sku_id, qty) => addLine({ sku_id, qty })} />
            {draft.lines.map((l) => (
              <View
                key={l.sku_id}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'var(--bg-elev)', border: '1px solid rgba(17,24,39,0.10)', borderRadius: '12px', marginBottom: '6px' }}
              >
                <Text style={{ color: 'var(--text)', fontSize: '13px' }}>{l.sku_id} × {l.qty}</Text>
                <Text onClick={() => removeLine(l.sku_id)} style={{ color: 'var(--danger)', fontSize: '12px' }}>
                  {t('common:actions.delete')}
                </Text>
              </View>
            ))}
            <View style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <View onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', background: 'var(--bg-elev)', border: '1px solid rgba(17,24,39,0.10)', borderRadius: '12px', textAlign: 'center' }}>
                <Text style={{ color: 'var(--text-mute)' }}>{t('common:actions.prev')}</Text>
              </View>
              <View
                onClick={() => draft.lines.length > 0 && setStep(3)}
                style={{ flex: 1, padding: '12px', background: draft.lines.length > 0 ? 'var(--primary)' : 'var(--border)', borderRadius: '12px', textAlign: 'center' }}
              >
                <Text style={{ color: 'var(--bg-soft)', fontWeight: 'bold' }}>{t('common:actions.next')}</Text>
              </View>
            </View>
          </>
        )}

        {step === 3 && draft && (
          <View style={{ background: 'var(--bg-elev)', borderRadius: '16px', border: '1px solid rgba(17,24,39,0.10)', boxShadow: '0 1px 2px rgba(17,24,39,0.04)', padding: '14px' }}>
            <Text style={{ display: 'block', color: 'var(--text-mute)', fontSize: '12px', marginBottom: '6px' }}>
              {t('pages:orders.discountPreview')}
            </Text>
            {loading && <Text style={{ color: 'var(--text-mute)', fontSize: '12px' }}>{t('common:actions.loading')}</Text>}
            {preview && (
              <>
                <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <Text style={{ color: 'var(--text-mute)', fontSize: '12px' }}>{t('pages:orders.subtotal')}</Text>
                  <Text style={{ color: 'var(--text)', fontSize: '12px' }}>¥{formatYuan(preview.subtotal)}</Text>
                </View>
                <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <Text style={{ color: 'var(--text-mute)', fontSize: '12px' }}>{t('pages:orders.discount')}</Text>
                  <Text style={{ color: 'var(--accent)', fontSize: '12px' }}>-¥{formatYuan(preview.discount)}</Text>
                </View>
                <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px solid rgba(17,24,39,0.10)', paddingTop: '8px' }}>
                  <Text style={{ color: 'var(--text-mute)', fontSize: '13px' }}>{t('pages:orders.total')}</Text>
                  <Text style={{ color: 'var(--primary)', fontSize: '15px', fontWeight: 'bold' }}>¥{formatYuan(preview.total)}</Text>
                </View>
              </>
            )}
            <View
              onClick={loading ? undefined : onSubmit}
              style={{ marginTop: '16px', padding: '14px', background: loading ? 'var(--border)' : 'var(--primary)', borderRadius: '14px', textAlign: 'center' }}
            >
              <Text style={{ color: 'var(--bg-soft)', fontWeight: 'bold' }}>
                {loading ? t('common:actions.loading') : t('pages:orders.submit')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

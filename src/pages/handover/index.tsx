import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTranslation } from 'react-i18next';
import TopNav from '@/components/TopNav';
import {
  endShiftApi,
  getCurrentShiftApi,
  listShiftsApi,
  startShiftApi,
  type Shift,
} from '@/services/shift';
import { useSession } from '@/store/session';
import { elapsedMinutes, formatYuan } from '@/utils/age';

// HandoverPage — start / end shift + history. Shift endpoints are
// planned on core; on 404 we fall back to a local-only "fake" shift so
// the UX is testable. Replace the catches once /shifts/* lands.

function fakeShift(store_id: string, staff_user_id: string): Shift {
  return {
    id: `local-${Date.now()}`,
    store_id,
    staff_user_id,
    started_at: new Date().toISOString(),
    sales_amount: 0,
    order_count: 0,
    cash_expected: 0,
  };
}

export default function HandoverPage() {
  const { t } = useTranslation();
  const currentStoreId = useSession((s) => s.currentStoreId);
  const user_id = useSession((s) => s.user_id);
  const setCurrentShift = useSession((s) => s.setCurrentShift);
  const [current, setCurrent] = useState<Shift | null>(null);
  const [history, setHistory] = useState<Shift[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try {
      const c = await getCurrentShiftApi();
      setCurrent(c);
      if (c) setCurrentShift(c.id);
    } catch (e) {
      // 404 = endpoint not ready; leave current null and continue.
      if (!(e instanceof Error && /404/.test(e.message))) {
        setErr(e instanceof Error ? e.message : String(e));
      }
    }
    try {
      const h = await listShiftsApi();
      setHistory(h);
    } catch {
      /* swallow until endpoint ships */
    }
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    if (!currentStoreId) {
      setErr(t('pages:login.tenantRequired'));
      return;
    }
    try {
      const s = await startShiftApi({ store_id: currentStoreId });
      setCurrent(s);
      setCurrentShift(s.id);
    } catch (e) {
      // dev fallback so the button does something visible
      if (e instanceof Error && /404/.test(e.message)) {
        const s = fakeShift(currentStoreId, user_id || 'unknown');
        setCurrent(s);
        setCurrentShift(s.id);
      } else {
        setErr(e instanceof Error ? e.message : String(e));
      }
    }
  };

  const end = async () => {
    if (!current) return;
    const ok = await new Promise<boolean>((resolve) => {
      Taro.showModal({
        title: t('pages:handover.confirmEnd'),
        success: (r) => resolve(!!r.confirm),
        fail: () => resolve(false),
      });
    });
    if (!ok) return;
    try {
      await endShiftApi({ shift_id: current.id });
      setCurrent(null);
      setCurrentShift('');
      load();
    } catch (e) {
      if (e instanceof Error && /404/.test(e.message)) {
        setCurrent(null);
        setCurrentShift('');
      } else {
        setErr(e instanceof Error ? e.message : String(e));
      }
    }
  };

  return (
    <View style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <TopNav title={t('pages:handover.navTitle')} />
      <ScrollView scrollY style={{ padding: '12px', height: 'calc(100vh - 80px)' }}>
        {err && (
          <View style={{ padding: '10px', background: 'rgba(220,38,38,0.10)', borderRadius: '12px', marginBottom: '8px' }}>
            <Text style={{ color: 'var(--danger)', fontSize: '12px' }}>{err}</Text>
          </View>
        )}

        <View style={{ background: 'var(--bg-elev)', borderRadius: '16px', border: '1px solid rgba(17,24,39,0.10)', boxShadow: '0 1px 2px rgba(17,24,39,0.04)', padding: '14px' }}>
          <Text style={{ display: 'block', color: 'var(--text-mute)', fontSize: '12px' }}>
            {t('pages:handover.currentShift')}
          </Text>
          {current ? (
            <>
              <Text style={{ display: 'block', color: 'var(--primary)', fontSize: '14px', marginTop: '6px' }}>
                {t('pages:handover.startTime')}: {current.started_at} ({elapsedMinutes(current.started_at)}m)
              </Text>
              <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <Text style={{ color: 'var(--text-mute)', fontSize: '11px' }}>
                  {t('pages:handover.sales')}: ¥{formatYuan(current.sales_amount ?? 0)}
                </Text>
                <Text style={{ color: 'var(--text-mute)', fontSize: '11px' }}>
                  {t('pages:handover.orders')}: {current.order_count ?? 0}
                </Text>
              </View>
              <Text style={{ display: 'block', color: 'var(--accent)', fontSize: '12px', marginTop: '4px' }}>
                {t('pages:handover.cash')}: ¥{formatYuan(current.cash_expected ?? 0)}
              </Text>
              <View
                onClick={end}
                style={{ marginTop: '14px', padding: '12px', background: 'var(--danger)', borderRadius: '12px', textAlign: 'center' }}
              >
                <Text style={{ color: 'var(--bg-soft)', fontWeight: 'bold' }}>{t('pages:handover.endShift')}</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={{ display: 'block', color: 'var(--text-mute)', fontSize: '12px', marginTop: '6px' }}>
                {t('pages:handover.noShift')}
              </Text>
              <View
                onClick={start}
                style={{ marginTop: '14px', padding: '12px', background: 'var(--primary)', borderRadius: '12px', textAlign: 'center' }}
              >
                <Text style={{ color: 'var(--bg-soft)', fontWeight: 'bold' }}>{t('pages:handover.startShift')}</Text>
              </View>
            </>
          )}
        </View>

        <Text style={{ display: 'block', fontSize: '13px', color: 'var(--text-mute)', margin: '16px 4px 8px' }}>
          {t('pages:handover.history')}
        </Text>
        {history.map((h) => (
          <View
            key={h.id}
            style={{ background: 'var(--bg-elev)', borderRadius: '16px', border: '1px solid rgba(17,24,39,0.10)', boxShadow: '0 1px 2px rgba(17,24,39,0.04)', padding: '10px', marginBottom: '6px' }}
          >
            <View style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ color: 'var(--text)', fontSize: '12px' }}>{h.started_at}</Text>
              <Text style={{ color: 'var(--primary)', fontSize: '12px' }}>¥{formatYuan(h.sales_amount ?? 0)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

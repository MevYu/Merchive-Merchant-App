import { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTranslation } from 'react-i18next';
import { hasMerchantRole, wxLoginApi } from '@/services/auth';
import { saveAuth } from '@/services/http';
import { useSession } from '@/store/session';

// LoginPage is the landing for unauthenticated launches OR for
// authenticated launches where the account lacks a merchant role.
//
// P1 ships weapp wxlogin only; h5 SMS / OAuth round-trips are punted
// to P2 because the merchant app is primarily distributed as a 微信小
// 程序 (店员都装微信). H5 lands a "open in WeChat" notice.

export default function LoginPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantId] = useState<string>(
    (process.env.TARO_APP_DEFAULT_TENANT_ID as string) || '',
  );
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const setIdentity = useSession((s) => s.setIdentity);
  const logout = useSession((s) => s.logout);

  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP;

  const handleWxLogin = async () => {
    if (!tenantId) {
      setErr(t('pages:login.tenantRequired'));
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const c = await Taro.login();
      if (!c.code) throw new Error(t('pages:login.wxCodeMissing'));
      const r = await wxLoginApi({ js_code: c.code, tenant_id: tenantId });
      // Reject consumer-only accounts before persisting auth — otherwise
      // a swipe-back into dashboard would see a stale "allowed" state.
      const roles = r.identity?.roles ?? [];
      if (!hasMerchantRole(roles)) {
        logout();
        setErr(t('pages:login.roleRejected'));
        setSubmitting(false);
        return;
      }
      saveAuth({ token: r.token, refresh: r.refresh ?? null });
      if (r.identity) setIdentity(r.identity);
      Taro.reLaunch({ url: '/pages/dashboard/index' }).catch(() => undefined);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ background: '#FAF8F4', minHeight: '100vh', color: '#111827', padding: '40px 24px' }}>
      <View style={{ textAlign: 'center', marginTop: '40px', marginBottom: '40px' }}>
        <Text style={{ display: 'block', fontSize: '24px', fontWeight: 'bold', color: '#0F1728' }}>
          {t('pages:login.title')}
        </Text>
        <Text style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
          {t('pages:login.subtitle')}
        </Text>
      </View>

      <View style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(17,24,39,0.10)', boxShadow: '0 1px 2px rgba(17,24,39,0.04)', padding: '16px' }}>
        <Text style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
          {t('pages:login.tenantLabel')}
        </Text>
        <Input
          value={tenantId}
          onInput={(e) => setTenantId(e.detail.value)}
          placeholder={t('pages:login.tenantPlaceholder')}
          style={{
            padding: '10px',
            background: '#F4F6FB',
            border: '1px solid rgba(17,24,39,0.10)',
            borderRadius: '10px',
            color: '#111827',
            fontSize: '14px',
          }}
        />
      </View>

      {isWeapp ? (
        <View
          onClick={submitting ? undefined : handleWxLogin}
          style={{
            background: submitting ? '#C5CBD3' : '#3563F6',
            padding: '14px',
            borderRadius: '14px',
            textAlign: 'center',
            marginTop: '24px',
          }}
        >
          <Text style={{ color: '#F4F6FB', fontWeight: 'bold', fontSize: '16px' }}>
            {submitting ? t('pages:login.loggingIn') : t('pages:login.wxLogin')}
          </Text>
        </View>
      ) : (
        <View
          style={{
            marginTop: '24px',
            padding: '14px',
            background: 'rgba(220,38,38,0.08)',
            borderRadius: '12px',
          }}
        >
          <Text style={{ color: '#DC2626', fontSize: '12px' }}>
            {/* H5 / app login lands in P2. For dev: bake TARO_APP_LOCAL_DEV_TOKEN. */}
            H5 / App 登录 P2 上线（当前请在微信内打开，或使用 LOCAL_DEV_TOKEN）
          </Text>
        </View>
      )}

      {err && (
        <View style={{ marginTop: '16px', padding: '10px', background: 'rgba(220,38,38,0.10)', borderRadius: '12px' }}>
          <Text style={{ color: '#DC2626', fontSize: '12px' }}>{err}</Text>
        </View>
      )}

      <View style={{ marginTop: '40px', textAlign: 'center' }}>
        <Text style={{ fontSize: '11px', color: '#6B7280' }}>{t('pages:login.policy')}</Text>
      </View>
    </View>
  );
}

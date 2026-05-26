import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import { useSession } from '@/store/session';

// TopNav is the in-page header that shows: staff name + role + current
// store + a "switch store" affordance (P1: just a label; P2: opens the
// store-picker modal).
//
// Not a tabBar — Taro tabBar requires same-app pages and the merchant
// flow is a single-stack push experience, not a 4-tab thing.

export interface TopNavProps {
  title?: string;
}

export default function TopNav({ title }: TopNavProps) {
  const { t } = useTranslation();
  const display_name = useSession((s) => s.display_name);
  const currentStoreId = useSession((s) => s.currentStoreId);
  const role = useSession((s) => s.currentRole());

  const roleLabel = role ? t(`common:role.${role}` as const) : '';

  return (
    <View
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        background: '#0b1020',
        color: '#e6edf7',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <View>
        <Text style={{ display: 'block', fontSize: '16px', fontWeight: 'bold' }}>
          {title || t('common:brand.title')}
        </Text>
        <Text style={{ display: 'block', fontSize: '11px', color: '#6b7493', marginTop: '2px' }}>
          {display_name || '—'} {roleLabel ? `· ${roleLabel}` : ''}
        </Text>
      </View>
      <View style={{ textAlign: 'right' }}>
        <Text style={{ display: 'block', fontSize: '11px', color: '#6b7493' }}>
          {t('common:menu.switchStore')}
        </Text>
        <Text style={{ display: 'block', fontSize: '12px', color: '#22d3ee' }}>
          {currentStoreId || '—'}
        </Text>
      </View>
    </View>
  );
}

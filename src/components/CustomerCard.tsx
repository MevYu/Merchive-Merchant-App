import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import type { Customer } from '@/services/customer';

// CustomerCard is a list-row used by /pages/customers/index. Stays
// presentational so the page can wrap it with onClick for nav.

const LEVEL_COLOR: Record<NonNullable<Customer['level_tag']>, string> = {
  L1: 'var(--text-mute)',
  L2: 'var(--primary)',
  L3: 'var(--accent)',
  L4: 'var(--danger)',
};

export interface CustomerCardProps {
  customer: Customer;
  onClick?: () => void;
}

export default function CustomerCard({ customer, onClick }: CustomerCardProps) {
  const { t } = useTranslation();
  const lvl = customer.level_tag;
  return (
    <View
      onClick={onClick}
      style={{
        background: 'var(--bg-elev)',
        borderRadius: '16px',
        border: '1px solid rgba(17,24,39,0.10)',
        boxShadow: '0 1px 2px rgba(17,24,39,0.04)',
        padding: '12px',
        marginBottom: '8px',
      }}
    >
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: 'var(--text)', fontSize: '15px', fontWeight: 'bold' }}>
          {customer.name || customer.phone || customer.id}
        </Text>
        {lvl && (
          <Text style={{ color: LEVEL_COLOR[lvl], fontSize: '11px', fontWeight: 'bold' }}>
            {t(`pages:customers.tag.${lvl}` as const)}
          </Text>
        )}
      </View>
      <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <Text style={{ color: 'var(--text-mute)', fontSize: '11px' }}>
          {customer.phone || '—'}
        </Text>
        {customer.pending_followup && (
          <Text style={{ color: 'var(--danger)', fontSize: '11px' }}>● {t('pages:customers.filterFollow')}</Text>
        )}
      </View>
    </View>
  );
}

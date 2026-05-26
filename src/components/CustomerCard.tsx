import { View, Text } from '@tarojs/components';
import { useTranslation } from 'react-i18next';
import type { Customer } from '@/services/customer';

// CustomerCard is a list-row used by /pages/customers/index. Stays
// presentational so the page can wrap it with onClick for nav.

const LEVEL_COLOR: Record<NonNullable<Customer['level_tag']>, string> = {
  L1: '#6b7493',
  L2: '#22d3ee',
  L3: '#fbbf24',
  L4: '#f87171',
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
        background: 'rgba(20, 28, 58, 0.6)',
        borderRadius: '10px',
        padding: '12px',
        marginBottom: '8px',
      }}
    >
      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: '#e6edf7', fontSize: '15px', fontWeight: 'bold' }}>
          {customer.name || customer.phone || customer.id}
        </Text>
        {lvl && (
          <Text style={{ color: LEVEL_COLOR[lvl], fontSize: '11px', fontWeight: 'bold' }}>
            {t(`pages:customers.tag.${lvl}` as const)}
          </Text>
        )}
      </View>
      <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <Text style={{ color: '#6b7493', fontSize: '11px' }}>
          {customer.phone || '—'}
        </Text>
        {customer.pending_followup && (
          <Text style={{ color: '#f87171', fontSize: '11px' }}>● {t('pages:customers.filterFollow')}</Text>
        )}
      </View>
    </View>
  );
}

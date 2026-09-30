import { ClientProfileData, DestinationWallet } from '../types';

export const CLIENT_DESTINATION_WALLETS: DestinationWallet[] = [
  {
    network: 'Trc-20',
    label: 'TRC-20 (Tron Network)',
    address: 'TK4HkBbHm2ZaPMYE3PY93WGXb667xheFb5',
    currency: 'USDT-TRC20 / TRX',
  },
  {
    network: 'Bep-20',
    label: 'BEP-20 (BNB Smart Chain)',
    address: '0xc0c2ef5c5c6eab62e4d2593846035ae0b09edee4',
    currency: 'USDT-BEP20 / BNB',
  },
  {
    network: 'ERC-20',
    label: 'ERC-20 (Ethereum Network)',
    address: '0xc0c2ef5c5c6eab62e4d2593846035ae0b09edee4',
    currency: 'USDT-ERC20 / ETH',
  },
];

export const getClientProfileData = (user?: { name?: string; username?: string } | null): ClientProfileData => {
  const name = user?.name || (user?.username ? user.username.split('@')[0] : 'Private Wealth Client');
  const email = user?.username || 'client@meridianbancorp.com';

  return {
    clientName: name,
    email: email,
    availableBalance: 47986.00,
    requiredWithdrawalFee: 5960.00,
    destinationWallets: CLIENT_DESTINATION_WALLETS,
    history: [
      {
        id: 'inv-1',
        date: 'March 8, 2019',
        investedAmount: 5000.00,
        withdrawalAmount: 11750.00,
        profitAmount: 6750.00,
        feePaid: 1586.00,
        status: 'completed',
        notes: 'Initial account investment deposit & withdrawal',
      },
      {
        id: 'inv-2',
        date: 'October 29, 2019',
        investedAmount: 4000.00,
        withdrawalAmount: 12000.00,
        profitAmount: 8000.00,
        feePaid: 1264.00,
        status: 'completed',
        notes: 'Automated yield cycle return',
      },
      {
        id: 'inv-3',
        date: 'January 6, 2020',
        investedAmount: 500.00,
        withdrawalAmount: 2000.00,
        profitAmount: 1500.00,
        feePaid: 300.00,
        status: 'completed',
        notes: 'Micro-allocation tranche withdrawal',
      },
      {
        id: 'inv-4',
        date: 'July 14, 2020',
        investedAmount: 7000.00,
        withdrawalAmount: 16000.00,
        profitAmount: 9000.00,
        feePaid: 2000.00,
        status: 'completed',
        notes: 'Mid-year growth portfolio settlement',
      },
      {
        id: 'inv-5',
        date: 'February 10, 2021',
        investedAmount: 1000.00,
        withdrawalAmount: 4000.00,
        profitAmount: 3000.00,
        feePaid: 700.00,
        status: 'completed',
        notes: 'Q1 investment cycle distribution',
      },
      {
        id: 'inv-6',
        date: 'September 20, 2021',
        investedAmount: 10000.00,
        withdrawalAmount: 31000.00,
        profitAmount: 21000.00,
        feePaid: 3900.00,
        status: 'completed',
        notes: 'High-tier allocation settlement',
      },
      {
        id: 'inv-7',
        date: 'January 5, 2022',
        investedAmount: 6000.00,
        withdrawalAmount: 14000.00,
        profitAmount: 8000.00,
        feePaid: 1800.00,
        status: 'completed',
        notes: 'Annual rollover distribution',
      },
      {
        id: 'inv-8',
        date: 'April 12, 2022',
        investedAmount: 4000.00,
        withdrawalAmount: 0,
        profitAmount: 12000.00,
        feePaid: 0,
        status: 'reinvested',
        notes: 'Profit of $12,000 reinvested into portfolio on July 7, 2022',
      },
    ],
  };
};

export const DEFAULT_CLIENT_DATA: ClientProfileData = getClientProfileData(null);

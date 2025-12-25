
export const CRYPTO_ADDRESSES = {
  BTC: '3Le2oaudBvU4GcmKn8mg19SVoEofrQry3V',
  BEP20: '0x6a153ab88caadd1a1a4305977c7a9e0a5d3fc8ad',
  ERC20: '0xc456734c60d73c80cfd5b1c6839f1bf0090917a7',
  TRC20: 'TZDeaPnUcBRPvkpDQmkBEHeRd6D1aX4Gve'
};

export const PAYOUT_PERCENTAGE = 0.95;

export const TIMEFRAMES = ['5s', '10s', '30s', '1m', '5m', '15m', '30m'] as const;

export const PAIRS = [
  // FOREX MAJOR & MINOR (20 PAIRS)
  { symbol: 'FX:EURUSD', name: 'EUR/USD' },
  { symbol: 'FX:GBPUSD', name: 'GBP/USD' },
  { symbol: 'FX:USDJPY', name: 'USD/JPY' },
  { symbol: 'FX:AUDUSD', name: 'AUD/USD' },
  { symbol: 'FX:USDCAD', name: 'USD/CAD' },
  { symbol: 'FX:USDCHF', name: 'USD/CHF' },
  { symbol: 'FX:NZDUSD', name: 'NZD/USD' },
  { symbol: 'FX:EURGBP', name: 'EUR/GBP' },
  { symbol: 'FX:EURJPY', name: 'EUR/JPY' },
  { symbol: 'FX:GBPJPY', name: 'GBP/JPY' },
  { symbol: 'FX:AUDJPY', name: 'AUD/JPY' },
  { symbol: 'FX:EURCAD', name: 'EUR/CAD' },
  { symbol: 'FX:AUDCAD', name: 'AUD/CAD' },
  { symbol: 'FX:CADJPY', name: 'CAD/JPY' },
  { symbol: 'FX:CHFJPY', name: 'CHF/JPY' },
  { symbol: 'FX:EURAUD', name: 'EUR/AUD' },
  { symbol: 'FX:GBPAUD', name: 'GBP/AUD' },
  { symbol: 'FX:EURCHF', name: 'EUR/CHF' },
  { symbol: 'FX:GBPCHF', name: 'GBP/CHF' },
  { symbol: 'FX:USDMXN', name: 'USD/MXN' },

  // STOCKS & INDICES (10 PAIRS)
  { symbol: 'STK:AAPL', name: 'APPLE INC' },
  { symbol: 'STK:TSLA', name: 'TESLA INC' },
  { symbol: 'STK:NVDA', name: 'NVIDIA' },
  { symbol: 'STK:AMZN', name: 'AMAZON' },
  { symbol: 'STK:MSFT', name: 'MICROSOFT' },
  { symbol: 'STK:META', name: 'META' },
  { symbol: 'STK:GOOGL', name: 'GOOGLE' },
  { symbol: 'STK:NFLX', name: 'NETFLIX' },
  { symbol: 'IDX:US30', name: 'DOW JONES' },
  { symbol: 'IDX:NAS100', name: 'NASDAQ 100' }
];

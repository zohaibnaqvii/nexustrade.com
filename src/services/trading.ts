export interface TradingPair {
  symbol: string;
  tvSymbol: string; // TradingView symbol format
  name: string;
  payout: number;
  payout5min: number;
  icon: string;
  category: 'currencies' | 'otc' | 'crypto' | 'commodities' | 'stocks';
  change?: number;
  isOTC?: boolean;
}

// Only pairs available on TradingView with live data
export const TRADING_PAIRS: TradingPair[] = [
  // Forex - Available on TradingView via FX/OANDA
  { symbol: 'EUR/USD', tvSymbol: 'FX:EURUSD', name: 'Euro / US Dollar', payout: 92, payout5min: 92, icon: '🇪🇺🇺🇸', category: 'currencies', change: 0.12 },
  { symbol: 'GBP/USD', tvSymbol: 'FX:GBPUSD', name: 'British Pound / US Dollar', payout: 90, payout5min: 90, icon: '🇬🇧🇺🇸', category: 'currencies', change: -0.08 },
  { symbol: 'USD/JPY', tvSymbol: 'FX:USDJPY', name: 'US Dollar / Japanese Yen', payout: 90, payout5min: 90, icon: '🇺🇸🇯🇵', category: 'currencies', change: 0.23 },
  { symbol: 'AUD/USD', tvSymbol: 'FX:AUDUSD', name: 'Australian Dollar / US Dollar', payout: 89, payout5min: 89, icon: '🇦🇺🇺🇸', category: 'currencies', change: -0.15 },
  { symbol: 'USD/CAD', tvSymbol: 'FX:USDCAD', name: 'US Dollar / Canadian Dollar', payout: 88, payout5min: 88, icon: '🇺🇸🇨🇦', category: 'currencies', change: 0.05 },
  { symbol: 'EUR/GBP', tvSymbol: 'FX:EURGBP', name: 'Euro / British Pound', payout: 88, payout5min: 88, icon: '🇪🇺🇬🇧', category: 'currencies', change: 0.05 },
  { symbol: 'EUR/JPY', tvSymbol: 'FX:EURJPY', name: 'Euro / Japanese Yen', payout: 89, payout5min: 89, icon: '🇪🇺🇯🇵', category: 'currencies', change: -0.18 },
  { symbol: 'GBP/JPY', tvSymbol: 'FX:GBPJPY', name: 'British Pound / Japanese Yen', payout: 91, payout5min: 91, icon: '🇬🇧🇯🇵', category: 'currencies', change: 0.45 },
  { symbol: 'USD/CHF', tvSymbol: 'FX:USDCHF', name: 'US Dollar / Swiss Franc', payout: 87, payout5min: 87, icon: '🇺🇸🇨🇭', category: 'currencies', change: 0.21 },
  { symbol: 'NZD/USD', tvSymbol: 'FX:NZDUSD', name: 'New Zealand / US Dollar', payout: 88, payout5min: 88, icon: '🇳🇿🇺🇸', category: 'currencies', change: 0.12 },
  
  // OTC Pairs - Available 24/7 (Flash symbol ⚡)
  { symbol: 'EUR/USD (OTC)', tvSymbol: 'OTC:EURUSD', name: 'Euro / US Dollar OTC', payout: 92, payout5min: 90, icon: '⚡🇪🇺🇺🇸', category: 'otc', change: 0.15, isOTC: true },
  { symbol: 'GBP/USD (OTC)', tvSymbol: 'OTC:GBPUSD', name: 'British Pound / US Dollar OTC', payout: 90, payout5min: 88, icon: '⚡🇬🇧🇺🇸', category: 'otc', change: -0.12, isOTC: true },
  { symbol: 'USD/JPY (OTC)', tvSymbol: 'OTC:USDJPY', name: 'US Dollar / Japanese Yen OTC', payout: 91, payout5min: 89, icon: '⚡🇺🇸🇯🇵', category: 'otc', change: 0.28, isOTC: true },
  { symbol: 'AUD/USD (OTC)', tvSymbol: 'OTC:AUDUSD', name: 'Australian Dollar / US Dollar OTC', payout: 89, payout5min: 87, icon: '⚡🇦🇺🇺🇸', category: 'otc', change: -0.09, isOTC: true },
  { symbol: 'USD/CAD (OTC)', tvSymbol: 'OTC:USDCAD', name: 'US Dollar / Canadian Dollar OTC', payout: 88, payout5min: 86, icon: '⚡🇺🇸🇨🇦', category: 'otc', change: 0.11, isOTC: true },
  { symbol: 'EUR/GBP (OTC)', tvSymbol: 'OTC:EURGBP', name: 'Euro / British Pound OTC', payout: 88, payout5min: 86, icon: '⚡🇪🇺🇬🇧', category: 'otc', change: 0.03, isOTC: true },
  { symbol: 'USD/INR (OTC)', tvSymbol: 'OTC:USDINR', name: 'US Dollar / Indian Rupee OTC', payout: 85, payout5min: 83, icon: '⚡🇺🇸🇮🇳', category: 'otc', change: 0.18, isOTC: true },
  { symbol: 'EUR/INR (OTC)', tvSymbol: 'OTC:EURINR', name: 'Euro / Indian Rupee OTC', payout: 84, payout5min: 82, icon: '⚡🇪🇺🇮🇳', category: 'otc', change: -0.05, isOTC: true },
  { symbol: 'GBP/JPY (OTC)', tvSymbol: 'OTC:GBPJPY', name: 'British Pound / Japanese Yen OTC', payout: 91, payout5min: 89, icon: '⚡🇬🇧🇯🇵', category: 'otc', change: 0.42, isOTC: true },
  { symbol: 'BTC/USD (OTC)', tvSymbol: 'OTC:BTCUSD', name: 'Bitcoin / US Dollar OTC', payout: 95, payout5min: 93, icon: '⚡₿', category: 'otc', change: 1.85, isOTC: true },
  { symbol: 'ETH/USD (OTC)', tvSymbol: 'OTC:ETHUSD', name: 'Ethereum / US Dollar OTC', payout: 94, payout5min: 92, icon: '⚡Ξ', category: 'otc', change: 1.23, isOTC: true },
  { symbol: 'XAU/USD (OTC)', tvSymbol: 'OTC:XAUUSD', name: 'Gold / US Dollar OTC', payout: 88, payout5min: 86, icon: '⚡🥇', category: 'otc', change: 0.28, isOTC: true },
  
  // Crypto - Available on TradingView via BINANCE/COINBASE
  { symbol: 'BTC/USD', tvSymbol: 'BINANCE:BTCUSDT', name: 'Bitcoin / US Dollar', payout: 95, payout5min: 95, icon: '₿', category: 'crypto', change: 2.34 },
  { symbol: 'ETH/USD', tvSymbol: 'BINANCE:ETHUSDT', name: 'Ethereum / US Dollar', payout: 95, payout5min: 95, icon: 'Ξ', category: 'crypto', change: 1.87 },
  { symbol: 'BNB/USD', tvSymbol: 'BINANCE:BNBUSDT', name: 'Binance Coin / US Dollar', payout: 93, payout5min: 93, icon: '🔶', category: 'crypto', change: -0.45 },
  { symbol: 'XRP/USD', tvSymbol: 'BINANCE:XRPUSDT', name: 'Ripple / US Dollar', payout: 92, payout5min: 92, icon: '💧', category: 'crypto', change: 0.78 },
  { symbol: 'SOL/USD', tvSymbol: 'BINANCE:SOLUSDT', name: 'Solana / US Dollar', payout: 94, payout5min: 94, icon: '☀️', category: 'crypto', change: 3.21 },
  { symbol: 'DOGE/USD', tvSymbol: 'BINANCE:DOGEUSDT', name: 'Dogecoin / US Dollar', payout: 91, payout5min: 91, icon: '🐕', category: 'crypto', change: -1.12 },
  { symbol: 'ADA/USD', tvSymbol: 'BINANCE:ADAUSDT', name: 'Cardano / US Dollar', payout: 90, payout5min: 90, icon: '🔵', category: 'crypto', change: 0.95 },
  { symbol: 'AVAX/USD', tvSymbol: 'BINANCE:AVAXUSDT', name: 'Avalanche / US Dollar', payout: 92, payout5min: 92, icon: '🔺', category: 'crypto', change: 2.15 },
  { symbol: 'MATIC/USD', tvSymbol: 'BINANCE:MATICUSDT', name: 'Polygon / US Dollar', payout: 91, payout5min: 91, icon: '💜', category: 'crypto', change: 1.45 },
  { symbol: 'DOT/USD', tvSymbol: 'BINANCE:DOTUSDT', name: 'Polkadot / US Dollar', payout: 90, payout5min: 90, icon: '⚪', category: 'crypto', change: 0.88 },
  
  // Commodities - Available on TradingView
  { symbol: 'XAU/USD', tvSymbol: 'TVC:GOLD', name: 'Gold / US Dollar', payout: 88, payout5min: 88, icon: '🥇', category: 'commodities', change: 0.34 },
  { symbol: 'XAG/USD', tvSymbol: 'TVC:SILVER', name: 'Silver / US Dollar', payout: 87, payout5min: 87, icon: '🥈', category: 'commodities', change: -0.56 },
  { symbol: 'OIL/USD', tvSymbol: 'TVC:USOIL', name: 'Crude Oil WTI', payout: 85, payout5min: 85, icon: '🛢️', category: 'commodities', change: 1.23 },
  { symbol: 'BRENT/USD', tvSymbol: 'TVC:UKOIL', name: 'Brent Crude Oil', payout: 85, payout5min: 85, icon: '⛽', category: 'commodities', change: 1.15 },
  { symbol: 'GAS/USD', tvSymbol: 'TVC:NATURALGAS', name: 'Natural Gas', payout: 84, payout5min: 84, icon: '🔥', category: 'commodities', change: -0.78 },
  { symbol: 'COPPER/USD', tvSymbol: 'TVC:COPPER', name: 'Copper', payout: 83, payout5min: 83, icon: '🥉', category: 'commodities', change: 0.45 },
  
  // Stocks - Available on TradingView via NASDAQ
  { symbol: 'AAPL', tvSymbol: 'NASDAQ:AAPL', name: 'Apple Inc.', payout: 85, payout5min: 85, icon: '🍎', category: 'stocks', change: 0.89 },
  { symbol: 'TSLA', tvSymbol: 'NASDAQ:TSLA', name: 'Tesla Inc.', payout: 85, payout5min: 85, icon: '⚡', category: 'stocks', change: -2.34 },
  { symbol: 'AMZN', tvSymbol: 'NASDAQ:AMZN', name: 'Amazon.com Inc.', payout: 84, payout5min: 84, icon: '📦', category: 'stocks', change: 1.12 },
  { symbol: 'GOOGL', tvSymbol: 'NASDAQ:GOOGL', name: 'Alphabet Inc.', payout: 84, payout5min: 84, icon: '🔍', category: 'stocks', change: 0.45 },
  { symbol: 'META', tvSymbol: 'NASDAQ:META', name: 'Meta Platforms Inc.', payout: 83, payout5min: 83, icon: '👤', category: 'stocks', change: -0.78 },
  { symbol: 'MSFT', tvSymbol: 'NASDAQ:MSFT', name: 'Microsoft Corp.', payout: 84, payout5min: 84, icon: '🪟', category: 'stocks', change: 0.56 },
  { symbol: 'NVDA', tvSymbol: 'NASDAQ:NVDA', name: 'NVIDIA Corp.', payout: 86, payout5min: 86, icon: '💚', category: 'stocks', change: 3.21 },
  { symbol: 'AMD', tvSymbol: 'NASDAQ:AMD', name: 'AMD Inc.', payout: 85, payout5min: 85, icon: '🔴', category: 'stocks', change: 1.87 },
  { symbol: 'NFLX', tvSymbol: 'NASDAQ:NFLX', name: 'Netflix Inc.', payout: 83, payout5min: 83, icon: '🎬', category: 'stocks', change: -1.23 },
  { symbol: 'V', tvSymbol: 'NYSE:V', name: 'Visa Inc.', payout: 82, payout5min: 82, icon: '💳', category: 'stocks', change: 0.67 },
];

export const TIMEFRAMES = [
  { label: '5s', seconds: 5 },
  { label: '10s', seconds: 10 },
  { label: '30s', seconds: 30 },
  { label: '1m', seconds: 60 },
  { label: '5m', seconds: 300 },
  { label: '15m', seconds: 900 },
  { label: '30m', seconds: 1800 },
];

export const CRYPTO_ADDRESSES = {
  BTC: '3Le2oaudBvU4GcmKn8mg19SVoEofrQry3V',
  ERC20: '0xc456734c60d73c80cfd5b1c6839f1bf0090917a7',
  BEP20: '0x6a153ab88caadd1a1a4305977c7a9e0a5d3fc8ad',
  TRC20: 'TZDeaPnUcBRPvkpDQmkBEHeRd6D1aX4Gve'
};

export interface Trade {
  id: string;
  pair: string;
  direction: 'up' | 'down';
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  payout: number;
  duration: number;
  startTime: number;
  endTime: number;
  result?: 'win' | 'loss';
  profit?: number;
  isDemo: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  method: string;
  address?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

// Get live price from current chart (will be updated by TradingView widget)
let currentPrices: Record<string, number> = {};

export const setCurrentPrice = (symbol: string, price: number) => {
  currentPrices[symbol] = price;
};

export const getLivePrice = async (symbol: string): Promise<number> => {
  // Return cached price or base price
  if (currentPrices[symbol]) {
    return currentPrices[symbol];
  }
  
  // Base prices as fallback
  const basePrices: Record<string, number> = {
    'EUR/USD': 1.0875,
    'GBP/USD': 1.2650,
    'USD/JPY': 148.50,
    'AUD/USD': 0.6720,
    'USD/CAD': 1.3420,
    'EUR/GBP': 0.8590,
    'EUR/JPY': 161.50,
    'GBP/JPY': 187.85,
    'USD/CHF': 0.8920,
    'NZD/USD': 0.6125,
    'BTC/USD': 43250,
    'ETH/USD': 2280,
    'BNB/USD': 315.50,
    'XRP/USD': 0.6235,
    'SOL/USD': 98.45,
    'DOGE/USD': 0.0825,
    'XAU/USD': 2035,
    'XAG/USD': 23.45,
    'OIL/USD': 72.35,
    'AAPL': 185.50,
    'TSLA': 245.80,
    'AMZN': 155.20,
    'GOOGL': 141.80,
    'META': 375.40,
    'MSFT': 378.90,
  };

  return basePrices[symbol] || 100;
};

// Determine trade result
export const calculateTradeResult = (
  direction: 'up' | 'down',
  entryPrice: number,
  exitPrice: number
): 'win' | 'loss' => {
  if (direction === 'up') {
    return exitPrice > entryPrice ? 'win' : 'loss';
  } else {
    return exitPrice < entryPrice ? 'win' : 'loss';
  }
};

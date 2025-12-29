import React, { useEffect, useRef, memo, useState, useCallback } from 'react';
import { createChart, IChartApi, CandlestickData, Time, CandlestickSeries, createSeriesMarkers, SeriesMarker } from 'lightweight-charts';
import { Trade } from '@/services/trading';
import { ChevronDown, FileText, TrendingUp, TrendingDown } from 'lucide-react';

interface TradingChartProps {
  symbol: string;
  tvSymbol: string;
  onPriceUpdate: (price: number) => void;
  activeTrades: Trade[];
  chartInterval: string;
  onChartIntervalChange: (interval: string) => void;
  onViewHistory?: () => void;
  tradeStats?: { total: number; wins: number; losses: number };
}

const CHART_TIMEFRAMES = [
  { label: '1s', interval: '1S', seconds: 1 },
  { label: '1m', interval: '1', seconds: 60 },
  { label: '5m', interval: '5', seconds: 300 },
  { label: '15m', interval: '15', seconds: 900 },
  { label: '1h', interval: '60', seconds: 3600 },
  { label: '4h', interval: '240', seconds: 14400 },
  { label: '1D', interval: 'D', seconds: 86400 },
];

// GLOBAL TIME-SEEDED RANDOM - Same for ALL users based on exact timestamp
// This ensures every user sees the EXACT same chart at the same time
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Get consistent seed based on global time (all users get same seed for same second)
const getGlobalTimeSeed = (timestamp: number, symbolSeed: number): number => {
  // Round to nearest second for consistency
  const timeInSeconds = Math.floor(timestamp / 1000);
  return timeInSeconds + symbolSeed;
};

// Get base price for symbol (including OTC pairs)
const getBasePrice = (symbol: string): number => {
  // Remove OTC suffix for price lookup
  const cleanSymbol = symbol.replace(' (OTC)', '');
  const prices: Record<string, number> = {
    'EUR/USD': 1.0875, 'GBP/USD': 1.2650, 'USD/JPY': 148.50, 'AUD/USD': 0.6720,
    'USD/CAD': 1.3420, 'EUR/GBP': 0.8590, 'EUR/JPY': 161.50, 'GBP/JPY': 187.85,
    'USD/CHF': 0.8920, 'NZD/USD': 0.6125, 'USD/INR': 83.25, 'EUR/INR': 90.45,
    'BTC/USD': 43250, 'ETH/USD': 2280, 'BNB/USD': 315.50, 'XRP/USD': 0.6235, 
    'SOL/USD': 98.45, 'DOGE/USD': 0.0825, 'ADA/USD': 0.58, 'AVAX/USD': 35.20,
    'MATIC/USD': 0.92, 'DOT/USD': 7.85,
    'XAU/USD': 2035, 'XAG/USD': 23.45, 'OIL/USD': 72.35, 'BRENT/USD': 76.80,
    'GAS/USD': 2.85, 'COPPER/USD': 3.95,
    'AAPL': 185.50, 'TSLA': 245.80, 'AMZN': 155.20, 'GOOGL': 141.80, 
    'META': 375.40, 'MSFT': 378.90, 'NVDA': 485.50, 'AMD': 142.30,
    'NFLX': 485.20, 'V': 268.50,
  };
  return prices[cleanSymbol] || 100;
};

// Generate realistic candle patterns with varied trends
// CRITICAL: Uses global time seed so ALL users see EXACTLY the same chart
const generateCandles = (symbol: string, intervalSeconds: number, count: number = 500): CandlestickData<Time>[] => {
  const candles: CandlestickData<Time>[] = [];
  const basePrice = getBasePrice(symbol);
  const now = Math.floor(Date.now() / 1000);
  // Align to interval boundary for consistency
  const alignedNow = Math.floor(now / intervalSeconds) * intervalSeconds;
  const startTime = alignedNow - (count * intervalSeconds);
  
  let price = basePrice;
  // Symbol seed ensures different symbols have different patterns but SAME for all users
  const symbolSeed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  
  // Volatility settings
  const isCrypto = symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('SOL');
  const isJPY = symbol.includes('JPY');
  const isOTC = symbol.includes('OTC');
  const volatility = isCrypto ? 0.004 : isJPY ? 0.0012 : 0.0006;
  
  // Multiple trend types for variety
  let trendType = 0; // 0=ranging, 1=uptrend, 2=downtrend, 3=volatile, 4=consolidation
  let trendStrength = 0.5;
  let trendDuration = 0;
  let consolidationCenter = price;

  for (let i = 0; i < count; i++) {
    const candleTime = startTime + (i * intervalSeconds);
    const time = candleTime as Time;
    // GLOBAL SEED: Based on exact candle time + symbol, SAME for ALL users
    const globalSeed = getGlobalTimeSeed(candleTime * 1000, symbolSeed + i);
    const rand = seededRandom(globalSeed);
    
    // Change trend type occasionally with variety
    trendDuration--;
    if (trendDuration <= 0) {
      const trendRoll = seededRandom(globalSeed + 500);
      if (trendRoll < 0.25) {
        trendType = 0; // Ranging/sideways
        trendStrength = 0.2;
      } else if (trendRoll < 0.45) {
        trendType = 1; // Uptrend
        trendStrength = 0.4 + seededRandom(globalSeed + 100) * 0.5;
      } else if (trendRoll < 0.65) {
        trendType = 2; // Downtrend
        trendStrength = 0.4 + seededRandom(globalSeed + 100) * 0.5;
      } else if (trendRoll < 0.8) {
        trendType = 3; // High volatility
        trendStrength = 0.1;
      } else {
        trendType = 4; // Tight consolidation
        trendStrength = 0.3;
        consolidationCenter = price;
      }
      trendDuration = Math.floor(8 + seededRandom(globalSeed + 200) * 25);
    }
    
    // Calculate candle based on trend type
    const bodyMultiplier = trendType === 3 ? 1.5 + seededRandom(globalSeed + 1) * 2 : 0.5 + seededRandom(globalSeed + 1) * 1.2;
    const baseBodySize = volatility * basePrice * bodyMultiplier;
    
    // Determine direction based on trend
    let isBullish: boolean;
    const randomDir = seededRandom(globalSeed + 2);
    
    switch (trendType) {
      case 1: // Uptrend - 65% bullish
        isBullish = randomDir < 0.65;
        break;
      case 2: // Downtrend - 35% bullish
        isBullish = randomDir < 0.35;
        break;
      case 4: // Consolidation - pull toward center
        const aboveCenter = price > consolidationCenter;
        isBullish = aboveCenter ? randomDir < 0.4 : randomDir < 0.6;
        break;
      default: // Ranging/volatile - 50/50
        isBullish = randomDir > 0.5;
    }
    
    const open = price;
    const bodySize = baseBodySize * (0.3 + seededRandom(globalSeed + 3) * 1.2);
    const close = isBullish ? open + bodySize : open - bodySize;
    
    // Wicks with variation
    const wickMultiplier = trendType === 3 ? 1.5 : 0.8;
    const upperWickRatio = seededRandom(globalSeed + 4) * wickMultiplier;
    const lowerWickRatio = seededRandom(globalSeed + 5) * wickMultiplier;
    const wickBase = Math.abs(close - open) * 0.6;
    
    const high = Math.max(open, close) + wickBase * upperWickRatio;
    const low = Math.min(open, close) - wickBase * lowerWickRatio;
    
    // Engulfing and doji patterns
    if (i > 0 && candles.length > 0) {
      const prevCandle = candles[i - 1];
      
      // Engulfing pattern (10% chance)
      if (seededRandom(globalSeed + 6) < 0.1) {
        if (isBullish && prevCandle.close < prevCandle.open) {
          candles.push({
            time,
            open: Math.min(open, prevCandle.close - bodySize * 0.2),
            high: Math.max(high, prevCandle.high),
            low: Math.min(low, prevCandle.low),
            close: Math.max(close, prevCandle.open + bodySize * 0.2),
          });
          price = candles[candles.length - 1].close;
          continue;
        }
      }
      
      // Doji pattern (5% chance in consolidation)
      if (trendType === 4 && seededRandom(globalSeed + 7) < 0.15) {
        const dojiPrice = (open + close) / 2;
        candles.push({
          time,
          open: dojiPrice - bodySize * 0.05,
          high: dojiPrice + bodySize * 0.4,
          low: dojiPrice - bodySize * 0.4,
          close: dojiPrice + bodySize * 0.05,
        });
        price = dojiPrice;
        continue;
      }
    }
    
    // Mean reversion with trend influence
    const deviation = (price - basePrice) / basePrice;
    const reversionStrength = trendType === 0 || trendType === 4 ? 0.15 : 0.05;
    if (Math.abs(deviation) > 0.025) {
      const reversion = -deviation * reversionStrength * basePrice;
      price = close + reversion;
    } else {
      price = close;
    }
    
    candles.push({ time, open, high, low, close: price });
  }
  
  return candles;
};

const TradingChart: React.FC<TradingChartProps> = memo(({ 
  symbol, 
  tvSymbol,
  onPriceUpdate, 
  activeTrades,
  chartInterval,
  onChartIntervalChange,
  onViewHistory,
  tradeStats,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ReturnType<IChartApi['addSeries']> | null>(null);
  const markersRef = useRef<ReturnType<typeof createSeriesMarkers> | null>(null);
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const candlesRef = useRef<CandlestickData<Time>[]>([]);
  const [candleCountdown, setCandleCountdown] = useState<string>('');
  const [currentDisplayPrice, setCurrentDisplayPrice] = useState<number>(0);

  const currentTf = CHART_TIMEFRAMES.find(tf => tf.interval === chartInterval) || CHART_TIMEFRAMES[1];

  // Candle countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const intervalSec = currentTf.seconds;
      const elapsed = now % intervalSec;
      const remaining = intervalSec - elapsed;
      
      if (remaining >= 60) {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        setCandleCountdown(`${mins}:${secs.toString().padStart(2, '0')}`);
      } else {
        setCandleCountdown(`${remaining}s`);
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [currentTf.seconds]);

  // Update display price
  const handlePriceUpdateInternal = useCallback((price: number) => {
    setCurrentDisplayPrice(price);
    onPriceUpdate(price);
  }, [onPriceUpdate]);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#0d1117' },
        textColor: '#848e9c',
      },
      grid: {
        vertLines: { color: '#1e2530' },
        horzLines: { color: '#1e2530' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#4f5966', width: 1, style: 2 },
        horzLine: { color: '#4f5966', width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: '#2a3548',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: '#2a3548',
        timeVisible: true,
        secondsVisible: currentTf.seconds <= 60,
      },
      handleScale: { mouseWheel: true, pinch: true },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: true },
    });

    // Add candlestick series using v5 API
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#00c853',
      downColor: '#ff1744',
      borderUpColor: '#00c853',
      borderDownColor: '#ff1744',
      wickUpColor: '#00c853',
      wickDownColor: '#ff1744',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Generate initial candles
    const candles = generateCandles(symbol, currentTf.seconds);
    candlesRef.current = candles;
    series.setData(candles);

    // Create markers primitive
    markersRef.current = createSeriesMarkers(series, []);

    // Initial zoom - show last 40 bars for better visibility
    if (candlesRef.current.length > 0) {
      const lastIndex = candlesRef.current.length - 1;
      const barsToShow = 40; // More zoomed in initially
      const fromIndex = Math.max(0, lastIndex - barsToShow);
      
      chart.timeScale().setVisibleLogicalRange({
        from: fromIndex,
        to: lastIndex + 5,
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      markersRef.current = null;
    };
  }, [symbol, chartInterval, currentTf.seconds, handlePriceUpdateInternal]);

  // Real-time price updates with GLOBAL TIME SEED - Same for ALL users
  useEffect(() => {
    const symbolSeed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const isCrypto = symbol.includes('BTC') || symbol.includes('ETH');
    const baseVol = isCrypto ? 0.0015 : 0.0004;
    
    const interval = setInterval(() => {
      if (!seriesRef.current || candlesRef.current.length === 0) return;
      
      const nowMs = Date.now();
      const now = Math.floor(nowMs / 1000);
      const lastCandle = candlesRef.current[candlesRef.current.length - 1];
      const lastCandleTime = lastCandle.time as number;
      
      // Use global time seed for tick updates - SAME for all users
      const tickSeed = getGlobalTimeSeed(nowMs, symbolSeed);
      
      if (now - lastCandleTime >= currentTf.seconds) {
        // New candle - use global seed
        const newTime = (lastCandleTime + currentTf.seconds) as Time;
        const newOpen = lastCandle.close;
        const newCandleSeed = getGlobalTimeSeed((lastCandleTime + currentTf.seconds) * 1000, symbolSeed);
        
        // Deterministic direction based on global seed
        const trendDir = seededRandom(newCandleSeed + 100) < 0.5 ? -1 : 1;
        const momentum = seededRandom(newCandleSeed + 200) * 0.5;
        
        const bodySize = baseVol * newOpen * (0.5 + seededRandom(newCandleSeed + 300));
        const direction = seededRandom(newCandleSeed + 400) + trendDir * momentum > 0.5 ? 1 : -1;
        const newClose = newOpen + direction * bodySize;
        
        const wickUp = seededRandom(newCandleSeed + 500) * bodySize * 0.5;
        const wickDown = seededRandom(newCandleSeed + 600) * bodySize * 0.5;
        
        const newCandle: CandlestickData<Time> = {
          time: newTime,
          open: newOpen,
          high: Math.max(newOpen, newClose) + wickUp,
          low: Math.min(newOpen, newClose) - wickDown,
          close: newClose,
        };
        
        candlesRef.current.push(newCandle);
        seriesRef.current.update(newCandle);
        handlePriceUpdateInternal(newClose);
      } else {
        // Update current candle tick with DETERMINISTIC movement
        const tickSize = baseVol * lastCandle.close * 0.3;
        // Use 100ms granularity for tick seed to reduce jitter
        const tickGranularSeed = Math.floor(nowMs / 100) + symbolSeed;
        const tickDir = seededRandom(tickGranularSeed) > 0.5 ? 1 : -1;
        const tickAmount = seededRandom(tickGranularSeed + 1) * tickSize;
        const newClose = lastCandle.close + tickDir * tickAmount;
        
        const updatedCandle: CandlestickData<Time> = {
          ...lastCandle,
          close: newClose,
          high: Math.max(lastCandle.high, newClose),
          low: Math.min(lastCandle.low, newClose),
        };
        
        candlesRef.current[candlesRef.current.length - 1] = updatedCandle;
        seriesRef.current.update(updatedCandle);
        handlePriceUpdateInternal(newClose);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [symbol, currentTf.seconds, handlePriceUpdateInternal]);

  // NO auto-zoom on trade - chart stays completely stable
  // User controls zoom manually, trades don't affect view
  
  // Limit zoom out - prevent excessive zoom
  useEffect(() => {
    if (!chartRef.current) return;
    
    const timeScale = chartRef.current.timeScale();
    
    const handleVisibleRangeChange = () => {
      const range = timeScale.getVisibleLogicalRange();
      if (range) {
        const visibleBars = range.to - range.from;
        // Limit to max 150 bars visible (prevent too much zoom out)
        if (visibleBars > 150) {
          const center = (range.from + range.to) / 2;
          timeScale.setVisibleLogicalRange({
            from: center - 75,
            to: center + 75,
          });
        }
      }
    };
    
    timeScale.subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
    return () => {
      timeScale.unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
    };
  }, []);

  // Price lines for active trades
  useEffect(() => {
    if (!seriesRef.current) return;
    
    // Store price lines to remove later
    const priceLines: ReturnType<typeof seriesRef.current.createPriceLine>[] = [];
    
    activeTrades.forEach((trade) => {
      const isUp = trade.direction === 'up';
      const priceLine = seriesRef.current!.createPriceLine({
        price: trade.entryPrice,
        color: isUp ? '#00c853' : '#ff1744',
        lineWidth: 1,
        lineStyle: 0, // Solid
        axisLabelVisible: true,
        title: '',
      });
      priceLines.push(priceLine);
    });
    
    return () => {
      priceLines.forEach(line => {
        try {
          seriesRef.current?.removePriceLine(line);
        } catch (e) {}
      });
    };
  }, [activeTrades]);

  // Update markers for active trades - dot style
  useEffect(() => {
    if (!markersRef.current) return;

    const updateMarkers = () => {
      if (!markersRef.current) return;
      
      const markers: SeriesMarker<Time>[] = activeTrades.map((trade) => {
        const tradeTime = Math.floor(trade.startTime / 1000) as Time;
        const isUp = trade.direction === 'up';
        const remaining = Math.max(0, Math.ceil((trade.endTime - Date.now()) / 1000));
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        return {
          time: tradeTime,
          position: isUp ? 'belowBar' : 'aboveBar',
          color: isUp ? '#00c853' : '#ff1744',
          shape: 'circle',
          text: `⏱ ${timeStr}`,
          size: 1,
        } as SeriesMarker<Time>;
      });

      markersRef.current.setMarkers(markers);
    };

    updateMarkers();
    const interval = setInterval(updateMarkers, 1000);
    return () => clearInterval(interval);
  }, [activeTrades]);

  // Format price for display
  const formatPrice = (price: number) => {
    if (price >= 1000) return price.toFixed(2);
    if (price >= 1) return price.toFixed(4);
    return price.toFixed(6);
  };

  return (
    <div className="w-full h-full bg-[#0d1117] relative">
      {/* Top Controls Bar */}
      <div className="absolute top-2 left-2 right-2 z-20 flex items-center gap-2">
        {/* Timeframe Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
            className="flex items-center gap-1 bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-white text-xs font-medium hover:bg-[#21262d] transition-colors"
          >
            {currentTf.label}
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          
          {showTimeframeDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowTimeframeDropdown(false)} />
              <div className="absolute top-full left-0 mt-1 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl z-50 py-1 min-w-[70px]">
                {CHART_TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.interval}
                    onClick={() => {
                      onChartIntervalChange(tf.interval);
                      setShowTimeframeDropdown(false);
                    }}
                    className={`w-full px-2 py-1 text-left text-xs ${
                      chartInterval === tf.interval
                        ? 'bg-[#00c853]/20 text-[#00c853]'
                        : 'text-gray-300 hover:bg-[#21262d]'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Trade History Button - Small */}
        {onViewHistory && (
          <button
            onClick={onViewHistory}
            className="flex items-center gap-1 bg-[#161b22] border border-[#30363d] rounded px-2 py-1 hover:bg-[#21262d] transition-colors"
          >
            <FileText className="w-3 h-3 text-gray-400" />
            {tradeStats && tradeStats.total > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-green-400 text-[10px] font-bold">{tradeStats.wins}</span>
                <span className="text-gray-500 text-[10px]">/</span>
                <span className="text-red-400 text-[10px] font-bold">{tradeStats.losses}</span>
              </div>
            )}
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + Candle Countdown */}
        <div className="flex items-center gap-2 bg-[#161b22]/90 border border-[#30363d] rounded px-2 py-1">
          <span className="text-white text-xs font-mono font-bold">
            {formatPrice(currentDisplayPrice)}
          </span>
          <span className="text-yellow-400 text-[10px] font-mono">
            ⏱{candleCountdown}
          </span>
        </div>
      </div>

      {/* Chart Container */}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
});

TradingChart.displayName = 'TradingChart';

export default TradingChart;
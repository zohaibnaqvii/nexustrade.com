import React, { useEffect, useRef, memo, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CrosshairMode, IPriceLine } from 'lightweight-charts';
import { Trade, Timeframe } from '../types';
import { TIMEFRAMES } from '../constants';

interface TradingViewChartProps {
  symbol: string;
  trades: Trade[];
  onPriceUpdate: (price: number) => void;
  candleCountdown: number;
  resolution: number;
  onResolutionChange: (res: number, tf: Timeframe) => void;
  currentTimeframe: Timeframe;
}

const getBasePrice = (symbol: string) => {
    if (symbol.includes('EURUSD')) return 1.08540;
    if (symbol.includes('GBPUSD')) return 1.26420;
    if (symbol.includes('USDJPY')) return 151.25;
    if (symbol.includes('AAPL')) return 192.45;
    if (symbol.includes('TSLA')) return 178.55;
    if (symbol.includes('NVDA')) return 890.15;
    if (symbol.includes('US30')) return 39210;
    if (symbol.includes('NAS100')) return 18305;
    return 100.00;
};

// Advanced Deterministic Algorithm for "Jagged" Market Movement
const getPriceAtTime = (symbol: string, timeSec: number) => {
    const base = getBasePrice(symbol);
    const hash = symbol.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    const s = Math.abs(hash) % 15000;
    const t = timeSec;

    const volatility = symbol.startsWith('FX:') ? 0.0007 : 0.0025;

    // Combining multiple prime-based oscillators to create chaotic but deterministic movement
    const trend = Math.sin((t + s) / 5039) * 30;         
    const swing = Math.sin((t + s) / 827) * 12;          
    const noise = Math.sin((t + s) / 197) * 4;           
    const jitter = Math.sin((t + s) / 41) * 2;           
    const micro = Math.sin((t + s) / 7) * 1.2;           
    const rapid = Math.sin((t + s) / 1.3) * 0.6;         

    const totalMove = (trend + swing + noise + jitter + micro + rapid) * volatility;
    return base * (1 + totalMove);
};

const TradingViewChart: React.FC<TradingViewChartProps> = memo(({ symbol, trades, onPriceUpdate, candleCountdown, resolution, onResolutionChange, currentTimeframe }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const priceLinesRef = useRef<{ [key: string]: IPriceLine }>({});
  const loopRef = useRef<number | null>(null);
  const [showTF, setShowTF] = useState(false);
  
  const currentHighRef = useRef<number>(0);
  const currentLowRef = useRef<number>(0);
  const lastCandleTRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const throttledPriceRef = useRef<number>(0);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    if (chartRef.current) {
        chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      layout: { 
        background: { type: ColorType.Solid, color: '#0b0e14' }, 
        textColor: '#d1d4dc', 
        fontSize: 12,
      },
      grid: { 
        vertLines: { color: 'rgba(42, 46, 57, 0.05)' }, 
        horzLines: { color: 'rgba(42, 46, 57, 0.05)' } 
      },
      crosshair: { 
        mode: CrosshairMode.Normal, 
        vertLine: { labelBackgroundColor: '#2962ff', color: '#758696', style: 2, width: 1, labelVisible: true }, 
        horzLine: { labelBackgroundColor: '#2962ff', color: '#758696', style: 2, width: 1, labelVisible: true } 
      },
      rightPriceScale: { 
        borderColor: 'rgba(255,255,255,0.08)', 
        autoScale: true,
        scaleMargins: { top: 0.15, bottom: 0.15 },
        alignLabels: true,
      },
      timeScale: { 
        borderColor: 'rgba(255,255,255,0.08)', 
        timeVisible: true, 
        secondsVisible: true, 
        barSpacing: 20, 
        minBarSpacing: 6,
        rightOffset: 12,
        shiftVisibleRangeOnNewBar: true,
      },
      handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
      watermark: {
          visible: true,
          fontSize: 42,
          horzAlign: 'center',
          vertAlign: 'center',
          color: 'rgba(255, 255, 255, 0.03)',
          text: 'NEXUSTRADE',
      },
    });

    const isForex = symbol.startsWith('FX:');
    const precision = isForex ? 5 : 2;

    const series = chart.addCandlestickSeries({
      upColor: '#26a69a', 
      downColor: '#ef5350', 
      borderVisible: false, 
      wickUpColor: '#26a69a', 
      wickDownColor: '#ef5350',
      priceFormat: { type: 'price', precision: precision, minMove: 1 / Math.pow(10, precision) },
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const now = Math.floor(Date.now() / 1000);
    const startT = Math.floor(now / resolution) * resolution;
    const history = [];
    for (let i = 1000; i >= 1; i--) {
        const t = startT - (i * resolution);
        const o = getPriceAtTime(symbol, t);
        const c = getPriceAtTime(symbol, t + resolution);
        const h = Math.max(o, c) + (Math.abs(Math.sin(t*1.5)) * (o * 0.00025));
        const l = Math.min(o, c) - (Math.abs(Math.cos(t*1.5)) * (o * 0.00025));
        history.push({ time: t as any, open: o, high: h, low: l, close: c });
    }
    series.setData(history);

    const updateLoop = () => {
        const nowMs = Date.now();
        const tNow = nowMs / 1000;
        const candleT = Math.floor(tNow / resolution) * resolution;
        
        // Every ~400ms update the price to create the "ruk ruk kar" (stepped) effect
        if (nowMs - lastUpdateRef.current > 400 || candleT !== lastCandleTRef.current) {
            const currentPrice = getPriceAtTime(symbol, tNow);
            const openPrice = getPriceAtTime(symbol, candleT);

            if (candleT !== lastCandleTRef.current) {
                currentHighRef.current = Math.max(openPrice, currentPrice);
                currentLowRef.current = Math.min(openPrice, currentPrice);
                lastCandleTRef.current = candleT;
            } else {
                currentHighRef.current = Math.max(currentHighRef.current, currentPrice);
                currentLowRef.current = Math.min(currentLowRef.current, currentPrice);
            }

            series.update({
                time: candleT as any,
                open: openPrice,
                high: currentHighRef.current,
                low: currentLowRef.current,
                close: currentPrice
            });

            throttledPriceRef.current = currentPrice;
            onPriceUpdate(currentPrice);
            lastUpdateRef.current = nowMs;
        }

        loopRef.current = requestAnimationFrame(updateLoop);
    };
    updateLoop();

    const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
            chartRef.current.applyOptions({ 
                width: chartContainerRef.current.clientWidth, 
                height: chartContainerRef.current.clientHeight 
            });
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        if (loopRef.current) cancelAnimationFrame(loopRef.current);
        chart.remove();
    };
  }, [symbol, resolution]);

  useEffect(() => {
    if (!seriesRef.current) return;
    const activeTrades = trades.filter(t => t.status === 'OPEN');
    
    Object.values(priceLinesRef.current).forEach(line => seriesRef.current?.removePriceLine(line));
    priceLinesRef.current = {};

    activeTrades.forEach(trade => {
        const line = seriesRef.current!.createPriceLine({
            price: trade.entryPrice,
            color: trade.direction === 'UP' ? '#26a69a' : '#ef5350',
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `${trade.direction} $${trade.amount}`,
        });
        priceLinesRef.current[trade.id] = line;
    });
  }, [trades]);

  return (
    <div className="relative w-full h-full bg-[#0b0e14] flex flex-col">
      <div ref={chartContainerRef} className="flex-1 w-full" />
      
      <div className="absolute top-4 right-4 z-50">
          <button onClick={() => setShowTF(!showTF)} className="glass-panel px-4 py-2 rounded-xl text-[11px] font-black text-blue-500 border-white/10 flex items-center gap-2 hover:bg-white/5 transition-all shadow-2xl">
              {currentTimeframe}
              <svg className={`w-3 h-3 transition-transform ${showTF ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" stroke="currentColor"></path></svg>
          </button>
          {showTF && (
              <div className="absolute top-full right-0 mt-2 w-28 glass-panel rounded-xl border-white/10 p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  {TIMEFRAMES.map(tf => (
                      <button key={tf} onClick={() => { 
                          const resMap: any = { '5s': 5, '10s': 10, '30s': 30, '1m': 60, '5m': 300, '15m': 900, '30m': 1800 };
                          onResolutionChange(resMap[tf], tf as any);
                          setShowTF(false);
                      }} className={`w-full text-left px-3 py-2.5 text-[10px] font-black rounded-lg transition-colors ${currentTimeframe === tf ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}>{tf}</button>
                  ))}
              </div>
          )}
      </div>

      <div className="absolute bottom-6 left-6 z-10 pointer-events-none flex flex-col items-start gap-1">
          <div className="bg-[#2962ff]/10 border border-[#2962ff]/30 px-3 py-1.5 rounded-full text-[#2962ff] font-black text-[10px] tabular-nums backdrop-blur-md flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                NEXT CANDLE: {candleCountdown}s
          </div>
      </div>
    </div>
  );
});

export default TradingViewChart;
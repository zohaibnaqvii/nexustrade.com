import React, { useState } from 'react';
import { TradingPair, TRADING_PAIRS } from '@/services/trading';
import { X, Search, Star, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';

interface PairSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPair: (pair: TradingPair) => void;
  selectedPair: TradingPair;
}

type Category = 'currencies' | 'otc' | 'crypto' | 'commodities' | 'stocks';

const PairSelectorModal: React.FC<PairSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectPair,
  selectedPair,
}) => {
  const [activeCategory, setActiveCategory] = useState<Category>('currencies');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'payout' | 'change'>('name');

  if (!isOpen) return null;

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol) 
        : [...prev, symbol]
    );
  };

  const filteredPairs = TRADING_PAIRS
    .filter(pair => pair.category === activeCategory)
    .filter(pair => 
      pair.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pair.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'payout':
          return b.payout - a.payout;
        case 'change':
          return Math.abs(b.change || 0) - Math.abs(a.change || 0);
        default:
          return a.symbol.localeCompare(b.symbol);
      }
    });

  const categories: { key: Category; label: string }[] = [
    { key: 'currencies', label: 'FOREX' },
    { key: 'otc', label: 'OTC 24/7' },
    { key: 'crypto', label: 'CRYPTO' },
    { key: 'commodities', label: 'COMMODITIES' },
    { key: 'stocks', label: 'STOCKS' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#2a3548]">
        <h1 className="text-white text-xl font-bold">Select trade pair</h1>
        <button onClick={onClose} className="p-2">
          <X className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex px-2 py-2 gap-2 border-b border-[#2a3548] overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              activeCategory === cat.key
                ? 'bg-[#2a3548] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Favorites & Search */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1f2e] border border-[#2a3548] rounded-lg">
          <Star className="w-4 h-4 text-gray-400" />
          <span className="text-gray-400 text-sm">{favorites.length}</span>
        </button>
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[#1a1f2e] border border-[#2a3548] rounded-lg">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#2a3548]">
        <span className="text-gray-500 text-sm">Sort by:</span>
        <button 
          onClick={() => setSortBy(sortBy === 'name' ? 'payout' : sortBy === 'payout' ? 'change' : 'name')}
          className="flex items-center gap-1 text-white text-sm"
        >
          <span className="underline decoration-dotted">{sortBy === 'name' ? 'Name' : sortBy === 'payout' ? 'Payout' : 'Change'}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Pairs List */}
      <div className="flex-1 overflow-y-auto max-h-[calc(100vh-220px)]">
        {filteredPairs.map(pair => {
          const isPositive = (pair.change || 0) >= 0;
          const isFavorite = favorites.includes(pair.symbol);
          
          return (
            <button
              key={pair.symbol}
              onClick={() => {
                onSelectPair(pair);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 border-b border-[#1a1f2e] active:bg-[#2a3548] ${
                pair.symbol === selectedPair.symbol ? 'bg-[#2a3548]/50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(pair.symbol);
                  }}
                  className="p-1"
                >
                  <Star 
                    className={`w-5 h-5 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                  />
                </button>
                <span className="text-2xl">{pair.icon}</span>
                <div className="text-left">
                  <div className="text-white font-semibold">{pair.symbol}</div>
                  <div className="text-gray-500 text-xs">
                    Profit 1+ min <span className="text-orange-400">{pair.payout}%</span>
                    {' '}5+ min <span className="text-orange-400">{pair.payout5min}%</span>
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span className="font-bold">{isPositive ? '+' : ''}{pair.change?.toFixed(2)}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PairSelectorModal;

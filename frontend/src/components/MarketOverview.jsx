import React, { useState, useEffect } from 'react';
import { HiTrendingUp, HiCurrencyDollar } from 'react-icons/hi';

export default function MarketOverview() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  // La lista exacta que pediste
  const COINS = ["BTC", "ETH", "SOL", "ADA", "DOT", "XRP", "LTC", "BCH", "USDT"];

  useEffect(() => {
    const fetchMarketPrices = async () => {
      try {
        // Pedimos todos los precios de una sola vez
        const tickersParam = COINS.join(',');
        const response = await fetch(`http://localhost:8080/api/prices/batch?tickers=${tickersParam}`);
        if (response.ok) {
          const data = await response.json();
          setPrices(data);
        }
      } catch (error) {
        console.error("Error fetching market:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketPrices();
    // Actualizar cada 60 segundos automáticamente
    const interval = setInterval(fetchMarketPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const getCoinName = (ticker) => {
    const names = {
        "BTC": "Bitcoin", "ETH": "Ethereum", "SOL": "Solana", 
        "ADA": "Cardano", "DOT": "Polkadot", "XRP": "Ripple",
        "LTC": "Litecoin", "BCH": "Bitcoin Cash", "USDT": "Tether"
    };
    return names[ticker] || ticker;
  };

  return (
    <div className="market-container">
      <div className="market-header">
        <h3>Market Overview</h3>
        <span className="live-badge">● Live</span>
      </div>

      <div className="coin-list">
        {loading ? (
            <div className="loading-state">Loading market data...</div>
        ) : (
            COINS.map((ticker) => {
                const price = prices[ticker];
                return (
                    <div key={ticker} className="coin-row">
                        <div className="coin-info">
                            <span className="ticker">{ticker}</span>
                            <span className="name">{getCoinName(ticker)}</span>
                        </div>
                        <div className="coin-price">
                            {price 
                                ? `$${price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6})}` 
                                : <span className="dots">...</span>
                            }
                        </div>
                    </div>
                );
            })
        )}
      </div>

      <style>{`
        .market-container {
            height: 100%;
            display: flex;
            flex-direction: column;
            min-height: 300px; /* Asegura altura si hay pocos datos */
        }

        .market-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .market-header h3 {
            margin: 0;
            font-size: 1.1rem;
            color: #fff;
            font-weight: 600;
        }

        .live-badge {
            font-size: 0.7rem;
            color: #4ade80;
            background: rgba(74, 222, 128, 0.1);
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: 600;
            animation: pulse 2s infinite;
        }

        /* LISTA CON SCROLL */
        .coin-list {
            flex: 1;
            overflow-y: auto; /* Permite scroll si la lista es larga */
            padding-right: 5px; /* Espacio para el scrollbar */
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-height: 320px; /* Límite de altura antes de hacer scroll */
        }

        /* Estilizando el Scrollbar para que se vea "Cyberpunk" */
        .coin-list::-webkit-scrollbar { width: 4px; }
        .coin-list::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .coin-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }

        .coin-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: rgba(255,255,255,0.03);
            border-radius: 8px;
            transition: background 0.2s;
        }
        
        .coin-row:hover {
            background: rgba(255,255,255,0.08);
        }

        .coin-info { display: flex; flex-direction: column; }
        
        .ticker { 
            font-weight: 700; 
            color: #fff; 
            font-size: 0.9rem; 
        }
        
        .name { 
            font-size: 0.7rem; 
            color: #94a3b8; 
        }

        .coin-price {
            font-family: 'Monaco', 'Consolas', monospace;
            color: #38bdf8;
            font-weight: 600;
            font-size: 0.95rem;
        }

        .loading-state {
            text-align: center;
            color: #64748b;
            margin-top: 40px;
            font-size: 0.9rem;
        }

        .dots { animation: pulse 1s infinite; }
        
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}
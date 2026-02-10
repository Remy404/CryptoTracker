import React, { useState, useEffect } from 'react';
import { HiTrendingUp, HiCurrencyDollar } from 'react-icons/hi';

export default function PortfolioSummary() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar datos del Backend
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/transactions/summary');
        if (response.ok) {
          const data = await response.json();
          setSummary(data);
        }
      } catch (error) {
        console.error("Error loading summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
    
    // Escuchar eventos para recargar si agregas una nueva transacción
    window.addEventListener('transaction-added', fetchSummary);
    window.addEventListener('transaction-deleted', fetchSummary);
    return () => {
        window.removeEventListener('transaction-added', fetchSummary);
        window.removeEventListener('transaction-deleted', fetchSummary);
    };
  }, []);

  if (loading) return <div className="loading-text">Loading Assets...</div>;
  if (summary.length === 0) return null; // No mostrar nada si no hay datos

  return (
    <div className="summary-grid">
      {summary.map((asset, index) => (
        <div key={index} className="asset-card">
          <div className="card-header">
            <span className="coin-badge">{asset.ticker}</span>
            <HiTrendingUp className="icon-trend" />
          </div>
          
          <div className="card-body">
            <div className="stat-group">
              <label>Total Holding</label>
              <span className="value">{asset.totalAmount} {asset.ticker}</span>
            </div>
            
            <div className="divider"></div>

            <div className="stat-group">
              <label>Total Invested</label>
              <span className="value money">
                ${asset.totalInvested.toLocaleString('en-US', {minimumFractionDigits: 2})}
              </span>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .asset-card {
            background: rgba(30, 41, 59, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 20px;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .asset-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
            border-color: rgba(56, 189, 248, 0.3);
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .coin-badge {
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 0.9rem;
            box-shadow: 0 2px 10px rgba(14, 165, 233, 0.3);
        }

        .icon-trend { color: #94a3b8; font-size: 1.2rem; }

        .stat-group { display: flex; flex-direction: column; gap: 4px; }
        .stat-group label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-group .value { font-size: 1.1rem; font-weight: 600; color: #f1f5f9; }
        .stat-group .money { color: #38bdf8; }

        .divider { height: 1px; background: rgba(255,255,255,0.1); margin: 12px 0; }
        .loading-text { color: #94a3b8; font-size: 0.9rem; margin-bottom: 20px; }
      `}</style>
    </div>
  );
}
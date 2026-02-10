import React, { useState, useEffect, useMemo } from 'react';
import { HiChevronDown, HiChevronUp, HiPencil, HiTrash, HiOutlineCollection } from 'react-icons/hi';
import EditTransactionModal from './EditTransactionModal.jsx';

export default function PortfolioAccordion() {
  const [transactions, setTransactions] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true); // Nuevo estado de carga
  const [expandedTicker, setExpandedTicker] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // 1. CARGA DE DATOS
  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
        fetchPrices(data);
      }
    } catch (error) { 
        console.error("Error loading history:", error); 
    } finally {
        setLoading(false); // Terminó de cargar (con éxito o error)
    }
  };

  const fetchPrices = async (txList) => {
    if (txList.length === 0) return;
    const uniqueTickers = [...new Set(txList.map(t => t.ticker))];
    const tickersParam = uniqueTickers.join(',');
    try {
        const response = await fetch(`http://localhost:8080/api/prices/batch?tickers=${tickersParam}`);
        if (response.ok) {
            const newPrices = await response.json();
            setPrices(newPrices); 
        }
    } catch (error) { console.error("Error fetching prices:", error); }
  };

  useEffect(() => {
    fetchTransactions();
    window.addEventListener('transaction-added', fetchTransactions);
    window.addEventListener('transaction-deleted', fetchTransactions);
    return () => {
        window.removeEventListener('transaction-added', fetchTransactions);
        window.removeEventListener('transaction-deleted', fetchTransactions);
    };
  }, []);

  // 2. AGRUPAR
  const groupedAssets = useMemo(() => {
    const groups = {};
    transactions.forEach(t => {
        if (!groups[t.ticker]) {
            groups[t.ticker] = {
                ticker: t.ticker,
                totalCrypto: 0,
                totalInvested: 0,
                transactions: []
            };
        }
        groups[t.ticker].totalCrypto += t.cryptoAmount;
        groups[t.ticker].totalInvested += t.fiatAmount;
        groups[t.ticker].transactions.push(t);
    });
    return Object.values(groups);
  }, [transactions]);

  // 3. STATS HELPERS
  const getAssetStats = (asset) => {
      const currentPrice = prices[asset.ticker] || 0;
      const currentValue = asset.totalCrypto * currentPrice;
      const profit = currentValue - asset.totalInvested;
      const percent = asset.totalInvested > 0 ? (profit / asset.totalInvested) * 100 : 0;
      
      return { 
          currentPrice,
          currentValue, 
          profit, 
          percent: percent.toFixed(2), 
          isProfit: profit >= 0 
      };
  };

  const getTransactionStats = (t) => {
      const currentPrice = prices[t.ticker] || 0;
      if (!currentPrice) return null;

      const currentValue = t.cryptoAmount * currentPrice;
      const profit = currentValue - t.fiatAmount;
      const percent = t.fiatAmount > 0 ? (profit / t.fiatAmount) * 100 : 0;

      return {
          currentValue,
          profit,
          percent: percent.toFixed(2),
          isProfit: profit >= 0
      };
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete transaction?")) return;
    await fetch(`http://localhost:8080/api/transactions/${id}`, { method: 'DELETE' });
    window.dispatchEvent(new Event('transaction-deleted'));
  };

  const toggleAccordion = (ticker) => {
      setExpandedTicker(expandedTicker === ticker ? null : ticker);
  };

  // --- RENDERIZADO CONDICIONAL ---

  if (loading) {
      return <div className="accordion-container"><div className="loading-text">Loading assets...</div></div>;
  }

  // ESTADO VACÍO (Aquí está la magia)
  if (groupedAssets.length === 0) {
      return (
        <div className="accordion-container">
            <div className="empty-state">
                <div className="empty-icon">
                    <HiOutlineCollection size={40} />
                </div>
                <h3>Seems empty here</h3>
                <p>Register your first transaction above to start tracking your portfolio.</p>
            </div>
            
            <style>{`
                .accordion-container { margin-top: 20px; }
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    background: rgba(30, 41, 59, 0.3);
                    border: 2px dashed rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    text-align: center;
                }
                .empty-icon {
                    color: #64748b;
                    margin-bottom: 15px;
                    background: rgba(255,255,255,0.05);
                    padding: 15px;
                    border-radius: 50%;
                }
                .empty-state h3 {
                    color: #f8fafc;
                    margin: 0 0 8px 0;
                    font-size: 1.1rem;
                }
                .empty-state p {
                    color: #94a3b8;
                    margin: 0;
                    font-size: 0.9rem;
                    max-width: 300px;
                }
            `}</style>
        </div>
      );
  }

  // RENDER NORMAL (Si hay datos)
  return (
    <div className="accordion-container">
      {groupedAssets.map((asset) => {
        const stats = getAssetStats(asset);
        const isOpen = expandedTicker === asset.ticker;

        return (
          <div key={asset.ticker} className={`asset-card ${isOpen ? 'open' : ''}`}>
            {/* CABECERA */}
            <div className="card-header" onClick={() => toggleAccordion(asset.ticker)}>
                <div className="header-left">
                    <span className="ticker-badge">{asset.ticker}</span>
                    <div className="price-info">
                        <span className="label">Current Price</span>
                        <span className="value">${stats.currentPrice.toLocaleString()}</span>
                    </div>
                </div>

                <div className="header-stats">
                    <div className="stat">
                        <span className="label">Holdings</span>
                        <span className="value">{asset.totalCrypto.toFixed(6)} {asset.ticker}</span>
                    </div>
                    <div className="stat">
                        <span className="label">Invested</span>
                        <span className="value">${asset.totalInvested.toLocaleString()}</span>
                    </div>
                    <div className="stat">
                        <span className="label">Current Value</span>
                        <span className="value highlight">${stats.currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                    <div className={`stat pnl ${stats.isProfit ? 'green' : 'red'}`}>
                        <span className="label">P&L</span>
                        <span className="value">{stats.isProfit ? '+' : ''}{stats.percent}%</span>
                    </div>
                </div>

                <div className="toggle-icon">
                    {isOpen ? <HiChevronUp size={24} /> : <HiChevronDown size={24} />}
                </div>
            </div>

            {/* CUERPO DESPLEGABLE */}
            {isOpen && (
                <div className="card-body">
                    <table className="tx-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Cost</th>
                                <th>Current Value</th>
                                <th>P&L</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {asset.transactions.map(t => {
                                const txStats = getTransactionStats(t);
                                return (
                                    <tr key={t.id}>
                                        <td>{new Date(t.transactionDate).toLocaleDateString()}</td>
                                        <td>{t.cryptoAmount.toFixed(8)}</td>
                                        <td className="text-muted">${t.fiatAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td>
                                            {txStats ? `$${txStats.currentValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : <span className="loading-dots">...</span>}
                                        </td>
                                        <td>
                                            {txStats ? (
                                                <div className={`pnl-cell ${txStats.isProfit ? 'green' : 'red'}`}>
                                                    <span className="pnl-percent">{txStats.isProfit ? '+' : ''}{txStats.percent}%</span>
                                                    <span className="pnl-amount">({txStats.isProfit ? '+' : ''}${txStats.profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})})</span>
                                                </div>
                                            ) : <span className="loading-dots">...</span>}
                                        </td>
                                        <td className="actions-cell">
                                            <button className="icon-btn edit" onClick={() => setEditingTransaction(t)}><HiPencil /></button>
                                            <button className="icon-btn delete" onClick={() => handleDelete(t.id)}><HiTrash /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
          </div>
        );
      })}

      <EditTransactionModal 
        isOpen={!!editingTransaction} 
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
      />

      <style>{`
        .accordion-container { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
        .loading-text { color: #94a3b8; text-align: center; padding: 20px; }
        
        .asset-card {
            background: rgba(30, 41, 59, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        .asset-card.open { border-color: rgba(56, 189, 248, 0.5); background: rgba(30, 41, 59, 0.8); }

        .card-header {
            display: grid;
            grid-template-columns: auto 1fr auto; 
            align-items: center;
            padding: 24px;
            cursor: pointer;
            gap: 30px;
        }
        .card-header:hover { background: rgba(255,255,255,0.02); }

        .header-left { display: flex; flex-direction: column; gap: 5px; min-width: 80px; }
        .ticker-badge { 
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            color: white; padding: 4px 10px; border-radius: 6px; font-weight: 800; text-align: center;
        }
        .price-info { display: flex; flex-direction: column; font-size: 0.75rem; color: #94a3b8; }

        .header-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr); 
            gap: 20px;
            width: 100%;
            text-align: right;
        }
        .stat { display: flex; flex-direction: column; }
        .stat .label { font-size: 0.7rem; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 2px; }
        .stat .value { font-size: 1rem; color: #f1f5f9; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .stat .highlight { color: #38bdf8; font-weight: 700; }
        
        .pnl.green .value, .pnl-cell.green { color: #4ade80; }
        .pnl.red .value, .pnl-cell.red { color: #f87171; }

        .toggle-icon { color: #94a3b8; display: flex; align-items: center; }

        .card-body {
            border-top: 1px solid rgba(255,255,255,0.1);
            background: rgba(15, 23, 42, 0.3);
            padding: 0 24px 24px 24px;
            animation: slideDown 0.3s ease-out;
        }

        .tx-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .tx-table th { text-align: left; color: #64748b; font-size: 0.75rem; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); text-transform: uppercase; }
        .tx-table td { color: #cbd5e1; padding: 12px; font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }
        .tx-table tr:last-child td { border-bottom: none; }
        
        .text-muted { color: #94a3b8; }
        .pnl-cell { display: flex; flex-direction: column; line-height: 1.2; }
        .pnl-percent { font-weight: 600; font-size: 0.9rem; }
        .pnl-amount { font-size: 0.75rem; opacity: 0.8; }
        .loading-dots { color: #64748b; font-size: 0.8rem; }

        .actions-cell { display: flex; gap: 8px; justify-content: flex-end; }
        .icon-btn { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 6px; border-radius: 4px; transition: 0.2s; display: flex; align-items: center; }
        .icon-btn.edit:hover { color: #fbbf24; background: rgba(251, 191, 36, 0.1); }
        .icon-btn.delete:hover { color: #f87171; background: rgba(248, 113, 113, 0.1); }

        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1000px) {
            .card-header { grid-template-columns: 1fr auto; gap: 15px; }
            .header-stats { grid-column: 1 / -1; grid-template-columns: repeat(2, 1fr); text-align: left; }
            .tx-table th, .tx-table td { padding: 8px; font-size: 0.85rem; }
        }
      `}</style>
    </div>
  );
}
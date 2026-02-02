import React, { useState, useEffect, useMemo } from 'react'; // Agregué useMemo al import
import { HiDotsVertical, HiArrowSmUp, HiArrowSmDown } from 'react-icons/hi';
import EditTransactionModal from './EditTransactionModal.jsx';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [prices, setPrices] = useState({});
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'ticker', direction: 'asc' });
  const [editingTransaction, setEditingTransaction] = useState(null);

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
    }
  };

  const fetchPrices = async (txList) => {
    if (txList.length === 0) return;

    // Obtenemos una lista limpia de tickers únicos: "BTC,SOL,ETH"
    const uniqueTickers = [...new Set(txList.map(t => t.ticker))];
    const tickersParam = uniqueTickers.join(',');

    try {
        const response = await fetch(`http://localhost:8080/api/prices/batch?tickers=${tickersParam}`);
        if (response.ok) {
            const newPrices = await response.json();
            setPrices(newPrices); 
        }
    } catch (error) { console.error("Error fetching live prices:", error); }
  };

  useEffect(() => {
    fetchTransactions();
    
    window.addEventListener('transaction-added', fetchTransactions);
    window.addEventListener('transaction-deleted', fetchTransactions);
    
    const closeMenu = () => setMenuOpenId(null);
    window.addEventListener('click', closeMenu);

    return () => {
        window.removeEventListener('transaction-added', fetchTransactions);
        window.removeEventListener('transaction-deleted', fetchTransactions);
        window.removeEventListener('click', closeMenu);
    };
  }, []);

  const getPnL = (transaction) => {
      const currentPrice = prices[transaction.ticker]; // Precio hoy de CoinGecko
      
      // Si el precio aún no carga, no calculamos nada
      if (!currentPrice) return null; 

      // Matemática Financiera:
      const currentValue = transaction.cryptoAmount * currentPrice; // Valor Hoy
      const invested = transaction.fiatAmount; // Lo que tú pagaste
      const profit = currentValue - invested; // Tu Ganancia neta
      const percent = invested > 0 ? ((profit / invested) * 100) : 0; // Tu % de ROI

      return { 
          currentValue, 
          profit, 
          percent: percent.toFixed(2), 
          isProfit: profit >= 0 
      };
  };

  const sortedTransactions = useMemo(() => {
    let sortableItems = [...transactions];
    if (sortConfig !== null) {
        sortableItems.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }
    return sortableItems;
    }, [transactions, sortConfig]);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (columnName) => {
        if (sortConfig.key !== columnName) {
            // Retornamos un span vacío del mismo tamaño para evitar que la tabla "brinque"
            return <span style={{width: '16px', display:'inline-block'}}></span>;
        }
        return sortConfig.direction === 'asc' ? <HiArrowSmUp size={16} /> : <HiArrowSmDown size={16} />;
    };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;

    try {
        const response = await fetch(`http://localhost:8080/api/transactions/${id}`, {
            method: 'DELETE',
        });
        
        if (response.ok) {
            // Actualización optimista (UI inmediata)
            setTransactions(transactions.filter(t => t.id !== id));
            // Aviso global (para recalcular totales en el futuro)
            window.dispatchEvent(new Event('transaction-deleted'));
        }
    } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete transaction");
    }
  };

  const toggleMenu = (e, id) => { e.stopPropagation(); setMenuOpenId(menuOpenId === id ? null : id); };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setMenuOpenId(null);
  }

  return (
    <div className="history-container">
      <h3>Portfolio History</h3>
      <table>
        <thead>
            <tr>
                <th onClick={() => requestSort('ticker')}>
                    <div className="th-content">
                        Asset {getSortIcon('ticker')}
                    </div>
                </th>
                <th onClick={() => requestSort('cryptoAmount')}>
                    <div className="th-content">
                        Amount {getSortIcon('cryptoAmount')}
                    </div>
                </th>
                <th onClick={() => requestSort('fiatAmount')}>
                    <div className="th-content">
                        Cost (USD) {getSortIcon('fiatAmount')}
                    </div>
                </th>
                <th>Current Value</th>
                <th>P/L (USD)</th>
                <th onClick={() => requestSort('transactionDate')}>
                    <div className="th-content">
                        Date {getSortIcon('transactionDate')}
                    </div>
                </th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((t) => {
            const pnl = getPnL(t); // Calculamos en tiempo real
            
            return (
                <tr key={t.id}>
                <td><span className="ticker-badge">{t.ticker}</span></td>
                <td>{t.cryptoAmount.toFixed(8)}</td>
                <td className="text-muted">${t.fiatAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                
                {/* RESULTADO: VALOR ACTUAL */}
                <td>
                    {pnl ? (
                        <span className="current-val">
                            ${pnl.currentValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                    ) : <span className="loading-dots">...</span>}
                </td>

                {/* RESULTADO: GANANCIA/PÉRDIDA CON COLORES */}
                <td>
                    {pnl ? (
                        <div className={`pnl-container ${pnl.isProfit ? 'profit' : 'loss'}`}>
                            <span className="pnl-percent">{pnl.isProfit ? '+' : ''}{pnl.percent}%</span>
                            <span className="pnl-amount">
                                ({pnl.isProfit ? '+' : ''}${pnl.profit.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})})
                            </span>
                        </div>
                    ) : <span className="loading-dots">...</span>}
                </td>

                <td>{new Date(t.transactionDate).toLocaleDateString()}</td>
                <td style={{ position: 'relative' }}>
                    <button className="kebab-btn" onClick={(e) => toggleMenu(e, t.id)}>
                    <HiDotsVertical size={20} />
                    </button>
                    {menuOpenId === t.id && (
                        <div className="action-menu">
                            <button onClick={() => handleEditClick(t)}>Edit</button>
                            <button className="delete-btn" onClick={() => handleDelete(t.id)}>Delete</button>
                        </div>
                    )}
                </td>
                </tr>
            );
          })}
        </tbody>
      </table>

      <EditTransactionModal
      isOpen = {!!editingTransaction}
      transaction = {editingTransaction}
      onClose = {() => setEditingTransaction(null)}
      />

      <style>{`
        /* ESTILOS DE INGENIERÍA DE UI */
        .history-container { margin-top: 30px; background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px; }
        h3 { color: #f8fafc; margin-top: 0; }
        table { width: 100%; border-collapse: separate; border-spacing: 0; }
        th { text-align: left; padding: 16px; color: #94a3b8; font-weight: 500; border-bottom: 1px solid rgba(255, 255, 255, 0.1); font-size: 0.85rem; cursor: pointer; user-select: none; }
        td { padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #e2e8f0; font-size: 0.95rem; vertical-align: middle; }
        
        .ticker-badge { font-weight: 700; color: #fff; background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; }
        .text-muted { color: #94a3b8; font-size: 0.9rem; }
        .current-val { font-weight: 600; color: #f8fafc; }

        /* Estilos P&L (Profit and Loss) */
        .pnl-container { display: flex; flex-direction: column; align-items: flex-start; line-height: 1.2; }
        .pnl-percent { font-weight: 700; font-size: 0.9rem; }
        .pnl-amount { font-size: 0.75rem; opacity: 0.8; }
        
        .profit .pnl-percent, .profit .pnl-amount { color: #4ade80; } /* Verde */
        .loss .pnl-percent, .loss .pnl-amount { color: #f87171; } /* Rojo */

        /* Helpers */
        .loading-dots { animation: pulse 1.5s infinite; color: #64748b; }
        @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }

        /* Standard Table Styles */
        .th-content { display: flex; align-items: center; gap: 5px; }
        .kebab-btn { background: none; border: none; cursor: pointer; padding: 8px; border-radius: 50%; color: #94a3b8; display: flex; align-items: center; justify-content: center; }
        .kebab-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }
        .action-menu { position: absolute; right: 0; top: 40px; background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.5); border-radius: 8px; overflow: hidden; z-index: 50; min-width: 120px; }
        .action-menu button { width: 100%; text-align: left; padding: 12px 16px; background: none; border: none; color: #e2e8f0; cursor: pointer; }
        .action-menu button:hover { background: #334155; }
        .action-menu .delete-btn { color: #ef4444; }
        .action-menu .delete-btn:hover { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }
      `}</style>
    </div>
  );
}
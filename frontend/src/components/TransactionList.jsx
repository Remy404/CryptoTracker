import React, { useState, useEffect, useMemo } from 'react'; // Agregué useMemo al import
import { HiDotsVertical, HiArrowSmUp, HiArrowSmDown } from 'react-icons/hi';
import EditTransactionModal from './EditTransactionModal.jsx';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'ticker', direction: 'asc' });
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
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
                <th onClick={() => requestSort('transactionDate')}>
                    <div className="th-content">
                        Date {getSortIcon('transactionDate')}
                    </div>
                </th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
          {sortedTransactions.map((t) => (
            <tr key={t.id}>
              <td>{t.ticker}</td>
              <td>{t.cryptoAmount.toFixed(8)}</td>
              <td>${t.fiatAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
              <td>{new Date(t.transactionDate).toLocaleDateString()}</td>
              <td style={{ position: 'relative' }}>
                <button className="kebab-btn" onClick={(e) => toggleMenu(e, t.id)}>
                  <HiDotsVertical size={20} />
                </button>

                {menuOpenId === t.id && (
                    <div className="action-menu">
                        <button onClick={() => handleEditClick(t)}>
                            Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(t.id)}>
                            Delete
                        </button>
                    </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <EditTransactionModal
      isOpen = {!!editingTransaction}
      transaction = {editingTransaction}
      onClose = {() => setEditingTransaction(null)}
      />

      <style>{`
        .history-container { 
            margin-top: 30px; 
            background: rgba(30, 41, 59, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 24px;
        }

        h3 { color: #f8fafc; margin-top: 0; }

        table { width: 100%; border-collapse: separate; border-spacing: 0; }
        
        th { 
            text-align: left; 
            padding: 16px; 
            color: #94a3b8;
            font-weight: 500;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 0.9rem;
        }

        td { 
            padding: 16px; 
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            color: #e2e8f0;
        }

        tr:hover td {
            background: rgba(255, 255, 255, 0.03);
        }
        
        tr:last-child td { border-bottom: none; }

        .kebab-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            color: #94a3b8;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .kebab-btn:hover { 
            color: #fff; 
            background: rgba(255,255,255,0.1); 
        }

        .action-menu {
            position: absolute;
            right: 0;
            top: 40px; 
            background: #1e293b;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            border-radius: 8px;
            overflow: hidden;
            z-index: 50;
            min-width: 120px;
        }
        
        .action-menu button { 
            width: 100%;
            text-align: left;
            padding: 12px 16px;
            background: none;
            border: none;
            color: #e2e8f0; 
            cursor: pointer;
            font-size: 0.9rem;
            transition: background 0.2s;
        }

        .sortable {
            cursor: pointer;
            user-select: none;
            transition: color 0.2s;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .sortable:hover {
            color: #22d3ee;
        }

        .action-menu button:hover { background: #334155; }
        
        .action-menu .delete-btn { color: #ef4444; }
        .action-menu .delete-btn:hover { 
            background: rgba(239, 68, 68, 0.1); 
            color: #fca5a5;
        }
      `}</style>
    </div>
  );
}
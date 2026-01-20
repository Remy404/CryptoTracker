import React, { useState, useEffect } from 'react';

export default function EditTransactionModal({ transaction, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    fiatAmount: '',
    cryptoAmount: '',
    ticker: ''
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        fiatAmount: transaction.fiatAmount,
        cryptoAmount: transaction.cryptoAmount.toFixed(8),
        ticker: transaction.ticker
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Preparar datos numéricos
    const payload = {
        ticker: formData.ticker,
        fiatAmount: parseFloat(formData.fiatAmount),
        cryptoAmount: parseFloat(formData.cryptoAmount)
    };

    try {
        const response = await fetch(`http://localhost:8080/api/transactions/${transaction.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Transaction updated!");
            window.dispatchEvent(new Event('transaction-added')); 
            onClose();
        } else {
            alert("Error updating transaction");
        }
    } catch (error) {
        console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-effect">
        <h3>Edit Transaction</h3>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Asset</label>
            <select name="ticker" value={formData.ticker} onChange={handleChange}>
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="SOL">Solana (SOL)</option>
                <option value="ADA">Cardano (ADA)</option>
                <option value="XRP">Ripple (XRP)</option>
                <option value="LTC">Litecoin (LTC)</option>
                <option value="USDT">Tether (USDT)</option>
                <option value="DOT">Polkadot (DOT)</option>
                <option value="BCH">Bitcoin Cash (BCH)</option>
            </select>
        </div>
          
          <div className="form-group">
            <label>Amount</label>
            <input 
                type="text" 
                name="cryptoAmount" 
                value={formData.cryptoAmount} 
                onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Cost (USD)</label>
            <input 
                type="number" 
                name="fiatAmount" 
                value={formData.fiatAmount} 
                onChange={handleChange} 
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-save">Save Changes</button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            display: flex; justify-content: center; align-items: center;
            z-index: 1000;
        }
        .modal-content {
            background: #1e293b;
            padding: 2rem;
            border-radius: 12px;
            width: 90%; max-width: 400px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; color: #94a3b8; }
        input, select {
            width: 100%; padding: 10px;
            background: rgba(15, 23, 42, 0.5);
            border: 1px solid rgba(255,255,255,0.1);
            color: white; border-radius: 6px;
        }
        .modal-actions { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; }
        .btn-cancel {
            padding: 8px 16px; background: transparent; color: #94a3b8;
            border: 1px solid #475569; border-radius: 6px; cursor: pointer;
        }
        .btn-save {
            padding: 8px 16px; background: #22d3ee; color: #0f172a;
            border: none; border-radius: 6px; font-weight: bold; cursor: pointer;
        }
        .btn-save:hover { background: #0ea5e9; }
      `}</style>
    </div>
  );
}
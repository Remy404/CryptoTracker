import React, { useState } from 'react';

export default function AddTransaction() {
  const [formData, setFormData] = useState({
    fiatAmount: '',
    cryptoAmount: '0.00000001', 
    ticker: 'BTC'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const saveToDatabase = async (submissionData) => {
    try {
      const response = await fetch('http://localhost:8080/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        alert("Transaction saved successfully in PostgreSQL!");
        setFormData({ fiatAmount: '', cryptoAmount: '0.00000001', ticker: 'BTC' });
        window.dispatchEvent(new Event('transaction-added'));
      } else {
        throw new Error('Failed to save transaction');
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error connecting to the backend. Is Spring Boot running?");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const submissionData = {
        ...formData,
        fiatAmount: parseFloat(formData.fiatAmount),
        cryptoAmount: parseFloat(formData.cryptoAmount),
    };

    saveToDatabase(submissionData);
  };

  return (
    <div className="form-container">
      <h3>Register New Purchase</h3>
      <form onSubmit={handleSubmit}>
        
        <div className="input-group">
          <label>Fiat Amount (USD):</label>
          <input 
            type="number" 
            name="fiatAmount"
            placeholder="e.g. 500.00"
            value={formData.fiatAmount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
            <label>Crypto Amount:</label>
            <input 
                type="text" // Cambiamos de number a text
                inputMode="decimal" // Asegura teclado numérico en móviles
                name="cryptoAmount"
                placeholder="e.g. 0.00000001"
                value={formData.cryptoAmount}
                onChange={handleChange}
                required
            />
        </div>

        <div className="input-group">
          <label>Cryptocurrency:</label>
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

        <button type="submit" className="btn-register">
          Register Transaction
        </button>
      </form>
      <style>{`
        .form-container {
            /* Estilo Glass igual que BtcPrice */
            background: rgba(30, 41, 59, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        h3 { margin-top: 0; color: #f8fafc; font-weight: 600; }

        .input-group { margin-bottom: 20px; }
        
        label { 
            display: block; 
            margin-bottom: 8px; 
            color: #94a3b8; /* Gris azulado */
            font-size: 0.9rem;
        }

        /* Inputs Modernos */
        input, select { 
            width: 100%; 
            padding: 12px; 
            background: rgba(15, 23, 42, 0.6); /* Fondo muy oscuro */
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #fff;
            font-family: 'Inter', sans-serif;
            transition: all 0.3s ease;
            box-sizing: border-box; /* Previene desbordes */
        }

        input:focus, select:focus {
            outline: none;
            border-color: #22d3ee; /* Borde Cyan al escribir */
            box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.1);
        }

        /* Botón Tech */
        .btn-register { 
            background: linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%);
            color: #0f172a;
            font-weight: 700;
            border: none; 
            padding: 14px; 
            border-radius: 8px; 
            cursor: pointer; 
            width: 100%;
            transition: transform 0.1s, box-shadow 0.3s;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 0.9rem;
        }

        .btn-register:hover { 
            transform: translateY(-1px);
            box-shadow: 0 0 15px rgba(34, 211, 238, 0.4);
        }

        .btn-register:active { transform: translateY(1px); }
      `}</style>
    </div>
  );
}
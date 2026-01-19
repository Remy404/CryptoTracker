import React, { useState, useEffect } from 'react';

export default function BtcPrice() {
  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Llamada a tu backend de Spring Boot
    fetch('http://localhost:8080/api/prices/btc')
      .then(response => {
        if (!response.ok) throw new Error('Error al conectar con el servidor');
        return response.json();
      })
      .then(data => setPrice(data.price))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '300px' }}>
      <h3>Current BTC price</h3>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : price ? (
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          ${price.toLocaleString('es-MX')} MXN
        </p>
      ) : (
        <p>Loading price...</p>
      )}
    </div>
  );
}
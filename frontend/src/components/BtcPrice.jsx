import { useState, useEffect } from 'react';

export default function BtcPrice() {
    const [price, setPrice] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/prices/btc');
                
                if (!response.ok) {
                    throw new Error('Backend connection failed');
                }

                const data = await response.json();

                if (data.price === 0) {
                     setPrice(0); 
                } else {
                     setPrice(data.price);
                }
                
            } catch (error) {
                console.error('Error fetching Bitcoin price:', error);
                setError(true);
            }
        };

        fetchPrice();
        const interval = setInterval(fetchPrice, 60000); 
        return () => clearInterval(interval);
    }, []);

    // ... (lógica de React igual)

    return (
        <div className="glass-card price-container">
            <h2 className="card-label">Bitcoin Price (USD)</h2>
            
            <div className="price-wrapper">
                {price !== null ? (
                    <span className="price-value">
                        ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                ) : error ? (
                    <span className="status-error">Offline</span>
                ) : (
                    <span className="status-loading">Syncing...</span>
                )}
            </div>

            <div className="live-indicator">
                <span className="pulse-dot"></span> 
                <span className="live-text">Live Market Data</span>
            </div>

            <style>{`
                .glass-card {
                    background: rgba(30, 41, 59, 0.4);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 100%; /* Para llenar el grid */
                }
                
                .card-label {
                    color: #94a3b8;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 0;
                }

                .price-value {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #fff;
                    text-shadow: 0 0 20px rgba(34, 211, 238, 0.3); /* Glow sutil */
                    display: block;
                    margin: 15px 0;
                }

                .pulse-dot {
                    height: 8px;
                    width: 8px;
                    background-color: #22d3ee;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 8px;
                    box-shadow: 0 0 0 rgba(34, 211, 238, 0.7);
                    animation: pulse 2s infinite;
                }

                .live-text {
                    color: #22d3ee;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.7); }
                    70% { box-shadow: 0 0 0 6px rgba(34, 211, 238, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0); }
                }
            `}</style>
        </div>
    );
}
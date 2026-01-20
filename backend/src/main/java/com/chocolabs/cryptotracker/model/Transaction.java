package com.chocolabs.cryptotracker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions") // This creates the table in your Docker PostgreSQL
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ticker; // e.g., "BTC", "ETH", "SOL"

    @Column(nullable = false)
    private Double fiatAmount; // The amount in MXN you spent

    @Column(nullable = false)
    private Double cryptoAmount; // The amount of crypto you received

    @Column(nullable = false)
    private LocalDateTime transactionDate;

    // Default Constructor (Required by JPA)
    public Transaction() {
        this.transactionDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }
    public Double getFiatAmount() { return fiatAmount; }
    public void setFiatAmount(Double fiatAmount) { this.fiatAmount = fiatAmount; }
    public Double getCryptoAmount() { return cryptoAmount; }
    public void setCryptoAmount(Double cryptoAmount) { this.cryptoAmount = cryptoAmount; }
    public LocalDateTime getTransactionDate() { return transactionDate; }
}
package com.chocolabs.cryptotracker.dto;

public class Summary {
    private String ticker;
    private Double totalAmount;
    private Double totalInvested;

    public Summary(String ticker, Double totalAmount, Double totalInvested) {
        this.ticker = ticker;
        this.totalAmount = totalAmount;
        this.totalInvested = totalInvested;
    }

    public String getTicker() {
        return ticker;
    }
    public Double getTotalAmount() {
        return totalAmount;
    }
    public Double getTotalInvested() {
        return totalInvested;
    }
}

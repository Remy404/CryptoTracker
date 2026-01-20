package com.chocolabs.cryptotracker.service;

import com.chocolabs.cryptotracker.model.Transaction;
import com.chocolabs.cryptotracker.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    public Transaction saveTransaction(Transaction transaction) {
        // Business logic can be added here later (e.g., validation)
        return repository.save(transaction);
    }

    public List<Transaction> getAllTransactions() {
        return repository.findAll();
    }

    public void deleteTransaction(Long id) {
        repository.deleteById(id);
    }

    public Transaction updateTransaction(Long id, Transaction updatedData) {
    return repository.findById(id)
        .map(existing -> {
            existing.setTicker(updatedData.getTicker());
            existing.setCryptoAmount(updatedData.getCryptoAmount());
            existing.setFiatAmount(updatedData.getFiatAmount());
            // existing.setTransactionDate(updatedData.getTransactionDate());
            return repository.save(existing);
        })
        .orElseThrow(() -> new RuntimeException("Transaction not found"));
}
}
package com.chocolabs.cryptotracker.controller;

import com.chocolabs.cryptotracker.model.Transaction;
import com.chocolabs.cryptotracker.repository.TransactionRepository;
import com.chocolabs.cryptotracker.service.TransactionService;
import org.springframework.web.bind.annotation.*;

import com.chocolabs.cryptotracker.dto.Summary;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:4321")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction transaction) {
        return service.saveTransaction(transaction);
    }

    @GetMapping
    public List<Transaction> getTransactions() {
        return service.getAllTransactions();
    }

    @GetMapping("/summary")
    public List<Summary> getPortfolioSummary() {
        return service.getPortfolioSummary();
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        service.deleteTransaction(id);
    }

    @PutMapping("/{id}")
    public Transaction updateTransaction(@PathVariable Long id, @RequestBody Transaction transaction) {
        return service.updateTransaction(id, transaction);
    }
}
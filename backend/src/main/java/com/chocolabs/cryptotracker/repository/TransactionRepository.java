package com.chocolabs.cryptotracker.repository;

import com.chocolabs.cryptotracker.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // This interface automatically gives you save(), findAll(), delete(), etc.
}
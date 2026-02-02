package com.chocolabs.cryptotracker.repository;

import com.chocolabs.cryptotracker.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chocolabs.cryptotracker.dto.Summary;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("SELECT new com.chocolabs.cryptotracker.dto.Summary(t.ticker, SUM(t.cryptoAmount), SUM(t.fiatAmount)) " +
           "FROM Transaction t GROUP BY t.ticker")
    List<Summary> getPortfolioSummary();
}

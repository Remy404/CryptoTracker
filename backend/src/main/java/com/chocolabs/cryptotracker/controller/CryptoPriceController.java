package com.chocolabs.cryptotracker.controller;

import com.chocolabs.cryptotracker.service.CryptoPriceService;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;


@CrossOrigin(origins = "http://localhost:4321")
@RestController
@RequestMapping("/api/prices")
public class CryptoPriceController {

    private final CryptoPriceService cryptoPriceService;

    // Inyección de dependencias por constructor
    public CryptoPriceController(CryptoPriceService cryptoPriceService) {
        this.cryptoPriceService = cryptoPriceService;
    }

    @GetMapping("/btc")
    public Map<String, Double> getBitcoinPrice() {
        Double price = cryptoPriceService.getBitcoinPrice();
        
        Map<String, Double> response = new HashMap<>();
        response.put("price", price);
        
        return response;
    }
}
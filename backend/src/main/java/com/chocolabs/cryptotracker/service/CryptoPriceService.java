package com.chocolabs.cryptotracker.service;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration; 
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class CryptoPriceService {

    private final RestTemplate restTemplate;
    private Double lastPrice = 0.0;
    private LocalDateTime lastUpdateTime = LocalDateTime.MIN;

    public CryptoPriceService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Double getBitcoinPrice() {
        if (Duration.between(lastUpdateTime, LocalDateTime.now()).getSeconds() < 60) {
            return lastPrice;
        }

        try {
            String url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=mxn";
            
            ParameterizedTypeReference<Map<String, Map<String, Double>>> typeRef = 
                new ParameterizedTypeReference<Map<String, Map<String, Double>>>() {};

            ResponseEntity<Map<String, Map<String, Double>>> responseEntity = 
                restTemplate.exchange(url, HttpMethod.GET, null, typeRef);

            Map<String, Map<String, Double>> response = responseEntity.getBody();
            
            if (response != null && response.containsKey("bitcoin")) {
                // 2. ACTUALIZAR ANTES DE RETORNAR (Importante)
                lastPrice = response.get("bitcoin").get("mxn");
                lastUpdateTime = LocalDateTime.now();
                return lastPrice;
            }
            
            return lastPrice; // Fallback si el JSON viene vacío

        } catch (Exception e) {
            // 3. Manejo de Resiliencia: Si falla la API, devolvemos el último dato conocido
            return lastPrice;
        }
    }
}
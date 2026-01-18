package com.chocolabs.cryptotracker.service;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class CryptoPriceService {

    private final RestTemplate restTemplate;

    public CryptoPriceService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Double getBitcoinPrice() {
        String url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=mxn";
        
        // 1. Definimos exactamente el tipo de dato que esperamos (Tipo de Lote)
        ParameterizedTypeReference<Map<String, Map<String, Double>>> typeRef = 
            new ParameterizedTypeReference<Map<String, Map<String, Double>>>() {};

        // 2. Usamos 'exchange' en lugar de 'getForObject' para pasar la referencia de tipo
        ResponseEntity<Map<String, Map<String, Double>>> responseEntity = 
            restTemplate.exchange(url, HttpMethod.GET, null, typeRef);

        Map<String, Map<String, Double>> response = responseEntity.getBody();
        
        if (response != null && response.containsKey("bitcoin")) {
            return response.get("bitcoin").get("mxn");
        }
        return 0.0;
    }
}
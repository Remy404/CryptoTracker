package com.chocolabs.cryptotracker.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CryptoPriceService {

    private final RestTemplate restTemplate;
    private static final Map<String, String> COIN_MAP = Map.of(
        "BTC", "bitcoin",
        "ETH", "ethereum",
        "LTC", "litecoin",
        "XRP", "ripple",
        "BCH", "bitcoin-cash",
        "SOL", "solana",
        "USDT", "tether",
        "ADA", "cardano",
        "DOT", "polkadot"
    );

    public CryptoPriceService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Método anterior (Legacy) - Lo dejamos por si acaso
    public Double getBitcoinPrice() {
        return getPriceForId("bitcoin");
    }

    // 2. NUEVO MÉTODO: Obtener precios de una lista de Tickers
    public Map<String, Double> getBatchPrices(List<String> tickers) {
        // A. Traducir Tickers (BTC) a IDs (bitcoin)
        List<String> ids = tickers.stream()
                .map(t -> COIN_MAP.getOrDefault(t.toUpperCase(), ""))
                .filter(id -> !id.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        if (ids.isEmpty()) return new HashMap<>();

        // B. Construir la URL para pedir todo junto (Batch Fetching)
        String idsParam = String.join(",", ids);
        String url = "https://api.coingecko.com/api/v3/simple/price?ids=" + idsParam + "&vs_currencies=usd";

        try {
            // C. Llamada a la API
            ParameterizedTypeReference<Map<String, Map<String, Double>>> typeRef =
                    new ParameterizedTypeReference<Map<String, Map<String, Double>>>() {};

            ResponseEntity<Map<String, Map<String, Double>>> response = 
                    restTemplate.exchange(url, HttpMethod.GET, null, typeRef);

            Map<String, Map<String, Double>> rawData = response.getBody();

            // D. Mapear de vuelta (ID -> Precio) a (Ticker -> Precio) para el Frontend
            // Esto facilita la vida al Frontend: le devolvemos {"BTC": 95000, "SOL": 140}
            Map<String, Double> result = new HashMap<>();
            if (rawData != null) {
                // Iteramos sobre nuestro mapa original para reconectar Ticker con Precio
                for (String ticker : tickers) {
                    String id = COIN_MAP.get(ticker.toUpperCase());
                    if (id != null && rawData.containsKey(id)) {
                        Double price = rawData.get(id).get("usd");
                        result.put(ticker, price);
                    }
                }
            }
            return result;

        } catch (Exception e) {
            System.err.println("Error fetching batch prices: " + e.getMessage());
            return new HashMap<>(); // Retornar vacío si falla para no romper la UI
        }
    }

    private Double getPriceForId(String id) {
        try {
           String url = "https://api.coingecko.com/api/v3/simple/price?ids=" + id + "&vs_currencies=usd";
           ParameterizedTypeReference<Map<String, Map<String, Double>>> typeRef = new ParameterizedTypeReference<Map<String, Map<String, Double>>>() {};
           ResponseEntity<Map<String, Map<String, Double>>> response = restTemplate.exchange(url, HttpMethod.GET, null, typeRef);
           Map<String, Map<String, Double>> responseBody = response.getBody();
           if (responseBody != null) {
               Map<String, Double> prices = responseBody.get(id);
               if (prices != null) {
                   return prices.get("usd");
               }
           }
           return 0.0;
        } catch (Exception e) { return 0.0; }
    }
}




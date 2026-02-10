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

    // --- ZONA DE CACHÉ ---
    private Map<String, Double> priceCache = new HashMap<>(); // Aquí guardamos los precios
    private long lastCacheUpdate = 0; // Aquí guardamos LA HORA de la última actualización
    private static final long CACHE_DURATION = 60000; // 60,000 milisegundos = 1 Minuto
    // ---------------------

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

    public Map<String, Double> getBatchPrices(List<String> tickers) {
        long currentTime = System.currentTimeMillis();

        // 1. EL GUARDIA DE SEGURIDAD
        // Si ya tenemos datos Y no ha pasado 1 minuto... ¡Devolvemos lo guardado!
        if (!priceCache.isEmpty() && (currentTime - lastCacheUpdate < CACHE_DURATION)) {
            System.out.println("⚡ Usando Caché (No llamamos a CoinGecko)");
            return filterCacheForTickers(tickers);
        }

        System.out.println("🐢 Caché expirada. Llamando a API CoinGecko...");

        // 2. LA LÓGICA DE SIEMPRE (Solo se ejecuta si la caché es vieja)
        List<String> ids = tickers.stream()
                .map(t -> COIN_MAP.getOrDefault(t.toUpperCase(), ""))
                .filter(id -> !id.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        if (ids.isEmpty()) return new HashMap<>();

        String idsParam = String.join(",", ids);
        String url = "https://api.coingecko.com/api/v3/simple/price?ids=" + idsParam + "&vs_currencies=usd";

        try {
            ParameterizedTypeReference<Map<String, Map<String, Double>>> typeRef =
                    new ParameterizedTypeReference<Map<String, Map<String, Double>>>() {};

            ResponseEntity<Map<String, Map<String, Double>>> response = 
                    restTemplate.exchange(url, HttpMethod.GET, null, typeRef);

            Map<String, Map<String, Double>> rawData = response.getBody();

            if (rawData != null) {
                // 3. ACTUALIZAMOS LA CACHÉ GLOBAL
                for (String ticker : tickers) {
                    String id = COIN_MAP.get(ticker.toUpperCase());
                    if (id != null && rawData.containsKey(id)) {
                        Double price = rawData.get(id).get("usd");
                        // Guardamos en la variable de memoria del servidor
                        priceCache.put(ticker, price);
                    }
                }
                // Marcamos la hora actual como "última actualización"
                lastCacheUpdate = System.currentTimeMillis();
            }
            
            return filterCacheForTickers(tickers);

        } catch (Exception e) {
            System.err.println("Error fetching prices: " + e.getMessage());
            // Si falla la API, devolvemos lo que tengamos en caché (mejor datos viejos que error)
            return filterCacheForTickers(tickers);
        }
    }

    // Helper pequeño para devolver solo lo que pidió el usuario desde nuestra caché gigante
    private Map<String, Double> filterCacheForTickers(List<String> tickers) {
        Map<String, Double> result = new HashMap<>();
        for (String ticker : tickers) {
            if (priceCache.containsKey(ticker)) {
                result.put(ticker, priceCache.get(ticker));
            }
        }
        return result;
    }

    public Double getBitcoinPrice() {
        return getPriceForId("bitcoin");
    }
    
    private Double getPriceForId(String id) {
         try {
           String url = "https://api.coingecko.com/api/v3/simple/price?ids=" + id + "&vs_currencies=usd";
           Map response = restTemplate.getForObject(url, Map.class);
           Map prices = (Map) response.get(id);
           return Double.valueOf(prices.get("usd").toString());
        } catch (Exception e) { return 0.0; }
    }
}
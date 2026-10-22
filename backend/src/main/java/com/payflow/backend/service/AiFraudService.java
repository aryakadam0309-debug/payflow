package com.payflow.backend.service;

import com.payflow.backend.dto.TransferEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class AiFraudService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateExplanation(TransferEvent event, String reasonCode) {

        if (geminiApiKey == null || geminiApiKey.isEmpty() || geminiApiKey.equals("${GEMINI_API_KEY}")) {
            return "API Key not configured. Flagged for: " + reasonCode;
        }

        String prompt = String.format(
                "You are an AI fraud detection system for a payment app. " +
                        "A transaction of ₹%s from %s to %s was flagged for reason: %s. " +
                        "Generate a 1-sentence human-readable explanation for the admin explaining why this is suspicious. " +
                        "Keep it professional and concise.",
                event.getAmount(), event.getSenderEmail(), event.getReceiverName(), reasonCode
        );

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent";

        // Retry Logic: Try up to 3 times
        int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                Map<String, Object> requestBody = Map.of(
                        "contents", List.of(
                                Map.of("parts", List.of(Map.of("text", prompt)))
                        )
                );

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("x-goog-api-key", geminiApiKey);

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

                Map<?, ?> response = restTemplate.postForObject(url, request, Map.class);

                if (response != null && response.containsKey("candidates")) {
                    List<?> candidates = (List<?>) response.get("candidates");
                    Map<?, ?> content = (Map<?, ?>) ((Map<?, ?>) candidates.get(0)).get("content");
                    List<?> parts = (List<?>) content.get("parts");
                    return (String) ((Map<?, ?>) parts.get(0)).get("text");
                }
            } catch (HttpServerErrorException e) {
                // Catch 503 (Service Unavailable) or 500 errors
                System.out.println("AI API Busy (Attempt " + attempt + "/" + maxRetries + "). Retrying in 2 seconds...");
                try {
                    Thread.sleep(2000); // Wait 2 seconds before retrying
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            } catch (Exception e) {
                System.out.println("AI API Failed: " + e.getMessage());
                break; // If it's a 400 Bad Request (like wrong key), don't retry, just break.
            }
        }

        // If all retries fail, return the fallback
        return "AI analysis temporarily unavailable due to high demand. Flagged for: " + reasonCode;
    }
}
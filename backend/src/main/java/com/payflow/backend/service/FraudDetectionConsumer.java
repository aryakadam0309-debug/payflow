package com.payflow.backend.service;

import com.payflow.backend.dto.TransferEvent;
import com.payflow.backend.entity.FraudFlag;
import com.payflow.backend.repository.FraudFlagRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.concurrent.TimeUnit;

@Service
public class FraudDetectionConsumer {

    private final FraudFlagRepository fraudFlagRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final AiFraudService aiFraudService; // ADDED THIS

    public FraudDetectionConsumer(FraudFlagRepository fraudFlagRepository,
                                  RedisTemplate<String, String> redisTemplate,
                                  AiFraudService aiFraudService) { // ADDED THIS
        this.fraudFlagRepository = fraudFlagRepository;
        this.redisTemplate = redisTemplate;
        this.aiFraudService = aiFraudService;
    }

    @KafkaListener(topics = "transfer-events", groupId = "fraud-group")
    public void analyzeTransaction(TransferEvent event) {

        // Rule 1: High Amount
        if (event.getAmount().compareTo(new BigDecimal("10000")) > 0) {
            saveFraudFlag(event, "HIGH_AMOUNT");
        }

        // Rule 2: Velocity
        String velocityKey = "fraud:velocity:" + event.getSenderEmail();
        Long transferCount = redisTemplate.opsForValue().increment(velocityKey);
        if (transferCount != null && transferCount == 1) {
            redisTemplate.expire(velocityKey, 1, TimeUnit.MINUTES);
        }
        if (transferCount != null && transferCount > 3) {
            saveFraudFlag(event, "HIGH_VELOCITY");
        }

        // Rule 3: Unusual Time
        int hour = LocalTime.now().getHour();
        if (hour >= 2 && hour <= 5) {
            saveFraudFlag(event, "UNUSUAL_TIME");
        }
    }

    private void saveFraudFlag(TransferEvent event, String reasonCode) {

        // CALL THE AI HERE
        String aiExplanation = aiFraudService.generateExplanation(event, reasonCode);

        FraudFlag flag = new FraudFlag();
        flag.setSenderEmail(event.getSenderEmail());
        flag.setReceiverName(event.getReceiverName());
        flag.setAmount(event.getAmount());
        flag.setReason(reasonCode);
        flag.setAiExplanation(aiExplanation);

        fraudFlagRepository.save(flag);

        System.out.println("\n🚨 FRAUD ALERT TRIGGERED 🚨");
        System.out.println("Reason: " + reasonCode + " | User: " + event.getSenderEmail());
        System.out.println("🤖 AI Analysis: " + aiExplanation + "\n");
    }
}
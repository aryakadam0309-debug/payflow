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

    public FraudDetectionConsumer(FraudFlagRepository fraudFlagRepository,
                                  RedisTemplate<String, String> redisTemplate) {
        this.fraudFlagRepository = fraudFlagRepository;
        this.redisTemplate = redisTemplate;
    }

    @KafkaListener(topics = "transfer-events", groupId = "fraud-group")
    public void analyzeTransaction(TransferEvent event) {

        // Rule 1: High Amount (Anything over ₹10,000)
        if (event.getAmount().compareTo(new BigDecimal("10000")) > 0) {
            saveFraudFlag(event, "HIGH_AMOUNT", "Transaction exceeds ₹10,000 limit.");
        }

        // Rule 2: Velocity (More than 3 transfers in 1 minute)
        String velocityKey = "fraud:velocity:" + event.getSenderEmail();
        Long transferCount = redisTemplate.opsForValue().increment(velocityKey);

        if (transferCount != null && transferCount == 1) {
            redisTemplate.expire(velocityKey, 1, TimeUnit.MINUTES);
        }

        if (transferCount != null && transferCount > 3) {
            saveFraudFlag(event, "HIGH_VELOCITY", "User made more than 3 transfers in 1 minute.");
        }

        // Rule 3: Unusual Time (Between 2:00 AM and 5:00 AM)
        int hour = LocalTime.now().getHour();
        if (hour >= 2 && hour <= 5) {
            saveFraudFlag(event, "UNUSUAL_TIME", "Transaction occurred in the middle of the night.");
        }
    }

    private void saveFraudFlag(TransferEvent event, String reasonCode, String aiExplanation) {
        FraudFlag flag = new FraudFlag();
        flag.setSenderEmail(event.getSenderEmail());
        flag.setReceiverName(event.getReceiverName());
        flag.setAmount(event.getAmount());
        flag.setReason(reasonCode);
        flag.setAiExplanation(aiExplanation);

        fraudFlagRepository.save(flag);

        System.out.println("\n🚨 FRAUD ALERT TRIGGERED 🚨");
        System.out.println("Reason: " + reasonCode + " | User: " + event.getSenderEmail());
        System.out.println("Amount: ₹" + event.getAmount() + "\n");
    }
}
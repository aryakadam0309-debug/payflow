package com.payflow.backend.service;

import com.payflow.backend.dto.TransferEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationConsumer {

    @KafkaListener(topics = "transfer-events", groupId = "payflow-group")
    public void handleTransferEvent(TransferEvent event) {
        System.out.println("\n========== KAFKA NOTIFICATION ==========");
        System.out.println("🔔 EMAIL SENT: Hi " + event.getReceiverName() + ",");
        System.out.println("You just received ₹" + event.getAmount() + " from " + event.getSenderName() + ".");
        System.out.println("Note: " + event.getNote());
        System.out.println("========================================\n");
    }
}
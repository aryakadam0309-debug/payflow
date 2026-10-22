package com.payflow.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FraudFlagResponse {
    private Long id;
    private String senderEmail;
    private String receiverName;
    private BigDecimal amount;
    private String reason;
    private String aiExplanation;
    private LocalDateTime flaggedAt;

    public FraudFlagResponse(Long id, String senderEmail, String receiverName, BigDecimal amount, String reason, String aiExplanation, LocalDateTime flaggedAt) {
        this.id = id;
        this.senderEmail = senderEmail;
        this.receiverName = receiverName;
        this.amount = amount;
        this.reason = reason;
        this.aiExplanation = aiExplanation;
        this.flaggedAt = flaggedAt;
    }

    // Getters
    public Long getId() { return id; }
    public String getSenderEmail() { return senderEmail; }
    public String getReceiverName() { return receiverName; }
    public BigDecimal getAmount() { return amount; }
    public String getReason() { return reason; }
    public String getAiExplanation() { return aiExplanation; }
    public LocalDateTime getFlaggedAt() { return flaggedAt; }
}
package com.payflow.backend.dto;

import java.math.BigDecimal;

public class TransferEvent {
    private String senderEmail;
    private String senderName;
    private String receiverName;
    private BigDecimal amount;
    private String note;

    // 1. Default Constructor (Required for Jackson to deserialize from Kafka)
    public TransferEvent() {
    }

    // 2. Parameterized Constructor
    public TransferEvent(String senderEmail, String senderName, String receiverName, BigDecimal amount, String note) {
        this.senderEmail = senderEmail;
        this.senderName = senderName;
        this.receiverName = receiverName;
        this.amount = amount;
        this.note = note;
    }

    // Getters and Setters
    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
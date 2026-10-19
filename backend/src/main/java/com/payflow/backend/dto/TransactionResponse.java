package com.payflow.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionResponse {
    private Long id;
    private String type; // "SENT" or "RECEIVED"
    private String counterpartyName;
    private BigDecimal amount;
    private String note;
    private String status;
    private LocalDateTime timestamp;

    public TransactionResponse(Long id, String type, String counterpartyName, BigDecimal amount, String note, String status, LocalDateTime timestamp) {
        this.id = id;
        this.type = type;
        this.counterpartyName = counterpartyName;
        this.amount = amount;
        this.note = note;
        this.status = status;
        this.timestamp = timestamp;
    }

    // Getters
    public Long getId() { return id; }
    public String getType() { return type; }
    public String getCounterpartyName() { return counterpartyName; }
    public BigDecimal getAmount() { return amount; }
    public String getNote() { return note; }
    public String getStatus() { return status; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
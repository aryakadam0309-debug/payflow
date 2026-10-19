package com.payflow.backend.dto;

public class SignupResponse {
    private String message;
    private String email;

    public SignupResponse(String message, String email) {
        this.message = message;
        this.email = email;
    }

    public String getMessage() { return message; }
    public String getEmail() { return email; }
}
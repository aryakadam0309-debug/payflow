package com.payflow.backend.controller;

import com.payflow.backend.dto.TransferRequest;
import com.payflow.backend.entity.User;
import com.payflow.backend.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(@AuthenticationPrincipal User user) {
        BigDecimal balance = walletService.getBalance(user);
        return ResponseEntity.ok(Map.of(
                "fullName", user.getFullName(),
                "balance", balance
        ));
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody TransferRequest request,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey
    ) {
        try {
            if (idempotencyKey == null || idempotencyKey.isEmpty()) {
                return new ResponseEntity<>("Idempotency-Key header is required for transfers.", HttpStatus.BAD_REQUEST);
            }

            String result = walletService.transferMoney(user, request, idempotencyKey);
            return ResponseEntity.ok(Map.of("message", result));

        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
package com.payflow.backend.controller;

import com.payflow.backend.dto.FraudFlagResponse;
import com.payflow.backend.entity.FraudFlag;
import com.payflow.backend.repository.FraudFlagRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final FraudFlagRepository fraudFlagRepository;

    public AdminController(FraudFlagRepository fraudFlagRepository) {
        this.fraudFlagRepository = fraudFlagRepository;
    }

    @GetMapping("/fraud-flags")
    public ResponseEntity<?> getFraudFlags() {
        List<FraudFlag> flags = fraudFlagRepository.findAll();

        List<FraudFlagResponse> response = flags.stream()
                .map(f -> new FraudFlagResponse(
                        f.getId(),
                        f.getSenderEmail(),
                        f.getReceiverName(),
                        f.getAmount(),
                        f.getReason(),
                        f.getAiExplanation(),
                        f.getFlaggedAt()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
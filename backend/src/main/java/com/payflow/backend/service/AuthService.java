package com.payflow.backend.service;

import com.payflow.backend.dto.LoginRequest;
import com.payflow.backend.dto.LoginResponse;
import com.payflow.backend.dto.SignupRequest;
import com.payflow.backend.dto.SignupResponse;
import com.payflow.backend.entity.User;
import com.payflow.backend.entity.Wallet;
import com.payflow.backend.repository.UserRepository;
import com.payflow.backend.repository.WalletRepository;
import com.payflow.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService; // Added JwtService

    public AuthService(UserRepository userRepository, WalletRepository walletRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public SignupResponse registerUser(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered!");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number is already registered!");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        Wallet wallet = new Wallet();
        wallet.setUser(savedUser);
        wallet.setBalance(BigDecimal.ZERO);
        walletRepository.save(wallet);

        return new SignupResponse("User registered successfully!", savedUser.getEmail());
    }

    // NEW LOGIN METHOD
    public LoginResponse loginUser(LoginRequest request) {
        // 1. Find the user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with this email!"));

        // 2. Compare the plain password with the hashed password in the DB
        boolean isPasswordMatch = passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!isPasswordMatch) {
            throw new RuntimeException("Invalid password!");
        }

        // 3. Generate the JWT VIP pass
        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(token, "Login successful!");
    }
}
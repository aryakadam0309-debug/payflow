package com.payflow.backend.service;

import com.payflow.backend.dto.TransferRequest;
import com.payflow.backend.dto.TransactionResponse;
import com.payflow.backend.entity.Transaction;
import com.payflow.backend.entity.User;
import com.payflow.backend.entity.Wallet;
import com.payflow.backend.repository.TransactionRepository;
import com.payflow.backend.repository.UserRepository;
import com.payflow.backend.repository.WalletRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.concurrent.TimeUnit;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final RateLimitService rateLimitService;

    public WalletService(WalletRepository walletRepository,
                         UserRepository userRepository,
                         TransactionRepository transactionRepository,
                         RedisTemplate<String, String> redisTemplate,
                         RateLimitService rateLimitService) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.redisTemplate = redisTemplate;
        this.rateLimitService = rateLimitService;
    }

    public BigDecimal getBalance(User user) {
        Wallet wallet = walletRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found!"));
        return wallet.getBalance();
    }

    @Transactional
    public String transferMoney(User sender, TransferRequest request, String idempotencyKey) {

        // 1. RATE LIMITING CHECK
        rateLimitService.checkRateLimit(sender.getId());

        // 2. IDEMPOTENCY CHECK
        String redisKey = "idempotency:" + idempotencyKey;
        Boolean isDuplicate = redisTemplate.hasKey(redisKey);

        if (Boolean.TRUE.equals(isDuplicate)) {
            throw new RuntimeException("Duplicate request! This transfer was already processed.");
        }

        // 3. Prevent sending to self
        if (sender.getPhone().equals(request.getRecipientPhone())) {
            throw new RuntimeException("You cannot send money to yourself!");
        }

        // 4. Get Recipient
        User recipient = userRepository.findByPhone(request.getRecipientPhone())
                .orElseThrow(() -> new RuntimeException("Recipient not found with that phone number!"));

        // 5. Lock Wallets
        Long senderId = sender.getId();
        Long recipientId = recipient.getId();
        Long firstLockId = senderId < recipientId ? senderId : recipientId;
        Long secondLockId = senderId < recipientId ? recipientId : senderId;

        walletRepository.findByUserIdWithLock(firstLockId)
                .orElseThrow(() -> new RuntimeException("Wallet not found!"));
        walletRepository.findByUserIdWithLock(secondLockId)
                .orElseThrow(() -> new RuntimeException("Wallet not found!"));

        Wallet senderWallet = walletRepository.findByUser_Id(senderId).get();
        Wallet recipientWallet = walletRepository.findByUser_Id(recipientId).get();

        // 6. Check Balance
        if (senderWallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance!");
        }

        // 7. Transfer Money
        senderWallet.setBalance(senderWallet.getBalance().subtract(request.getAmount()));
        recipientWallet.setBalance(recipientWallet.getBalance().add(request.getAmount()));

        walletRepository.save(senderWallet);
        walletRepository.save(recipientWallet);

        // 8. Transaction Record
        Transaction transaction = new Transaction();
        transaction.setSenderWallet(senderWallet);
        transaction.setReceiverWallet(recipientWallet);
        transaction.setAmount(request.getAmount());
        transaction.setNote(request.getNote());
        transaction.setStatus("SUCCESS");
        transactionRepository.save(transaction);

        // 9. SAVE KEY TO REDIS
        redisTemplate.opsForValue().set(redisKey, "SUCCESS", 24, TimeUnit.HOURS);

        return "Transfer of ₹" + request.getAmount() + " to " + recipient.getFullName() + " was successful!";
    }

    public Page<TransactionResponse> getTransactionHistory(User user, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactions = transactionRepository.findAllByUserId(user.getId(), pageable);

        // Map the raw database entities to clean DTOs
        return transactions.map(t -> {
            boolean isSender = t.getSenderWallet().getUser().getId().equals(user.getId());

            String type = isSender ? "SENT" : "RECEIVED";
            String counterpartyName = isSender
                    ? t.getReceiverWallet().getUser().getFullName()
                    : t.getSenderWallet().getUser().getFullName();

            return new TransactionResponse(
                    t.getId(),
                    type,
                    counterpartyName,
                    t.getAmount(),
                    t.getNote(),
                    t.getStatus(),
                    t.getTimestamp()
            );
        });
    }
}
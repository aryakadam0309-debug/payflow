package com.payflow.backend.service;

import com.payflow.backend.dto.TransferRequest;
import com.payflow.backend.entity.Transaction;
import com.payflow.backend.entity.User;
import com.payflow.backend.entity.Wallet;
import com.payflow.backend.repository.TransactionRepository;
import com.payflow.backend.repository.UserRepository;
import com.payflow.backend.repository.WalletRepository;
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

    public WalletService(WalletRepository walletRepository,
                         UserRepository userRepository,
                         TransactionRepository transactionRepository,
                         RedisTemplate<String, String> redisTemplate) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.redisTemplate = redisTemplate;
    }

    public BigDecimal getBalance(User user) {
        Wallet wallet = walletRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found!"));
        return wallet.getBalance();
    }

    @Transactional
    public String transferMoney(User sender, TransferRequest request, String idempotencyKey) {

        // 1. IDEMPOTENCY CHECK
        String redisKey = "idempotency:" + idempotencyKey;
        Boolean isDuplicate = redisTemplate.hasKey(redisKey);

        if (Boolean.TRUE.equals(isDuplicate)) {
            throw new RuntimeException("Duplicate request! This transfer was already processed.");
        }

        // 2. Prevent sending to self
        if (sender.getPhone().equals(request.getRecipientPhone())) {
            throw new RuntimeException("You cannot send money to yourself!");
        }

        // 3. Get Recipient
        User recipient = userRepository.findByPhone(request.getRecipientPhone())
                .orElseThrow(() -> new RuntimeException("Recipient not found with that phone number!"));

        // 4. Lock Wallets (To prevent race conditions)
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

        // 5. Check Balance
        if (senderWallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance!");
        }

        // 6. Transfer Money
        senderWallet.setBalance(senderWallet.getBalance().subtract(request.getAmount()));
        recipientWallet.setBalance(recipientWallet.getBalance().add(request.getAmount()));

        walletRepository.save(senderWallet);
        walletRepository.save(recipientWallet);

        // 7. Transaction Record
        Transaction transaction = new Transaction();
        transaction.setSenderWallet(senderWallet);
        transaction.setReceiverWallet(recipientWallet);
        transaction.setAmount(request.getAmount());
        transaction.setNote(request.getNote());
        transaction.setStatus("SUCCESS");
        transactionRepository.save(transaction);

        // 8. SAVE KEY TO REDIS (Expires in 24 hours)
        redisTemplate.opsForValue().set(redisKey, "SUCCESS", 24, TimeUnit.HOURS);

        return "Transfer of ₹" + request.getAmount() + " to " + recipient.getFullName() + " was successful!";
    }
}
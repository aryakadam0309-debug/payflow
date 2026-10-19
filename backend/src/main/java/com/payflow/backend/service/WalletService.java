package com.payflow.backend.service;

import com.payflow.backend.dto.TransferRequest;
import com.payflow.backend.entity.Transaction;
import com.payflow.backend.entity.User;
import com.payflow.backend.entity.Wallet;
import com.payflow.backend.repository.TransactionRepository;
import com.payflow.backend.repository.UserRepository;
import com.payflow.backend.repository.WalletRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public WalletService(WalletRepository walletRepository,
                         UserRepository userRepository,
                         TransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    public BigDecimal getBalance(User user) {
        Wallet wallet = walletRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new RuntimeException("Wallet not found!"));
        return wallet.getBalance();
    }

    // NEW TRANSFER METHOD
    @Transactional // If anything fails, it rolls back the whole transaction!
    public String transferMoney(User sender, TransferRequest request) {

            // 1. Prevent sending money to yourself (Do this BEFORE locking to save time)
            if (sender.getPhone().equals(request.getRecipientPhone())) {
                throw new RuntimeException("You cannot send money to yourself!");
            }

            // 2. Get Recipient User
            User recipient = userRepository.findByPhone(request.getRecipientPhone())
                    .orElseThrow(() -> new RuntimeException("Recipient not found with that phone number!"));

            // 3. LOCK THE WALLETS (Order matters! Lock lower ID first to prevent deadlocks)
            Long senderId = sender.getId();
            Long recipientId = recipient.getId();

            // Sort the IDs so we always lock in the same order
            Long firstLockId = senderId < recipientId ? senderId : recipientId;
            Long secondLockId = senderId < recipientId ? recipientId : senderId;

            // Lock 1
            walletRepository.findByUserIdWithLock(firstLockId)
                    .orElseThrow(() -> new RuntimeException("Wallet not found!"));

            // Lock 2
            walletRepository.findByUserIdWithLock(secondLockId)
                    .orElseThrow(() -> new RuntimeException("Wallet not found!"));

            // 4. Now that we have the locks, fetch the actual wallets again
            Wallet senderWallet = walletRepository.findByUser_Id(senderId).get();
            Wallet recipientWallet = walletRepository.findByUser_Id(recipientId).get();

            // 5. Check Balance
            if (senderWallet.getBalance().compareTo(request.getAmount()) < 0) {
                throw new RuntimeException("Insufficient balance!");
            }

            // 6. Perform the Transfer
            senderWallet.setBalance(senderWallet.getBalance().subtract(request.getAmount()));
            recipientWallet.setBalance(recipientWallet.getBalance().add(request.getAmount()));

            walletRepository.save(senderWallet);
            walletRepository.save(recipientWallet);

            // 7. Record the Transaction
            Transaction transaction = new Transaction();
            transaction.setSenderWallet(senderWallet);
            transaction.setReceiverWallet(recipientWallet);
            transaction.setAmount(request.getAmount());
            transaction.setNote(request.getNote());
            transaction.setStatus("SUCCESS");

            transactionRepository.save(transaction);

            return "Transfer of ₹" + request.getAmount() + " to " + recipient.getFullName() + " was successful!";
        }
    }

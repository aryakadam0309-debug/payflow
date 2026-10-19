package com.payflow.backend.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class RateLimitService {

    private final RedisTemplate<String, String> redisTemplate;

    public RateLimitService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void checkRateLimit(Long userId) {
        // 1. Create a unique key for this user's transfer attempts
        String key = "rate_limit:transfer:" + userId;

        // 2. Increment the counter in Redis
        Long currentAttempts = redisTemplate.opsForValue().increment(key);

        // 3. If this is the first attempt (counter == 1), set the timer to 60 seconds
        if (currentAttempts != null && currentAttempts == 1) {
            redisTemplate.expire(key, 60, TimeUnit.SECONDS);
        }

        // 4. If they have made more than 5 attempts, block them!
        if (currentAttempts != null && currentAttempts > 5) {
            throw new RuntimeException("Rate limit exceeded! You can only make 5 transfers per minute. Please wait.");
        }
    }
}
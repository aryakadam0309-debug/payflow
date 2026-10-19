package com.payflow.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        // 1. Set up the host and port
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName("immortal-perch-129984.upstash.io");
        config.setPort(6379);

        // 2. Set the password (PUT YOUR NEW PASSWORD HERE)
        config.setPassword("gQAAAAAAAfvAAAIgcDIxOTgzYTU5MzkxZWE0ZTRjOGI5MWYxMGUzMDMwMTQyZg");

        // 3. Force SSL and disable peer verification (required for Upstash)
        LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
                .useSsl()
                .disablePeerVerification()
                .build();

        return new LettuceConnectionFactory(config, clientConfig);
    }

    @Bean
    public RedisTemplate<String, String> redisTemplate(LettuceConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        return template;
    }
}
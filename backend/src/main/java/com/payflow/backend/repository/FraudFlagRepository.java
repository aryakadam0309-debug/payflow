package com.payflow.backend.repository;

import com.payflow.backend.entity.FraudFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FraudFlagRepository extends JpaRepository<FraudFlag, Long> {
}
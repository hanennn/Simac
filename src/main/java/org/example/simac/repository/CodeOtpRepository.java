package org.example.simac.repository;

import org.example.simac.entity.CodeOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CodeOtpRepository extends JpaRepository<CodeOtp, Long> {

    Optional<CodeOtp> findTopByEmailAndUtiliseFalseOrderByDateExpirationDesc(String email);
}
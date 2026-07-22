package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.example.simac.entity.CodeOtp;
import org.example.simac.repository.CodeOtpRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final CodeOtpRepository codeOtpRepository;
    private final NotificationEmailService notificationEmailService;

    public void genererEtEnvoyerOtp(String email) {
        String code = String.format("%06d", new Random().nextInt(999999));

        CodeOtp otp = new CodeOtp();
        otp.setEmail(email);
        otp.setCode(code);
        otp.setDateExpiration(LocalDateTime.now().plusMinutes(5));
        otp.setUtilise(false);
        codeOtpRepository.save(otp);

        notificationEmailService.envoyerEmail(
                email,
                "Code de verification - SIMAC",
                "Votre code de connexion est : " + code + "\nCe code est valide 5 minutes."
        );
    }

    public boolean verifierOtp(String email, String codeSaisi) {
        var otp = codeOtpRepository
                .findTopByEmailAndUtiliseFalseOrderByDateExpirationDesc(email)
                .orElseThrow(()-> new IllegalArgumentException("Le code de connexion est invalide"));

        if (otp==null) {
            return false;
        }


        if (otp.getDateExpiration().isBefore(LocalDateTime.now())) {
            return false; // code expire
        }

        if (!otp.getCode().equals(codeSaisi)) {
            return false; // code incorrect
        }

        otp.setUtilise(true);
        codeOtpRepository.save(otp);
        return true;
    }
}
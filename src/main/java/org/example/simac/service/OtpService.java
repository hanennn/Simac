package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.example.simac.entity.CodeOtp;
import org.example.simac.repository.CodeOtpRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private static final int MAX_TENTATIVES_OTP = 3;

    private final CodeOtpRepository codeOtpRepository;
    private final NotificationEmailService notificationEmailService;
    private final PasswordEncoder passwordEncoder;

    public void genererEtEnvoyerOtp(String email) {
        String code = String.format("%06d", new Random().nextInt(999999));

        CodeOtp otp = new CodeOtp();
        otp.setEmail(email);
        otp.setCode(passwordEncoder.encode(code));
        otp.setDateExpiration(LocalDateTime.now().plusMinutes(5));
        otp.setUtilise(false);
        otp.setTentatives(0);
        codeOtpRepository.save(otp);
        System.out.println("code " + code);

        notificationEmailService.envoyerEmailOtp(email, code);
    }

    // Lance une exception avec le bon message selon le cas
    public void verifierOtp(String email, String codeSaisi) {
        var otpOptionnel = codeOtpRepository
                .findTopByEmailAndUtiliseFalseOrderByDateExpirationDesc(email);

        if (otpOptionnel.isEmpty()) {
            throw new RuntimeException("Aucun code actif pour cet email. Veuillez vous reconnecter.");
        }

        CodeOtp otp = otpOptionnel.get();

        if (otp.getDateExpiration().isBefore(LocalDateTime.now())) {
            otp.setUtilise(true);
            codeOtpRepository.save(otp);
            throw new RuntimeException("Le code a expire. Veuillez vous reconnecter.");
        }

        if (!passwordEncoder.matches(codeSaisi, otp.getCode())) {
            int nouvellesTentatives = otp.getTentatives() + 1;
            otp.setTentatives(nouvellesTentatives);

            if (nouvellesTentatives >= MAX_TENTATIVES_OTP) {
                otp.setUtilise(true);
                codeOtpRepository.save(otp);
                throw new RuntimeException("Trop de tentatives incorrectes. Veuillez vous reconnecter.");
            }

            codeOtpRepository.save(otp);
            int tentativesRestantes = MAX_TENTATIVES_OTP - nouvellesTentatives;
            throw new RuntimeException("Code incorrect. Il vous reste " + tentativesRestantes + " tentative(s).");
        }

        otp.setUtilise(true);
        codeOtpRepository.save(otp);
    }
}
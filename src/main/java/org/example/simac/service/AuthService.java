package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.*;
import org.example.simac.entity.Utilisateur;
import org.example.simac.repository.UtilisateurRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;

    public void register(RegisterRequest request) {
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNomUser(request.getNom());
        utilisateur.setPrenomUser(request.getPrenom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        utilisateur.setRole(request.getRole());

        utilisateurRepository.save(utilisateur);
    }

    public void login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMotDePasse())
        );

        otpService.genererEtEnvoyerOtp(request.getEmail());
    }

    public LoginResponse verifyOtp(VerifyOtpRequest request) {
        boolean valide = otpService.verifierOtp(request.getEmail(), request.getCode());

        if (!valide) {
            throw new RuntimeException("Code invalide ou expire");
        }

        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        UserDetails userDetails = User.builder()
                .username(utilisateur.getEmail())
                .password(utilisateur.getMotDePasse())
                .authorities("ROLE_" + utilisateur.getRole().name())
                .build();

        String token = jwtService.genererToken(userDetails);

        return new LoginResponse(
                token,
                utilisateur.getNomUser(),
                utilisateur.getPrenomUser(),
                utilisateur.getEmail(),
                utilisateur.getRole()
        );
    }

    public void motDePasseOublie(ForgotPasswordRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            otpService.genererEtEnvoyerOtp(request.getEmail());
        }
    }

    public void reinitialiserMotDePasse(ResetPasswordRequest request) {
        boolean codeValide = otpService.verifierOtp(request.getEmail(), request.getCode());

        if (!codeValide) {
            throw new RuntimeException("Code invalide ou expire");
        }

        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        utilisateur.setMotDePasse(passwordEncoder.encode(request.getNouveauMotDePasse()));
        utilisateurRepository.save(utilisateur);
    }
}
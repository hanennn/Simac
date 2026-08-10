package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.*;
import org.example.simac.entity.Utilisateur;
import org.example.simac.repository.UtilisateurRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MAX_TENTATIVES = 3;
    private static final int DUREE_BLOCAGE_MINUTES = 1;

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
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        if (!utilisateur.isActif()) {
            throw new RuntimeException("Ce compte a ete desactive. Contactez un administrateur.");
        }

        // Si le compte est actuellement verrouille, on bloque avant meme de verifier le mot de passe
        if (utilisateur.getVerrouilleJusqua() != null
                && utilisateur.getVerrouilleJusqua().isAfter(LocalDateTime.now())) {

            long minutesRestantes = Duration.between(LocalDateTime.now(), utilisateur.getVerrouilleJusqua())
                    .toMinutes() + 1;

            throw new RuntimeException(
                    "Compte temporairement bloque suite a plusieurs tentatives echouees. "
                            + "Reessayez dans " + minutesRestantes + " minute(s)."
            );
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMotDePasse())
            );
        } catch (BadCredentialsException e) {
            enregistrerTentativeEchouee(utilisateur);
            throw e;
        }

        // Connexion reussie : on remet le compteur a zero
        if (utilisateur.getTentativesEchouees() > 0 || utilisateur.getVerrouilleJusqua() != null) {
            utilisateur.setTentativesEchouees(0);
            utilisateur.setVerrouilleJusqua(null);
            utilisateurRepository.save(utilisateur);
        }

        otpService.genererEtEnvoyerOtp(request.getEmail());
    }

    private void enregistrerTentativeEchouee(Utilisateur utilisateur) {
        int nouvellesTentatives = utilisateur.getTentativesEchouees() + 1;
        utilisateur.setTentativesEchouees(nouvellesTentatives);

        if (nouvellesTentatives >= MAX_TENTATIVES) {
            utilisateur.setVerrouilleJusqua(LocalDateTime.now().plusMinutes(DUREE_BLOCAGE_MINUTES));
            utilisateur.setTentativesEchouees(0);
            System.out.println("[AUTH] Compte " + utilisateur.getEmail() + " verrouille pour "
                    + DUREE_BLOCAGE_MINUTES + " minutes apres " + MAX_TENTATIVES + " echecs.");
        }

        utilisateurRepository.save(utilisateur);
    }

    public LoginResponse verifyOtp(VerifyOtpRequest request) {
        boolean valide = otpService.verifierOtp(request.getEmail(), request.getCode());

        if (!valide) {
            throw new RuntimeException("Code invalide ou expire");
        }

        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (!utilisateur.isActif()) {
            throw new RuntimeException("Ce compte a ete desactive. Contactez un administrateur.");
        }

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
                utilisateur.getRole(),
                utilisateur.getDepartement() != null ? utilisateur.getDepartement().getIdDepart() : null
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
//verrouillage
    public boolean verifierMotDePasseActuel(String email, String motDePasse) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        return passwordEncoder.matches(motDePasse, utilisateur.getMotDePasse());//verif correspondance
    }
}
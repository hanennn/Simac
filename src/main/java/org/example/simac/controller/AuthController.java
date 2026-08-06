package org.example.simac.controller;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.*;
import org.example.simac.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("Compte cree avec succes");
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        authService.login(request);
        return ResponseEntity.ok(Map.of(
                "message", "Code envoye par email. Veuillez le saisir pour finaliser la connexion.",
                "email", request.getEmail()
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<LoginResponse> verifyOtp(@RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/mot-de-passe-oublie")
    public ResponseEntity<Map<String, String>> motDePasseOublie(@RequestBody ForgotPasswordRequest request) {
        authService.motDePasseOublie(request);
        return ResponseEntity.ok(Map.of(
                "message", "Si cet email existe, un code de reinitialisation a ete envoye."
        ));
    }

    @PostMapping("/reinitialiser-mot-de-passe")
    public ResponseEntity<Map<String, String>> reinitialiserMotDePasse(@RequestBody ResetPasswordRequest request) {
        authService.reinitialiserMotDePasse(request);
        return ResponseEntity.ok(Map.of("message", "Mot de passe reinitialise avec succes"));
    }

    @PostMapping("/verifier-mot-de-passe")
    public ResponseEntity<Map<String, Boolean>> verifierMotDePasse(@RequestBody VerifierMotDePasseRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName(); // recupere l'email depuis le token deja valide

        boolean valide = authService.verifierMotDePasseActuel(email, request.getMotDePasse());
        return ResponseEntity.ok(Map.of("valide", valide));
    }
}
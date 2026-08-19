package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationEmailService {

    @Value("${resend.api-key}")
    private String resendApiKey;

    @Value("${resend.from-email:onboarding@resend.dev}")
    private String fromEmail;

    private final RestClient restClient = RestClient.create("https://api.resend.com");

    public void envoyerEmail(String destinataire, String sujet, String contenu) {
        String html = chargerTemplate("base.html").replace("{{CONTENU}}", "<p style=\"margin:0;\">" + contenu + "</p>");
        envoyerEmailHtml(destinataire, sujet, html);
    }

    public void envoyerEmailCreationCompte(String destinataire, String prenom, String motDePasseTemporaire) {
        String contenu = chargerTemplate("creation-comptes.html")
                .replace("{{PRENOM}}", prenom)
                .replace("{{MOT_DE_PASSE}}", motDePasseTemporaire);

        String html = chargerTemplate("base.html").replace("{{CONTENU}}", contenu);
        envoyerEmailHtml(destinataire, "Création de votre compte SIMAC", html);
    }

    public void envoyerEmailOtp(String destinataire, String code) {
        String contenu = chargerTemplate("otp.html")
                .replace("{{CODE}}", code);

        String html = chargerTemplate("base.html").replace("{{CONTENU}}", contenu);
        envoyerEmailHtml(destinataire, "Votre code de connexion SIMAC", html);
    }

    // Envoie l'email via l'API HTTP de Resend, au lieu du protocole SMTP
    // (SMTP est bloque par Render en offre gratuite, contrairement aux requetes HTTP classiques)
    private void envoyerEmailHtml(String destinataire, String sujet, String contenuHtml) {
        try {
            Map<String, Object> corps = Map.of(
                    "from", fromEmail,
                    "to", List.of(destinataire),
                    "subject", sujet,
                    "html", contenuHtml
            );

            restClient.post()
                    .uri("/emails")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + resendApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(corps)
                    .retrieve()
                    .toBodilessEntity();

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email via Resend", e);
        }
    }

    private String chargerTemplate(String nomFichier) {
        try (InputStream is = new ClassPathResource("email-templates/" + nomFichier).getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de charger le template email : " + nomFichier, e);
        }
    }

    public void envoyerEmailStatutDepense(String destinataire, String prenom, String statut, double montant, String description) {
        String contenu = chargerTemplate("statut-depense.html")
                .replace("{{PRENOM}}", prenom)
                .replace("{{STATUT}}", statut)
                .replace("{{MONTANT}}", String.format("%.2f", montant))
                .replace("{{DESCRIPTION}}", description != null ? description : "");

        String html = chargerTemplate("base.html").replace("{{CONTENU}}", contenu);
        envoyerEmailHtml(destinataire, "Mise à jour de votre dépense - SIMAC", html);
    }
}
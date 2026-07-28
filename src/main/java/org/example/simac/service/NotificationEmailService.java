package org.example.simac.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class NotificationEmailService {

    private final JavaMailSender mailSender;

    public void envoyerEmail(String destinataire, String sujet, String contenu) {
        String html = chargerTemplate("base.html").replace("{{CONTENU}}", "<p style=\"margin:0;\">" + contenu + "</p>");
        envoyerEmailHtml(destinataire, sujet, html);
    }

    public void envoyerEmailCreationCompte(String destinataire, String prenom, String motDePasseTemporaire) {
        String contenu = chargerTemplate("creation-compte.html")
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

    private void envoyerEmailHtml(String destinataire, String sujet, String contenuHtml) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(destinataire);
            helper.setSubject(sujet);
            helper.setText(contenuHtml, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email", e);
        }
    }

    private String chargerTemplate(String nomFichier) {
        try (InputStream is = new ClassPathResource("email-templates/" + nomFichier).getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de charger le template email : " + nomFichier, e);
        }
    }
}
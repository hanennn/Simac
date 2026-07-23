package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor //constr généré auto
public class NotificationEmailService {

    private final JavaMailSender mailSender;

    public void envoyerEmail(String destinataire, String sujet, String contenu) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(destinataire);
        message.setSubject(sujet);
        message.setText(contenu);
        mailSender.send(message);
    }
}
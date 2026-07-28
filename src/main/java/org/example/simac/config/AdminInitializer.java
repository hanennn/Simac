package org.example.simac.config;

import lombok.RequiredArgsConstructor;
import org.example.simac.entity.Utilisateur;
import org.example.simac.enums.Role;
import org.example.simac.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String emailAdmin = "hanen.bennaceur@esprit.tn";

        if (!utilisateurRepository.existsByEmail(emailAdmin)) {
            Utilisateur admin = new Utilisateur();
            admin.setNomUser("Admin");
            admin.setPrenomUser("Simac");
            admin.setEmail(emailAdmin);
            admin.setMotDePasse(passwordEncoder.encode("Admin123!"));
            admin.setRole(Role.ADMIN);

            utilisateurRepository.save(admin);

            System.out.println("Compte Admin par defaut cree : " + emailAdmin);
        }
    }
}
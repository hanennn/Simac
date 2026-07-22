package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.UtilisateurRequest;
import org.example.simac.entity.Departement;
import org.example.simac.entity.Utilisateur;
import org.example.simac.repository.DepartementRepository;
import org.example.simac.repository.UtilisateurRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UtilisateurAdminService {

    private final UtilisateurRepository utilisateurRepository;
    private final DepartementRepository departementRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationEmailService notificationEmailService;

    public List<Utilisateur> listerTous() {
        return utilisateurRepository.findAll();
    }

    public Utilisateur creer(UtilisateurRequest request) {
        String motDePasseTemporaire = UUID.randomUUID().toString().substring(0, 10);

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNomUser(request.getNomUser());
        utilisateur.setPrenomUser(request.getPrenomUser());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setMotDePasse(passwordEncoder.encode(motDePasseTemporaire));
        utilisateur.setRole(request.getRole());

        if (request.getDepartementId() != null) {
            Departement departement = departementRepository.findById(request.getDepartementId())
                    .orElseThrow(() -> new RuntimeException("Departement introuvable"));
            utilisateur.setDepartement(departement);
        }

        Utilisateur saved = utilisateurRepository.save(utilisateur);

        notificationEmailService.envoyerEmail(
                request.getEmail(),
                "Creation de votre compte SIMAC",
                "Votre compte a ete cree. Mot de passe temporaire : " + motDePasseTemporaire
        );

        return saved;
    }

    public void supprimer(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        utilisateurRepository.delete(utilisateur);
    }
}

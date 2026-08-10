package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.example.simac.entity.Alerte;
import org.example.simac.entity.Budget;
import org.example.simac.entity.Utilisateur;
import org.example.simac.repository.AlerteRepository;
import org.example.simac.repository.UtilisateurRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlerteService {

    private final AlerteRepository alerteRepository;
    private final UtilisateurRepository utilisateurRepository;

    public void creerAlerteDepassement(Budget budget) {
        boolean existeDeja = alerteRepository.findByBudgetIdBudAndLueFalse(budget.getIdBud()).isPresent();
        if (existeDeja) {
            return; // évite les doublons si déjà alerté et pas encore lu
        }

        //creation
        Alerte alerte = new Alerte();
        alerte.setBudget(budget);
        alerte.setMessage("Le budget du département " + budget.getDepartement().getNomDepart() + " est dépassé.");
        alerte.setDateCreation(LocalDateTime.now());
        alerte.setLue(false);
        alerteRepository.save(alerte);
    }


    //renvoyer les alertes non lues
    public List<Alerte> listerMesAlertesNonLues(Authentication authentication) {
        Utilisateur utilisateur = utilisateurCourant(authentication);
        if (utilisateur.getDepartement() == null) {//si user n'a pas de département
            return List.of();  // retourne une liste vide
        }
        return alerteRepository.findByBudgetDepartementIdDepartAndLueFalse(utilisateur.getDepartement().getIdDepart());
    }

    public void marquerCommeLue(Long idAlerte) {
        Alerte alerte = alerteRepository.findById(idAlerte)
                .orElseThrow(() -> new RuntimeException("Alerte introuvable"));
        alerte.setLue(true);
        alerte.setDateLecture(LocalDateTime.now());
        alerteRepository.save(alerte);
    }

    private Utilisateur utilisateurCourant(Authentication authentication) {
        String email = authentication.getName();//extrait mail
        return utilisateurRepository.findByEmail(email)//récupérer user
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }
}
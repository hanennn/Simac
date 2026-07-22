package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.DepenseRequest;
import org.example.simac.entity.Budget;
import org.example.simac.entity.CategorieDepart;
import org.example.simac.entity.Depense;
import org.example.simac.entity.Utilisateur;
import org.example.simac.enums.StatutDepense;
import org.example.simac.repository.BudgetRepository;
import org.example.simac.repository.DepenseRepository;
import org.example.simac.repository.UtilisateurRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepenseService {

    private final DepenseRepository depenseRepository;
    private final BudgetRepository budgetRepository;
    private final UtilisateurRepository utilisateurRepository;

    public List<Depense> listerTous() {
        return depenseRepository.findAll();
    }

    public List<Depense> listerMesDepenses(Authentication authentication) {
        Utilisateur utilisateur = utilisateurCourant(authentication);
        return depenseRepository.findByUtilisateurIdUser(utilisateur.getIdUser());
    }

    public Depense trouverParId(Long id) {
        return depenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Depense introuvable"));
    }

    public Depense saisir(DepenseRequest request, Authentication authentication) {
        Utilisateur utilisateur = utilisateurCourant(authentication);

        Budget budget = budgetRepository.findById(request.getBudgetId())
                .orElseThrow(() -> new RuntimeException("Budget introuvable"));

        Depense depense = new Depense();
        depense.setMontant(request.getMontant());
        depense.setCategorieDepense(request.getCategorieDepense());
        depense.setDescDepense(request.getDescDepense());
        depense.setDateDepense(request.getDateDepense());
        depense.setStatutDepense(StatutDepense.EN_ATTENTE);
        depense.setBudget(budget);
        depense.setUtilisateur(utilisateur);

        return depenseRepository.save(depense);
    }

    public Depense valider(Long id) {
        Depense depense = trouverParId(id);
        depense.changerStatut(StatutDepense.VALIDEE);

        Budget budget = depense.getBudget();
        budget.setMontantConsommeBud(budget.getMontantConsommeBud() + depense.getMontant());
        budgetRepository.save(budget);

        return depenseRepository.save(depense);
    }

    public Depense rejeter(Long id) {
        Depense depense = trouverParId(id);
        depense.changerStatut(StatutDepense.REJETEE);
        return depenseRepository.save(depense);
    }

    private Utilisateur utilisateurCourant(Authentication authentication) {
        String email = authentication.getName();
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }
}
package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.DepenseRequest;
import org.example.simac.dto.OdooWebhookRequest;
import org.example.simac.entity.Budget;
import org.example.simac.entity.CategorieDepense;
import org.example.simac.entity.Depense;
import org.example.simac.entity.Departement;
import org.example.simac.entity.Utilisateur;
import org.example.simac.enums.StatutDepense;
import org.example.simac.repository.BudgetRepository;
import org.example.simac.repository.CategorieDepenseRepository;
import org.example.simac.repository.DepenseRepository;
import org.example.simac.repository.DepartementRepository;
import org.example.simac.repository.UtilisateurRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DepenseService {

    private final DepenseRepository depenseRepository;
    private final BudgetRepository budgetRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final CategorieDepenseRepository categorieDepenseRepository;
    private final DepartementRepository departementRepository;
    private final NotificationEmailService notificationEmailService;
    private final AlerteService alerteService;

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

        CategorieDepense categorie = categorieDepenseRepository.findById(request.getCategorieId())
                .orElseThrow(() -> new RuntimeException("Categorie introuvable"));

        Depense depense = new Depense();
        depense.setMontant(request.getMontant());
        depense.setCategorieDepense(categorie);
        depense.setDescDepense(request.getDescDepense());
        depense.setDateDepense(request.getDateDepense());
        depense.setStatutDepense(StatutDepense.EN_ATTENTE);
        depense.setBudget(budget);
        depense.setUtilisateur(utilisateur);

        return depenseRepository.save(depense);
    }

    public Depense saisirDepuisOdoo(OdooWebhookRequest request) {

        Departement departement = departementRepository.findByCategorieDepart_NomCategorie(request.getX_departement())
                .orElseThrow(() -> new RuntimeException("Departement introuvable : " + request.getX_departement()));

        // Ne prend que le budget dont la periode contient la date du jour,
        // au lieu du premier budget trouve pour ce departement (qui pouvait etre expire).
        LocalDate dateDuJour = LocalDate.now();

        Budget budget = budgetRepository.findAll().stream()
                .filter(b -> b.getDepartement() != null
                        && b.getDepartement().getIdDepart().equals(departement.getIdDepart()))
                .filter(b -> !b.getDateDebutBud().isAfter(dateDuJour) && !b.getDateFinBud().isBefore(dateDuJour))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Aucun budget actif pour ce departement aujourd'hui"));

        String nomCategorieDepense = request.getX_categorie_depense() != null
                ? request.getX_categorie_depense()
                : "Fourniture";

        CategorieDepense categorie = categorieDepenseRepository.findByNomCategorie(nomCategorieDepense)
                .orElseThrow(() -> new RuntimeException("Categorie de depense introuvable : " + nomCategorieDepense));

        Utilisateur chef = utilisateurRepository.findAll().stream()
                .filter(u -> u.getRole() != null && "CHEF_DEPARTEMENT".equals(u.getRole().name())
                        && u.getDepartement() != null
                        && u.getDepartement().getIdDepart().equals(departement.getIdDepart()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Aucun chef de departement trouve pour ce departement"));

        String nomProduit = request.getX_nom_produit() != null
                ? request.getX_nom_produit()
                : request.getDisplay_name();

        Depense depense = new Depense();
        depense.setMontant(request.getAmount_untaxed());
        depense.setCategorieDepense(categorie);
        depense.setDescDepense("Achat ERP : " + nomProduit + " (" + request.getDisplay_name() + ")");
        depense.setDateDepense(LocalDate.parse(request.getDate_approve().substring(0, 10)));
        depense.setStatutDepense(StatutDepense.EN_ATTENTE);
        depense.setBudget(budget);
        depense.setIdUtilisateur(chef.getIdUser());

        return depenseRepository.save(depense);
    }

    public Depense valider(Long id) {
        Depense depense = trouverParId(id);
        depense.changerStatut(StatutDepense.VALIDEE);

        Budget budget = depense.getBudget();
        budget.setMontantConsommeBud(budget.getMontantConsommeBud() + depense.getMontant());
        budgetRepository.save(budget);

        // Si le budget est désormais dépassé, on crée une alerte (notification)
        if (budget.getMontantConsommeBud() > budget.getMontantAlloueBud()) {
            alerteService.creerAlerteDepassement(budget);
        }

        Depense sauvegardee = depenseRepository.save(depense);
        envoyerNotificationStatut(sauvegardee, "validée");
        return sauvegardee;
    }

    public Depense rejeter(Long id) {
        Depense depense = trouverParId(id);
        depense.changerStatut(StatutDepense.REJETEE);

        Depense sauvegardee = depenseRepository.save(depense);
        envoyerNotificationStatut(sauvegardee, "rejetée");
        return sauvegardee;
    }

    private void envoyerNotificationStatut(Depense depense, String statutLibelle) {
        Utilisateur chef = depense.getUtilisateur();
        if (chef != null && chef.getEmail() != null) {
            notificationEmailService.envoyerEmailStatutDepense(
                    chef.getEmail(),
                    chef.getPrenomUser(),
                    statutLibelle,
                    depense.getMontant(),
                    depense.getDescDepense()
            );
        }
    }

    private Utilisateur utilisateurCourant(Authentication authentication) {
        String email = authentication.getName();
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }
}
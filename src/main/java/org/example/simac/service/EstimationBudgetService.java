package org.example.simac.service;

import org.example.simac.dto.EstimationBudgetResponse;
import org.example.simac.entity.Budget;
import org.example.simac.entity.Departement;
import org.example.simac.entity.Depense;
import org.example.simac.enums.StatutDepense;
import org.example.simac.repository.BudgetRepository;
import org.example.simac.repository.DepartementRepository;
import org.example.simac.repository.DepenseRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class EstimationBudgetService {

    private final BudgetRepository budgetRepository;
    private final DepenseRepository depenseRepository;
    private final DepartementRepository departementRepository;
    private final ChatClient chatClient;

    public EstimationBudgetService(BudgetRepository budgetRepository,
                                   DepenseRepository depenseRepository,
                                   DepartementRepository departementRepository,
                                   ChatClient.Builder chatClientBuilder) {
        this.budgetRepository = budgetRepository;
        this.depenseRepository = depenseRepository;
        this.departementRepository = departementRepository;
        this.chatClient = chatClientBuilder.build();
    }

    public EstimationBudgetResponse estimerBudget(Long departementId) {
        Departement departement = departementRepository.findById(departementId)
                .orElseThrow(() -> new NoSuchElementException("Departement introuvable"));

        List<Budget> budgetsHistoriques = budgetRepository.findByDepartementIdDepart(departementId);

        if (budgetsHistoriques.isEmpty()) {
            return new EstimationBudgetResponse(
                    0,
                    "Aucun historique de budget disponible pour ce departement. "
                            + "Impossible de fournir une estimation fiable sans donnees.",
                    "FAIBLE"
            );
        }

        double moyenneAlloue = budgetsHistoriques.stream()
                .mapToDouble(Budget::getMontantAlloueBud)
                .average()
                .orElse(0);

        double moyenneConsomme = budgetsHistoriques.stream()
                .mapToDouble(Budget::getMontantConsommeBud)
                .average()
                .orElse(0);

        long nombreDepassements = budgetsHistoriques.stream()
                .filter(Budget::estDepasse)
                .count();

        double tauxDepassement = (nombreDepassements * 100.0) / budgetsHistoriques.size();

        double totalDepensesValidees = budgetsHistoriques.stream()
                .flatMap(b -> depenseRepository.findByBudgetIdBud(b.getIdBud()).stream())
                .filter(d -> d.getStatutDepense() == StatutDepense.VALIDEE)
                .mapToDouble(Depense::getMontant)
                .sum();

        String nomCategorie = departement.getCategorieDepart() != null
                ? departement.getCategorieDepart().getNomCategorie()
                : "Non definie";

        double margeSecurite;
        if (tauxDepassement >= 66) {
            margeSecurite = 0.30;
        } else if (tauxDepassement >= 33) {
            margeSecurite = 0.15;
        } else {
            margeSecurite = 0.05;
        }
        double montantEstimeCalcule = moyenneConsomme * (1 + margeSecurite);

        String prompt = """
                Tu es un assistant qui aide un responsable financier a comprendre une estimation
                de budget deja calculee automatiquement a partir de statistiques reelles.
                Tu ne dois PAS recalculer ni modifier ce montant, seulement l'expliquer.

                Departement : %s
                Categorie : %s
                Nombre de budgets historiques : %d
                Moyenne des budgets alloues precedemment : %.2f DT
                Moyenne des montants reellement consommes : %.2f DT
                Total des depenses validees sur l'historique : %.2f DT
                Pourcentage de budgets historiques ayant ete depasses : %.1f %%
                Marge de securite appliquee : %.0f %%
                Montant estime (deja calcule, a ne pas changer) : %.2f DT

                Redige une justification courte (2 a 3 phrases) qui explique ce montant
                a partir des statistiques ci-dessus, et donne un niveau de confiance
                (FAIBLE, MOYEN ou ELEVE) base sur la quantite et la coherence des donnees disponibles.

                Reponds UNIQUEMENT avec un objet JSON valide de la forme exacte suivante,
                sans balises markdown, sans backticks, sans aucun texte avant ou apres :
                {"justification": "<texte>", "niveauConfiance": "<FAIBLE|MOYEN|ELEVE>"}
                """.formatted(
                departement.getNomDepart(),
                nomCategorie,
                budgetsHistoriques.size(),
                moyenneAlloue,
                moyenneConsomme,
                totalDepensesValidees,
                tauxDepassement,
                margeSecurite * 100,
                montantEstimeCalcule
        );

        String reponseBrute = chatClient.prompt()
                .user(prompt)
                .call()
                .content();

        return parserReponse(reponseBrute, montantEstimeCalcule);
    }

    private EstimationBudgetResponse parserReponse(String reponseBrute, double montantCalcule) {
        try {
            String json = nettoyerJson(reponseBrute);
            JustificationEtConfiance texte =
                    new BeanOutputConverter<>(JustificationEtConfiance.class).convert(json);
            return new EstimationBudgetResponse(montantCalcule, texte.justification(), texte.niveauConfiance());
        } catch (Exception e) {
            System.out.println("[ESTIMATION IA] Impossible de parser la reponse du modele : " + reponseBrute);
            return new EstimationBudgetResponse(
                    montantCalcule,
                    "Estimation calculee a partir de l'historique. L'IA n'a pas pu generer de justification "
                            + "detaillee cette fois-ci.",
                    "MOYEN"
            );
        }
    }

    private String nettoyerJson(String texte) {
        String nettoye = texte.trim();
        if (nettoye.startsWith("```")) {
            nettoye = nettoye.replaceFirst("^```(json)?", "");
            int derniereBalise = nettoye.lastIndexOf("```");
            if (derniereBalise != -1) {
                nettoye = nettoye.substring(0, derniereBalise);
            }
        }
        return nettoye.trim();
    }

    private record JustificationEtConfiance(String justification, String niveauConfiance) {}
}
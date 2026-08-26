package org.example.simac.service;

import org.example.simac.dto.EstimationBudgetResponse;
import org.example.simac.entity.Budget;
import org.example.simac.entity.Departement;
import org.example.simac.entity.EstimationBudget;
import org.example.simac.repository.BudgetRepository;
import org.example.simac.repository.DepartementRepository;
import org.example.simac.repository.DepenseRepository;
import org.example.simac.repository.EstimationBudgetRepository;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class EstimationBudgetService {

    private final BudgetRepository budgetRepository;
    private final DepenseRepository depenseRepository;
    private final DepartementRepository departementRepository;
    private final EstimationBudgetRepository estimationBudgetRepository;
    private final OllamaChatModel chatModel;
    private final BeanOutputConverter<EstimationBudgetResponse> outputConverter =
            new BeanOutputConverter<>(EstimationBudgetResponse.class);

    @Value("${spring.ai.ollama.chat.model}")
    private String nomModele;

    public EstimationBudgetService(BudgetRepository budgetRepository,
                                   DepenseRepository depenseRepository,
                                   DepartementRepository departementRepository,
                                   EstimationBudgetRepository estimationBudgetRepository,
                                   OllamaChatModel chatModel) {
        this.budgetRepository = budgetRepository;
        this.depenseRepository = depenseRepository;
        this.departementRepository = departementRepository;
        this.estimationBudgetRepository = estimationBudgetRepository;
        this.chatModel = chatModel;
    }

    public EstimationBudgetResponse estimerBudget(Long departementId) {
        Departement departement = departementRepository.findById(departementId)
                .orElseThrow(() -> new NoSuchElementException("Departement introuvable"));

        List<Budget> budgets = budgetRepository.findByDepartementIdDepart(departementId).stream()
                .sorted(Comparator.comparing(Budget::getDateDebutBud))
                .toList();

        if (budgets.isEmpty()) {
            EstimationBudgetResponse reponseVide = new EstimationBudgetResponse(
                    0,
                    "Aucun historique de budget disponible pour ce departement.",
                    "FAIBLE"
            );
            sauvegarderEstimation(departement, reponseVide);
            return reponseVide;
        }

        String historique = budgets.stream()
                .map(b -> "- Periode %s a %s : alloue %.2f DT, consomme %.2f DT".formatted(
                        b.getDateDebutBud(), b.getDateFinBud(), b.getMontantAlloueBud(), b.getMontantConsommeBud()))
                .reduce("", (a, b) -> a + b + "\n");

        String nomCategorie = departement.getCategorieDepart() != null
                ? departement.getCategorieDepart().getNomCategorie()
                : "Non definie";

        String promptTexte = """
                Tu es un expert financier. Analyse l'historique de budgets de ce departement
                et estime toi-meme le montant a allouer pour la prochaine periode.

                Departement : %s
                Categorie : %s

                Historique des budgets :
                %s

                Consignes pour ton analyse :
                1. Observe la tendance generale de consommation d'un budget a l'autre.
                2. Accorde plus d'importance aux budgets les plus recents.
                3. Ne recopie jamais un montant existant tel quel : raisonne sur l'ensemble des donnees.
                4. Le montant estime doit toujours etre un nombre positif et realiste.
                5. Determine un niveau de confiance honnete (FAIBLE, MOYEN ou ELEVE) selon la
                   quantite et la coherence des donnees disponibles.
                6. Redige une justification precise (2 a 3 phrases) citant les chiffres.

                Reponds maintenant avec ton montant estime, ta justification, et ton niveau de confiance.
                """.formatted(departement.getNomDepart(), nomCategorie, historique);

        Prompt prompt = new Prompt(
                new UserMessage(promptTexte),
                OllamaChatOptions.builder()
                        .model(nomModele)
                        .outputSchema(outputConverter.getJsonSchema())
                        .build()
        );

        ChatResponse response = chatModel.call(prompt);
        String texte = response.getResult().getOutput().getText();
        System.out.println("texte "+texte);
        EstimationBudgetResponse resultat = outputConverter.convert(texte);

        sauvegarderEstimation(departement, resultat);

        return resultat;
    }

    // Enregistre l'estimation, en ecrasant la precedente pour ce departement s'il y en a une
    private void sauvegarderEstimation(Departement departement, EstimationBudgetResponse resultat) {
        EstimationBudget entite = estimationBudgetRepository
                .findByDepartementIdDepart(departement.getIdDepart())
                .orElse(new EstimationBudget());

        entite.setDepartement(departement);
        entite.setMontantEstime(resultat.montantEstime());
        entite.setJustification(resultat.justification());
        entite.setNiveauConfiance(resultat.niveauConfiance());
        entite.setDateEstimation(LocalDateTime.now());

        estimationBudgetRepository.save(entite);
    }

    // Recupere la derniere estimation deja calculee, sans rappeler le modele IA
    public EstimationBudgetResponse recupererDerniereEstimation(Long departementId) {
        EstimationBudget entite = estimationBudgetRepository.findByDepartementIdDepart(departementId)
                .orElseThrow(() -> new NoSuchElementException("Aucune estimation enregistree pour ce departement"));

        return new EstimationBudgetResponse(
                entite.getMontantEstime(),
                entite.getJustification(),
                entite.getNiveauConfiance()
        );
    }
}
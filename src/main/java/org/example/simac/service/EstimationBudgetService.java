package org.example.simac.service;

import org.example.simac.dto.EstimationBudgetResponse;
import org.example.simac.entity.Budget;
import org.example.simac.entity.Departement;
import org.example.simac.entity.Depense;
import org.example.simac.enums.StatutDepense;
import org.example.simac.repository.BudgetRepository;
import org.example.simac.repository.DepartementRepository;
import org.example.simac.repository.DepenseRepository;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class EstimationBudgetService {

    private final BudgetRepository budgetRepository;
    private final DepenseRepository depenseRepository;
    private final DepartementRepository departementRepository;
    private final OllamaChatModel chatModel;

    //fabrique un traducteur JSON/Java,
    private final BeanOutputConverter<EstimationBudgetResponse> outputConverter =
            new BeanOutputConverter<>(EstimationBudgetResponse.class);

    public EstimationBudgetService(BudgetRepository budgetRepository, DepenseRepository depenseRepository, DepartementRepository departementRepository, OllamaChatModel chatModel) {
        this.budgetRepository = budgetRepository;
        this.depenseRepository = depenseRepository;
        this.departementRepository = departementRepository;
        this.chatModel = chatModel;
    }

    public EstimationBudgetResponse estimerBudget(Long departementId) {
        //recupere departement
        Departement departement = departementRepository.findById(departementId)
                .orElseThrow(() -> new NoSuchElementException("Departement introuvable"));


        //recupere budget
        List<Budget> budgetsHistoriques = budgetRepository.findByDepartementIdDepart(departementId);

        // recupere les depenses (validees)
        List<Depense> depensesHistoriques = budgetsHistoriques.stream()
                .flatMap(b -> depenseRepository.findByBudgetIdBud(b.getIdBud()).stream())
                .filter(d -> d.getStatutDepense() == StatutDepense.VALIDEE)
                .sorted(Comparator.comparing(Depense::getDateDepense))
                .toList();

        String detailDepenses = depensesHistoriques.isEmpty()
                ? "Aucune depense validee enregistree."
                : depensesHistoriques.stream()
                .map(d -> "- %s : %.2f DT (%s) - %s".formatted(
                        d.getDateDepense(),
                        d.getMontant(),
                        d.getCategorieDepense() != null ? d.getCategorieDepense().getNomCategorie() : "categorie inconnue",
                        d.getDescDepense() != null ? d.getDescDepense() : "sans description"))
                .reduce("", (a, b) -> a + b + "\n");

        String historiqueBudgets = budgetsHistoriques.isEmpty()
                ? "Aucun historique de budget disponible."
                : budgetsHistoriques.stream()
                .map(b -> "- Periode %s a %s : alloue %.2f DT".formatted(
                        b.getDateDebutBud(), b.getDateFinBud(), b.getMontantAlloueBud()))
                .reduce("", (a, b) -> a + b + "\n");

        //recupere categorie
        String nomCategorie = departement.getCategorieDepart() != null
                ? departement.getCategorieDepart().getNomCategorie()
                : "Non definie";

        String promptTexte = """
            Tu es un expert financier. Analyse les depenses reelles de ce departement
            (pas seulement les budgets alloues dans le passe) et estime toi-meme
            le budget a lui allouer pour la prochaine periode.

            Departement : %s
            Categorie : %s

            Budgets alloues dans le passe (pour reference uniquement) :
            %s

            Depenses reelles validees (le vrai comportement de consommation) :
            %s

            Analyse la frequence, les montants et les categories des depenses
            pour estimer un budget realiste, meme s'il est different des budgets
            precedemment alloues.

            Donne un montant estime, une justification (2-3 phrases), et un niveau de confiance
            (FAIBLE, MOYEN ou ELEVE).
            """.formatted(
                departement.getNomDepart(),
                nomCategorie,
                historiqueBudgets,
                detailDepenses
        );

        Prompt prompt = new Prompt(
                new UserMessage(promptTexte),
                OllamaChatOptions.builder()
                        .outputSchema(outputConverter.getJsonSchema())
                        .build()
        );
        //appel modele
        ChatResponse response = chatModel.call(prompt);
        String texte = response.getResult().getOutput().getText();

        return outputConverter.convert(texte);
    }
}
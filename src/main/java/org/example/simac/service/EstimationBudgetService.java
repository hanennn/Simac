package org.example.simac.service;

import org.example.simac.dto.EstimationBudgetResponse;
import org.example.simac.entity.Budget;
import org.example.simac.entity.Departement;
import org.example.simac.repository.BudgetRepository;
import org.example.simac.repository.DepartementRepository;
import org.example.simac.repository.DepenseRepository;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.beans.factory.annotation.Value;
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

    //traducteur JSON/obj Java
    private final BeanOutputConverter<EstimationBudgetResponse> outputConverter =
            new BeanOutputConverter<>(EstimationBudgetResponse.class);

    @Value("${spring.ai.ollama.chat.model}")
    private String nomModele;

    public EstimationBudgetService(BudgetRepository budgetRepository,
                                   DepenseRepository depenseRepository,
                                   DepartementRepository departementRepository,
                                   OllamaChatModel chatModel) {
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
        List<Budget> budgets = budgetRepository.findByDepartementIdDepart(departementId).stream()
                .sorted(Comparator.comparing(Budget::getDateDebutBud))
                .toList();

        if (budgets.isEmpty()) {
            return new EstimationBudgetResponse(
                    0,
                    "Aucun historique de budget disponible pour ce departement.",
                    "FAIBLE"
            );
        }
//recup historique
        String historique = budgets.stream()
                .map(b -> "- Periode %s a %s : alloue %.2f DT, consomme %.2f DT".formatted(
                        b.getDateDebutBud(), b.getDateFinBud(), b.getMontantAlloueBud(), b.getMontantConsommeBud()))
                .reduce("", (a, b) -> a + b + "\n");

        String nomCategorie = departement.getCategorieDepart() != null
                ? departement.getCategorieDepart().getNomCategorie()
                : "Non definie";

        String promptTexte = """
        Tu es un expert financier specialise dans la gestion budgetaire d'entreprise.
        Ta mission est d'estimer le budget a allouer a un departement pour la prochaine periode,
        en te basant UNIQUEMENT sur son historique reel de budgets fourni ci-dessous.

        Departement : %s
        Categorie : %s

        Historique des budgets (du plus ancien au plus recent) :
        %s

        Consignes pour ton analyse :
        1. Observe la tendance generale de consommation d'un budget a l'autre (croissante, stable, decroissante).
        2. Accorde plus d'importance aux budgets les plus recents qu'aux plus anciens,
           car ils refletent mieux le comportement actuel du departement.
        3. Ne recopie jamais un montant existant tel quel : ton estimation doit resulter
           d'un veritable raisonnement sur l'ensemble des donnees fournies.
        4. Le montant estime doit toujours etre un nombre positif et realiste,
           coherent avec l'ordre de grandeur des montants observes dans l'historique.
        5. Determine un niveau de confiance qui reflete honnetement la qualite des donnees :
           - FAIBLE si tu as peu de budgets historiques ou des montants tres irreguliers,
           - MOYEN si les donnees sont raisonnablement coherentes,
           - ELEVE si tu as plusieurs budgets avec une tendance claire et stable.
        6. Redige une justification precise (2 a 3 phrases) qui explique concretement
           comment tu es arrive a ce montant, en citant les chiffres de l'historique.

        Reponds maintenant avec ton montant estime, ta justification, et ton niveau de confiance.
        """.formatted(departement.getNomDepart(), nomCategorie, historique);

        Prompt prompt = new Prompt(
                new UserMessage(promptTexte),
                OllamaChatOptions.builder()
                        .model(nomModele)//modele utilisé
                        .outputSchema(outputConverter.getJsonSchema())
                        .build()
        );

        ChatResponse response = chatModel.call(prompt);//appel
        String texte = response.getResult().getOutput().getText(); //reponse

        return outputConverter.convert(texte);
    }
}
package org.example.simac.service;

import org.example.simac.dto.PredictionDepassementResponse;
import org.example.simac.entity.Budget;
import org.example.simac.entity.Depense;
import org.example.simac.enums.StatutDepense;
import org.example.simac.repository.BudgetRepository;
import org.example.simac.repository.DepenseRepository;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class PredictionBudgetService {

    private final BudgetRepository budgetRepository;
    private final DepenseRepository depenseRepository;
    private final OllamaChatModel chatModel;
    //traducteur JSON/obj Java
    private final BeanOutputConverter<PredictionDepassementResponse> outputConverter =
            new BeanOutputConverter<>(PredictionDepassementResponse.class);

    @Value("${spring.ai.ollama.chat.model}")
    private String nomModele;

    public PredictionBudgetService(BudgetRepository budgetRepository,
                                   DepenseRepository depenseRepository,
                                   OllamaChatModel chatModel) {
        this.budgetRepository = budgetRepository;
        this.depenseRepository = depenseRepository;
        this.chatModel = chatModel;
    }

    public PredictionDepassementResponse predire(Long budgetId) {
        //recuperer budget
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new NoSuchElementException("Budget introuvable"));
        //recuperer les depenses
        List<Depense> depenses = depenseRepository.findByBudgetIdBud(budgetId).stream()
                .filter(d -> d.getStatutDepense() == StatutDepense.VALIDEE)
                .sorted(Comparator.comparing(Depense::getDateDepense))
                .toList();

        //nombre de jours entre deux dates.
        long joursTotal = ChronoUnit.DAYS.between(budget.getDateDebutBud(), budget.getDateFinBud());
        //jours écoulés
        long joursEcoules = Math.max(1, Math.min(
                ChronoUnit.DAYS.between(budget.getDateDebutBud(), LocalDate.now()), joursTotal));

        String historique = depenses.isEmpty()
                ? "Aucune depense validee enregistree."
                : depenses.stream()
                .map(d -> "- %s : %.2f DT (%s)".formatted(
                        d.getDateDepense(), d.getMontant(),
                        d.getCategorieDepense() != null ? d.getCategorieDepense().getNomCategorie() : "categorie inconnue"))
                .reduce("", (a, b) -> a + b + "\n");

        String nomDepartement = budget.getDepartement() != null
                ? budget.getDepartement().getNomDepart()
                : "Departement inconnu";

        String promptTexte = """
                Tu es un expert financier specialise dans le suivi budgetaire en temps reel.
                Ta mission est d'analyser un budget actuellement EN COURS et de determiner
                s'il risque d'etre depasse avant la fin de sa periode.

                Departement : %s
                Budget alloue : %.2f DT
                Montant deja consomme : %.2f DT
                Duree totale de la periode : %d jours
                Jours ecoules depuis le debut : %d jours sur %d
                Periode : %s a %s

                Depenses validees jusqu'a present (de la plus ancienne a la plus recente) :
                %s

                Consignes pour ton analyse :
                1. Observe le rythme reel des depenses dans le temps : est-il stable, en acceleration,
                   en ralentissement, ou concentre sur quelques depenses ponctuelles ?
                2. Projette, a partir de ce rythme observe, le montant total qui sera probablement
                   consomme a la fin de la periode.
                3. Ta conclusion "vaDepasser" doit etre parfaitement coherente avec le montant projete
                   que tu donnes : si le montant projete depasse le budget alloue, vaDepasser doit etre true,
                   sinon false. Verifie cette coherence avant de repondre.
                4. Redige une justification precise (2 a 3 phrases) qui explique ton raisonnement,
                   en citant les chiffres cles (rythme de depense, montant projete, budget alloue).

                Reponds maintenant avec ton montant projete, ta conclusion vaDepasser, et ta justification.
                """.formatted(
                nomDepartement,
                budget.getMontantAlloueBud(),
                budget.getMontantConsommeBud(),
                joursTotal,
                joursEcoules,
                joursTotal,
                budget.getDateDebutBud(),
                budget.getDateFinBud(),
                historique
        );
        //preparer req
        Prompt prompt = new Prompt(
                new UserMessage(promptTexte),
                OllamaChatOptions.builder()
                        .model(nomModele)//modèle utilisé
                        .outputSchema(outputConverter.getJsonSchema())
                        .build()
        );

        ChatResponse response = chatModel.call(prompt);//appel
        String texte = response.getResult().getOutput().getText();//reponse

        return outputConverter.convert(texte);
    }
}
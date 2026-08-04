package org.example.simac.dto;

public record EstimationBudgetResponse(
        double montantEstime,
        String justification,
        String niveauConfiance // "FAIBLE", "MOYEN" ou "ELEVE"
) {
}
package org.example.simac.dto;

public record PredictionDepassementResponse(
        boolean vaDepasser,
        double montantProjete,
        String justification
) {
}
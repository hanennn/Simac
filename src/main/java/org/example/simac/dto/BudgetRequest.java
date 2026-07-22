package org.example.simac.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.LocalDate;

@Data
public class BudgetRequest {

    @NotNull(message = "Le montant alloue est obligatoire")
    @Positive(message = "Le montant doit etre positif")
    private Double montantAlloueBud;

    @NotNull(message = "La date de debut est obligatoire")
    private LocalDate dateDebutBud;

    @NotNull(message = "La date de fin est obligatoire")
    private LocalDate dateFinBud;

    @NotNull(message = "Le departement est obligatoire")
    private Long departementId;
}

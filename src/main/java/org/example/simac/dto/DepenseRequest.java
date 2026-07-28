package org.example.simac.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.LocalDate;

@Data
public class DepenseRequest {

    @NotNull(message = "Le montant est obligatoire")
    @Positive(message = "Le montant doit etre positif")
    private Double montant;

    @NotNull(message = "La categorie est obligatoire")
    private Long categorieId;

    private String descDepense;

    @NotNull(message = "La date est obligatoire")
    private LocalDate dateDepense;

    @NotNull(message = "Le budget est obligatoire")
    private Long budgetId;
}
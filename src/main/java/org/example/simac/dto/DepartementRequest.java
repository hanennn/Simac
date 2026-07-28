package org.example.simac.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DepartementRequest {

    @NotBlank(message = "Le nom du departement est obligatoire")
    private String nomDepart;

    private String descDepart;

    @NotNull(message = "La categorie est obligatoire")
    private Long categorieId;
}
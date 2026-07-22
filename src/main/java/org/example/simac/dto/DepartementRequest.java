package org.example.simac.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DepartementRequest {

    @NotBlank(message = "Le nom du departement est obligatoire")
    private String nomDepart;

    private String descDepart;

    @NotBlank(message = "La categorie est obligatoire")
    private String categorieDepart;
}

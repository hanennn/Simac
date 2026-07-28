package org.example.simac.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategorieRequest {
    @NotBlank(message = "Le nom de la categorie est obligatoire")
    private String nomCategorie;
}
package org.example.simac.dto;

import lombok.Data;

@Data
public class ProduitRequest {
    private String nom;
    private double prix;
    private String categorie;
    private String description;
    private String categorieDepense;
}
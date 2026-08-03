package org.example.simac.dto;

import lombok.Data;

@Data
public class OdooWebhookRequest {
    private String _model;
    private String _name;
    private Double amount_untaxed;
    private String date_approve;
    private String display_name;
    private Long id;
    private String x_departement;
    private String x_nom_produit;
    private String x_categorie_depense;
}
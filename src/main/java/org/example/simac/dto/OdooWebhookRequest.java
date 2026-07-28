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
}
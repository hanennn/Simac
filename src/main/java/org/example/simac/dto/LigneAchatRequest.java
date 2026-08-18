package org.example.simac.dto;

import lombok.Data;

@Data
public class LigneAchatRequest {
    private Integer produitId;
    private Integer quantite;
}
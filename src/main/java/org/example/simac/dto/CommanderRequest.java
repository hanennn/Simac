package org.example.simac.dto;

import lombok.Data;

import java.util.List;

@Data
public class CommanderRequest {
    private List<LigneAchatRequest> lignes;
}
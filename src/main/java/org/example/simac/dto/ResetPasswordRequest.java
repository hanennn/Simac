package org.example.simac.dto;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String email;
    private String code;
    private String nouveauMotDePasse;
}

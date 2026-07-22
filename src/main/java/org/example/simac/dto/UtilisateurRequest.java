package org.example.simac.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.example.simac.enums.Role;

@Data
public class UtilisateurRequest {

    @NotBlank
    private String nomUser;

    @NotBlank
    private String prenomUser;

    @Email
    @NotBlank
    private String email;

    private Role role;

    private Long departementId;
}
package org.example.simac.dto;

import lombok.Data;
import org.example.simac.enums.Role;

@Data
public class RegisterRequest {
    private String nom;
    private String prenom;
    private String email;
    private String motDePasse;
    private Role role;
}

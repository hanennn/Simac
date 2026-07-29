package org.example.simac.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.simac.enums.Role;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String nom;
    private String prenom;
    private String email;
    private Role role;
    private Long departementId;
}
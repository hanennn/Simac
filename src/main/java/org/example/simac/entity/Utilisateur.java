package org.example.simac.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.simac.enums.Role;

import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUser;

    @Column(nullable = false)
    private String nomUser;

    @Column(nullable = false)
    private String prenomUser;

    @Column(nullable = false)
    private boolean actif = true;

    @Email(message = "L'email doit etre valide")
    @NotBlank(message = "L'email est obligatoire")
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @ManyToOne
    @JoinColumn(name = "departement_id")
    private Departement departement;

    // --- Ajout pour le blocage apres tentatives echouees ---
    @Column(nullable = false)
    private int tentativesEchouees = 0;

    private LocalDateTime verrouilleJusqua;
}
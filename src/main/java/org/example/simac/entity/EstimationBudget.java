package org.example.simac.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "estimations_budget")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstimationBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "departement_id", nullable = false, unique = true)
    private Departement departement;

    @Column(nullable = false)
    private double montantEstime;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String justification;

    @Column(nullable = false)
    private String niveauConfiance;

    @Column(nullable = false)
    private LocalDateTime dateEstimation;
}
package org.example.simac.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "budgets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idBud;

    @Column(nullable = false)
    private double montantAlloueBud;

    @Column(nullable = false)
    private double montantConsommeBud = 0.0;

    @Column(nullable = false)
    private LocalDate dateDebutBud;

    @Column(nullable = false)
    private LocalDate dateFinBud;

    @ManyToOne
    @JoinColumn(name = "departement_id", nullable = false)
    @JsonBackReference
    private Departement departement;

    public double calculerSoldeRestant() {
        return montantAlloueBud - montantConsommeBud;
    }

    public boolean estDepasse() {
        return montantConsommeBud > montantAlloueBud;
    }
}
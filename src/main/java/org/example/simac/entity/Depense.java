package org.example.simac.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.simac.enums.StatutDepense;
import java.time.LocalDate;

@Entity
@Table(name = "depenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Depense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDepense;

    @Column(nullable = false)
    private double montant;

    @Column(nullable = false)
    private String categorieDepense;

    private String descDepense;

    @Column(nullable = false)
    private LocalDate dateDepense;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutDepense statutDepense = StatutDepense.EN_ATTENTE;

    @ManyToOne
    @JoinColumn(name = "budget_id", nullable = false)
    private Budget budget;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    public void changerStatut(StatutDepense nouveauStatut) {
        this.statutDepense = nouveauStatut;
    }
}
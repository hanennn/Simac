package org.example.simac.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "departements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Departement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDepart;

    @Column(nullable = false)
    private String nomDepart;

    private String descDepart;

    @ManyToOne
    @JoinColumn(name = "categorie_id", nullable = false)
    private CategorieDepart categorieDepart;
}
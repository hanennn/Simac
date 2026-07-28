package org.example.simac.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categories_departement")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategorieDepart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCategorie;

    @Column(nullable = false, unique = true)
    private String nomCategorie;
}
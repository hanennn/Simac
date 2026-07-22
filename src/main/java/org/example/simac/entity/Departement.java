package org.example.simac.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

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

    @Column(nullable = false)
    private String categorieDepart;

    @OneToMany(mappedBy = "departement")
    @JsonManagedReference
    private List<Budget> budgets;
}
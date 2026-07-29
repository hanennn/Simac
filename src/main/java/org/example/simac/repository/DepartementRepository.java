package org.example.simac.repository;

import org.example.simac.entity.Departement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartementRepository extends JpaRepository<Departement, Long> {
    Optional<Departement> findByNomDepart(String nomDepart);
    Optional<Departement> findByCategorieDepart_NomCategorie(String nomCategorie);
}
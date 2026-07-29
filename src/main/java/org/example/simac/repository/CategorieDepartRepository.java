package org.example.simac.repository;

import org.example.simac.entity.CategorieDepart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategorieDepartRepository extends JpaRepository<CategorieDepart, Long> {
    Optional<CategorieDepart> findByNomCategorie(String nomCategorie);
}
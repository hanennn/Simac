package org.example.simac.repository;

import org.example.simac.entity.CategorieDepense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategorieDepenseRepository extends JpaRepository<CategorieDepense, Long> {
    Optional<CategorieDepense> findByNomCategorie(String nomCategorie);
}
package org.example.simac.repository;

import org.example.simac.entity.Depense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepenseRepository extends JpaRepository<Depense, Long> {
    List<Depense> findByUtilisateurIdUser(Long utilisateurId);
    List<Depense> findByBudgetIdBud(Long budgetId);
}

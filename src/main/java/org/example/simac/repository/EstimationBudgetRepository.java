package org.example.simac.repository;

import org.example.simac.entity.EstimationBudget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EstimationBudgetRepository extends JpaRepository<EstimationBudget, Long> {
    Optional<EstimationBudget> findByDepartementIdDepart(Long departementId);
}
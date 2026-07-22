package org.example.simac.repository;

import org.example.simac.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByDepartementIdDepart(Long departementId);
}

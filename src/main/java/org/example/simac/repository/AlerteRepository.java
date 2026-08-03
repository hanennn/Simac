package org.example.simac.repository;

import org.example.simac.entity.Alerte;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlerteRepository extends JpaRepository<Alerte, Long> {
    List<Alerte> findByBudgetDepartementIdDepartAndLueFalse(Long idDepart);
    Optional<Alerte> findByBudgetIdBudAndLueFalse(Long idBud);
}
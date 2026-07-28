package org.example.simac.repository;

import org.example.simac.entity.CategorieDepart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategorieDepartRepository extends JpaRepository<CategorieDepart, Long> {
}
package org.example.simac.controller;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.EstimationBudgetResponse;
import org.example.simac.service.EstimationBudgetService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/budgets/estimation")
@RequiredArgsConstructor
public class BudgetEstimationController {

    private final EstimationBudgetService estimationBudgetService;

    // Recalcule via le modele IA, et enregistre (ecrase la precedente pour ce departement)
    @GetMapping("/{departementId}")
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER')")
    public EstimationBudgetResponse estimer(@PathVariable Long departementId) {
        return estimationBudgetService.estimerBudget(departementId);
    }

    // Recupere la derniere estimation deja enregistree, sans rappeler l'IA
    @GetMapping("/{departementId}/derniere")
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER')")
    public EstimationBudgetResponse derniereEstimation(@PathVariable Long departementId) {
        return estimationBudgetService.recupererDerniereEstimation(departementId);
    }
}
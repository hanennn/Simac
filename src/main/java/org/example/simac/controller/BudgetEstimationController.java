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

    // Reserve au responsable financier : c'est lui qui doit decider du budget a allouer
    @GetMapping("/{departementId}")
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER')")
    public EstimationBudgetResponse estimer(@PathVariable Long departementId) {
        return estimationBudgetService.estimerBudget(departementId);
    }
}
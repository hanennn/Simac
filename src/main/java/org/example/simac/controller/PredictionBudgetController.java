package org.example.simac.controller;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.PredictionDepassementResponse;
import org.example.simac.service.PredictionBudgetService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class PredictionBudgetController {

    private final PredictionBudgetService predictionBudgetService;

    @GetMapping("/{id}/prediction")
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER')")
    public PredictionDepassementResponse predire(@PathVariable Long id) {
        return predictionBudgetService.predire(id);
    }
}
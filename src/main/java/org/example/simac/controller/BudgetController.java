package org.example.simac.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.simac.dto.BudgetRequest;
import org.example.simac.entity.Budget;
import org.example.simac.service.BudgetService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER') or hasRole('ADMIN')")
    public List<Budget> listerTous() {
        return budgetService.listerTous();
    }

    @GetMapping("/departement/{departementId}")
    public List<Budget> listerParDepartement(@PathVariable Long departementId) {
        return budgetService.listerParDepartement(departementId);
    }

    @GetMapping("/{id}")
    public Budget trouverParId(@PathVariable Long id) {
        return budgetService.trouverParId(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER')")
    public ResponseEntity<Budget> creer(@Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.status(201).body(budgetService.creer(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER')")
    public ResponseEntity<Budget> modifier(@PathVariable Long id, @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.modifier(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        budgetService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
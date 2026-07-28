package org.example.simac.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.simac.dto.CategorieRequest;
import org.example.simac.entity.CategorieDepense;
import org.example.simac.service.CategorieDepenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories-depense")
@RequiredArgsConstructor
public class CategorieDepenseController {

    private final CategorieDepenseService categorieDepenseService;

    @GetMapping
    public List<CategorieDepense> listerTous() {
        return categorieDepenseService.listerTous();
    }

    @PostMapping
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER')")
    public ResponseEntity<CategorieDepense> creer(@Valid @RequestBody CategorieRequest request) {
        return ResponseEntity.status(201).body(categorieDepenseService.creer(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER')")
    public ResponseEntity<CategorieDepense> modifier(@PathVariable Long id, @Valid @RequestBody CategorieRequest request) {
        return ResponseEntity.ok(categorieDepenseService.modifier(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        categorieDepenseService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
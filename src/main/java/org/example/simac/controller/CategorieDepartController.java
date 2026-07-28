package org.example.simac.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.simac.dto.CategorieRequest;
import org.example.simac.entity.CategorieDepart;
import org.example.simac.service.CategorieDepartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories-departement")
@RequiredArgsConstructor
public class CategorieDepartController {

    private final CategorieDepartService categorieDepartService;

    @GetMapping
    public List<CategorieDepart> listerTous() {
        return categorieDepartService.listerTous();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategorieDepart> creer(@Valid @RequestBody CategorieRequest request) {
        return ResponseEntity.status(201).body(categorieDepartService.creer(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategorieDepart> modifier(@PathVariable Long id, @Valid @RequestBody CategorieRequest request) {
        return ResponseEntity.ok(categorieDepartService.modifier(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        categorieDepartService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
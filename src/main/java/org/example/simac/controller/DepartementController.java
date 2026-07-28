package org.example.simac.controller;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.DepartementRequest;
import org.example.simac.entity.Departement;
import org.example.simac.service.DepartementService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/departements")//toute route commence par api départ
@RequiredArgsConstructor
public class DepartementController {

    private final DepartementService departementService;

    @GetMapping("/")
    public List<Departement> listerTous() {
        return departementService.listerTous();
    }

    @GetMapping("/{id}")
    public Departement trouverParId(@PathVariable Long id) {
        return departementService.trouverParId(id);
    }

    @PostMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Departement> creer(@Valid @RequestBody DepartementRequest request) {
        Departement departement = departementService.creer(request);
        return ResponseEntity.status(201).body(departement);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Departement> modifier(@PathVariable Long id, @Valid @RequestBody DepartementRequest request) {
        Departement departement = departementService.modifier(id, request);
        return ResponseEntity.ok(departement);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        departementService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
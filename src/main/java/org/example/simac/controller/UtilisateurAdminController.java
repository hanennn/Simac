package org.example.simac.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.simac.dto.UtilisateurRequest;
import org.example.simac.entity.Utilisateur;
import org.example.simac.service.UtilisateurAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/utilisateurs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UtilisateurAdminController {

    private final UtilisateurAdminService utilisateurAdminService;

    @GetMapping
    public List<Utilisateur> listerTous() {
        return utilisateurAdminService.listerTous();
    }

    // --- Ajout pour le chargement a la demande, par departement ---
    @GetMapping("/departement/{departementId}")
    public List<Utilisateur> listerParDepartement(@PathVariable Long departementId) {
        return utilisateurAdminService.listerParDepartement(departementId);
    }

    @PostMapping
    public ResponseEntity<Utilisateur> creer(@Valid @RequestBody UtilisateurRequest request) {
        return ResponseEntity.status(201).body(utilisateurAdminService.creer(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        utilisateurAdminService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Utilisateur> modifier(@PathVariable Long id, @RequestBody UtilisateurRequest request) {
        return ResponseEntity.ok(utilisateurAdminService.modifier(id, request));
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<Utilisateur> changerStatut(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurAdminService.changerStatut(id));
    }
}
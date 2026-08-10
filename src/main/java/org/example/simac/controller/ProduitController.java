package org.example.simac.controller;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.ProduitRequest;
import org.example.simac.service.ProduitService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/produits")
@RequiredArgsConstructor
public class ProduitController {

    private final ProduitService produitService;

    @GetMapping("/mes-produits")
    @PreAuthorize("hasRole('CHEF_DEPARTEMENT')")
    public ResponseEntity<?> listerMesProduits(Authentication authentication) throws Exception {
        List<Map<String, Object>> produits = produitService.listerMesProduits(authentication);
        return ResponseEntity.ok(produits);
    }

    @PostMapping("/commander")
    @PreAuthorize("hasRole('CHEF_DEPARTEMENT')")
    public ResponseEntity<?> commander(@RequestBody Map<String, Integer> body, Authentication authentication) throws Exception {
        Integer produitId = body.get("produitId");
        Integer quantite = body.get("quantite");
        Integer commandeId = produitService.commander(produitId, quantite, authentication);
        return ResponseEntity.ok(Map.of("commandeId", commandeId, "message", "Commande créée avec succès"));
    }

    // --- Ajout pour le Gestionnaire de produits (parametrage des produits) ---

    @PostMapping
    @PreAuthorize("hasRole('GESTIONNAIRE_PRODUITS')")
    public ResponseEntity<?> creer(@RequestBody ProduitRequest request) throws Exception {
        Integer produitId = produitService.creerProduit(request);
        return ResponseEntity.status(201).body(Map.of("id", produitId, "message", "Produit créé avec succès"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('GESTIONNAIRE_PRODUITS')")
    public ResponseEntity<?> modifier(@PathVariable Integer id, @RequestBody ProduitRequest request) throws Exception {
        produitService.modifierProduit(id, request);
        return ResponseEntity.ok(Map.of("message", "Produit modifié avec succès"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('GESTIONNAIRE_PRODUITS')")
    public ResponseEntity<?> archiver(@PathVariable Integer id) throws Exception {
        produitService.archiverProduit(id);
        return ResponseEntity.ok(Map.of("message", "Produit archivé avec succès"));
    }

    @GetMapping
    @PreAuthorize("hasRole('GESTIONNAIRE_PRODUITS')")
    public ResponseEntity<?> listerTousProduits() throws Exception {
        List<Map<String, Object>> produits = produitService.listerTousProduits();
        return ResponseEntity.ok(produits);
    }
}
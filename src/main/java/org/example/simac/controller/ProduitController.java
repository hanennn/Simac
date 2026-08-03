package org.example.simac.controller;

import lombok.RequiredArgsConstructor;
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
}
package org.example.simac.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.simac.dto.DepenseRequest;
import org.example.simac.dto.OdooWebhookRequest;
import org.example.simac.entity.Depense;
import org.example.simac.service.DepenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.example.simac.service.OdooClientService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/depenses")//toute route commence par api depense
@RequiredArgsConstructor
public class DepenseController {

    private final DepenseService depenseService;
    private final OdooClientService odooClientService;

    @GetMapping
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER') ")
    public List<Depense> listerTous() {
        return depenseService.listerTous();
    }

    @GetMapping("/mes-depenses")
    @PreAuthorize("hasRole('CHEF_DEPARTEMENT')")
    public List<Depense> listerMesDepenses(Authentication authentication) {
        return depenseService.listerMesDepenses(authentication);
    }

    @PostMapping
    @PreAuthorize("hasRole('CHEF_DEPARTEMENT')")
    public ResponseEntity<Depense> saisir(@Valid @RequestBody DepenseRequest request, Authentication authentication) {
        return ResponseEntity.status(201).body(depenseService.saisir(request, authentication));
    }

    @PatchMapping("/{id}/valider")
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER')")
    public ResponseEntity<Depense> valider(@PathVariable Long id) { //pathvariable récupère var depuis url
        return ResponseEntity.ok(depenseService.valider(id));
    }

    @PatchMapping("/{id}/rejeter")
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER')")
    public ResponseEntity<Depense> rejeter(@PathVariable Long id) {
        return ResponseEntity.ok(depenseService.rejeter(id));
    }

    @PostMapping("/webhook-odoo")
    public ResponseEntity<Depense> recevoirDepenseOdoo(@RequestBody OdooWebhookRequest request) {
        return ResponseEntity.status(201).body(depenseService.saisirDepuisOdoo(request));
    }
    @GetMapping("/test-odoo")
    public ResponseEntity<?> testerConnexionOdoo() throws Exception {
        Integer uid = odooClientService.authentifier();
        return ResponseEntity.ok(Map.of("uid", uid, "message", "Connexion Odoo réussie !"));
    }

    @GetMapping("/test-produits")
    public ResponseEntity<?> testerListeProduits() throws Exception {
        List<Map<String, Object>> produits = odooClientService.listerProduitsParCategorie("Ressources Humaines");
        return ResponseEntity.ok(produits);
    }
}

package org.example.simac.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.simac.dto.DepenseRequest;
import org.example.simac.entity.Depense;
import org.example.simac.service.DepenseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/depenses")
@RequiredArgsConstructor
public class DepenseController {

    private final DepenseService depenseService;

    @GetMapping
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER') or hasRole('ADMIN')")
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
    public ResponseEntity<Depense> valider(@PathVariable Long id) {
        return ResponseEntity.ok(depenseService.valider(id));
    }

    @PatchMapping("/{id}/rejeter")
    @PreAuthorize("hasRole('RESPONSABLE_FINANCIER')")
    public ResponseEntity<Depense> rejeter(@PathVariable Long id) {
        return ResponseEntity.ok(depenseService.rejeter(id));
    }
}

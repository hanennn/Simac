package org.example.simac.controller;

import lombok.RequiredArgsConstructor;
import org.example.simac.entity.Alerte;
import org.example.simac.service.AlerteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alertes")
@RequiredArgsConstructor
public class AlerteController {

    private final AlerteService alerteService;

    @GetMapping("/mes-alertes")
    public ResponseEntity<List<Alerte>> listerMesAlertes(Authentication authentication) {
        return ResponseEntity.ok(alerteService.listerMesAlertesNonLues(authentication));
    }

    @PatchMapping("/{id}/lue")
    public ResponseEntity<Void> marquerCommeLue(@PathVariable Long id) {
        alerteService.marquerCommeLue(id);
        return ResponseEntity.ok().build();
    }
}
package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.example.simac.entity.Utilisateur;
import org.example.simac.repository.UtilisateurRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProduitService {

    private final OdooClientService odooClientService;
    private final UtilisateurRepository utilisateurRepository;

    public List<Map<String, Object>> listerMesProduits(Authentication authentication) throws Exception {
        Utilisateur utilisateur = utilisateurCourant(authentication);

        if (utilisateur.getDepartement() == null || utilisateur.getDepartement().getCategorieDepart() == null) {
            throw new RuntimeException("Aucun département/catégorie associé à votre compte.");
        }

        String nomCategorie = utilisateur.getDepartement().getCategorieDepart().getNomCategorie();

        return odooClientService.listerProduitsParCategorie(nomCategorie);
    }

    private Utilisateur utilisateurCourant(Authentication authentication) {
        String email = authentication.getName();
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    public Integer commander(Integer produitId, Integer quantite, Authentication authentication) throws Exception {
        Utilisateur utilisateur = utilisateurCourant(authentication);
        String nomCategorie = utilisateur.getDepartement().getCategorieDepart().getNomCategorie();
        return odooClientService.creerCommandeAchat(produitId, quantite, nomCategorie);
    }
}
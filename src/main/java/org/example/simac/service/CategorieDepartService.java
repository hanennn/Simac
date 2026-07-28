package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.CategorieRequest;
import org.example.simac.entity.CategorieDepart;
import org.example.simac.repository.CategorieDepartRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategorieDepartService {

    private final CategorieDepartRepository categorieDepartRepository;

    public List<CategorieDepart> listerTous() {
        return categorieDepartRepository.findAll();
    }

    public CategorieDepart creer(CategorieRequest request) {
        CategorieDepart categorie = new CategorieDepart();
        categorie.setNomCategorie(request.getNomCategorie());
        return categorieDepartRepository.save(categorie);
    }

    public CategorieDepart modifier(Long id, CategorieRequest request) {
        CategorieDepart categorie = categorieDepartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categorie introuvable"));
        categorie.setNomCategorie(request.getNomCategorie());
        return categorieDepartRepository.save(categorie);
    }

    public void supprimer(Long id) {
        CategorieDepart categorie = categorieDepartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categorie introuvable"));
        categorieDepartRepository.delete(categorie);
    }
}
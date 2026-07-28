package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.CategorieRequest;
import org.example.simac.entity.CategorieDepense;
import org.example.simac.repository.CategorieDepenseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategorieDepenseService {

    private final CategorieDepenseRepository categorieDepenseRepository;

    public List<CategorieDepense> listerTous() {
        return categorieDepenseRepository.findAll();
    }

    public CategorieDepense creer(CategorieRequest request) {
        CategorieDepense categorie = new CategorieDepense();
        categorie.setNomCategorie(request.getNomCategorie());
        return categorieDepenseRepository.save(categorie);
    }

    public CategorieDepense modifier(Long id, CategorieRequest request) {
        CategorieDepense categorie = categorieDepenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categorie introuvable"));
        categorie.setNomCategorie(request.getNomCategorie());
        return categorieDepenseRepository.save(categorie);
    }

    public void supprimer(Long id) {
        CategorieDepense categorie = categorieDepenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categorie introuvable"));
        categorieDepenseRepository.delete(categorie);
    }
}
package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.DepartementRequest;
import org.example.simac.entity.CategorieDepart;
import org.example.simac.entity.Departement;
import org.example.simac.repository.CategorieDepartRepository;
import org.example.simac.repository.DepartementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartementService {

    private final DepartementRepository departementRepository;
    private final CategorieDepartRepository categorieDepartRepository;

    public List<Departement> listerTous() {
        return departementRepository.findAll();
    }

    public Departement trouverParId(Long id) {
        return departementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Departement introuvable"));
    }

    public Departement creer(DepartementRequest request) {
        CategorieDepart categorie = trouverCategorie(request.getCategorieId());

        Departement departement = new Departement();
        departement.setNomDepart(request.getNomDepart());
        departement.setDescDepart(request.getDescDepart());
        departement.setCategorieDepart(categorie);

        return departementRepository.save(departement);
    }

    public Departement modifier(Long id, DepartementRequest request) {
        CategorieDepart categorie = trouverCategorie(request.getCategorieId());

        Departement departement = trouverParId(id);
        departement.setNomDepart(request.getNomDepart());
        departement.setDescDepart(request.getDescDepart());
        departement.setCategorieDepart(categorie);

        return departementRepository.save(departement);
    }

    public void supprimer(Long id) {
        Departement departement = trouverParId(id);
        departementRepository.delete(departement);
    }

    private CategorieDepart trouverCategorie(Long categorieId) {
        return categorieDepartRepository.findById(categorieId)
                .orElseThrow(() -> new RuntimeException("Categorie introuvable"));
    }
}
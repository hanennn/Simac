package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.DepartementRequest;
import org.example.simac.entity.CategorieDepart;
import org.example.simac.entity.Departement;
import org.example.simac.repository.DepartementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartementService {

    private final DepartementRepository departementRepository;

    public List<Departement> listerTous() {
        return departementRepository.findAll();
    }

    public Departement trouverParId(Long id) {
        return departementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Departement introuvable"));
    }

    public Departement creer(DepartementRequest request) {
        validerCategorie(request.getCategorieDepart());

        Departement departement = new Departement();
        departement.setNomDepart(request.getNomDepart());
        departement.setDescDepart(request.getDescDepart());
        departement.setCategorieDepart(request.getCategorieDepart());

        return departementRepository.save(departement);
    }

    public Departement modifier(Long id, DepartementRequest request) {
        validerCategorie(request.getCategorieDepart());

        Departement departement = trouverParId(id);
        departement.setNomDepart(request.getNomDepart());
        departement.setDescDepart(request.getDescDepart());
        departement.setCategorieDepart(request.getCategorieDepart());

        return departementRepository.save(departement);
    }

    public void supprimer(Long id) {
        Departement departement = trouverParId(id);
        departementRepository.delete(departement);
    }

    private void validerCategorie(String categorie) {
        if (!CategorieDepart.VALEURS_DEPART.contains(categorie)) {
            throw new IllegalArgumentException("Categorie de departement invalide. Valeurs autorisees : " + CategorieDepart.VALEURS_DEPART);
        }
    }
}
package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.BudgetRequest;
import org.example.simac.entity.Budget;
import org.example.simac.entity.Departement;
import org.example.simac.repository.BudgetRepository;
import org.example.simac.repository.DepartementRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final DepartementRepository departementRepository;

    public List<Budget> listerTous() {
        return budgetRepository.findAll();
    }

    public List<Budget> listerParDepartement(Long departementId) {
        return budgetRepository.findByDepartementIdDepart(departementId);
    }

    public Budget trouverParId(Long id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget introuvable"));
    }

    public Budget creer(BudgetRequest request) {
        if (request.getDateFinBud().isBefore(request.getDateDebutBud())) {
            throw new IllegalArgumentException("La date de fin doit etre posterieure a la date de debut");
        }

        Departement departement = departementRepository.findById(request.getDepartementId())
                .orElseThrow(() -> new RuntimeException("Departement introuvable"));

        Budget budget = new Budget();
        budget.setMontantAlloueBud(request.getMontantAlloueBud());
        budget.setMontantConsommeBud(0.0);
        budget.setDateDebutBud(request.getDateDebutBud());
        budget.setDateFinBud(request.getDateFinBud());
        budget.setDepartement(departement);

        return budgetRepository.save(budget);
    }

    public Budget modifier(Long id, BudgetRequest request) {
        Budget budget = trouverParId(id);
        Departement departement = departementRepository.findById(request.getDepartementId())
                .orElseThrow(() -> new RuntimeException("Departement introuvable"));

        budget.setMontantAlloueBud(request.getMontantAlloueBud());
        budget.setDateDebutBud(request.getDateDebutBud());
        budget.setDateFinBud(request.getDateFinBud());
        budget.setDepartement(departement);

        return budgetRepository.save(budget);
    }

    public void supprimer(Long id) {
        budgetRepository.delete(trouverParId(id));
    }
}
package org.example.simac.service;

import lombok.RequiredArgsConstructor;
import org.example.simac.dto.BudgetRequest;
import org.example.simac.entity.Budget;
import org.example.simac.repository.BudgetRepository;
import org.example.simac.repository.DepartementRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

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
                .orElseThrow(() -> new NoSuchElementException("Budget introuvable"));
    }

    public Budget creer(BudgetRequest request) {
        if (request.getDateFinBud().isBefore(request.getDateDebutBud())) {
            throw new IllegalArgumentException("La date de fin doit etre posterieure a la date de debut");
        }

        Budget budget = new Budget();
        budget.setMontantAlloueBud(request.getMontantAlloueBud());
        budget.setMontantConsommeBud(0.0);
        budget.setDateDebutBud(request.getDateDebutBud());
        budget.setDateFinBud(request.getDateFinBud());
        budget.setIdDepart(request.getDepartementId());
        return budgetRepository.save(budget);
    }

    public Budget modifier(Long id, BudgetRequest request) {
        Budget budget = trouverParId(id);
        budget.setMontantAlloueBud(request.getMontantAlloueBud());
        budget.setDateDebutBud(request.getDateDebutBud());
        budget.setDateFinBud(request.getDateFinBud());
        return budgetRepository.saveAndFlush(budget);
    }

    public void supprimer(Long id) {
        budgetRepository.delete(trouverParId(id));
    }
}
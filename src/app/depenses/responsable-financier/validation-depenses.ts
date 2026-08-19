import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Depense as DepenseService } from '../../depenses/depense';
import { Depense as DepenseModel } from '../depense.model';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { take, takeUntil } from 'rxjs';
import { creerEtatChargement } from '../../shared/etat-chargement';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-validation-depenses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validation-depenses.html',
  styleUrl: './validation-depenses.css'
})
export class ValidationDepenses implements OnInit {

  depenses = signal<DepenseModel[]>([]);
  etat = creerEtatChargement();

  filtreStatut = signal<'TOUS' | 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE'>('EN_ATTENTE');

  depensesFiltrees = computed(() => {
    const filtre = this.filtreStatut();
    if (filtre === 'TOUS') return this.depenses();
    return this.depenses().filter(d => d.statutDepense === filtre);
  });

  actionEnCours = signal<number | null>(null);

  constructor(private depenseService: DepenseService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.etat.chargement.set(true);
    this.etat.erreur.set(null);
    this.depenseService.listerTous().pipe(take(1)).subscribe({
      next: (liste) => {
        this.depenses.set(liste);
        this.etat.chargement.set(false);
      },
      error: () => {
        this.etat.erreur.set("Impossible de charger les dépenses.");
        this.etat.chargement.set(false);
      }
    });
  }

  valider(dep: DepenseModel): void {
    this.actionEnCours.set(dep.idDepense);
    this.depenseService.valider(dep.idDepense).pipe(take(1)).subscribe({
      next: () => {
        this.actionEnCours.set(null);
        this.charger();
      },
      error: () => {
        this.actionEnCours.set(null);
        this.etat.erreur.set("La validation a échoué.");
      }
    });
  }

  rejeter(dep: DepenseModel): void {
    this.actionEnCours.set(dep.idDepense);
    this.depenseService.rejeter(dep.idDepense).pipe(take(1)).subscribe({
      next: () => {
        this.actionEnCours.set(null);
        this.charger();
      },
      error: () => {
        this.actionEnCours.set(null);
        this.etat.erreur.set("Le rejet a échoué.");
      }
    });
  }

  formatStatut(statut: string): string {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente',
      'VALIDEE': 'Validée',
      'REJETEE': 'Rejetée'
    };
    return labels[statut] || statut;
  }

  exporterExcel(): void {
  const donnees = this.depensesFiltrees().map(dep => ({
    'Date': dep.dateDepense || '',
    'Catégorie': dep.categorieDepense?.nomCategorie || '',
    'Description': dep.descDepense || '',
    'Montant (DT)': dep.montant,
    'Statut': this.formatStatut(dep.statutDepense),
    'Département': dep.budget?.departement?.nomDepart || '',
    'Soumis par': `${dep.utilisateur?.prenomUser || ''} ${dep.utilisateur?.nomUser || ''}`.trim()
  }));

  const feuille = XLSX.utils.json_to_sheet(donnees);
  const classeur = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(classeur, feuille, 'Dépenses');

  const dateExport = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(classeur, `depenses_simac_${dateExport}.xlsx`);
}
}
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Produit_Service } from '../produitService';
import { Produit } from '../produit.model';
import { take } from 'rxjs';
import { creerEtatChargement } from '../../shared/etat-chargement';

interface LignePanier {
  produit: Produit;
  quantite: number;
}

@Component({
  selector: 'app-faire-achat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faire-achat.html',
  styleUrl: './faire-achat.css'
})
export class FaireAchat implements OnInit {

  produits = signal<Produit[]>([]);
  etat = creerEtatChargement();

  panier = signal<LignePanier[]>([]);

  commandeEnCours = signal(false);
  commandeReussie = signal(false);

  totalPanier = computed(() =>
    this.panier().reduce((total, ligne) => total + ligne.produit.list_price * ligne.quantite, 0)
  );

  constructor(private produitService: Produit_Service) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.etat.chargement.set(true);
    this.etat.erreur.set(null);
    this.produitService.listerMesProduits().pipe(take(1)).subscribe({
      next: (liste) => {
        this.produits.set(liste);
        this.etat.chargement.set(false);
      },
      error: () => {
        this.etat.erreur.set("Impossible de charger les produits.");
        this.etat.chargement.set(false);
      }
    });
  }

  ajouterAuPanier(produit: Produit): void {
    const panierActuel = this.panier();
    const ligneExistante = panierActuel.find(l => l.produit.id === produit.id);

    if (ligneExistante) {
      ligneExistante.quantite++;
      this.panier.set([...panierActuel]);
    } else {
      this.panier.set([...panierActuel, { produit, quantite: 1 }]);
    }
  }

  retirerDuPanier(produitId: number): void {
    this.panier.set(this.panier().filter(l => l.produit.id !== produitId));
  }

  validerCommande(): void {
    const lignes = this.panier();
    if (lignes.length === 0) { return; }

    this.commandeEnCours.set(true);
    this.etat.erreur.set(null);
    this.commandeReussie.set(false);

    const payload = lignes.map(l => ({ produitId: l.produit.id, quantite: l.quantite }));

    this.produitService.commander(payload).pipe(take(1)).subscribe({
      next: () => {
        this.commandeEnCours.set(false);
        this.commandeReussie.set(true);
        this.panier.set([]);
      },
      error: () => {
        this.commandeEnCours.set(false);
        this.etat.erreur.set("La commande a échoué. Réessayez.");
      }
    });
  }
}
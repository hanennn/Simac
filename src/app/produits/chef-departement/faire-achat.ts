import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Produit_Service } from '../produitService';
import { Produit } from '../produit.model';

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
  chargement = signal(true);
  erreur = signal<string | null>(null);

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
    this.chargement.set(true);
    this.erreur.set(null);
    this.produitService.listerMesProduits().subscribe({
      next: (liste) => {
        this.produits.set(liste);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set("Impossible de charger les produits.");
        this.chargement.set(false);
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
    this.erreur.set(null);
    this.commandeReussie.set(false);

    // Version simple : on commande le premier produit du panier
    // (à améliorer plus tard pour gérer plusieurs produits en une seule commande)
    const premiereLigne = lignes[0];

    this.produitService.commander(premiereLigne.produit.id, premiereLigne.quantite).subscribe({
      next: () => {
        this.commandeEnCours.set(false);
        this.commandeReussie.set(true);
        this.panier.set([]);
      },
      error: () => {
        this.commandeEnCours.set(false);
        this.erreur.set("La commande a échoué. Réessayez.");
      }
    });
  }
}
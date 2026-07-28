export interface Depense {
  idDepense: number;
  montant: number;
  categorieDepense: {
    idCategorie: number;
    nomCategorie: string;
  };
  descDepense: string;
  dateDepense: string;
  statutDepense: 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE';
  idUtilisateur: number;
  budget: {
    idBud: number;
    montantAlloueBud: number;
    montantConsommeBud: number;
    departement?: { idDepart: number; nomDepart: string; categorieDepart: { idCategorie: number; nomCategorie: string } };
  };
  utilisateur?: {
    idUser: number;
    nomUser: string;
    prenomUser: string;
  };
}

export interface DepenseRequest {
  montant: number;
  categorieId: number;
  descDepense: string;
  dateDepense: string;
  budgetId: number;
}
export interface Depense {
  idDepense: number;
  montant: number;
  categorieDepense: string;
  descDepense: string;
  dateDepense: string;
  statutDepense: 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE';
  idUtilisateur: number;
  budget: {
    idBud: number;
    montantAlloueBud: number;
    montantConsommeBud: number;
    departement?: { idDepart: number; nomDepart: string; categorieDepart: string };
  };
  utilisateur?: {
    idUser: number;
    nomUser: string;
    prenomUser: string;
  };
}

export interface DepenseRequest {
  montant: number;
  categorieDepense: string;
  descDepense: string;
  dateDepense: string;
  budgetId: number;
}
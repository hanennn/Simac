export interface CategorieDepart {
  idCategorie: number;
  nomCategorie: string;
}

export interface Budget {
  idBud: number;
  montantAlloueBud: number;
  montantConsommeBud: number;
  dateDebutBud: string; // format ISO yyyy-MM-dd
  dateFinBud: string;
  departement: {
    idDepart: number;
    nomDepart: string;
    categorieDepart: CategorieDepart;
  };
}

export interface BudgetRequest {
  montantAlloueBud: number;
  dateDebutBud: string;
  dateFinBud: string;
  departementId: number;
}

export interface EstimationBudgetResponse {
  montantEstime: number;
  justification: string;
  niveauConfiance: 'FAIBLE' | 'MOYEN' | 'ELEVE';
}

export interface PredictionDepassementResponse {
  vaDepasser: boolean;
  montantProjete: number;
  justification: string;
}
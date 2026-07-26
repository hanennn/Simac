export interface Budget {
  idBud: number;
  montantAlloueBud: number;
  montantConsommeBud: number;
  dateDebutBud: string; // format ISO yyyy-MM-dd
  dateFinBud: string;
  departement: {
    idDepart: number;
    nomDepart: string;
    categorieDepart: string;
  };
}

export interface BudgetRequest {
  montantAlloueBud: number;
  dateDebutBud: string;
  dateFinBud: string;
  departementId: number;
}
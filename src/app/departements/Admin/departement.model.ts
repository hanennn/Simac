export interface Departement {
  idDepart: number;
  nomDepart: string;
  descDepart: string;
  categorieDepart: {
    idCategorie: number;
    nomCategorie: string;
  };
}

export interface DepartementRequest {
  nomDepart: string;
  descDepart: string;
  categorieId: number;
}

export const CATEGORIES_DEPARTEMENT: string[] = [
  'ADMINISTRATIF',
  'COMMERCIAL',
  'FINANCIER',
  'RESSOURCES HUMAINES'
];
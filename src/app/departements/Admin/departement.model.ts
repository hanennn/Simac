export interface Departement {
  idDepart: number;
  nomDepart: string;
  descDepart: string;
  categorieDepart: string;
}

export interface DepartementRequest {
  nomDepart: string;
  descDepart: string;
  categorieDepart: string;
}

export const CATEGORIES_DEPARTEMENT: string[] = [
  'ADMINISTRATIF',
  'COMMERCIAL',
  'FINANCIER',
  'RESSOURCES HUMAINES'
];
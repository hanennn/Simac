//struct departement

export interface Departement {
  idDepart: number;
  nomDepart: string;
  descDepart: string;
  categorieDepart: {
    idCategorie: number;
    nomCategorie: string;
  };
}
//ce qu'on envoie au backend pour créer/modifier
export interface DepartementRequest {
  nomDepart: string;
  descDepart: string;
  categorieId: number;
}
//const
export const CATEGORIES_DEPARTEMENT: string[] = [
  'ADMINISTRATIF',
  'COMMERCIAL',
  'FINANCIER',
  'RESSOURCES HUMAINES'
];
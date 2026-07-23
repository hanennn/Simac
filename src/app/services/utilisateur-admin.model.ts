export interface Utilisateur {
  idUser: number;
  nomUser: string;
  prenomUser: string;
  email: string;
  role: string;
  departement: { idDepart: number; nomDepart: string } | null;
}

export interface UtilisateurRequest {
  nomUser: string;
  prenomUser: string;
  email: string;
  role: string;
  departementId: number | null;
}

export const ROLES_UTILISATEUR: string[] = [
  'ADMIN',
  'CHEF_DEPARTEMENT',
  'RESPONSABLE_FINANCIER'
];
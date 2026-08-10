export interface Produit {
  id: number;
  name: string;
  list_price: number;
  categ_id: [number, string];
}
export interface ProduitRequest {
  nom: string;
  prix: number;
  categorie: string;
  description: string;
  categorieDepense: string;
}
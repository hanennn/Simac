package org.example.simac.service;

import org.apache.xmlrpc.client.XmlRpcClient;
import org.apache.xmlrpc.client.XmlRpcClientConfigImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.example.simac.dto.LigneAchatRequest;
import java.util.ArrayList;

import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OdooClientService {

    @Value("${odoo.url}")
    private String odooUrl;

    @Value("${odoo.db}")
    private String odooDb;

    @Value("${odoo.username}")
    private String odooUsername;

    @Value("${odoo.password}")
    private String odooPassword;

    private Integer uid;

    //se connecte à Odoo
    public Integer authentifier() throws Exception {
        if (uid != null) {
            return uid;
        }
        //@ où envoyer demande de cnx à Odoo.
        XmlRpcClientConfigImpl config = new XmlRpcClientConfigImpl();
        config.setServerURL(new URL(odooUrl + "/xmlrpc/2/common"));
        XmlRpcClient client = new XmlRpcClient();
        client.setConfig(config);
        //donne db, mail, mdp
        Object result = client.execute("authenticate", Arrays.asList(
                odooDb, odooUsername, odooPassword, java.util.Collections.emptyMap()
        ));

        this.uid = (Integer) result;
        return uid;
    }
    //comment parler à odoo
    public XmlRpcClient obtenirClientObjet() throws Exception {
        XmlRpcClientConfigImpl config = new XmlRpcClientConfigImpl();
        config.setServerURL(new URL(odooUrl + "/xmlrpc/2/object")); //@ odoo
        XmlRpcClient client = new XmlRpcClient(); //cree obj client
        client.setConfig(config);
        return client;
    }

    // Republie standard_price (cout d'achat, le vrai champ pertinent pour SIMAC)
    // sous la cle "list_price" attendue par le frontend Angular, sans avoir a le modifier
    private Map<String, Object> renommerPrixAchat(Map<String, Object> produit) {
        Map<String, Object> copie = new HashMap<>(produit);
        Object prixAchat = copie.remove("standard_price");
        copie.put("list_price", prixAchat != null ? prixAchat : 0);
        return copie;
    }

    //interroger Odoo pour récupérer la liste des produits
    public List<Map<String, Object>> listerProduitsParCategorie(String nomCategorie) throws Exception {
        Integer userId = authentifier();
        XmlRpcClient client = obtenirClientObjet();

        // Le produit doit soit appartenir a la categorie du departement, soit etre dans "All" (visible partout)
        List<Object> domaine = Arrays.asList(
                Arrays.asList("categ_id.name", "in", Arrays.asList(nomCategorie, "All")),
                Arrays.asList("purchase_ok", "=", true)
        );

        Map<String, Object> options = Map.of("fields", Arrays.asList("id", "name", "standard_price", "categ_id"));

        Object[] result = (Object[]) client.execute("execute_kw", Arrays.asList(
                odooDb, userId, odooPassword,
                "product.product", "search_read",
                Arrays.asList(domaine), options
        ));

        return Arrays.stream(result)
                .map(item -> (Map<String, Object>) item)
                .map(this::renommerPrixAchat)
                .collect(Collectors.toList());
    }
    public Integer creerCommandeAchat(List<LigneAchatRequest> lignes, String nomCategorie) throws Exception {
        Integer userId = authentifier();
        XmlRpcClient client = obtenirClientObjet();

        Object[] utilisateurData = (Object[]) client.execute("execute_kw", Arrays.asList(
                odooDb, userId, odooPassword,
                "res.users", "read",
                Arrays.asList(Arrays.asList(userId), Arrays.asList("company_id"))
        ));
        Map<String, Object> userInfo = (Map<String, Object>) utilisateurData[0];
        Object[] companyField = (Object[]) userInfo.get("company_id");
        Integer companyId = (Integer) companyField[0];

        // Categorie de depense : on prend celle du premier produit qui en a une
        // (simplification si le panier melange plusieurs categories de depense)
        String categorieDepense = null;
        for (LigneAchatRequest ligne : lignes) {
            Object[] produitData = (Object[]) client.execute("execute_kw", Arrays.asList(
                    odooDb, userId, odooPassword,
                    "product.product", "read",
                    Arrays.asList(Arrays.asList(ligne.getProduitId()), Arrays.asList("x_categorie_depense"))
            ));
            Map<String, Object> produitInfo = (Map<String, Object>) produitData[0];
            Object valeur = produitInfo.get("x_categorie_depense");
            if (valeur instanceof String && categorieDepense == null) {
                categorieDepense = (String) valeur;
            }
        }

        Object[] fournisseurs = (Object[]) client.execute("execute_kw", Arrays.asList(
                odooDb, userId, odooPassword,
                "res.partner", "search",
                Arrays.asList(Arrays.asList(Arrays.asList("supplier_rank", ">", 0))),
                Map.of("limit", 1)
        ));

        if (fournisseurs.length == 0) {
            throw new RuntimeException("Aucun fournisseur disponible dans Odoo");
        }
        Integer fournisseurId = (Integer) fournisseurs[0];

        // Une ligne de commande par produit du panier
        List<Object> lignesCommande = new ArrayList<>();
        for (LigneAchatRequest ligne : lignes) {
            Map<String, Object> ligneCommande = new HashMap<>();
            ligneCommande.put("product_id", ligne.getProduitId());
            ligneCommande.put("product_qty", ligne.getQuantite());
            ligneCommande.put("name", "Achat via SIMAC");
            lignesCommande.add(Arrays.asList(0, 0, ligneCommande));
        }

        Map<String, Object> commande = new HashMap<>();
        commande.put("partner_id", fournisseurId);
        commande.put("company_id", companyId);
        commande.put("x_departement", nomCategorie);
        if (categorieDepense != null) {
            commande.put("x_categorie_depense", categorieDepense);
        }
        commande.put("order_line", lignesCommande);

        Object resultat = client.execute("execute_kw", Arrays.asList(
                odooDb, userId, odooPassword,
                "purchase.order", "create",
                Arrays.asList(Arrays.asList(commande))
        ));

        Integer commandeId;
        if (resultat instanceof Object[]) {
            commandeId = (Integer) ((Object[]) resultat)[0];
        } else {
            commandeId = (Integer) resultat;
        }

        client.execute("execute_kw", Arrays.asList(
                odooDb, userId, odooPassword,
                "purchase.order", "button_confirm",
                Arrays.asList(Arrays.asList(commandeId))
        ));

        return commandeId;
    }







    // --- Ajout pour le Gestionnaire de produits (parametrage des produits) ---

    public Integer creerProduit(String nom, double prix, String nomCategorie, String description, String categorieDepense) throws Exception {
        Integer userId = authentifier();
        XmlRpcClient client = obtenirClientObjet();

        Object[] categories = (Object[]) client.execute("execute_kw", Arrays.asList(
                odooDb, userId, odooPassword,
                "product.category", "search",
                Arrays.asList(Arrays.asList(Arrays.asList("name", "=", nomCategorie))),
                Map.of("limit", 1)
        ));

        if (categories.length == 0) {
            throw new RuntimeException("Categorie Odoo introuvable : " + nomCategorie);
        }
        Integer categorieId = (Integer) categories[0];

        Map<String, Object> produit = new HashMap<>();
        produit.put("name", nom);
        produit.put("standard_price", prix);
        produit.put("categ_id", categorieId);
        produit.put("purchase_ok", true);
        if (description != null && !description.isBlank()) {
            produit.put("description", description);
        }
        if (categorieDepense != null && !categorieDepense.isBlank()) {
            produit.put("x_categorie_depense", categorieDepense);
        }

        Object resultat = client.execute("execute_kw", Arrays.asList(
                odooDb, userId, odooPassword,
                "product.product", "create",
                Arrays.asList(Arrays.asList(produit))
        ));

        Integer produitId;
        if (resultat instanceof Object[]) {
            produitId = (Integer) ((Object[]) resultat)[0];
        } else {
            produitId = (Integer) resultat;
        }

        return produitId;
    }

    public void modifierProduit(Integer produitId, String nom, double prix, String description) throws Exception {
        Integer userId = authentifier();
        XmlRpcClient client = obtenirClientObjet();

        Map<String, Object> valeurs = new HashMap<>();
        if (nom != null) valeurs.put("name", nom);
        valeurs.put("standard_price", prix);
        if (description != null) valeurs.put("description", description);

        client.execute("execute_kw", Arrays.asList(
                odooDb, userId, odooPassword,
                "product.product", "write",
                Arrays.asList(Arrays.asList(produitId), valeurs)
        ));
    }

    public void archiverProduit(Integer produitId) throws Exception {
        Integer userId = authentifier();
        XmlRpcClient client = obtenirClientObjet();

        // Odoo n'a pas de "suppression" simple recommandee : on desactive le produit (active=false)
        client.execute("execute_kw", Arrays.asList(
                odooDb, userId, odooPassword,
                "product.product", "write",
                Arrays.asList(Arrays.asList(produitId), Map.of("active", false))
        ));
    }

    public List<Map<String, Object>> listerTousProduits() throws Exception {
        Integer userId = authentifier();
        XmlRpcClient client = obtenirClientObjet();

        List<Object> domaine = Arrays.asList(
                Arrays.asList("purchase_ok", "=", true)
        );

        Map<String, Object> options = Map.of("fields", Arrays.asList("id", "name", "standard_price", "categ_id", "x_categorie_depense", "active"));

        Object[] result = (Object[]) client.execute("execute_kw", Arrays.asList(
                odooDb, userId, odooPassword,
                "product.product", "search_read",
                Arrays.asList(domaine), options
        ));

        return Arrays.stream(result)
                .map(item -> (Map<String, Object>) item)
                .map(this::renommerPrixAchat)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> listerProduitsArchives() throws Exception {
        Integer userId = authentifier();
        XmlRpcClient client = obtenirClientObjet();

        List<Object> domaine = Arrays.asList(
                Arrays.asList("active", "=", false)
        );

        Map<String, Object> options = Map.of("fields", Arrays.asList("id", "name", "standard_price", "categ_id", "x_categorie_depense"));

        Object[] result = (Object[]) client.execute("execute_kw", Arrays.asList(
                odooDb, userId, odooPassword,
                "product.product", "search_read",
                Arrays.asList(domaine), options
        ));

        return Arrays.stream(result)
                .map(item -> (Map<String, Object>) item)
                .map(this::renommerPrixAchat)
                .collect(Collectors.toList());
    }

    public void restaurerProduit(Integer produitId) throws Exception {
        Integer userId = authentifier();
        XmlRpcClient client = obtenirClientObjet();

        client.execute("execute_kw", Arrays.asList(
                odooDb, userId, odooPassword,
                "product.product", "write",
                Arrays.asList(Arrays.asList(produitId), Map.of("active", true))
        ));
    }
}
package org.example.simac.service;

import org.apache.xmlrpc.client.XmlRpcClient;
import org.apache.xmlrpc.client.XmlRpcClientConfigImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

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

    public Integer authentifier() throws Exception {
        if (uid != null) {
            return uid;
        }

        XmlRpcClientConfigImpl config = new XmlRpcClientConfigImpl();
        config.setServerURL(new URL(odooUrl + "/xmlrpc/2/common"));
        XmlRpcClient client = new XmlRpcClient();
        client.setConfig(config);

        Object result = client.execute("authenticate", Arrays.asList(
                odooDb, odooUsername, odooPassword, java.util.Collections.emptyMap()
        ));

        this.uid = (Integer) result;
        return uid;
    }

    public XmlRpcClient obtenirClientObjet() throws Exception {
        XmlRpcClientConfigImpl config = new XmlRpcClientConfigImpl();
        config.setServerURL(new URL(odooUrl + "/xmlrpc/2/object"));
        XmlRpcClient client = new XmlRpcClient();
        client.setConfig(config);
        return client;
    }

    public List<Map<String, Object>> listerProduitsParCategorie(String nomCategorie) throws Exception {
        Integer userId = authentifier();
        XmlRpcClient client = obtenirClientObjet();

        // Filtre : produits de cette catégorie, achetables uniquement
        List<Object> domaine = Arrays.asList(
                Arrays.asList("categ_id.name", "=", nomCategorie),
                Arrays.asList("purchase_ok", "=", true)
        );

        Map<String, Object> options = Map.of("fields", Arrays.asList("id", "name", "list_price", "categ_id"));

        Object[] result = (Object[]) client.execute("execute_kw", Arrays.asList(
                odooDb, userId, odooPassword,
                "product.product", "search_read",  // <-- changé de product.template à product.product
                Arrays.asList(domaine), options
        ));

        return Arrays.stream(result)
                .map(item -> (Map<String, Object>) item)
                .collect(Collectors.toList());
    }


    public Integer creerCommandeAchat(Integer produitId, Integer quantite, String nomCategorie) throws Exception {
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

        Map<String, Object> ligneCommande = new HashMap<>();
        ligneCommande.put("product_id", produitId);
        ligneCommande.put("product_qty", quantite);
        ligneCommande.put("name", "Achat via SIMAC");

        Map<String, Object> commande = new HashMap<>();
        commande.put("partner_id", fournisseurId);
        commande.put("company_id", companyId);
        commande.put("x_departement", nomCategorie); // <-- ajout direct, sans dépendre des groupes
        commande.put("order_line", Arrays.asList(Arrays.asList(0, 0, ligneCommande)));

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
    }}
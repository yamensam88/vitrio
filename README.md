# Vitrio - Plateforme SaaS de Pare-Brise

**Vitrio** est une plateforme complète de comparaison et de réservation pour le remplacement de vitrage automobile, connectant les conducteurs (B2C) et les garages partenaires (B2B).

![Vitrio Banner](public/images/garage1.jpg) *Note: Image placeholder*

## 🚀 Fonctionnalités

### Pour les Conducteurs (B2C)
- **Géolocalisation** : Trouvez instantanément les garages autour de vous.
- **Comparateur** : Filtrez par prix, distance et disponibilité.
- **Réservation Digitale** : Parcours en 4 étapes avec upload de documents (Carte Grise, Assurance).
- **SEO Local** : Pages dédiées pour chaque ville (ex: `/garage-pare-brise/paris`).

### Pour les Garages (B2B)
- **Portail Partenaire** : Page d'acquisition dédiée (`/pro`).
- **Dashboard de Gestion** : Suivi des rendez-vous en temps réel.
- **Facturation Simplifiée** : Validation des prestations en un clic.

### Pour l'Administration
- **Back-office** : Validation et modération des nouveaux garages inscrits.
- **Statistiques** : Vue globale de l'activité.

## 🛠 Stack Technique

- **Framework** : Next.js 14+ (App Router)
- **Langage** : TypeScript
- **Styling** : CSS Modules / Variables (Design System "Clinique")
- **État** : React Context (Architecture sans backend pour démo)
- **Date** : date-fns

## 📦 Installation & Démarrage

1.  **Cloner le projet**
    ```bash
    git clone https://github.com/votre-repo/vitrio.git
    cd vitrio
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Lancer le serveur de développement**
    ```bash
    npm run dev
    ```

4.  **Accéder à l'application**
    - Client : `http://localhost:3000`
    - Pro : `http://localhost:3000/pro`
    - Admin : `http://localhost:3000/admin/dashboard`

## 🧪 Scénario de Démonstration (Demo Mode)

L'application tourne en mode "Demo Unifiée" grâce à un `AppContext`.
1.  Ouvrez Dashboard Pro et Client dans deux fenêtres.
2.  Réservez côté Client.
3.  Voyez la mise à jour instantanée côté Pro.

---
*Fait avec ❤️ par l'équipe Vitrio.*

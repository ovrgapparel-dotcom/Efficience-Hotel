// AIEngine.js
// A local "Expert System" rules engine designed to securely parse ERP metrics offline
// and generate human-readable executive insights without costly external LLM APIs.

export const AIEngine = {
  analyze: (data) => {
    const { roomsData, restaurantData, hrData, financeData } = data;
    const insights = [];

    // Base metrics aggregation
    const CA_Hebergement = roomsData.reduce((acc, row) => acc + (row.total || 0), 0);
    const totalChambres = 40;
    const chambresOccupees = new Set(roomsData.map(r => r.chambreNo)).size;
    const tauxOcc = totalChambres > 0 ? (chambresOccupees / totalChambres) * 100 : 0;

    const CA_Restaurant = restaurantData.reduce((acc, row) => acc + (row.ventes || 0), 0);
    const Cout_Mat = restaurantData.reduce((acc, row) => acc + (row.coutMatiere || 0), 0);
    const foodCost = CA_Restaurant > 0 ? (Cout_Mat / CA_Restaurant) * 100 : 0;

    const CA_Total = CA_Hebergement + CA_Restaurant;
    const Couts_RH = hrData.reduce((acc, row) => acc + (row.salaire || 0), 0);
    const ratioMasse = CA_Total > 0 ? (Couts_RH / CA_Total) * 100 : 0;

    const Autres_Revenus = financeData.filter(d => d.type === 'Revenu').reduce((acc, row) => acc + (row.montant || 0), 0);
    const Autres_Couts = financeData.filter(d => d.type === 'Coût').reduce((acc, row) => acc + (row.montant || 0), 0);
    const EBITDA = CA_Total + Autres_Revenus - Couts_RH - Autres_Couts;
    const Marge = CA_Total > 0 ? (EBITDA / CA_Total) * 100 : 0;

    // Rules Processing
    if (CA_Total === 0 && hrData.length === 0) {
      return [{
        title: "Intelligence en Attente",
        text: "Le moteur IA requiert des données opérationnelles pour générer des insights. Veuillez enregistrer des revenus ou des dépenses.",
        severity: "neutral",
        icon: "brain",
        action: "Saisir des données"
      }];
    }

    // 1. Profitability Rule
    if (Marge >= 30) {
      insights.push({
        title: "Hyper-Rentabilité",
        text: `Votre marge EBITDA de ${Marge.toFixed(1)}% surpasse les standards de l'industrie hôtelière (25-30%). La structure de vos coûts est remarquablement saine.`,
        severity: "good",
        icon: "chart-line",
        action: "Maintenir le cap"
      });
    } else if (Marge > 0 && Marge < 20) {
      insights.push({
        title: "Marge Sous-Performante",
        text: `La marge EBITDA actuelle de ${Marge.toFixed(1)}% est en deçà du seuil critique (20%). Une revue immédiate des coûts fixes est recommandée.`,
        severity: "bad",
        icon: "exclamation-triangle",
        action: "Auditer les dépenses"
      });
    } else if (Marge < 0) {
      insights.push({
        title: "Déficit Opérationnel (URGENT)",
        text: `Vos sorties de trésorerie globales dépassent vos flux entrants, entraînant une marge de ${Marge.toFixed(1)}%. Ce rythme risque de causer une crise de liquidités.`,
        severity: "critical",
        icon: "skull-crossbones",
        action: "Bloquer les dépenses"
      });
    }

    // 2. HR Management
    if (ratioMasse > 40) {
      insights.push({
        title: "Surchauffe Salariale",
        text: `Le ratio masse salariale/CA atteint ${ratioMasse.toFixed(1)}% (Cible optimale: <35%). Vos plannings sont actuellement sur-staffés par rapport à votre volume d'activity réel.`,
        severity: "critical",
        icon: "users",
        action: "Optimiser les plannings"
      });
    } else if (ratioMasse > 0 && ratioMasse <= 30) {
      insights.push({
        title: "Efficience Salariale",
        text: `Avec ${ratioMasse.toFixed(1)}% de ratio RH, le rendement des équipes est maximal face au CA généré.`,
        severity: "good",
        icon: "check-circle",
        action: "Féliciter l'équipe"
      });
    }

    // 3. F&B Analysis
    if (CA_Restaurant > 0) {
      if (foodCost > 33) {
        insights.push({
          title: "Fuite de Trésorerie F&B",
          text: `Le ratio matières (Food Cost) au restaurant est de ${foodCost.toFixed(1)}%. Il y a probablement du gaspillage, des vols, ou un mauvais calibrage des portions (Standard: 28-30%).`,
          severity: "bad",
          icon: "utensils",
          action: "Auditer la cuisine"
        });
      } else {
        insights.push({
          title: "Contrôle Qualité F&B",
          text: `Ratio matières maîtrisé (${foodCost.toFixed(1)}%). Les portions sont bien calibrées.`,
          severity: "good",
          icon: "utensils",
          action: "Valider les menus"
        });
      }
    }

    // 4. Yield Management
    if (tauxOcc < 50 && tauxOcc > 0) {
      insights.push({
        title: "Yield Marketing Requis",
        text: `Occupation dangereusement basse (${tauxOcc.toFixed(1)}%). L'Intelligence recommande de lancer des offres promotionnelles 'Last Minute' ou d'ajuster les prix dynamiquement pour la nuit prochaine.`,
        severity: "bad",
        icon: "bullhorn",
        action: "Ajuster les tarifs"
      });
    }

    return insights;
  }
};

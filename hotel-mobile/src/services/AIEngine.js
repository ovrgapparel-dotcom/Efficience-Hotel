// AIEngine.js
// Cross-department expert system: correlates bookings, housekeeping, supplies, HR, and financials
// to generate holistic executive intelligence without external APIs.

export const AIEngine = {
  analyze: (data) => {
    const { roomsData, restaurantData, hrData, financeData, housekeepingData, consumablesData } = data;
    const insights = [];

    // ── Base Metrics ──
    const CA_Hebergement = roomsData.reduce((acc, row) => acc + (row.total || 0), 0);
    const totalChambres = 40;
    const chambresOccupees = new Set(roomsData.map(r => r.chambreNo)).size;
    const tauxOcc = totalChambres > 0 ? (chambresOccupees / totalChambres) * 100 : 0;
    const totalNuits = roomsData.reduce((acc, row) => acc + (row.nuits || 0), 0);

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

    // ── Housekeeping Metrics ──
    const hkTasks = housekeepingData || [];
    const pendingTasks = hkTasks.filter(t => !t.completed);
    const completedTasks = hkTasks.filter(t => t.completed);
    const totalCleaningMins = hkTasks.reduce((a, t) => a + (t.cleaningTime || 0), 0);
    const totalSuppliesUsed = hkTasks.reduce((a, t) => a + (t.suppliesUsed || 0), 0);

    // ── Cleaning Supply Metrics ──
    const allConsumables = consumablesData || [];
    const cleaningSupplies = allConsumables.filter(c => c.categorie === 'Nettoyage');
    const totalCleaningStock = cleaningSupplies.reduce((a, c) => a + c.qte, 0);
    const totalCleaningSold = cleaningSupplies.reduce((a, c) => a + (c.sold || 0), 0);
    const cleaningRemaining = totalCleaningStock - totalCleaningSold;

    // ── No data guard ──
    if (CA_Total === 0 && hrData.length === 0 && hkTasks.length === 0) {
      return [{
        title: "Intelligence en Attente",
        text: "Le moteur IA requiert des données opérationnelles pour générer des insights. Veuillez enregistrer des revenus, réservations ou dépenses.",
        severity: "neutral",
        icon: "brain",
        action: "Saisir des données"
      }];
    }

    // ══════════════════════════════════════════════
    // RULE 1: Profitability 
    // ══════════════════════════════════════════════
    if (Marge >= 30) {
      insights.push({
        title: "Hyper-Rentabilité",
        text: `Marge EBITDA de ${Marge.toFixed(1)}% — surpasse les standards hôteliers (25-30%). Structure de coûts excellente.`,
        severity: "good", icon: "chart-line", action: "Maintenir le cap"
      });
    } else if (Marge > 0 && Marge < 20) {
      insights.push({
        title: "Marge Sous-Performante",
        text: `Marge EBITDA de ${Marge.toFixed(1)}% — en deçà du seuil critique (20%). Revue des coûts fixes recommandée.`,
        severity: "bad", icon: "exclamation-triangle", action: "Auditer les dépenses"
      });
    } else if (Marge < 0) {
      insights.push({
        title: "Déficit Opérationnel (URGENT)",
        text: `Marge négative de ${Marge.toFixed(1)}%. Les sorties dépassent les entrées — risque de crise de liquidités.`,
        severity: "critical", icon: "skull-crossbones", action: "Bloquer les dépenses"
      });
    }

    // ══════════════════════════════════════════════
    // RULE 2: Booking ↔ Housekeeping Correlation
    // ══════════════════════════════════════════════
    if (roomsData.length > 0 && hkTasks.length > 0) {
      const bookingToCleanRatio = hkTasks.length / roomsData.length;
      if (bookingToCleanRatio < 0.8) {
        insights.push({
          title: "Décalage Réservations / Nettoyage",
          text: `Seulement ${(bookingToCleanRatio * 100).toFixed(0)}% des réservations ont déclenché un cycle de nettoyage. ${roomsData.length - hkTasks.length} chambre(s) non couvertes par le calendrier d'entretien.`,
          severity: "bad", icon: "broom",
          action: "Synchroniser les workflows"
        });
      } else {
        insights.push({
          title: "Synergie Réservations ↔ Entretien",
          text: `${hkTasks.length} tâches de nettoyage pour ${roomsData.length} réservations — couverture de ${(bookingToCleanRatio * 100).toFixed(0)}%. Le calendrier d'entretien est parfaitement synchronisé avec les check-ins.`,
          severity: "good", icon: "sync",
          action: "Rotation optimale"
        });
      }
    }

    // ══════════════════════════════════════════════
    // RULE 3: Cleaning Supply Allocation Intelligence
    // ══════════════════════════════════════════════
    if (totalCleaningStock > 0) {
      const usageRate = totalCleaningSold / totalCleaningStock;
      const daysOfSupply = pendingTasks.length > 0 ? Math.floor(cleaningRemaining / pendingTasks.length) : cleaningRemaining;

      if (cleaningRemaining < 10) {
        insights.push({
          title: "Alerte Stock Nettoyage 🚨",
          text: `Il ne reste que ${cleaningRemaining} unité(s) de fournitures de nettoyage. Avec ${pendingTasks.length} chambre(s) en attente, le stock sera épuisé en ~${daysOfSupply} rotation(s). Commander immédiatement.`,
          severity: "critical", icon: "pump-soap",
          action: "Commander d'urgence"
        });
      } else if (usageRate > 0.6) {
        insights.push({
          title: "Fournitures en Consommation Rapide",
          text: `${(usageRate * 100).toFixed(0)}% du stock nettoyage consommé. Estimation: ${daysOfSupply} rotation(s) restantes avant rupture. Planifier le réassort.`,
          severity: "bad", icon: "pump-soap",
          action: "Planifier commande"
        });
      } else if (totalSuppliesUsed > 0) {
        insights.push({
          title: "Fournitures Entretien Stables",
          text: `Stock nettoyage à ${(100 - usageRate * 100).toFixed(0)}% de capacité. ${totalSuppliesUsed} unité(s) consommées pour ${hkTasks.length} intervention(s) — ratio d'allocation sain.`,
          severity: "good", icon: "check-circle",
          action: "Aucune action"
        });
      }
    }

    // ══════════════════════════════════════════════
    // RULE 4: Housekeeping Efficiency
    // ══════════════════════════════════════════════
    if (hkTasks.length > 0) {
      const avgCleaning = totalCleaningMins / hkTasks.length;
      const pendingRate = pendingTasks.length / hkTasks.length;

      if (pendingRate > 0.5) {
        insights.push({
          title: "Retard de Rotation Entretien",
          text: `${pendingTasks.length} tâche(s) en attente sur ${hkTasks.length} — taux de complétion de ${((1 - pendingRate) * 100).toFixed(0)}%. L'équipe de nettoyage est en surcharge. Considérer un renfort temporaire.`,
          severity: "bad", icon: "clock",
          action: "Renforcer l'équipe"
        });
      }

      if (avgCleaning > 45) {
        insights.push({
          title: "Temps de Nettoyage Élevé",
          text: `Moyenne de ${avgCleaning.toFixed(0)} min/chambre (standard: 30-40 min). Vérifier l'efficacité des procédures ou l'état des chambres à la remise.`,
          severity: "bad", icon: "hourglass-half",
          action: "Revoir les procédures"
        });
      }
    }

    // ══════════════════════════════════════════════
    // RULE 5: HR ↔ Occupancy Staffing Optimization
    // ══════════════════════════════════════════════
    if (ratioMasse > 40) {
      insights.push({
        title: "Surchauffe Salariale",
        text: `Ratio masse salariale/CA à ${ratioMasse.toFixed(1)}% (cible: <35%). Plannings sur-staffés par rapport au volume d'activité.`,
        severity: "critical", icon: "users",
        action: "Optimiser les plannings"
      });
    } else if (ratioMasse > 0 && ratioMasse <= 30) {
      insights.push({
        title: "Efficience Salariale",
        text: `Ratio RH de ${ratioMasse.toFixed(1)}% — rendement des équipes maximal face au CA généré.`,
        severity: "good", icon: "check-circle",
        action: "Féliciter l'équipe"
      });
    }

    // Cleaning staff vs workload correlation
    if (hrData.length > 0 && hkTasks.length > 0) {
      const cleaningStaff = hrData.filter(h => (h.poste || '').toLowerCase().includes('entretien') || (h.poste || '').toLowerCase().includes('nettoyage'));
      if (cleaningStaff.length > 0) {
        const tasksPerCleaner = hkTasks.length / cleaningStaff.length;
        if (tasksPerCleaner > 10) {
          insights.push({
            title: "Sous-Effectif Entretien",
            text: `${tasksPerCleaner.toFixed(0)} tâches par agent de nettoyage (${cleaningStaff.length} agent(s)). Seuil recommandé: 8 max. Recruter ou redistribuer.`,
            severity: "bad", icon: "user-plus",
            action: "Recruter entretien"
          });
        }
      }
    }

    // ══════════════════════════════════════════════
    // RULE 6: F&B Analysis
    // ══════════════════════════════════════════════
    if (CA_Restaurant > 0) {
      if (foodCost > 33) {
        insights.push({
          title: "Fuite de Trésorerie F&B",
          text: `Food Cost de ${foodCost.toFixed(1)}% — gaspillage ou mauvais calibrage des portions (standard: 28-30%).`,
          severity: "bad", icon: "utensils",
          action: "Auditer la cuisine"
        });
      } else {
        insights.push({
          title: "Contrôle Qualité F&B",
          text: `Food Cost maîtrisé (${foodCost.toFixed(1)}%). Portions bien calibrées.`,
          severity: "good", icon: "utensils",
          action: "Valider les menus"
        });
      }
    }

    // ══════════════════════════════════════════════
    // RULE 7: Yield Management
    // ══════════════════════════════════════════════
    if (tauxOcc < 50 && tauxOcc > 0) {
      insights.push({
        title: "Yield Marketing Requis",
        text: `Occupation à ${tauxOcc.toFixed(1)}% — lancer des offres promotionnelles 'Last Minute' ou ajuster les prix dynamiquement.`,
        severity: "bad", icon: "bullhorn",
        action: "Ajuster les tarifs"
      });
    }

    // ══════════════════════════════════════════════
    // RULE 8: Cross-Department Revenue per Cleaning Hour
    // ══════════════════════════════════════════════
    if (totalCleaningMins > 0 && CA_Total > 0) {
      const revenuePerCleanHour = CA_Total / (totalCleaningMins / 60);
      insights.push({
        title: "Rendement Revenu / Heure de Nettoyage",
        text: `Chaque heure de nettoyage génère ${revenuePerCleanHour.toFixed(0)} CFA de revenus. ${revenuePerCleanHour > 50000 ? 'Ratio exceptionnellement rentable.' : 'Optimiser l\'occupation ou réduire les temps de nettoyage pour améliorer ce ratio.'}`,
        severity: revenuePerCleanHour > 50000 ? "good" : "neutral",
        icon: "balance-scale",
        action: revenuePerCleanHour > 50000 ? "Maintenir" : "Optimiser l'occupation"
      });
    }

    return insights;
  }
};

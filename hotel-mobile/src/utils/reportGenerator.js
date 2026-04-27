/**
 * generateHotelReport
 * Builds a full HTML string for the consolidated hotel daily report.
 * Used by expo-print to render and export a PDF.
 */
export const generateHotelReport = ({ roomsData, restaurantData, hrData, financeData, date }) => {

  const CA_Hebergement = roomsData.reduce((acc, r) => acc + (r.total || 0), 0);
  const totalChambres = 40;
  const chambresOccupees = new Set(roomsData.map(r => r.chambreNo)).size;
  const tauxOcc = ((chambresOccupees / totalChambres) * 100).toFixed(1);

  const CA_Restaurant = restaurantData.reduce((acc, r) => acc + (r.ventes || 0), 0);
  const Cout_Mat = restaurantData.reduce((acc, r) => acc + (r.coutMatiere || 0), 0);
  const foodCost = CA_Restaurant > 0 ? ((Cout_Mat / CA_Restaurant) * 100).toFixed(1) : "N/A";

  const CA_Total = CA_Hebergement + CA_Restaurant;
  const Couts_RH = hrData.reduce((acc, r) => acc + (r.salaire || 0), 0);
  const Autres_Revenus = financeData.filter(d => d.type === 'Revenu').reduce((acc, r) => acc + (r.montant || 0), 0);
  const Autres_Couts = financeData.filter(d => d.type === 'Coût').reduce((acc, r) => acc + (r.montant || 0), 0);
  const EBITDA = CA_Total + Autres_Revenus - Couts_RH - Autres_Couts;
  const Marge = CA_Total > 0 ? ((EBITDA / CA_Total) * 100).toFixed(1) : "N/A";

  let daysRecorded = new Set([...roomsData.map(d => d.date), ...restaurantData.map(d => d.date)]).size || 1;
  const projCA = Math.round((CA_Total / daysRecorded) * 30).toLocaleString();
  const projEBITDA = Math.round((EBITDA / daysRecorded) * 30).toLocaleString();

  const roomRows = roomsData.map(r => `
    <tr>
      <td>${r.date}</td><td>${r.chambreNo}</td><td>${r.type || '-'}</td>
      <td>${r.client || '-'}</td><td>${r.statut}</td>
      <td>${r.prixNuit.toLocaleString()}</td><td>${r.nuits}</td><td><b>${r.total.toLocaleString()}</b></td>
    </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:#888">Aucune entrée</td></tr>';

  const restoRows = restaurantData.map(r => `
    <tr>
      <td>${r.date}</td><td>${r.service}</td><td>${r.couverts}</td>
      <td>${r.ventes.toLocaleString()}</td><td>${r.coutMatiere.toLocaleString()}</td><td>${r.foodCostPerc}%</td>
    </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:#888">Aucune entrée</td></tr>';

  const hrRows = hrData.map(r => `
    <tr>
      <td>${r.date}</td><td>${r.nom}</td><td>${r.poste || '-'}</td>
      <td>${r.heures}</td><td>${r.taux.toLocaleString()}</td><td><b>${r.salaire.toLocaleString()}</b></td>
    </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:#888">Aucune entrée</td></tr>';

  const finRows = financeData.map(r => `
    <tr>
      <td>${r.date}</td>
      <td style="color:${r.type==='Revenu'?'green':'red'}">${r.type}</td>
      <td>${r.departement}</td><td>${r.description}</td><td><b>${r.montant.toLocaleString()}</b></td><td>${r.paiement}</td>
    </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:#888">Aucune entrée</td></tr>';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Rapport Hôtelier – ${date}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 24px; color: #1a1a2e; font-size: 12px; }
    h1 { color: #0f3460; margin-bottom: 2px; }
    .subtitle { color: #888; margin-bottom: 20px; font-size: 11px; }
    .kpi-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
    .kpi-card { background: #f4f7ff; border-left: 4px solid #0f3460; padding: 10px 14px; border-radius: 6px; min-width: 140px; flex: 1; }
    .kpi-card .label { font-size: 10px; color: #666; margin-bottom: 3px; }
    .kpi-card .value { font-size: 16px; font-weight: bold; color: #0f3460; }
    .proj-box { background: #fff3f5; border-left: 4px solid #e94560; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px; }
    .proj-box h3 { color: #e94560; margin: 0 0 8px; font-size: 13px; }
    .proj-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .proj-row span:last-child { font-weight: bold; }
    h2 { color: #e94560; font-size: 13px; margin: 20px 0 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #0f3460; color: white; padding: 7px 6px; text-align: left; font-size: 11px; }
    td { padding: 6px; border-bottom: 1px solid #eee; font-size: 11px; }
    tr:nth-child(even) td { background: #f9f9f9; }
    .footer { margin-top: 30px; text-align: center; color: #aaa; font-size: 10px; border-top: 1px solid #eee; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>🏨 Efficience Hotel – Rapport Journalier</h1>
  <div class="subtitle">Généré le ${new Date().toLocaleString('fr-FR')} | Période : ${date}</div>

  <div class="kpi-grid">
    <div class="kpi-card"><div class="label">CA Total</div><div class="value">${CA_Total.toLocaleString()} CFA</div></div>
    <div class="kpi-card"><div class="label">EBITDA</div><div class="value">${EBITDA.toLocaleString()} CFA</div></div>
    <div class="kpi-card"><div class="label">Marge EBITDA</div><div class="value">${Marge} %</div></div>
    <div class="kpi-card"><div class="label">Taux d'Occup.</div><div class="value">${tauxOcc} %</div></div>
    <div class="kpi-card"><div class="label">Food Cost</div><div class="value">${foodCost} %</div></div>
    <div class="kpi-card"><div class="label">Coûts RH</div><div class="value">${Couts_RH.toLocaleString()} CFA</div></div>
  </div>

  <div class="proj-box">
    <h3>🔮 Projections Mensuelles (×30)</h3>
    <div class="proj-row"><span>CA Mensuel Projeté</span><span>${projCA} CFA</span></div>
    <div class="proj-row"><span>EBITDA Mensuel Projeté</span><span>${projEBITDA} CFA</span></div>
  </div>

  <h2>🛏 Hébergement</h2>
  <table>
    <thead><tr><th>Date</th><th>Ch N°</th><th>Type</th><th>Client</th><th>Statut</th><th>Px/Nuit</th><th>Nuits</th><th>Total (CFA)</th></tr></thead>
    <tbody>${roomRows}</tbody>
  </table>

  <h2>🍽 Restaurant</h2>
  <table>
    <thead><tr><th>Date</th><th>Service</th><th>Couverts</th><th>Ventes</th><th>Coûts Mat.</th><th>FC %</th></tr></thead>
    <tbody>${restoRows}</tbody>
  </table>

  <h2>👥 Ressources Humaines</h2>
  <table>
    <thead><tr><th>Date</th><th>Employé</th><th>Poste</th><th>Heures</th><th>Taux</th><th>Salaire J.</th></tr></thead>
    <tbody>${hrRows}</tbody>
  </table>

  <h2>💰 Finance & Trésorerie</h2>
  <table>
    <thead><tr><th>Date</th><th>Type</th><th>Poste</th><th>Description</th><th>Montant</th><th>Paiement</th></tr></thead>
    <tbody>${finRows}</tbody>
  </table>

  <div class="footer">Rapport généré par Efficience Hotel ERP – Confidentiel</div>
</body>
</html>`;
};

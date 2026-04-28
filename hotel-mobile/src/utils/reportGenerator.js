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
  <title>Rapport Hôtelier Exécutif – ${date}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap');
    * { box-sizing: border-box; font-family: 'Montserrat', sans-serif; }
    body { padding: 40px; color: #1a1a1a; font-size: 11px; background-color: #f8f9fa; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1a6b3c; padding-bottom: 15px; margin-bottom: 25px; }
    .header-logo { width: 120px; }
    h1 { color: #111; font-weight: 800; font-size: 22px; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
    .subtitle { color: #555; font-size: 10px; font-weight: 600; margin-top: 4px; }
    .kpi-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
    .kpi-card { background: #fff; border-left: 5px solid #1a6b3c; padding: 12px 16px; border-radius: 4px; min-width: 140px; flex: 1; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .kpi-card .label { font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .kpi-card .value { font-size: 18px; font-weight: 800; color: #222; }
    .chart-container { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; }
    canvas { max-width: 400px !important; max-height: 250px !important; }
    h2 { color: #1a6b3c; font-size: 14px; margin: 25px 0 10px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    th { background: #222; color: #fff; padding: 10px 8px; text-align: left; font-size: 10px; text-transform: uppercase; }
    td { padding: 8px; border-bottom: 1px solid #eee; font-size: 10px; color: #333; }
    tr:nth-child(even) td { background: #fafafa; }
    tr:last-child td { border-bottom: 2px solid #222; }
    .proj-box { background: #1a6b3c; color: #fff; padding: 16px 20px; border-radius: 6px; margin-bottom: 25px; box-shadow: 0 4px 8px rgba(26,107,60,0.2); }
    .proj-box h3 { margin: 0 0 12px; font-size: 14px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; color:#fff; }
    .proj-row { display: flex; justify-content: space-between; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px; }
    .proj-row span:last-child { font-weight: 800; font-size: 14px; }
    .footer { margin-top: 40px; text-align: center; color: #666; font-size: 9px; border-top: 1px solid #ccc; padding-top: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Rapport Exécutif</h1>
      <div class="subtitle">Généré le ${new Date().toLocaleString('fr-FR')} | Période : ${date}</div>
    </div>
    <img src="https://efficience-hotel-web.vercel.app/logo_eh.png" class="header-logo" alt="Efficience Hotel Logo" />
  </div>

  <div class="kpi-grid">
    <div class="kpi-card"><div class="label">CA Total</div><div class="value">${CA_Total.toLocaleString()} CFA</div></div>
    <div class="kpi-card"><div class="label">EBITDA</div><div class="value">${EBITDA.toLocaleString()} CFA</div></div>
    <div class="kpi-card" style="border-left-color: ${Marge >= 25 ? '#1a6b3c' : Marge < 0 ? '#d9534f' : '#f0ad4e'};"><div class="label">Marge EBITDA</div><div class="value">${Marge} %</div></div>
    <div class="kpi-card"><div class="label">Taux d'Occup.</div><div class="value">${tauxOcc} %</div></div>
    <div class="kpi-card" style="border-left-color: ${foodCost <= 30 ? '#1a6b3c' : '#d9534f'};"><div class="label">Food Cost</div><div class="value">${foodCost} %</div></div>
    <div class="kpi-card"><div class="label">Coûts RH</div><div class="value">${Couts_RH.toLocaleString()} CFA</div></div>
  </div>

  <div class="chart-container">
    <h3 style="margin:0 0 15px; font-size:12px; color:#1a6b3c; text-transform:uppercase;">Répartition par Département</h3>
    <canvas id="revenueChart"></canvas>
  </div>

  <div class="proj-box">
    <h3>Projections Mensuelles</h3>
    <div class="proj-row"><span>CA Mensuel Projeté</span><span>${projCA} CFA</span></div>
    <div class="proj-row"><span>EBITDA Mensuel Projeté</span><span>${projEBITDA} CFA</span></div>
  </div>

  <h2>Hébergement</h2>
  <table>
    <thead><tr><th>Date</th><th>Ch N°</th><th>Type</th><th>Client</th><th>Statut</th><th>Px/Nuit</th><th>Nuits</th><th>Total</th></tr></thead>
    <tbody>${roomRows}</tbody>
  </table>

  <h2>Restaurant</h2>
  <table>
    <thead><tr><th>Date</th><th>Service</th><th>Couverts</th><th>Ventes</th><th>Coûts Mat.</th><th>FC %</th></tr></thead>
    <tbody>${restoRows}</tbody>
  </table>

  <h2>Ressources Humaines</h2>
  <table>
    <thead><tr><th>Date</th><th>Employé</th><th>Poste</th><th>Heures</th><th>Taux</th><th>Salaire J.</th></tr></thead>
    <tbody>${hrRows}</tbody>
  </table>

  <h2>Finance & Trésorerie</h2>
  <table>
    <thead><tr><th>Date</th><th>Type</th><th>Poste</th><th>Description</th><th>Montant</th><th>Paiement</th></tr></thead>
    <tbody>${finRows}</tbody>
  </table>

  <div class="footer">Propulsé par IMI Business Solutions • Confidentiel</div>

  <script>
    const ctx = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Hébergement', 'Restauration', 'Autres Revenus'],
        datasets: [{
          data: [${CA_Hebergement}, ${CA_Restaurant}, ${Autres_Revenus}],
          backgroundColor: ['#1a6b3c', '#d98a29', '#f0ad4e'],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 1500, easing: 'easeOutQuart' },
        plugins: {
          legend: { position: 'bottom', labels: { font: { family: 'Montserrat', size: 10, weight: 'bold' } } }
        }
      }
    });
  </script>
</body>
</html>`;
};

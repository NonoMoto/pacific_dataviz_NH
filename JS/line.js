const indicatorsMapBis = {
  VC_DSR_AFFCT: ["🌪️ Catastrophes Naturelles", "Nombre de personnes touchées lors de catastrophes (<strong>unités</strong>)"],
  SPC_7_b_1: ["⚡ Énergie Renouvelable", "Capacité installée du parc d’énergie renouvelable (<strong>watts/habitant</strong>)"],
  SH_TBS_INCD: ["🦠 Incidence Tuberculose", "Incidence de la tuberculose (<strong>pour 100 000 habitants</strong>)"],
  EG_ACS_ELEC: ["💡 Accès Électricité", "Proportion de la population ayant accès à l’électricité (<strong>en %</strong>)"],
  IT_NET_BBND: ["📶 Connexion Haut Débit", "Abonnements à une connexion à haut débit fixe (<strong>pour 100 habitants</strong>)"],
  EG_FEC_RNEW: ["🔋 Mix Énergétique", "Part de l’énergie renouvelable dans la consommation finale d’énergie (<strong>en %</strong>)"],
  SL_TLF_UEM: ["📉 Taux de Chômage", "Taux de chômage (<strong>en %</strong>)"],
  SH_STA_BRTC: ["🤱 Accouchements Assistés", "Proportion d’accouchements assistés par du personnel de santé qualifié (<strong>en %</strong>)"]
};

const indicatorsDesc = {
  ...indicatorsMap,
  ...indicatorsMapBis
};

let dataCurves = [];

const correlatedIndicators = {
  'CK': { main: 'SH_MED_DEN', correlated: ['IT_USE_ii99'] },
  'NU': { main: 'SH_DYN_MORT', correlated: ['IT_USE_ii99'] },
  'PW': { main: 'SH_DYN_MORT', correlated: ['VC_DSR_AFFCT'] },
  'TV': { main: 'SH_DYN_MORT', correlated: ['IT_USE_ii99'] },
  'KI': { main: 'SPC_7_b_1', correlated: ['IT_USE_ii99'] },
  'NC': { main: 'SH_TBS_INCD', correlated: ['VC_DSR_AFFCT'] },
  'MH': { main: 'SH_DYN_MORT', correlated: ['EG_ACS_ELEC'] },
  'FM': { main: 'IT_NET_BBND', correlated: ['EG_ACS_ELEC'] },
  'TO': { main: 'SPC_7_b_1', correlated: ['IT_USE_ii99'] },
  'PF': { main: 'SPC_7_b_1', correlated: ['IT_USE_ii99'] },
  'VU': { main: 'EG_FEC_RNEW', correlated: ['SPC_7_b_1'] },
  'SB': { main: 'EG_ACS_ELEC', correlated: ['SH_DYN_MORT', 'SH_STA_MORT'] },
  'FJ': { main: 'SPC_7_b_1', correlated: ['IT_USE_ii99'] },
  'NR': { main: 'SPC_7_b_1', correlated: ['SL_TLF_UEM'] },
  'WS': { main: 'SH_STA_MORT', correlated: ['SH_STA_BRTC'] },
  'PG': { main: 'SH_MED_DEN', correlated: ['IT_USE_ii99', 'EG_ACS_ELEC'] }
};


const uniqueIndicators = Array.from(new Set([
  ...Object.values(correlatedIndicators).map(data => data.main),
  ...Object.values(correlatedIndicators).flatMap(data => data.correlated)
]));

const dataset = {};

d3.dsv(";", "DATA/toutes_thematiques.csv", row => {
  // Ici on retourne uniquement les lignes d'indicateurs qui nous intéressent
  if (uniqueIndicators.includes(row.INDICATOR)) {
    return {
      island: row.GEO_PICT,
      year : row.TIME_PERIOD,
      indicator: row.INDICATOR,
      indicName: "test",
      indicDesc: row.Indicateur,
      value: parseFloat(row.OBS_VALUE)
    };
  }
  // sinon on retourne null pour ignorer la ligne
  return null;
}).then(data => {
  // data contient un tableau avec des objets ou null (filtrer les null)
  const filteredData = data.filter(d => d !== null);

    // Object pour accumuler les sommes et comptes
  const grouped = {};

  filteredData.forEach(d => {

    const key = "".concat(d.island, "*", d.indicator, "*", d.year);

    if (!grouped[key]) {
      grouped[key] = { island: d.island, year: d.year, indicator: d.indicator, indicName: d.indicName, indicDesc: d.indicDesc, sum: 0, count: 0 };
    }

    grouped[key].sum += d.value;
    grouped[key].count += 1;
  });

  averagedData = Object.values(grouped).map(g => ({
    island: g.island,
    year: g.year,
    indicator: g.indicator,
    indicName: g.indicName,
    indicDesc: g.indicDesc,
    averageValue: g.sum / g.count
  }));

  const dataByIndicator = d3.group(averagedData, d => d.indicator);

  for (const [indicator, entries] of dataByIndicator.entries()) {
    dataset[indicator] = entries.map(entry => ({
      island: entry.island,
      year: entry.year,
      indicator: entry.indicator,
      indicName: entry.indicName,
      indicDesc: entry.indicDesc,
      value: entry.averageValue
    }));
  }

});

////////////////////////////
////// GRAPHIQUE ///////////
////////////////////////////

function updateLineChart() {

  for (const indicator in dataset) {
    dataset[indicator].sort((a, b) => Number(a.year) - Number(b.year));
  }

  if(document.getElementById('elementLineChart')) {
    document.getElementById('elementLineChart').remove();
  }

  if(document.getElementById('elementTextLineChart')) {
    document.getElementById('elementTextLineChart').remove();
  }

  const svg = d3.select("#lineChart"),
        margin = {top: 20, right: 60, bottom: 30, left: 60},
        lineChartWidth = +svg.attr("width") - margin.left - margin.right,
        lineChartHeight = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`).attr("id", "elementLineChart");

  const hoverLine = svg.append("line")
    .attr("stroke", "#CCC")
    .attr("stroke-width", 1)
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .attr("y1", 0)
    .attr("y2", lineChartHeight)
    .attr("visibility", "hidden");

  svg.append("rect")
    .attr("width", lineChartWidth)
    .attr("height", lineChartHeight)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);

  const lineChartTooltip = d3.select("#lineChart-tooltip");

  const ind1Info = d3.select(".ind1-info-title");
  const ind2Select = d3.select("#ind2");
  const indicators = correlatedIndicators[mainIslandCode].main;

  ind1Info.attr("id", correlatedIndicators[mainIslandCode].main).text(indicatorsDesc[correlatedIndicators[mainIslandCode].main][0]);

  const selected1 = ind1Info.attr("id");
  ind2Select.selectAll("option").remove();

  const correlated = correlatedIndicators[mainIslandCode].correlated || [];

  ind2Select.attr("disabled", correlated.length == 1 ? true : null);

  correlated.forEach(ind => {
    if (dataset[ind]) {
      ind2Select.append("option").attr("value", ind).text(indicatorsDesc[ind][0]);
    }
  });

  // Si aucun indicateur corrélé n’est dispo, on désactive ind2
  if (correlated.length === 0) {
    ind2Select.append("option").attr("value", "").text("No correlated indicator");
  }

  ind2Select.on("change", updateChart);


  function updateChart() {
    const ind1 = ind1Info.attr("id");
    const ind2 = ind2Select.property("value");

    const data1 = dataset[ind1].filter(d => d.island === mainIslandCode).map(d => ({year: +d.year, value: d.value}));
    const data2 = dataset[ind2].filter(d => d.island === mainIslandCode).map(d => ({year: +d.year, value: d.value}));

    const years1 = data1.map(d => d.year);
    const years2 = data2.map(d => d.year);
    const commonYears = years1.filter(year => years2.includes(year)).sort();

    const [minYear, maxYear] = d3.extent(commonYears);
    const x = d3.scaleLinear().domain([minYear, maxYear]).range([0, lineChartWidth]);

    // Filtrer les données sur l’intervalle commun uniquement
    const data1Filtered = data1.filter(d => d.year >= minYear && d.year <= maxYear);
    const data2Filtered = data2.filter(d => d.year >= minYear && d.year <= maxYear);

    dataCurves = [
      {
        id: "ind1",
        color: "#1f77b4",
        values: Array.from(data1Filtered.entries()).map(([x, y]) => ({ x: y.year, y: y.value }))
      },
      {
        id: "ind2",
        color: "orange",
        values: Array.from(data2Filtered.entries()).map(([x, y]) => ({ x: y.year, y: y.value }))
      }
    ];

    const y1 = d3.scaleLinear().domain([0, d3.max(data1, d => d.value) * 1.1]).range([lineChartHeight, 0]);
    const y2 = d3.scaleLinear().domain([0, d3.max(data2, d => d.value) * 1.1]).range([lineChartHeight, 0]);

    const line1 = d3.line().x(d => x(d.year)).y(d => y1(d.value));
    const line2 = d3.line().x(d => x(d.year)).y(d => y2(d.value));

    g.selectAll("*").remove();

    // Axes
    g.append("g").attr("class", "axis").call(d3.axisLeft(y1));
    g.append("g").attr("class", "axis").attr("transform", `translate(${lineChartWidth},0)`).call(d3.axisRight(y2));
    g.append("g").attr("class", "axis").attr("transform", `translate(0,${lineChartHeight})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Lines
    g.append("path").datum(data1Filtered).attr("class", "line1").attr("d", line1);
    g.append("path").datum(data2Filtered).attr("class", "line2").attr("d", line2);

  }

  function bisectX(values, x0) {
    // On suppose que values est trié par ordre croissant de x
    const i = d3.bisector(d => d.x).center(values, x0);
    return values[i];
  }

  function mousemove(event) {
    const [mx, my] = d3.pointer(event);

    hoverLine
      .attr("x1", mx)
      .attr("x2", mx)
      .attr("visibility", "visible");

    // Convertir position pixel en valeur domaine x

    const allXValues = dataCurves.flatMap(curve => curve.values.map(d => d.x));

    const xScale = d3.scaleLinear()
      .domain([d3.min(allXValues), d3.max(allXValues)])
      .range([0, lineChartWidth]);

    const x0 = xScale.invert(mx);

    // Trouver points correspondants sur chaque courbe
    const pointsData = dataCurves.map(curve => {
      const closest = bisectX(curve.values, x0);
      return {
        id: curve.id,
        color: curve.color,
        value: closest.y
      };
    });

    // Construire le contenu du tooltip
    const tooltipHTML = pointsData.map(d =>
      `<div><strong style="font-family: 'Segoe UI', sans-serif; color:${d.color}">${d.id == "ind1" ? ind1Info.text() : ind2Select.select("option:checked").text()}</strong> : <strong>${d.value.toFixed(2)}<br/>Description :</strong><br/>${d.id == "ind1" ? indicatorsDesc[ind1Info.attr("id")][1] : indicatorsDesc[ind2Select.property("value")][1]}<br/><br/></div>`
    ).join("");

    // Afficher tooltip proche de la souris
    lineChartTooltip.html(tooltipHTML)
      .style("opacity", 1)
      .style("border-radius", "10px")
      .style("box-shadow",  "0 2px 8px rgba(0,0,0,0.15)")
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 28) + "px");
  }

  function mouseout() {
    hoverLine.attr("visibility", "hidden");
    lineChartTooltip.style("opacity", 0);
  }

  // Init
  ind1Info.attr("id", correlatedIndicators[mainIslandCode].main).text(indicatorsDesc[correlatedIndicators[mainIslandCode].main][0]);
  ind2Select.property("value", correlatedIndicators[mainIslandCode].correlated[0]);
  updateChart();

  const btn_synthese = `<a href="javascript:void(0)" id="btn-synthese" class="btn-inline">➕ Afficher la synthèse complète</a>`;

  const legendLineChart = g.append("g")
    .attr("transform", `translate(${lineChartWidth / 2}, ${lineChartHeight + 60})`).attr("id", "legendRadar"); // centré en bas

  // Texte adaptatif
  legendLineChart.append("text")
    .attr("text-anchor", "middle")
    .attr("text-align", "center")
    .attr("fill", "#666")
    .attr("background-color", "#FFF")
    .attr("font-size", "14px")
    .html("Fig 2. Corrélations entre indicateurs (" + '<a target="_blank" href="https://stats.pacificdata.org/vis?fs[0]=Development%20indicators%2C0%7CBlue%20Pacific%202050%20Indicators%23BP50%23&pg=0&fc=Development%20indicators&bp=true&snb=8&df[ds]=ds%3ASPC2&df[id]=DF_BP50&df[ag]=SPC&df[vs]=1.0&dq=A..._T._T._T._T....&pd=2022%2C&to[TIME_PERIOD]=false">lien</a>' + ")");

  d3.select("#lineChartContainer")
  .insert("div", ":first-child")
  .attr("id", "elementTextLineChart")
  .style("text-align", "start")
  .style("margin-bottom", "20px")
  .style("max-width", "800px")
  .style("font-size", "14px")
  .style('font-family', 'Segoe UI, sans-serif')
  .html(lineChartAnalyse[mainIslandCode] + btn_synthese);

  const affichageSynthese = document.getElementById('btn-synthese');

  document.getElementById('texte-synthese').innerHTML = analyseSynthese;

  affichageSynthese.addEventListener('click', function (e) {
    e.preventDefault();
    if(document.getElementById('popup-synthese').classList.contains('show')) {
      document.getElementById('popup-synthese').classList.remove('show');
    } else {
      document.getElementById('popup-synthese').classList.add('show');
    }
  });

}

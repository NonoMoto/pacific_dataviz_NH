
// Première liste d'indicateurs résilience
const indicatorsMap = {
  SH_STA_MORT: ['🤱 Santé Maternelle', 'Taux de mortalité maternelle pour <strong>100 000</strong> naissances'],
  SH_MED_DEN: ['👩‍⚕️ Accès aux soins', 'Densité du personnel de santé pour <strong>10 000</strong> habitants'],
  SI_COV_BENFTS: ['🛡️ Protection sociale', 'Proportion de la population couverte par au moins une prestation de protection sociale (<strong>en %</strong>)'],
  SL_TLF_NEET: ['📚 Éducation & Insertion des Jeunes', 'Proportion de jeunes non scolarisés et sans emploi ni formation (<strong>en %</strong>)'],
  IT_USE_ii99: ["🌐 Inclusion Numérique", 'Proportion de la population utilisant Internet (<strong>en %</strong>)'],
  SH_DYN_MORT: ['👶 Santé Infantile', 'Taux de mortalité des enfants de moins de 5 ans pour <strong>1 000</strong> naissances']
};

let averagedData = null;
let normalizedData = [];
const indicatorOrder = Object.values(indicatorsMap);

// Récuperer les données
d3.dsv(";", "DATA/toutes_thematiques.csv", row => {
  let islandName = "";
  islandList.forEach(island => {
    if (island.code == row.GEO_PICT) {
      islandName = island.name;
    }
  });

  // Filtrage
  if (indicatorsMap[row.INDICATOR]) {
    return {
      island : row.GEO_PICT,
      indicator: row.INDICATOR.toString(16),
      indicName: indicatorsMap[row.INDICATOR][0],
      indicDesc: indicatorsMap[row.INDICATOR][1],
      islandName: islandName,
      value: parseFloat(row.OBS_VALUE)
    };
  }
  // Retourne null si erreur (debug)
  return null;
}).then(data => {
  // Filtrer valeurs nulles s'il y a
  const filteredData = data.filter(d => d !== null);

  // Prpéa calcul
  const grouped = {};

  filteredData.forEach(d => {

    //Création de la clé
    const key = "".concat(d.island, d.indicator);

    if (!grouped[key]) {
      grouped[key] = { island: d.island, indicator: d.indicator, indicName: d.indicName, indicDesc: d.indicDesc, islandName: d.islandName, sum: 0, count: 0 };
    }

    grouped[key].sum += d.value;
    grouped[key].count += 1;
  });

  averagedData = Object.values(grouped).map(g => ({
    island: g.island,
    indicator: g.indicator,
    indicName: g.indicName,
    indicDesc: g.indicDesc,
    islandName: g.islandName,
    averageValue: g.sum / g.count
  }));

  const groupedByIndicator = d3.group(averagedData, d => d.indicator);

  function normalize(value, min, max, useLog = false, invert = false) {
    const valTemp = useLog ? Math.log(value + 1) : value;
    const scaled = ((valTemp - min) / (max - min)) * 100;
    return invert ? 100 - scaled : scaled;
  }

  groupedByIndicator.forEach((records, indicatorCode) => {

    // Choix des transfos selon l'indicateur
    const useLog = ["SH_DYN_MORT", "SL_TLF_NEET", "SH_STA_MORT"].includes(indicatorCode);
    const invert = ["SH_DYN_MORT", "SL_TLF_NEET", "SH_STA_MORT"].includes(indicatorCode);

    // Calcul  min/max sur les valeurs transformées si log
    const transformedValues = records.map(d => useLog ? Math.log(d.averageValue + 1) : d.averageValue);
    const min = d3.min(transformedValues);
    const max = d3.max(transformedValues);

    // Appliquer la normalisation sur chaque valeur
    records.forEach(d => {
      const val = normalize(d.averageValue, min, max, useLog, invert);
      normalizedData.push({
        island: d.island,
        indicator: d.indicator,
        indicName: d.indicName,
        indicDesc: d.indicDesc,
        islandName: d.islandName,
        averageValue: d.averageValue,
        normalizeValue: val
      });
    });
  });

});

////////////////////////////
////// GRAPHIQUE ///////////
////////////////////////////

// RADAR CHART

function updateGraph() {

  if(document.getElementById('elementGraph')) {
    document.getElementById('elementGraph').remove();
  }

  if(document.getElementById('elementTextRadar')) {
    document.getElementById('elementTextRadar').remove();
  }

  if(document.getElementById('legendRadar')) {
    document.getElementById('legendRadar').remove();
  }

  // Globales
  const width = 650;
  const height = 650;
  const radius = 220;
  const levels = 5;

  const svg = d3.select("#radarChart")
    .attr("width", width)
    .attr("height", height);

    const zoomGroup = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`).attr("id", "elementGraph");
    const g = zoomGroup.append("g");

    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

  const tooltip = d3.select("#radar-tooltip");
  const dataByIsland = d3.group(normalizedData, d => d.island);
  const indicators = indicatorOrder;
  const angleSlice = 2 * Math.PI / indicators.length;
  const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

  // échelle de valeurs
  for (let level = 1; level <= levels; level++) {
    const r = radius * (level / levels);

    let color = "#ccc";
    if (level === 1) color = "red";
    else if (level === 2) color = "orange";

    g.append("circle")
      .attr("r", r)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-dasharray", "2,2");

    g.append("text")
      .attr("x", 4)
      .attr("y", -r + 4)
      .attr("font-size", "10px")
      .attr("fill", "#666")
      .text(Math.round(100 * level / levels));
  }

  // Axes et labels
  indicators.forEach((label, i) => {
    const angle = i * angleSlice - Math.PI / 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    g.append("line")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", x).attr("y2", y)
      .attr("stroke", "#999");

    g.append("text")
      .attr("x", x * 1.15)
      .attr("y", y * 1.15)
      .attr("class", "axisLabel")
      .attr("text-anchor", "middle")
      .style('font-family', 'Segoe UI, sans-serif')
      .style('font-size', '15px')
      .text(label[0]);
  });

  const radarLine = d3.lineRadial()
    .radius(d => rScale(d.normalizeValue))
    .angle((d, i) => i * angleSlice)
    .curve(d3.curveLinearClosed);

  // Uniquement valeurs de l'île
  const focusData = dataByIsland.get(mainIslandCode);

  const sortedFocusData = indicatorOrder.map(name => {
  const found = focusData.find(d => d.indicName === name[0]);
  return found || {
      island: mainIslandCode,
      islandName: focusData[0].islandName,
      indicName: name[0],
      indicDesc: name[1],
      normalizeValue: 0
    };
  });


  g.append("path")
    .datum(sortedFocusData)
    .attr("class", "radarStroke")
    .attr("stroke", mainColor)
    .attr("d", radarLine);

  g.selectAll(".radarCircle-" + mainIslandCode)
    .data(focusData)
    .enter()
    .append("circle")
    .attr("class", "radarCircle")
    .attr("r", 5)
    .attr("fill", mainColor)
    .attr("cx", d => {
      const i = indicators.findIndex(indic => indic[0] === d.indicName);
      return rScale(d.normalizeValue) * Math.cos(i * angleSlice - Math.PI / 2);
    })
    .attr("cy", d => {
      const i = indicators.findIndex(indic => indic[0] === d.indicName);
      return rScale(d.normalizeValue) * Math.sin(i * angleSlice - Math.PI / 2);
    })
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition().duration(100)
        .attr("r", 6)
        .attr("stroke", "#000")
        .attr("stroke-width", 1.5);

      tooltip
        .style("opacity", 1)
        .attr("class", "radar-tooltip")
        .html(`<div style="
                font-family: 'Segoe UI', sans-serif;
                font-size: 14px;
                background: white;
                color: #333;
                border-radius: 10px;
                padding: 12px 16px;
                box-shadow: 0 2px 8px rgba(31,119,180,1);
                max-width: 280px;
              ">
                <div style="font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 6px;">
                  🏝️ ${d.islandName}
                </div>

                <div style="margin-bottom: 10px;">
                  <strong style="color: #555;">Description :</strong><br>
                  ${d.indicDesc} :
                </div>

                <div style="
                  text-align: center;
                  font-size: 22px;
                  font-weight: bold;
                  color: #34495e;
                  background: #f4f4f4;
                  border-radius: 6px;
                  padding: 6px 0;
                  margin-bottom: 12px;
                ">
                  ${d.averageValue.toFixed(2)}
                </div>

                <div style="
                  text-align: center;
                  font-size: 15px;
                  font-weight: 500;
                  color: ${d.normalizeValue <= 20 ? '#e74c3c' : d.normalizeValue <= 40 ? '#f39c12' : '#27ae60'};
                ">
                  Note normalisée : ${d.normalizeValue.toFixed(2)} / 100
                  ${d.normalizeValue <= 20 ? '🔴' : d.normalizeValue <= 40 ? '🟡' : '🟢'}
                </div>
              </div>`)
          .style("left", (event.clientX+5) + "px")
          .style("top", (event.clientY+5) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .transition().duration(100)
        .attr("r", d => d.island === mainIslandCode ? 4 : 3)
        .attr("stroke", "none");

      tooltip.style("opacity", 0).attr("class", "radar-tooltip");
    });


  // PUIS LE RESTE
  Array.from(dataByIsland.entries()).forEach(([islandCode, data]) => {
    if (islandCode === mainIslandCode) return;

    g.selectAll(".radarCircle-" + islandCode)
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "radarCircle")
      .attr("r", 3)
      .attr("fill", mutedColor)
      .attr("cx", d => {
        const i = indicators.findIndex(indic => indic[0] === d.indicName);
        return rScale(d.normalizeValue) * Math.cos(i * angleSlice - Math.PI / 2);
      })
      .attr("cy", d => {
        const i = indicators.findIndex(indic => indic[0] === d.indicName);
        return rScale(d.normalizeValue) * Math.sin(i * angleSlice - Math.PI / 2);
      })
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition().duration(100)
          .attr("r", 6)
          .attr("stroke", "#000")
          .attr("stroke-width", 1.5);

        tooltip.style("opacity", 1)
        .html(`<div style="
                font-family: 'Segoe UI', sans-serif;
                font-size: 14px;
                background: white;
                color: #333;
                border-radius: 10px;
                padding: 12px 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                max-width: 280px;
              ">
                <div style="font-size: 18px; font-weight: bold; color: #2c3e50; margin-bottom: 6px;">
                  🏝️ ${d.islandName}
                </div>

                <div style="margin-bottom: 10px;">
                  <strong style="color: #555;">Description :</strong><br>
                  ${d.indicDesc} :
                </div>

                <div style="
                  text-align: center;
                  font-size: 22px;
                  font-weight: bold;
                  color: #34495e;
                  background: #f4f4f4;
                  border-radius: 6px;
                  padding: 6px 0;
                  margin-bottom: 12px;
                ">
                  ${d.averageValue.toFixed(2)}
                </div>

                <div style="
                  text-align: center;
                  font-size: 15px;
                  font-weight: 500;
                  color: ${d.normalizeValue <= 20 ? '#e74c3c' : d.normalizeValue <= 40 ? '#f39c12' : '#27ae60'};
                ">
                  Note normalisée : ${d.normalizeValue.toFixed(2)} / 100
                  ${d.normalizeValue <= 20 ? '🔴' : d.normalizeValue <= 40 ? '🟡' : '🟢'}
                </div>
              </div>`)
          .style("left", (event.clientX+5) + "px")
          .style("top", (event.clientY+5) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition().duration(100)
          .attr("r", d => d.island === mainIslandCode ? 4 : 3)
          .attr("stroke", "none");

        tooltip.style("opacity", 0);
      })
  });

  svg.on("mouseleave", () => {
    svg.transition().duration(500).call(
      zoom.transform,
      d3.zoomIdentity
    );
  });

  // LEGENDE GRAPHIQUE
  const legendRadar = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height - 10})`).attr("id", "legendRadar"); // centré en bas

  // Légende + source
  legendRadar.append("text")
    .attr("text-anchor", "middle")
    .attr("text-align", "center")
    .attr("fill", "#666")
    .attr("background-color", "#FFF")
    .attr("font-size", "14px")
    .html("Fig 1. Indices de Résilience Humaine (" + '<a target="_blank" href="https://stats.pacificdata.org/vis?fs[0]=Development%20indicators%2C0%7CBlue%20Pacific%202050%20Indicators%23BP50%23&pg=0&fc=Development%20indicators&bp=true&snb=8&df[ds]=ds%3ASPC2&df[id]=DF_BP50&df[ag]=SPC&df[vs]=1.0&dq=A..._T._T._T._T....&pd=2022%2C&to[TIME_PERIOD]=false">lien</a>' + ")");


  // TEXTE ADAPTATIF ANALYSE

  d3.select("#radarContainer")
  .append("div")
  .attr("id", "elementTextRadar")
  .style("margin-top", "20px")
  .style("max-width", "650px")
  .style("text-align", "justify")
  .style("font-size", "15px")
  .style('font-family', 'Segoe UI, sans-serif')
  .text(radarAnalyse[mainIslandCode]);

};

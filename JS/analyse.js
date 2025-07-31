
const radarAnalyse = {
  MH: ["Une part modérée de la population utilise Internet, laissant entrevoir un potentiel d'amélioration en matière de connectivité. La jeunesse est en grande difficulté, avec une forte proportion de jeunes déscolarisés et inactifs. Le taux de mortalité maternelle est alarmant, témoignant d'importantes lacunes dans le système de santé pour les femmes enceintes. La protection sociale est partiellement assurée, bien que des disparités persistent. L'accès aux soins est globalement satisfaisant, bien que certaines zones puissent être sous-dotées. Enfin, la mortalité des enfants de moins de 5 ans reste préoccupante, signe de difficultés persistantes en santé infantile."],
  KI: ["L'inclusion numérique est moyenne mais perfectible, avec une utilisation d’Internet encore limitée. La jeunesse souffre d’un désengagement profond, avec un taux très élevé de jeunes sans situation. La mortalité maternelle demeure préoccupante, révélant un accès aux soins insuffisant. En parallèle, la couverture sociale reste très faible, exposant la population à une forte vulnérabilité. Les ressources médicales sont modérées, mais le taux de mortalité infantile très élevé indique un besoin urgent d’amélioration."],
  NR: ["L’usage d’Internet est correct mais pourrait être étendu pour une meilleure inclusion. La jeunesse est moyennement insérée, avec des signes de décrochage. Fait remarquable : aucun décès maternel n’a été signalé, témoignant d’un système de santé performant à ce niveau. La couverture sociale est raisonnable. L’accès aux soins est adéquat, mais des disparités peuvent persister. La mortalité infantile demeure une source de préoccupation."],
  FM: ["La connectivité est particulièrement faible, traduisant un isolement numérique marqué. Les jeunes sont nombreux à être déscolarisés ou sans emploi. La santé maternelle affiche des lacunes persistantes. La protection sociale demeure limitée. Le manque de personnel de santé entrave l’accès aux soins, tandis que la mortalité infantile reste préoccupante."],
  PW: ["Palau affiche des indicateurs globalement positifs : une bonne connectivité, une jeunesse bien insérée, une absence de mortalité maternelle et une couverture sociale excellente. Le pays dispose d’une densité médicale importante, garantissant un bon accès aux soins. Seule ombre au tableau : la santé infantile mérite encore des efforts."],
  TO: ["L'île présente une bonne inclusion numérique et une jeunesse bien encadrée. Toutefois, la mortalité maternelle demeure un enjeu de santé publique. Le système de protection sociale est partiellement fonctionnel. Les ressources médicales sont correctes et la mortalité infantile reste modérée."],
  TV: ["Tuvalu est modérément connecté, avec une jeunesse en situation de fragilité. L'absence de mortalité maternelle est un point extrêmement positif. En revanche, la couverture sociale est très insuffisante. Le personnel de santé est relativement disponible, mais les performances en santé infantile restent à renforcer."],
  VU: ["La connectivité progresse lentement. Une large part de jeunes n’est ni à l’école ni en emploi. La mortalité maternelle interpelle, tout comme la faible couverture sociale. La densité médicale est insuffisante, et la santé infantile reste préoccupante."],
  CK: ["Bien que perfectible, l’usage d’Internet est en expansion. Les jeunes sont bien insérés. L’absence de mortalité maternelle reflète un système de santé performant. La couverture sociale est quasi universelle, et la densité médicale très élevée. La mortalité infantile est maîtrisée, bien que des marges d’amélioration existent."],
  FJ: ["L’adoption d’Internet est moyenne. Les jeunes sont relativement bien intégrés. La mortalité maternelle est modérée, et la couverture sociale satisfaisante. Le personnel médical est disponible en nombre raisonnable. La mortalité infantile, bien que moins dramatique qu’ailleurs, reste à surveiller."],
  SB: ["L’inclusion numérique est extrêmement basse. La jeunesse fait face à un taux élevé de désengagement. La mortalité maternelle et infantile soulignent les lacunes persistantes du système de santé. La protection sociale est quasi absente, et l’accès aux soins est limité."],
  WS: ["Samoa souffre d’un retard en inclusion numérique. La jeunesse connaît une certaine désinsertion. La mortalité maternelle demeure un enjeu à adresser. Le système social est peu protecteur. Le manque de personnel médical nuit à la qualité des soins. Toutefois, la mortalité infantile est contenue."],
  NC: ["New Caledonia dispose d’une bonne connectivité et d’un système éducatif correct, bien que des jeunes soient encore en difficulté. La santé maternelle est relativement maîtrisée. La protection sociale pourrait être renforcée. L’accès aux soins est correct, et la mortalité infantile reste modérée."],
  PF: ["Une très bonne inclusion numérique et une absence totale de mortalité maternelle marquent un système avancé. Cependant, une jeunesse désengagée ternit le tableau. La couverture sociale est moyenne. La santé des jeunes enfants est excellente, avec une mortalité infantile quasi nulle."],
  NU: ["Niue affiche d'excellentes performances : connectivité élevée, jeunesse insérée, absence de mortalité maternelle, personnel médical dense. La couverture sociale pourrait cependant être plus étendue. Une attention particulière doit être portée à la santé des enfants, encore fragile."],
  PG: ["L’île cumule les fragilités : très faible connectivité, jeunesse désengagée, taux de mortalité maternelle et infantile très élevés. Le système de protection sociale est quasiment inexistant. Le manque criant de personnel médical aggrave encore cette situation préoccupante."]
};

const lineChartThemes = {
  introduction: [`<div id="intro">
    <p>L’analyse croisée des indicateurs dans le Pacifique met en lumière des <strong>corrélations significatives</strong> entre <strong>santé, environnement</strong> et <strong>accès aux services essentiels</strong>. Ces dynamiques révèlent des logiques de développement souvent interconnectées, où <strong>numérique, énergie</strong> et <strong>infrastructures</strong> jouent un rôle clé dans la réduction des vulnérabilités.</p>
  </div>`],
  acces_internet: [`<div>
    <h3>📡 Accès à internet : un levier transversal</h3>
    <p>La connectivité se distingue comme un <strong>facteur structurant</strong> du développement. Elle est corrélée à la <strong>densité du personnel de santé</strong> (Îles Cook, Papouasie-Nouvelle-Guinée) et à la <strong>mortalité infantile</strong> (Niue, Tuvalu). L’hypothèse : internet permet de <strong>renforcer l’accès aux soins</strong> et d’améliorer la prévention.</p>
    <p>On observe aussi un lien avec la <strong>capacité installée en énergie renouvelable</strong> (Kiribati, Tonga, Fidji, Polynésie française), suggérant une logique de projets <strong>numérique + énergie</strong> intégrés, au service de l’inclusion.</p>
  </div>`],
  acces_electricite: [`<div>
    <h3>⚡ Électricité : socle des services essentiels</h3>
    <p>L’accès à l’électricité est corrélé à la <strong>mortalité infantile</strong> (Îles Marshall) et à la <strong>mortalité maternelle</strong> (Îles Salomon), soulignant son rôle vital dans le fonctionnement des structures de santé.</p>
    <p>Dans les États fédérés de Micronésie, elle est aussi liée à l’<strong>abonnement haut débit</strong> : un rappel que le numérique ne peut se développer sans une infrastructure énergétique fiable.</p>
  </div>`],
  catastrophes_naturelles: [`<div>
    <h3>🌪️ Catastrophes naturelles : amplificateurs de vulnérabilités</h3>
    <p>En Nouvelle-Calédonie, une corrélation entre <strong>catastrophes naturelles</strong> et <strong>tuberculose</strong> suggère une dégradation sanitaire en période de crise. À Palaos, ces événements sont associés à une <strong>hausse de la mortalité infantile</strong>, illustrant la fragilité des systèmes de santé face aux chocs climatiques.</p>
  </div>`],
  autres_correlations: [`<div>
    <h3>🔎 Corrélations spécifiques mais parlantes</h3>
    <p>À Nauru, un lien entre <strong>énergies renouvelables</strong> et <strong>taux de chômage</strong> soulève des questions : <em>absence d’impact sur l’emploi ? inadéquation des compétences ?</em></p>
    <p>À Vanuatu, la part d’<strong>énergies renouvelables dans la consommation</strong> suit logiquement la capacité installée, signalant une transition engagée.</p>
    <p>Enfin, à Samoa, la <strong>mortalité maternelle diminue</strong> lorsque les accouchements sont réalisés avec un <strong>personnel de santé qualifié</strong> – un lien attendu mais crucial pour orienter les politiques de santé reproductive.</p>
  </div>`]
}

const lineChartAnalyse = {
  MH: lineChartThemes["acces_electricite"],
  KI: lineChartThemes["acces_internet"],
  NR: lineChartThemes["autres_correlations"],
  FM: lineChartThemes["acces_electricite"],
  PW: lineChartThemes["catastrophes_naturelles"],
  TO: lineChartThemes["acces_internet"],
  TV: lineChartThemes["acces_internet"],
  VU: lineChartThemes["autres_correlations"],
  CK: lineChartThemes["acces_internet"],
  FJ: lineChartThemes["acces_internet"],
  SB: lineChartThemes["acces_electricite"],
  WS: lineChartThemes["autres_correlations"],
  NC: lineChartThemes["catastrophes_naturelles"],
  PF: lineChartThemes["acces_internet"],
  NU: lineChartThemes["acces_internet"],
  PG: lineChartThemes["acces_internet"]
};

const analyseSynthese = `<p>
    L'analyse exploratoire des données met en évidence plusieurs corrélations significatives suggérant des dynamiques communes entre <strong>santé, environnement</strong> et <strong>accès aux services essentiels</strong>. Ces corrélations permettent de mettre en avant des pistes d'interprétation cohérentes sur les interactions entre les dimensions du développement durable dans les États et territoires insulaires du Pacifique.
  </p>

  <h2>1. Accès à internet : un indicateur transversal</h2>
  <p>
    L’accès à internet présente de multiples corrélations avec des indicateurs-clés de santé et d’environnement :
  </p>
  <p>
    <strong>Densité du personnel de santé :</strong> Corrélation observée notamment aux <em>Îles Cook</em> et en <em>Papouasie-Nouvelle-Guinée</em>, suggérant que l’accès numérique peut être un levier pour renforcer les systèmes de santé, peut-être grâce à la télémédecine ou la gestion des ressources humaines.
  </p>
  <p>
    <strong>Taux de mortalité infantile :</strong> Cas de <em>Niue</em> et <em>Tuvalu</em>. Une meilleure connectivité pourrait favoriser la diffusion des bonnes pratiques sanitaires ou l'accès rapide à des services médicaux.
  </p>
  <p>
    <strong>Capacité installée en énergie renouvelable :</strong> Corrélations identifiées à <em>Kiribati, Tonga, Polynésie française</em> et <em>Fidji</em>. Cela pourrait traduire une approche intégrée des politiques publiques visant à combiner inclusion numérique et transition énergétique, souvent dans des projets co-financés (ex : infrastructures durables couplant énergie solaire et télécommunications rurales).
  </p>
  <p>
    <strong>🔎 Hypothèse générale :</strong> Le développement conjoint de l’accès à internet, à l’énergie et aux services de santé traduirait une stratégie de développement territoriale intégrée, visant à lutter simultanément contre l’isolement, la précarité énergétique et les inégalités sanitaires.
  </p>

  <h2>2. Accès à l’électricité : un facteur déterminant pour la santé</h2>
  <p>
    D’autres corrélations mettent en avant l’importance de l’électrification dans l’amélioration des conditions de santé :
  </p>
  <p>
    <strong>Mortalité infantile :</strong> Corrélation aux <em>Îles Marshall</em>, soulignant le rôle critique de l’électricité dans la continuité des soins (ex : éclairage, conservation des vaccins, etc.).
  </p>
  <p>
    <strong>Mortalité maternelle :</strong> Double corrélation pour les <em>Îles Salomon</em>. L’accès à l’électricité pourrait être lié à la qualité des soins obstétriques, notamment dans les zones rurales.
  </p>
  <p>
    <strong>Connexion haut débit :</strong> Corrélation dans les <em>États fédérés de Micronésie</em>. Cela confirme une interdépendance entre les infrastructures d’électricité et de télécommunication.
  </p>

  <h2>3. Catastrophes naturelles : un amplificateur des vulnérabilités sanitaires</h2>
  <p>
    Deux corrélations suggèrent un lien entre les impacts des catastrophes naturelles et les indicateurs de santé :
  </p>
  <p>
    <strong>Tuberculose (Nouvelle-Calédonie) :</strong> Les crises climatiques pourraient fragiliser les systèmes de santé et aggraver les risques épidémiques.
  </p>
  <p>
    <strong>Mortalité infantile (Palaos) :</strong> Effet potentiel des catastrophes sur les infrastructures de santé ou l’accès aux soins d’urgence.
  </p>
  <p>
    <strong>🔎 Hypothèse générale :</strong> Les catastrophes naturelles aggravent les vulnérabilités préexistantes, notamment sanitaires, en perturbant l'accès aux soins et les conditions de vie.
  </p>

  <h2>4. Corrélations isolées mais significatives</h2>
  <p>
    Trois corrélations supplémentaires méritent d’être notées :
  </p>
  <p>
    <strong>Taux de chômage et capacité installée en énergie renouvelable (Nauru) :</strong> Cela pourrait refléter un effet indirect des projets énergétiques sur l’emploi local, ou au contraire une faiblesse structurelle du marché du travail malgré les investissements.
  </p>
  <p>
    <strong>Part des énergies renouvelables dans la consommation finale (Vanuatu) :</strong> Peut signaler une politique énergétique ambitieuse, indépendante du développement des autres infrastructures (santé, emploi, etc.).
  </p>
  <p>
    <strong>Mortalité maternelle et proportion d’accouchements assistés par du personnel qualifié (Samoa) :</strong> Corrélation attendue et logique, confirmant que l’assistance qualifiée lors des accouchements est un facteur clé de la réduction de la mortalité maternelle.
  </p><br/>
  ---------------------------------------------
  <p>
    <strong>Ressources et technologies utilisées :</strong><br/>Le projet a été réalisé "sur-mesure" en HTML/CSS/JS à l'aide de D3.js et Leaflet.js. Le style n'est pas encore 'responsive', faute de temps...
  </p>
  <p>
    Le code source est accessible via <a target="_blank" href="https://github.com/NonoMoto/pacific_dataviz_NH">GitHub</a>.
  </p>
  <p>
    Projet réalisé par <a target="_blank" href="https://fr.linkedin.com/in/no%C3%A9-haller-1b2b04198">Noé Haller</a> pour le <a target="_blank" href="https://pacificdatavizchallenge.org/">Pacific Dataviz Challenge</a>.
  </p>`;

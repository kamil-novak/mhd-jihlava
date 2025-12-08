// ------------------------------------
// MODULY
// ------------------------------------ 
const Popup = await $arcgis.import("@arcgis/core/widgets/Popup.js");
const WebMap = await $arcgis.import("@arcgis/core/WebMap.js");
const MapView = await $arcgis.import("@arcgis/core/views/MapView.js");
const reactiveUtils = await $arcgis.import("@arcgis/core/core/reactiveUtils.js");
const Expand = await $arcgis.import("@arcgis/core/widgets/Expand.js");
const Home = await $arcgis.import("@arcgis/core/widgets/Home.js");
const Locate = await $arcgis.import("@arcgis/core/widgets/Locate.js");
const LocalBasemapsSource = await $arcgis.import("@arcgis/core/widgets/BasemapGallery/support/LocalBasemapsSource.js");
const Basemap = await $arcgis.import("@arcgis/core/Basemap.js");
const BasemapGallery = await $arcgis.import("@arcgis/core/widgets/BasemapGallery.js");
const Search = await $arcgis.import("@arcgis/core/widgets/Search.js");
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
const Graphic = await $arcgis.import("@arcgis/core/Graphic.js");
const GraphicsLayer = await $arcgis.import("@arcgis/core/layers/GraphicsLayer.js");
const FeatureFilter = await $arcgis.import("@arcgis/core/layers/support/FeatureFilter.js");
const FeatureEffect = await $arcgis.import("@arcgis/core/layers/support/FeatureEffect.js");


// ------------------------------------
// GLOBÁLNÍ NASTAVENÍ
// ------------------------------------ 
// Globální proměnné
let polohaLr;
let zastavkyLr;
let trasyLr;
let trasyHighlightLr;
let odjezdyLr;

// Popups
// Poloha vozidel
const polohaPopupTitle = `
  <span class="popup-poloha popup-vehicle popup-{TYP_VOZIDLA}"></span>
  Linka {LINKA} 
  <span class="popup-poloha popup-direction">(směr {CILOVA_ZASTAVKA_NAME})</span>
`
const polohaPopupContentEl = document.createElement("div");
polohaPopupContentEl.innerHTML = `
  <div class="popup-poloha">
    <div class="popup-poloha-row">
      <div>Zpoždění</div>
      <div id="popup-poloha-zpozdeni"></div>
    </div>
    <div class="popup-poloha-row">
      <div>Rychlost / stav</div>
      <div id="popup-poloha-rychlost"></div>
    </div>
    <div class="popup-poloha-row">
      <div>Poslední projetá zastávka</div>
      <div id="popup-poloha-zastavka"></div>
    </div>
    <div class="popup-poloha-row">
      <div>Bezbariérovost</div>
      <div id="popup-poloha-bezbarierovost"></div>
    </div>
  </div>
`;
const popupPolohaZpozdeni = polohaPopupContentEl.querySelector("#popup-poloha-zpozdeni");
const popupPolohaRychlost = polohaPopupContentEl.querySelector("#popup-poloha-rychlost");
const popupPolohaZastavka = polohaPopupContentEl.querySelector("#popup-poloha-zastavka");
const popupPolohaBezbarierovost = polohaPopupContentEl.querySelector("#popup-poloha-bezbarierovost");

// Zastávky
const zastavkyPopupTitle = `
  Zastávka {${config.zastavkaNazevField}}
`
const zastavkyPopupContentEl = document.createElement("div");
zastavkyPopupContentEl.innerHTML = `
  <div class="popup-zastavky">
    <div class="popup-zastavky-linky"></div>
    <table class="popup-zastavky-odjezdy">
      <thead>
        <tr>
          <th>Linka</th>
          <th>Cílová stanice</th>
          <th>Odjezd</th>
        </tr>
      </thead>
      <tbody id="popup-zastavky-odjezdy-rows">
      </tbody>
    </table>
    <div id="popup-zastavky-odjezdy-warning">${config.noOdjezdyText}</div>
  </div>
`;
const popupZastavkyOdjezdyTable = zastavkyPopupContentEl.querySelector(".popup-zastavky-odjezdy");
const popupZastavkyOdjezdyRows = zastavkyPopupContentEl.querySelector("#popup-zastavky-odjezdy-rows");
const popupZastavkyLinky = zastavkyPopupContentEl.querySelector(".popup-zastavky-linky");
const popupZastavkyOdjezdyWarning = zastavkyPopupContentEl.querySelector("#popup-zastavky-odjezdy-warning");


// ------------------------------------
// ZÁKLADNÍ KOMPONENTY APLIKACE
// ------------------------------------ 
document.querySelector(".title-container").innerHTML = config.headerTitle;
document.querySelector(".logo-container").innerHTML = 
  `<a href="${config.headerLink}" target="_blank">
    <img class="logo-image" src="images/header-logo-jihlava.svg" alt="logo">
  </a>`;
document.querySelector("title").innerText = config.headerTitle;


// ------------------------------------
// ZÁKLADNÍ KOMPONENTY APLIKACE
// ------------------------------------ 
// Vrstva odjezdů
odjezdyLr = new FeatureLayer({
  url: config.zastavkoveOdjezdyLrUrl,
  outFields: ["*"]
});


// Webová mapa
const webmap = new WebMap({
  portalItem: {
    id: config.webmapId,
    portal: {
      url: config.portalUrl
    }    
  }
});

// Mapové view
const view = new MapView({
  container: "viewDiv",
  map: webmap,
  padding: {
    top: 55
  },
  popup: new Popup({
    hideSpinner: true,
    highlightEnabled: true,
    dockOptions: {
      position: "bottom-right",
      breakpoint: false
    },
    dockEnabled: true
  })
});

// Tlačítko Home
const homeWidget = new Home({
  view: view,
  label: "Výchozí zobrazení mapy"
});

// Lokalizace
const locateWidget = new Locate({
  view: view,  
  scale: 2500,
  label: "Najdi moji polohu",
});

// O aplikaci
const infoNode = document.createElement("div");
infoNode.style.padding = "10px";
infoNode.classList.add("esri-widget--panel", "esri-widget");
infoNode.innerHTML = config.infoWidgetContent;

const infoWidget = new Expand({
  content: infoNode, 
  view: view,
  expandTooltip: "O aplikaci",
  collapseTooltip: "Sbalit informace o aplikaci",
  group: "top-left",
  expandIcon: "question"
});



// ------------------------------------
// LOGIKA APLIKACE
// ------------------------------------ 
reactiveUtils.once(() => view.ready === true).then(() => {
  
  // Loading screen
  const loadingScreenEl = document.getElementById("loading-screen");
  loadingScreenEl.remove();

  // Breakpoints (popups position, header hidding)
  reactiveUtils.watch(
    () => view.widthBreakpoint,
    (breakpoint) => updateView(breakpoint),
    {initial: true}
  )

});

view.when(() => {

  // Načítání widgetů
  view.ui.add(homeWidget, "top-left", 0);
  view.ui.add(locateWidget, "top-left", 1);
  view.ui.add(infoWidget, "top-left", 3);

  // Přístup k vrstvám
  polohaLr = webmap.findLayerById(config.polohaVozidelLrId);
  zastavkyLr = webmap.findLayerById(config.zastavkyLrId);
  trasyLr = webmap.findLayerById(config.trasyLrId);

  // Nastavení vrstev
  polohaLr.popupEnabled = true;
  polohaLr.popupTemplate.overwriteActions = true;
  polohaLr.popupTemplate.outFields = ["*"];
  polohaLr.popupTemplate.title = polohaPopupTitle; 
  polohaLr.popupTemplate.content = polohaPopupContentEl;

  zastavkyLr.popupEnabled = true;
  zastavkyLr.popupTemplate.overwriteActions = true;
  zastavkyLr.popupTemplate.outFields = ["*"];
  zastavkyLr.popupTemplate.title = zastavkyPopupTitle; 
  zastavkyLr.popupTemplate.content = zastavkyPopupContentEl;

})

reactiveUtils.watch(
  () => [view.updating, view.popup?.selectedFeature],
  async ([updating, selectedFeature]) => {
    if (!updating && selectedFeature?.layer?.id === polohaLr.id) {
      await updatePolohaPopup(selectedFeature);
    }
    if (!updating && selectedFeature?.layer?.id === zastavkyLr.id) {
      await updateZastavkyPopup(selectedFeature);
    }
  }
);

reactiveUtils.watch(
  () => [view.popup?.selectedFeature],
  async ([selectedFeature]) => {
    if (selectedFeature?.layer?.id === zastavkyLr.id) {
      createLinesBarInZastavkyPopup(selectedFeature);
    }
  }
);

reactiveUtils.watch(
  () => [view.popup?.selectedFeature, view.popup?.visible],
  async ([selectedFeature, popupIsVisible]) => {
    console.log(popupIsVisible);
    if (selectedFeature?.layer?.id === polohaLr.id) {
      await filterTrasa(selectedFeature);
    }
    if (!popupIsVisible || selectedFeature?.layer?.id !== polohaLr.id) {
      await filterTrasa(null);
    }
  }
);


// ------------------------------------
// FUNKCE
// ------------------------------------
// Update popup polohy
const updatePolohaPopup = async (feature) => {

  const query = {
    returnGeometry: false,
    where: `${polohaLr.objectIdField} = ${feature.attributes[polohaLr.objectIdField]}`
  }
  
  const selectedFeatures = await polohaLr.queryFeatures(query);
 
  
  if (selectedFeatures.features.length > 0) {
    const selectedFeature = selectedFeatures.features[0].attributes;
 
    const zpozdeniAtt = selectedFeature.ZPOZDENI_MIN_FORMAT;
    const rychlostAtt = selectedFeature.RYCHLOST_KM_H_FORMAT;
    const zastavkaAtt = selectedFeature.POSLEDNI_ZASTAVKA_NAME;
    const bezbarierovostAtt = selectedFeature.BEZBARIEROVOST_FORMAT;

    popupPolohaZpozdeni.innerHTML = zpozdeniAtt;
    popupPolohaRychlost.innerHTML = rychlostAtt;
    popupPolohaZastavka.innerHTML = zastavkaAtt;
    popupPolohaBezbarierovost.innerHTML = bezbarierovostAtt;
  }
}

// Vytvoření seznamu linek v popup zastávek
const createLinesBarInZastavkyPopup = (feature) => {
  const linesFiels = feature.attributes[config.zastavkaLinkyField];
  const bezbarierFiels = feature.attributes[config.zastavkaBezbarField];

  popupZastavkyLinky.innerHTML = "";

  let newHtml = "";

  if (bezbarierFiels === "Ano") {
    newHtml = `<div class="zastavky-bezbar"></div>`
  }
  if (linesFiels) {
    const linesArr = linesFiels.split(" ");
    linesArr.forEach((line) => {
      newHtml = newHtml + `<div class="zastavky-line">${line}</div>`
    })
  }

  popupZastavkyLinky.innerHTML = newHtml
}

// Update popup zastávek
const updateZastavkyPopup = async (feature) => {

  const query = {
    returnGeometry: false,
    where: `${config.searchOdjezdyField} = '${feature.attributes[config.zastavkaIdField]}-${feature.attributes[config.zastavkaSmerField]}'`
  }
  
  const selectedFeatures = await odjezdyLr.queryFeatures(query);
    
  popupZastavkyOdjezdyRows.innerHTML = null;
  let newHtml = "";

  if (selectedFeatures.features.length > 0) {
    if (popupZastavkyOdjezdyTable.style.display !== "table") { popupZastavkyOdjezdyTable.style.display = "table"; }
    if (popupZastavkyOdjezdyWarning.style.display !== "none") { popupZastavkyOdjezdyWarning.style.display = "none"; }
        
    selectedFeatures.features.forEach((feature) => {
      newHtml = newHtml + feature.attributes[config.odjezdyField];
    })
    
    popupZastavkyOdjezdyRows.innerHTML = newHtml;
  }
  else {
    popupZastavkyOdjezdyTable.style.display = "none";
    popupZastavkyOdjezdyWarning.style.display = "block";
  }
}

// Zvýraznění trasy po identifikaci vozidla
const filterTrasa = async (feature) => {
  const linkaField = feature?.attributes?.[config.polohaLinkaField];
  const trasyLrView = await view.whenLayerView(trasyLr);

  if (linkaField) {
    const filter = new FeatureFilter({
      where: `trasa LIKE '%${linkaField}%'`,
    })
    trasyLrView.featureEffect = new FeatureEffect({
      filter,
      excludedEffect: "grayscale(100%) opacity(50%)"
    });
  }
  else {
    trasyLrView.featureEffect = null;
  }
}

// Update layoutu při mobilním rozlišení
const updateView = (breakpoint) => {
  let header = true; 

  switch (breakpoint) {
    case "xsmall":
      header = true;
      view.popup.dockOptions.position = "bottom-center";
      break;
    case "small":
      header = true;
      view.popup.dockOptions.position = "bottom-right";
      break;
    case "medium":
      header = false;
      view.popup.dockOptions.position = "bottom-right";
      break;
    case "large":
      header = false;
      break;
    case "xlarge":
      header = false;
      break;
    default:
  }

  if (header) {
    document.querySelector("#title-bar").classList.add("invisible");
    view.padding = {
      top: 0
    };
  } else {
    document.querySelector("#title-bar").classList.remove("invisible");
    view.padding = {
      top: 55
    };
  }
}


    
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
// URL parametry
const url = new URL(window.location.href);
let stopParam = url.searchParams.get('stop');

// Globální proměnné
let polohaLrs;
let zastavkyLr;
let trasyLr;
let trasyHighlightLr;
let odjezdyLr;
let noDataInfoWasClosed = false;

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

const noDataScreen = document.querySelector("#no-data-screen");
const noDataMessage = noDataScreen.querySelector(".no-data-message");
const noDataCloseBtn = noDataScreen.querySelector(".no-data-close");
noDataMessage.innerText = config.noDataText;
noDataCloseBtn.addEventListener("click", () => closeNoDataInfo());

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
  expandIcon: "question",
  mode: "auto",
  label: "O aplikaci",
});

// Vyhledávání zastávek
const zastavkySearchBtnNode = document.createElement("calcite-button");
const zastavkySearchNode = document.createElement("calcite-list");
zastavkySearchNode.setAttribute("filter-enabled", "");
zastavkySearchNode.setAttribute("selection-mode", "single");
zastavkySearchNode.setAttribute("selection-appearance", "highlight");
const zastavkySearchFeatures = new Map();
zastavkySearchNode.style.display = "none";
zastavkySearchNode.id = "searchZastavka";
zastavkySearchBtnNode.innerText = "Hledat zastávku";
zastavkySearchBtnNode.id = "searchZastavkaBtn";
zastavkySearchBtnNode.setAttribute("icon-start", "magnifying-glass");

// Načítání widgetů
view.ui.add(zastavkySearchBtnNode, "manual", 0);
view.ui.add(homeWidget, "top-left", 0);
view.ui.add(locateWidget, "top-left", 1);
view.ui.add(infoWidget, "top-left", 2);
view.ui.add(zastavkySearchNode, "manual");


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

view.when(async() => {

  // Přístup k vrstvám
  polohaLrs = config.polohaVozidelLrIds.map((polohaLrId) => webmap.findLayerById(polohaLrId));
  zastavkyLr = webmap.findLayerById(config.zastavkyLrId);
  trasyLr = webmap.findLayerById(config.trasyLrId);

  // Nastavení vrstev
  polohaLrs.forEach((polohaLr) => {
    polohaLr.popupEnabled = true;
    polohaLr.popupTemplate = {};
    polohaLr.popupTemplate.overwriteActions = true;
    polohaLr.popupTemplate.outFields = ["*"];
    polohaLr.popupTemplate.title = polohaPopupTitle; 
    polohaLr.popupTemplate.content = updatePolohaPopup;
  });

  zastavkyLr.popupEnabled = true;
  zastavkyLr.popupTemplate = {};
  zastavkyLr.popupTemplate.overwriteActions = true;
  zastavkyLr.popupTemplate.outFields = ["*"];
  zastavkyLr.popupTemplate.title = zastavkyPopupTitle; 
  zastavkyLr.popupTemplate.content = updateZastavkyPopup;

  // Načtení zastávek do vyhledávacího seznamu
  await loadZastavkySearch();

  // URL parametry
  if (stopParam) {
    try {
      const stopId = stopParam.split("-")?.[0];
      const postId = stopParam.split("-")?.[1];
      const stopExpr = 
        `${config.zastavkaIdField} = ${stopId} AND ${config.zastavkaSmerField} = ${postId}` || null;
      const stopQuery = {outFields: ["*"], returnGeometry: true, where: stopExpr};

      const stopFeatures = await zastavkyLr.queryFeatures(stopQuery);
      const existFeature = stopFeatures.features.length > 0 ? true : false;
      if (existFeature) {
        view.popup.open({features: stopFeatures.features});
        view.goTo({target: stopFeatures.features, scale: 1000});
      }
    }
    catch {
      console.log("Nepodařilo se získat data o zastávkových odjezdech dle zadaného URL parametru");
    }    
  }

})

reactiveUtils.watch(
  () => [view.updating, view.popup?.selectedFeature],
  async ([updating, selectedFeature]) => {
    if (!updating && isPolohaFeature(selectedFeature)) {
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
    if (isPolohaFeature(selectedFeature)) {
      await filterTrasa(selectedFeature);
    }
    if (!popupIsVisible || !isPolohaFeature(selectedFeature)) {
      await filterTrasa(null);
    }
  }
);

reactiveUtils.watch(
  () => [view.popup?.selectedFeature, view.popup?.visible],
  async ([selectedFeature, popupIsVisible]) => {
    if (selectedFeature?.layer?.id === zastavkyLr.id) {
      setStopUrlParameter(selectedFeature);
    }
    if (!popupIsVisible || selectedFeature?.layer?.id !== zastavkyLr.id) {
      setStopUrlParameter(null);
    }
  }
);

reactiveUtils.watch(
  () => [view.updating],
  async ([updating]) => {
    if (!updating) {
      if (config.noDataInfoEnable === true && isTimeInRange(config.noDataInfoFrom, config.noDataInfoTo)) {
        const polohaCounts = await Promise.all(polohaLrs.map(async (polohaLr) => {
          try {
            return await polohaLr.queryFeatureCount();
          }
          catch {
            return 0;
          }
        }));
        const polohaCount = polohaCounts.reduce((count, layerCount) => count + layerCount, 0);
        if (polohaCount < 1 && (noDataScreen.style.display === "none" || noDataScreen.style.display === "") && noDataInfoWasClosed === false) {
          noDataScreen.style.display = "flex";
        }
        if (polohaCount > 0 && noDataScreen.style.display === "flex") {
          noDataScreen.style.display = "none"
        }
      }
    }
  }
);

zastavkySearchBtnNode.addEventListener("click", () => {
  const isOpen = zastavkySearchNode.style.display !== "none";
  zastavkySearchNode.style.display = isOpen ? "none" : "block";
  zastavkySearchBtnNode.iconStart = isOpen ? "magnifying-glass" : "x";
});

zastavkySearchNode.addEventListener("calciteListChange", async (event) => {
  const selectedItem = event.target.selectedItems?.[0];
  if (!selectedItem) return;

  const feature = zastavkySearchFeatures.get(String(selectedItem.value));
  if (!feature) return;

  zastavkySearchNode.style.display = "none";
  zastavkySearchBtnNode.iconStart = "magnifying-glass";
  selectedItem.selected = false;
  zastavkySearchNode.filterText = "";

  try {
    await view.goTo({ target: feature, scale: 1000 });
    view.popup.open({ features: [feature], location: feature.geometry });
  }
  catch (error) {
    if (error.name !== "AbortError") console.error("Nepodařilo se přiblížit na zastávku:", error);
  }
});


// ------------------------------------
// FUNKCE
// ------------------------------------
// Načtení všech zastávek ze služby (včetně překročení maxRecordCount)
async function loadZastavkySearch() {
  zastavkySearchNode.loading = true;
  try {
    await zastavkyLr.load();
    const objectIds = await zastavkyLr.queryObjectIds({ where: "1=1" });
    if (!objectIds?.length) return;

    const features = [];
    const pageSize = 200;
    for (let i = 0; i < objectIds.length; i += pageSize) {
      const result = await zastavkyLr.queryFeatures({
        objectIds: objectIds.slice(i, i + pageSize),
        outFields: ["*"],
        returnGeometry: true
      });
      features.push(...result.features);
    }

    features.sort((a, b) => String(a.attributes[config.zastavkaNazevField] ?? "")
      .localeCompare(String(b.attributes[config.zastavkaNazevField] ?? ""), "cs"));

    const fragment = document.createDocumentFragment();
    for (const feature of features) {
      const objectId = String(feature.attributes[zastavkyLr.objectIdField]);
      zastavkySearchFeatures.set(objectId, feature);

      const item = document.createElement("calcite-list-item");
      item.label = String(feature.attributes[config.zastavkaNazevField] ?? "Bez názvu");
      item.value = objectId;
      fragment.appendChild(item);
    }
    zastavkySearchNode.replaceChildren(fragment);
  }
  catch (error) {
    console.error("Nepodařilo se načíst seznam zastávek:", error);
  }
  finally {
    zastavkySearchNode.loading = false;
  }
}

// Update popup polohy
const updatePolohaPopup = async (feature) => {
  const featureAtt = feature.attributes || feature.graphic.attributes;
  const featureLr = feature.layer || feature.graphic.layer;

  const query = {
    returnGeometry: false,
    where: `${featureLr.objectIdField} = ${featureAtt[featureLr.objectIdField]}`
  }
  
  let selectedFeatures;
  try {
    selectedFeatures = await featureLr.queryFeatures(query);
  }
  catch {
    console.log("Chyba dotazu na jízdní data");
  }

  if (selectedFeatures.features.length > 0) {
    
    const selectedFeatureAtt = selectedFeatures.features[0].attributes;
 
    const zpozdeniAtt = selectedFeatureAtt.ZPOZDENI_MIN_FORMAT;
    const rychlostAtt = selectedFeatureAtt.RYCHLOST_KM_H_FORMAT;
    const zastavkaAtt = selectedFeatureAtt.POSLEDNI_ZASTAVKA_NAME;
    const bezbarierovostAtt = selectedFeatureAtt.BEZBARIEROVOST_FORMAT;

    popupPolohaZpozdeni.innerHTML = zpozdeniAtt;
    popupPolohaRychlost.innerHTML = rychlostAtt;
    popupPolohaZastavka.innerHTML = zastavkaAtt;
    popupPolohaBezbarierovost.innerHTML = bezbarierovostAtt;
  }

  return(polohaPopupContentEl);
}

// Kontrola, zda prvek pochází z některé vrstvy polohy vozidel
const isPolohaFeature = (feature) => {
  return polohaLrs?.some((polohaLr) => feature?.layer?.id === polohaLr.id);
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

// Získání zastávkových odjezdů
const getZastavkyData = async (featureAtt) => {
  const query = {
    returnGeometry: false,
    where: `${config.searchOdjezdyField} = '${featureAtt[config.zastavkaIdField]}-${featureAtt[config.zastavkaSmerField]}'`
  }

  try {
    const data = await odjezdyLr.queryFeatures(query);
    return data;
  }
  catch {
    console.log("Chyba dotazu na zastávkové odjezdy");
    return "ERROR";
  }
}

// Update popup zastávek
const updateZastavkyPopup = async (feature) => {
  const featureAtt = feature.attributes || feature.graphic.attributes;

  const selectedFeatures = await getZastavkyData(featureAtt);
    
  popupZastavkyOdjezdyRows.innerHTML = null;
  let newHtml = "";

  if (selectedFeatures !== "ERROR" && selectedFeatures.features.length > 0) {
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

  return(zastavkyPopupContentEl);
}

// Zvýraznění trasy po identifikaci vozidla
const filterTrasa = async (feature) => {
  const linkaField = feature?.attributes?.[config.polohaLinkaField];
  const trasyLrView = await view.whenLayerView(trasyLr);

  if (linkaField) {
    const filter = new FeatureFilter({
      where: `trasa LIKE '%(${linkaField})%'`,
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

// Nastavení URL parametru zastávky
const setStopUrlParameter = (feature) => {
  if (feature) {
    const stopId = feature?.attributes?.[config.zastavkaIdField];
    const postId = feature?.attributes?.[config.zastavkaSmerField];
    const stopPostId = `${stopId}-${postId}`;
    url.searchParams.set("stop", stopPostId);
    window.history.replaceState({}, '', url.toString());
  }
  else {
    url.searchParams.delete('stop');
    window.history.replaceState({}, '', url.toString());
  }
}

// Zavření informačního okna při nedostupnosti dat
const closeNoDataInfo = () => {
  noDataInfoWasClosed = true;
  noDataScreen.style.display = "none";
}

// Kontrola, zda je aktuální čas v zadaném rozmezí (podporuje přechod přes půlnoc)
const isTimeInRange = (fromStr, toStr, date = new Date()) => {
  const toMinutes = s => {
    const [h, m = "0"] = s.split(":");
    return parseInt(h, 10) * 60 + parseInt(m, 10);
  };
  const from = toMinutes(fromStr);
  const to = toMinutes(toStr);
  const cur = date.getHours() * 60 + date.getMinutes();
  if (from <= to) return cur >= from && cur <= to;
  // rozmezí přechází přes půlnoc
   return cur >= from || cur <= to;
};

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


    

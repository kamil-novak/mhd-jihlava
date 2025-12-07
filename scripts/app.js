// ------------------------------------
// GLOBÁLNÍ NASTAVENÍ
// ------------------------------------ 
// --- Globální proměnné ---
let polohaLr;
let zastavkyLr;
let trasyLr;
let trasyHighlightLr;

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
const TileLayer = await $arcgis.import("@arcgis/core/layers/TileLayer.js");
const Basemap = await $arcgis.import("@arcgis/core/Basemap.js");
const BasemapGallery = await $arcgis.import("@arcgis/core/widgets/BasemapGallery.js");
const Search = await $arcgis.import("@arcgis/core/widgets/Search.js");
const FeatureLayer = await $arcgis.import("@arcgis/core/layers/FeatureLayer.js");
const Graphic = await $arcgis.import("@arcgis/core/Graphic.js");
const GraphicsLayer = await $arcgis.import("@arcgis/core/layers/GraphicsLayer.js");


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
  polohaLr.popupEnabled = true;
})

reactiveUtils.watch(
  () => [view.updating, view.popup?.selectedFeature],
  async ([updating, selectedFeature]) => {
    if (!updating && selectedFeature?.layer?.id === polohaLr.id) {
      const content = await polohaPopup(selectedFeature);

      const title = `
        <span class="popup-vehicle popup-${selectedFeature.attributes.TYP_VOZIDLA}"></span>
        Linka ${selectedFeature.attributes.LINKA} 
        <span class="popup-direction">(směr ${selectedFeature.attributes.CILOVA_ZASTAVKA_NAME})</span>
      `
      polohaLr.popupTemplate = {
        overwriteActions: true,
        outFields: ["*"],
        content,
        title
      }
    }
  }
);


// ------------------------------------
// FUNKCE
// ------------------------------------
// Školy pop-up
const polohaPopup = async (feature) => {

  let popup = "Nepodařilo se načíst informace o vozidle."

  const query = {
    where: `${polohaLr.objectIdField} = ${feature.attributes[polohaLr.objectIdField]}`
  }
  
  const selectedFeatures = await polohaLr.queryFeatures(query);
  
  if (selectedFeatures.features.length === 0) {
    return popup
  }

  const selectedFeature = selectedFeatures.features[0].attributes;
  const zpozdeniAtt = selectedFeature.ZPOZDENI_MIN_FORMAT;
  const rychlostAtt = selectedFeature.RYCHLOST_KM_H_FORMAT;
  const zastavkaAtt = selectedFeature.POSLEDNI_ZASTAVKA_NAME;
  const bezbarierovostAtt = selectedFeature.BEZBARIEROVOST_FORMAT;

  const content = `
    <div class="popup-table">
      <div class="popup-table-row">
        <div>Zpoždění</div>
        <div>${zpozdeniAtt}</div>
      </div>
      <div class="popup-table-row">
        <div>Rychlost / stav</div>
        <div>${rychlostAtt}</div>
      </div>
      <div class="popup-table-row">
        <div>Poslední projetá zastávka</div>
        <div>${zastavkaAtt}</div>
      </div>
      <div class="popup-table-row">
        <div>Bezbariérovost</div>
        <div>${bezbarierovostAtt}</div>
      </div>
    </div>
  `
  
  popup = document.createElement("div");
  popup.classList.add("school-popup")
  popup.innerHTML = content;

  return popup; 
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


    
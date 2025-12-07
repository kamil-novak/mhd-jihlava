// -----------------------------------------------------------------------------------
// NASTAVENÍ MAPOVÉ APLIKACE 
// Vybraná nastavení lze provádět pomocí tohoto konfiguračního souboru (viz komentáře)
// Jiná nastavení je nutné provádět přímo v aplikaci
// -----------------------------------------------------------------------------------

var config = {
    
    // Text v horní liště mapové aplikace
    headerTitle: "Hlášení závad ve městě",
    
    // Text v horní liště mapové aplikace
    headerLink: "https://www.jihlava.cz/projekty-pro-verejnost/d-465410",

    // ID webové mapy
    webmapId: "6eab4160ae6a40be8baf4aa7dfe04b15",

    // URL služby pro editaci ( resp. vrstva ve formátu https://...FeatureServer/IDvrstvy )
    editFeatureUrl: "https://gis.jihlava-city.cz/server1/rest/services/verejnost/verejnost_hlaseni_zavad/FeatureServer/0",

    // Souřadnicový systém webov mapy ( kód EPSG )
    webmapSpatialReference: 5514,

    // Portal URL
    portalUrl: "https://gis.jihlava-city.cz/portal",

    // Typ závady 
    // name = libovolný název, který se objeví ve formuláři
    // code = kód domény v geodatabázi; 
    // image = cesta na thumbnail, který se objeví ve formuláři (cesta na soubor nebo URL obrázku)
    // *ideální je použití vektorového obrázku (SVG)
    problemTyp: [
        {
            name: "Odpady",
            code: "odpady",
            image: "images/category_odpady.svg"
        },
        /* {
            name: "Zeleň",
            code: "zeleň",
            image: "images/category_zelen.svg"
        },
        {
            name: "Poškozené věci",
            code: "poškozené věci",
            image: "images/category_poskozene_veci.svg"
        }, */
        {
            name: "Osvětlení",
            code: "osvětlení",
            image: "images/category_osvetleni.svg"
        },
        {
            name: "Dětské hřiště",
            code: "dětské hřiště",
            image: "images/category_detske_hriste.svg"
        },
        {
            name: "Ostatní",
            code: "ostatní",
            image: "images/category_ostatni.svg"
        }
    ],

    // Zpráva při přepnutí "Připojit fotografii"
    attachmentMessage: "Doporučujeme přiložení fotografie pro snadnější určení rozsahu závady.",
 
    // Obsah widgetu o aplikaci (HTML)
    infoWidgetContent: "<div class='about-widget'><h3>Hlášení závad ve městě</h3><div><h4>Autoři</h4><p><a href='https://jihlava.cz' target='_blank'>Statutární město Jihlava</a><br>odbor informatiky<br>gis@jihlava-city.cz<br>Verze 1.1.0</p></div></div>",

    // Maximální rozměry a kvalita přílohy
    // quality = zadávat v rozmezí 0-1 (např. 0.75)
    // U rozměrů se zohledňuje, zda je obrázek na šířku nebo na výšku
    attachments: {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.7
    }
};
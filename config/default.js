// -----------------------------------------------------------------------------------
// NASTAVENÍ MAPOVÉ APLIKACE 
// Vybraná nastavení lze provádět pomocí tohoto konfiguračního souboru (viz komentáře)
// Jiná nastavení je nutné provádět přímo v aplikaci
// -----------------------------------------------------------------------------------

const config = {
    
    // Text v horní liště mapové aplikace
    headerTitle: "Online mapa MHD v Jihlavě",
    
    // Text v horní liště mapové aplikace
    headerLink: "https://www.jihlava.cz/projekty-pro-verejnost/d-465410",

    // ID webové mapy
    webmapId: "c038c0a515ba4b508305677a2013838d",

    // Portal URL
    portalUrl: "https://mapy.jihlava-city.cz/portal",

    // ID vrstvy polohy vozidel MHD (v rámci webové mapy)
    polohaVozidelLrId: "199cfe80b98-layer-4",

    // ID vrstvy zastávek MHD (v rámci webové mapy)
    zastavkyLrId: "19af80f47d5-layer-4",

    // ID vrstvy tras MHD (v rámci webové mapy)
    trasyLrId: "19af81068fc-layer-5",

    // Obsah widgetu o aplikaci (HTML)
    infoWidgetContent: "<div class='about-widget'><h3>Online mapa MHD v Jihlavě</h3><div><h4>Autoři</h4><p><a href='https://jihlava.cz' target='_blank'>Statutární město Jihlava</a><br>odbor informatiky<br>gis@jihlava-city.cz<br>Verze 1.0.0</p></div></div>",

};
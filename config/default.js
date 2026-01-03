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

    // URL tabulky zastávkových odjezdů (tabulka v rámci CDF Feature služby)
    // Př. https://mapy.jihlava-city.cz/server1/rest/services/mhdJihlavaZastavky/FeatureServer/0
    zastavkoveOdjezdyLrUrl: "https://mapy.jihlava-city.cz/server1/rest/services/mhdJihlavaZastavky/FeatureServer/0",

    // Pole pro hledání zastávkových odjezdů v tabulce definované v zastavkoveOdjezdyLrUrl
    searchOdjezdyField: "STOP_POST_ID",

    // Pole určující název linky ve vrstvě definované v polohaVozidelLrId
    polohaLinkaField: "LINKA",

    // Pole formátovaných zastávkových odjezdů v tabulce definované v zastavkoveOdjezdyLrUrl
    odjezdyField: "POPUP_ROW",

    // Pole určující ID zastávky ve vrstvě definované v zastavkyLrId
    zastavkaIdField: "elp_id",

    // Pole určující směr zastávky ve vrstvě definované v zastavkyLrId
    zastavkaSmerField: "elp_post",

    // Pole určující název zastávky ve vrstvě definované v zastavkyLrId
    zastavkaNazevField: "nazev",

    // Pole určující bezbariérovost zastávky ve vrstvě definované v zastavkyLrId
    zastavkaBezbarField: "bezbar",

    // Pole se seznamem linek ve vrstvě definované v zastavkyLrId
    zastavkaLinkyField: "linky",

    // Text v případě, že nebyly identifikovány zastávkové odjezdy
    noOdjezdyText: "Pro tuto zastávku v tomto směru nebyly aktuálně nalezeny žádné zastávkové odjezdy.",

    // Obsah widgetu o aplikaci (HTML)
    infoWidgetContent: "<div class='about-widget'><h3>Online mapa MHD v Jihlavě</h3><div><h4>Autoři</h4><p><a href='https://jihlava.cz' target='_blank'>Statutární město Jihlava</a><br>odbor informatiky<br>gis@jihlava-city.cz<br>Verze 1.0.1</p></div></div>",

    // Zapnout automatické zobrazování informačního okna v situaci,
    // kdy server nevrací žádná data polohy vozidel
    noDataInfoEnable: true,

    // Časový interval, ve kterém informační okno při nedostupnosti dat polohy vozidel, zobrazovat.
    // Formát: 7:30, 21:35, 0:30 apod.
    noDataInfoFrom: "5:00",
    noDataInfoTo: "0:30",

    // Text upozornění, pokud server nevrací čádná data polohy vozidel
    noDataText: "Data aktuální polohy vozidel MHD nejsou momentálně dostupná. Omlouváme se."

};
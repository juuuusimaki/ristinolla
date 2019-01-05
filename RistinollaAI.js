// Ristinolla tietokonetta vastaan 3*3-ruudukolla. Tietokone osaa automaattisesti valita pelattavan ruudun, tunnistaa voittomahdollisuudet sekä etsii viereisiä vapaita ruutuja.
//12.12.2018 Juuso Uusimäki
var GameState = /** @class */ (function () {
    function GameState() {
        // Luodaan pelialue seuraamista varten
        this.game_matrix = [[0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]]; // 0 = pelaamaton/tyhjä, 1 = tietokone, 2 = pelaaja
    }
    return GameState;
}());
var rivinumero, sarakenumero; // Luodaan rivi- ja sarakeindeksit
var game_status = new GameState(); // Luodaan olio pelitilanteesta
function init() {
    console.log("Odotetaan aloitusnappulan painallusta."); // Tulostetaan sanoma konsoliin
    game_status.i = 0; // Nollataan peli varmuuden vuoksi
    game_status.pelaajavoitto = 0;
    game_status.tietokonevoitto = 0;
    game_status.tasapeli = 0;
    game_status.vuoro = 1; // Ruksi (1) aloittaa ensimmäisen pelin
}
function Reset(frmKohde) {
    console.log("Aloitetaan uusi peli, ja alustetaan pelin tiedot.");
    console.log("Peli alkaa.");
    game_status.i = 0; // Pelin ensimmäinen vuoro, laskuri alkaa nollasta
    if (game_status.vuoro == 1) { // Aloitusvuoro vaihtuu uuden pelin alkaessa - ilmoitetaan asiasta tekstikentässä
        frmKohde.txtVuoro.value = "Tietokoneen vuoro";
    }
    if (game_status.vuoro == 2) {
        frmKohde.txtVuoro.value = "Pelaajan vuoro";
    }
    game_status.voitto = false; // Alustetaan voittotilanne. Alussa ei vielä voittajaa.
    game_status.game_matrix = [[0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]];
    // Tässä alustetaan kuvat
    frmKohde.p0_0.src = "check.png"; // Palautetaan rasti kuvaksi
    frmKohde.p0_0.disabled = false; // Palautetaan käytettäväksi
    frmKohde.p0_1.src = "check.png";
    frmKohde.p0_1.disabled = false;
    frmKohde.p0_2.src = "check.png";
    frmKohde.p0_2.disabled = false;
    frmKohde.p1_0.src = "check.png";
    frmKohde.p1_0.disabled = false;
    frmKohde.p1_1.src = "check.png";
    frmKohde.p1_1.disabled = false;
    frmKohde.p1_2.src = "check.png";
    frmKohde.p1_2.disabled = false;
    frmKohde.p2_0.src = "check.png";
    frmKohde.p2_0.disabled = false;
    frmKohde.p2_1.src = "check.png";
    frmKohde.p2_1.disabled = false;
    frmKohde.p2_2.src = "check.png";
    frmKohde.p2_2.disabled = false;
    n = 0; // Nollataan indeksit
    m = 0;
    if (game_status.vuoro == 1) { // Ajetaan tietokoneen vuoro, jos aloitusvuoro on koneella
        AI(frmKohde);
    }
    frmKohde.btnReset.disabled = true; // Poistetaan reset käytöstä ensimmäisellä vuorolla, sillä se aiheutti ongelmia, koska AI:lla on tuo sekunnin viive pelin miellyttävyyden lisäämiseksi
}
// Funktio, jota hiiren painalluksella kutsutaan (Käytännössä pelaajan vuoro)
function Change(frmKohde, imgKuva) {
    if (game_status.voitto == true || game_status.i == 9) { // Jos jompikumpi on voittanut tai peli on loppunut, ilmoitetaan asiasta
        console.log("Peli on ohi.");
        alert("Peli on ohi. Aloita uusi peli!");
        return;
    }
    if (game_status.vuoro == 2) { // Ajetaan funktio vain, jos on pelaajan siirto. Näin estetään pelaaminen koneen vuorolla
        console.log("Vuoro " + game_status.i); // Tulostetaan vuoronumero konsoliin seurannan helpottamiseksi
        if (game_status.i < 9) { // Ajetaan peliä maksimissaan 9 vuoroa
            if (imgKuva.disabled != true) { // Ajetaan, jos kuvaa ei ole poistettu käytöstä
                imgKuva.src = "circle.png"; // Vaihdetaan kuva rastista ympyräksi
                rivinumero = imgKuva.id.charAt(1); // Haetaan kuvan id:stä oikea rivi
                sarakenumero = imgKuva.id.charAt(3); // Samoin sarake
                imgKuva.disabled = true; // Poistetaan valittu kuva käytöstä
                game_status.game_matrix[rivinumero][sarakenumero] = 2; // Sijoitetaan löydettyyn kohtaan numero 2
                game_status.i++; // Ynnätään pelin vuoronumeroon 1
                game_status.vuoro = 1; // Siirretään vuoro tietokoneelle
                console.log("Pelaaja merkitsee riville " + rivinumero + " sarakkeeseen " + sarakenumero + " ympyrän (2)."); // Tulostetaan konsoliin vuoron tapahtuma
                frmKohde.txtVuoro.value = "Tietokoneen vuoro"; // Vaihdetaan vuoro tekstilaatikossa
                Voitto(frmKohde); // Ajetaan voitontarkistusfunktio
                if (game_status.voitto == false && game_status.i < 9) { // Jos ei voitettu vielä, eikä peli ole loppunut, ajetaan tietokoneen vuoro
                    AI(frmKohde);
                }
            }
            else { // Jos kuva on poistettu käytöstä (jo pelattu), ehdotetaan valitsemaan vapaa kuva
                alert("Valitse pelaamaton ruutu!");
            }
        }
    }
}
var n; // Kaksi lukua tekoälyn siirtovalintaa varten (samat kuin rivi- ja sarakenumero, mutta pidetään erillään varmuuden vuoksi)
var m;
// Tietokoneen toiminnasta vastaava funktio. 
function AI(frmKohde) {
    if (game_status.vuoro == 1) { // Ajetaan, jos on tietokoneen vuoro
        console.log("Vuoro " + game_status.i); // Printataan vuoronumero seurausmielessä
        setTimeout(function () {
            if (game_status.i < 8) { // Haetaan vuoron alussa satunnaisluvut siirtoa varten
                n = Math.floor(Math.random() * 3); // Satunnainen kokonaisluku riveille
                m = Math.floor(Math.random() * 3); // Sama sarakkeille
            }
            Valinta(); // Tietokoneen siirron valintafunktio. Tarkastaa koneen ja pelaajan voittomahdollisuudet, viereiset ruudut sekä etsii tarvittaessa tyhjän ruudun.
            // Seuraavaksi etsitään valittua alkiota vastaava html-id
            // Luodaan matriisi käsittelyn helpottamiseksi
            var Kuvamatriisi = [[frmKohde.p0_0, frmKohde.p0_1, frmKohde.p0_2],
                [frmKohde.p1_0, frmKohde.p1_1, frmKohde.p1_2],
                [frmKohde.p2_0, frmKohde.p2_1, frmKohde.p2_2]];
            var imgKuva = Kuvamatriisi[n][m]; // Haetaan oikea id kuvamatriisista indeksien n, m avulla
            imgKuva.src = "cross.png"; // Vaihdetaan haettu kuva rastista ruksiksi
            imgKuva.disabled = true; // Poistetaan kuva käytöstä estäen kuvan uudelleen pelaaminen
            game_status.i++; // Ynnätään pelin vuoronumeroon 1
            console.log(game_status.game_matrix); // Seurataan tilannetta konsolista
            console.log("Tietokone merkitsee riville " + n + " sarakkeeseen " + m + " ruksin (1).");
            game_status.vuoro = 2; // Vaihdetaan vuoro pelaajalle
            frmKohde.txtVuoro.value = "Pelaajan vuoro"; // Vaihdetaan vuoro tekstikenttään
            Voitto(frmKohde); // Ajetaan voitontarkistusfunktio
        }, 1000); // Odotetaan sekunti ennen siirtoa. Tämä ei pakollista, mutta saa pelin tuntumaan peliltä. 
    }
    frmKohde.btnReset.disabled = false; // Palautetaan reset-nappula käytettäväksi ensimmäisen vuoron jälkeen
}
// Tietokoneen tekoäly, jonka avulla kone valitsee pelattavan ruutunsa.
function Valinta() {
    if (game_status.i > 1) { // Tarkistetaan koneen välitön voittomahdollisuus (Kaksi raksia rivillä, sarakkeella tai viistolla)
        // Pystyrivit
        if (((game_status.game_matrix[0][0] == 1) && (game_status.game_matrix[1][0] == 1)) && game_status.game_matrix[2][0] == 0) {
            game_status.game_matrix[2][0] = 1;
            n = 2;
            m = 0;
            console.log("Pysty1");
            return;
        }
        if (((game_status.game_matrix[1][0] == 1) && (game_status.game_matrix[2][0] == 1)) && game_status.game_matrix[0][0] == 0) {
            game_status.game_matrix[0][0] = 1;
            n = 0;
            m = 0;
            console.log("Pysty1");
            return;
        }
        if (((game_status.game_matrix[0][0] == 1) && (game_status.game_matrix[2][0] == 1)) && game_status.game_matrix[1][0] == 0) {
            game_status.game_matrix[1][0] = 1;
            n = 1;
            m = 0;
            console.log("Pysty1");
            return;
        }
        if (((game_status.game_matrix[0][1] == 1) && (game_status.game_matrix[1][1] == 1)) && game_status.game_matrix[2][1] == 0) {
            game_status.game_matrix[2][1] = 1;
            n = 2;
            m = 1;
            console.log("Pysty2");
            return;
        }
        if (((game_status.game_matrix[1][1] == 1) && (game_status.game_matrix[2][1] == 1)) && game_status.game_matrix[0][1] == 0) {
            game_status.game_matrix[0][1] = 1;
            n = 0;
            m = 1;
            console.log("Pysty2");
            return;
        }
        if (((game_status.game_matrix[0][1] == 1) && (game_status.game_matrix[2][1] == 1)) && game_status.game_matrix[1][1] == 0) {
            game_status.game_matrix[1][1] = 1;
            n = 1;
            m = 1;
            console.log("Pysty2");
            return;
        }
        if (((game_status.game_matrix[0][2] == 1) && (game_status.game_matrix[1][2] == 1)) && game_status.game_matrix[2][2] == 0) {
            game_status.game_matrix[2][2] = 1;
            n = 2;
            m = 2;
            console.log("Pysty3");
            return;
        }
        if (((game_status.game_matrix[1][2] == 1) && (game_status.game_matrix[2][2] == 1)) && game_status.game_matrix[0][2] == 0) {
            game_status.game_matrix[0][2] = 1;
            n = 0;
            m = 2;
            console.log("Pysty3");
            return;
        }
        if (((game_status.game_matrix[0][2] == 1) && (game_status.game_matrix[2][2] == 1)) && game_status.game_matrix[1][2] == 0) {
            game_status.game_matrix[1][2] = 1;
            n = 1;
            m = 2;
            console.log("Pysty3");
            return;
        }
        // Vaakarivit
        if (((game_status.game_matrix[0][0] == 1) && (game_status.game_matrix[0][1] == 1)) && game_status.game_matrix[0][2] == 0) {
            game_status.game_matrix[0][2] = 1;
            n = 0;
            m = 2;
            console.log("Vaaka1");
            return;
        }
        if (((game_status.game_matrix[0][1] == 1) && (game_status.game_matrix[0][2] == 1)) && game_status.game_matrix[0][0] == 0) {
            game_status.game_matrix[0][0] = 1;
            n = 0;
            m = 0;
            console.log("Vaaka1");
            return;
        }
        if (((game_status.game_matrix[0][0] == 1) && (game_status.game_matrix[0][2] == 1)) && game_status.game_matrix[0][1] == 0) {
            game_status.game_matrix[0][1] = 1;
            n = 0;
            m = 1;
            console.log("Vaaka1");
            return;
        }
        if (((game_status.game_matrix[1][0] == 1) && (game_status.game_matrix[1][1] == 1)) && game_status.game_matrix[1][2] == 0) {
            game_status.game_matrix[1][2] = 1;
            n = 1;
            m = 2;
            console.log("Vaaka2");
            return;
        }
        if (((game_status.game_matrix[1][1] == 1) && (game_status.game_matrix[1][2] == 1)) && game_status.game_matrix[1][0] == 0) {
            game_status.game_matrix[1][0] = 1;
            n = 1;
            m = 0;
            console.log("Vaaka2");
            return;
        }
        if (((game_status.game_matrix[1][0] == 1) && (game_status.game_matrix[1][2] == 1)) && game_status.game_matrix[1][1] == 0) {
            game_status.game_matrix[1][1] = 1;
            n = 1;
            m = 1;
            console.log("Vaaka2");
            return;
        }
        if (((game_status.game_matrix[2][0] == 1) && (game_status.game_matrix[2][1] == 1)) && game_status.game_matrix[2][2] == 0) {
            game_status.game_matrix[2][2] = 1;
            n = 2;
            m = 2;
            console.log("Vaaka3");
            return;
        }
        if (((game_status.game_matrix[2][1] == 1) && (game_status.game_matrix[2][2] == 1)) && game_status.game_matrix[2][0] == 0) {
            game_status.game_matrix[2][0] = 1;
            n = 2;
            m = 0;
            console.log("Vaaka3");
            return;
        }
        if (((game_status.game_matrix[2][0] == 1) && (game_status.game_matrix[2][2] == 1)) && game_status.game_matrix[2][1] == 0) {
            game_status.game_matrix[2][1] = 1;
            n = 2;
            m = 1;
            console.log("Vaaka3");
            return;
        }
        // Viistot
        if (((game_status.game_matrix[0][0] == 1) && (game_status.game_matrix[1][1] == 1)) && game_status.game_matrix[2][2] == 0) {
            game_status.game_matrix[2][2] = 1;
            n = 2;
            m = 2;
            console.log("Esto, viistoV1");
            return;
        }
        if (((game_status.game_matrix[1][1] == 1) && (game_status.game_matrix[2][2] == 1)) && game_status.game_matrix[0][0] == 0) {
            game_status.game_matrix[0][0] = 1;
            n = 0;
            m = 0;
            console.log("ViistoV2");
            return;
        }
        if (((game_status.game_matrix[0][0] == 1) && (game_status.game_matrix[2][2] == 1)) && game_status.game_matrix[1][1] == 0) {
            game_status.game_matrix[1][1] = 1;
            n = 1;
            m = 1;
            console.log("ViistoV3");
            return;
        }
        if (((game_status.game_matrix[0][2] == 1) && (game_status.game_matrix[1][1] == 1)) && game_status.game_matrix[2][0] == 0) {
            game_status.game_matrix[2][0] = 1;
            n = 2;
            m = 0;
            console.log("ViistoO1");
            return;
        }
        if (((game_status.game_matrix[1][1] == 1) && (game_status.game_matrix[2][0] == 1)) && game_status.game_matrix[0][2] == 0) {
            game_status.game_matrix[0][2] = 1;
            n = 0;
            m = 2;
            console.log("ViistoO2");
            return;
        }
        if (((game_status.game_matrix[0][2] == 1) && (game_status.game_matrix[2][0] == 1)) && game_status.game_matrix[1][1] == 0) {
            game_status.game_matrix[1][1] = 1;
            n = 1;
            m = 1;
            console.log("ViistoO3");
            return;
        }
    }
    if (game_status.i > 1) { // Jos koneella ei ole välitöntä voittomahdollisuutta, tarkistetaan pelaajan voittomahdollisuus ja estetään se
        // Pystyrivit
        if (((game_status.game_matrix[0][0] == 2) && (game_status.game_matrix[1][0] == 2)) && game_status.game_matrix[2][0] == 0) {
            game_status.game_matrix[2][0] = 1;
            n = 2;
            m = 0;
            console.log("Esto, pysty1");
            return;
        }
        if (((game_status.game_matrix[1][0] == 2) && (game_status.game_matrix[2][0] == 2)) && game_status.game_matrix[0][0] == 0) {
            game_status.game_matrix[0][0] = 1;
            n = 0;
            m = 0;
            console.log("Esto, pysty1");
            return;
        }
        if (((game_status.game_matrix[0][0] == 2) && (game_status.game_matrix[2][0] == 2)) && game_status.game_matrix[1][0] == 0) {
            game_status.game_matrix[1][0] = 1;
            n = 1;
            m = 0;
            console.log("Esto, pysty1");
            return;
        }
        if (((game_status.game_matrix[0][1] == 2) && (game_status.game_matrix[1][1] == 2)) && game_status.game_matrix[2][1] == 0) {
            game_status.game_matrix[2][1] = 1;
            n = 2;
            m = 1;
            console.log("Esto, pysty2");
            return;
        }
        if (((game_status.game_matrix[1][1] == 2) && (game_status.game_matrix[2][1] == 2)) && game_status.game_matrix[0][1] == 0) {
            game_status.game_matrix[0][1] = 1;
            n = 0;
            m = 1;
            console.log("Esto, pysty2");
            return;
        }
        if (((game_status.game_matrix[0][1] == 2) && (game_status.game_matrix[2][1] == 2)) && game_status.game_matrix[1][1] == 0) {
            game_status.game_matrix[1][1] = 1;
            n = 1;
            m = 1;
            console.log("Esto, pysty2");
            return;
        }
        if (((game_status.game_matrix[0][2] == 2) && (game_status.game_matrix[1][2] == 2)) && game_status.game_matrix[2][2] == 0) {
            game_status.game_matrix[2][2] = 1;
            n = 2;
            m = 2;
            console.log("Esto, pysty3");
            return;
        }
        if (((game_status.game_matrix[1][2] == 2) && (game_status.game_matrix[2][2] == 2)) && game_status.game_matrix[0][2] == 0) {
            game_status.game_matrix[0][2] = 1;
            n = 0;
            m = 2;
            console.log("Esto, pysty3");
            return;
        }
        if (((game_status.game_matrix[0][2] == 2) && (game_status.game_matrix[2][2] == 2)) && game_status.game_matrix[1][2] == 0) {
            game_status.game_matrix[1][2] = 1;
            n = 1;
            m = 2;
            console.log("Esto, pysty3");
            return;
        }
        // Vaakarivit
        if (((game_status.game_matrix[0][0] == 2) && (game_status.game_matrix[0][1] == 2)) && game_status.game_matrix[0][2] == 0) {
            game_status.game_matrix[0][2] = 1;
            n = 0;
            m = 2;
            console.log("Esto, vaaka1");
            return;
        }
        if (((game_status.game_matrix[0][1] == 2) && (game_status.game_matrix[0][2] == 2)) && game_status.game_matrix[0][0] == 0) {
            game_status.game_matrix[0][0] = 1;
            n = 0;
            m = 0;
            console.log("Esto, vaaka1");
            return;
        }
        if (((game_status.game_matrix[0][0] == 2) && (game_status.game_matrix[0][2] == 2)) && game_status.game_matrix[0][1] == 0) {
            game_status.game_matrix[0][1] = 1;
            n = 0;
            m = 1;
            console.log("Esto, vaaka1");
            return;
        }
        if (((game_status.game_matrix[1][0] == 2) && (game_status.game_matrix[1][1] == 2)) && game_status.game_matrix[1][2] == 0) {
            game_status.game_matrix[1][2] = 1;
            n = 1;
            m = 2;
            console.log("Esto, vaaka2");
            return;
        }
        if (((game_status.game_matrix[1][1] == 2) && (game_status.game_matrix[1][2] == 2)) && game_status.game_matrix[1][0] == 0) {
            game_status.game_matrix[1][0] = 1;
            n = 1;
            m = 0;
            console.log("Esto, vaaka2");
            return;
        }
        if (((game_status.game_matrix[1][0] == 2) && (game_status.game_matrix[1][2] == 2)) && game_status.game_matrix[1][1] == 0) {
            game_status.game_matrix[1][1] = 1;
            n = 1;
            m = 1;
            console.log("Esto, vaaka2");
            return;
        }
        if (((game_status.game_matrix[2][0] == 2) && (game_status.game_matrix[2][1] == 2)) && game_status.game_matrix[2][2] == 0) {
            game_status.game_matrix[2][2] = 1;
            n = 2;
            m = 2;
            console.log("Esto, vaaka3");
            return;
        }
        if (((game_status.game_matrix[2][1] == 2) && (game_status.game_matrix[2][2] == 2)) && game_status.game_matrix[2][0] == 0) {
            game_status.game_matrix[2][0] = 1;
            n = 2;
            m = 0;
            console.log("Esto, vaaka3");
            return;
        }
        if (((game_status.game_matrix[2][0] == 2) && (game_status.game_matrix[2][2] == 2)) && game_status.game_matrix[2][1] == 0) {
            game_status.game_matrix[2][1] = 1;
            n = 2;
            m = 1;
            console.log("Esto, vaaka3");
            return;
        }
        // Viistot
        if (((game_status.game_matrix[0][0] == 2) && (game_status.game_matrix[1][1] == 2)) && game_status.game_matrix[2][2] == 0) {
            game_status.game_matrix[2][2] = 1;
            n = 2;
            m = 2;
            console.log("Esto, viistoV1");
            return;
        }
        if (((game_status.game_matrix[1][1] == 2) && (game_status.game_matrix[2][2] == 2)) && game_status.game_matrix[0][0] == 0) {
            game_status.game_matrix[0][0] = 1;
            n = 0;
            m = 0;
            console.log("Esto, viistoV2");
            return;
        }
        if (((game_status.game_matrix[0][0] == 2) && (game_status.game_matrix[2][2] == 2)) && game_status.game_matrix[1][1] == 0) {
            game_status.game_matrix[1][1] = 1;
            n = 1;
            m = 1;
            console.log("Esto, viistoV3");
            return;
        }
        if (((game_status.game_matrix[0][2] == 2) && (game_status.game_matrix[1][1] == 2)) && game_status.game_matrix[2][0] == 0) {
            game_status.game_matrix[2][0] = 1;
            n = 2;
            m = 0;
            console.log("Esto, viistoO1");
            return;
        }
        if (((game_status.game_matrix[1][1] == 2) && (game_status.game_matrix[2][0] == 2)) && game_status.game_matrix[0][2] == 0) {
            game_status.game_matrix[0][2] = 1;
            n = 0;
            m = 2;
            console.log("Esto, viistoO2");
            return;
        }
        if (((game_status.game_matrix[0][2] == 2) && (game_status.game_matrix[2][0] == 2)) && game_status.game_matrix[1][1] == 0) {
            game_status.game_matrix[1][1] = 1;
            n = 1;
            m = 1;
            console.log("Esto, viistoO3");
            return;
        }
    }
    if (game_status.game_matrix[n][m] == 1) { // Jos kumpikaan ei ole voittamassa, etsitään viereistä tyhjää kohtaa edellisen siirron vierestä
        if ((n + 1 < 3) && (game_status.game_matrix[n + 1][m] == 0)) {
            n = n + 1;
            game_status.game_matrix[n][m] = 1;
            console.log("1");
            return;
        }
        if ((n - 1 > -1) && (game_status.game_matrix[n - 1][m] == 0)) {
            n = n - 1;
            game_status.game_matrix[n][m] = 1;
            console.log("2");
            return;
        }
        if ((m + 1 < 3) && (game_status.game_matrix[n][m + 1] == 0)) {
            m = m + 1;
            game_status.game_matrix[n][m] = 1;
            console.log("3");
            return;
        }
        if ((m - 1 > -1) && (game_status.game_matrix[n][m - 1] == 0)) {
            m = m - 1;
            game_status.game_matrix[n][m] = 1;
            console.log("4");
            return;
        }
        if (((n + 1 < 3) && (m + 1 < 3)) && (game_status.game_matrix[n + 1][m + 1] == 0)) {
            n = n + 1;
            m = m + 1;
            game_status.game_matrix[n][m] = 1;
            console.log("5");
            return;
        }
        if (((n - 1 > -1) && (m - 1 > -1)) && (game_status.game_matrix[n - 1][m - 1] == 0)) {
            n = n - 1;
            m = m - 1;
            game_status.game_matrix[n][m] = 1;
            console.log("6");
            return;
        }
        if (((n + 1 < 3) && (m - 1 > -1)) && (game_status.game_matrix[n + 1][m - 1] == 0)) {
            n = n + 1;
            m = m - 1;
            game_status.game_matrix[n][m] = 1;
            console.log("7");
            return;
        }
        if (((n - 1 > -1) && (m + 1 < 3)) && (game_status.game_matrix[n - 1][m + 1] == 0)) {
            n = n - 1;
            m = m + 1;
            game_status.game_matrix[n][m] = 1;
            console.log("8");
            return;
        }
    }
    if (game_status.game_matrix[n][m] == 0) { // Jos aikaisemmat ehdot eivät toteudu, jos vuoron alussa arvottu paikka tyhjä, niin sijoitetaan luku 1
        game_status.game_matrix[n][m] = 1;
        console.log("Tyhjään");
        return;
    }
    if (game_status.game_matrix[n][m] != 0) { // Jos ei sopivia paikkoja, etsitään uusi tyhjä paikka
        while (game_status.game_matrix[n][m] != 0) { // Jatka niin kauan kun sarakkeessa ei ole nollaa
            n = Math.floor(Math.random() * 3); // Satunnainen kokonaisluku riveille
            m = Math.floor(Math.random() * 3); // Sama sarakkeille
        }
        game_status.game_matrix[n][m] = 1; // Kun löydetty 0, sijoitetaan 1 paikalle.
        console.log("Etsitty tyhjä");
        return;
    }
}
// Voittotarkastusfunktio. Käydään läpi kaikki mahdolliset voittotilanteet, ja tehdään asianmukaisia toimia.
function Voitto(frmKohde) {
    // Tietokoneen voittotarkastus: Kolme ykköstä vaakaan (rivi), pystyyn (sarake) tai viistoihin.
    if (((game_status.game_matrix[0][0] == 1) && (game_status.game_matrix[0][1] == 1)) && ((game_status.game_matrix[0][1] == 1) && (game_status.game_matrix[0][2] == 1))) { // Ylärivi
        console.log("Tietokone voitti!"); // Tulostetaan ja ilmoitetaan
        alert("Tietokone voitti!");
        game_status.voitto = true; // Peli on voitettu
        frmKohde.txtVuoro.value = "Tietokone voitti!"; // Ilmoitetaan myös tekstilaatikossa
        game_status.tietokonevoitto++; // Lisätään tietokoneen pistelaskuriin 
        Pistelaskuri(frmKohde); // Ajetaan pistelaskurifunktio, joka päivittää tekstikentän
        return;
    }
    if (((game_status.game_matrix[1][0] == 1) && (game_status.game_matrix[1][1] == 1)) && ((game_status.game_matrix[1][1] == 1) && (game_status.game_matrix[1][2] == 1))) { // Keskirivi
        console.log("Tietokone voitti!");
        alert("Tietokone voitti!");
        game_status.voitto = true;
        frmKohde.txtVuoro.value = "Tietokone voitti!";
        game_status.tietokonevoitto++;
        Pistelaskuri(frmKohde);
        return;
    }
    if (((game_status.game_matrix[2][0] == 1) && (game_status.game_matrix[2][1] == 1)) && ((game_status.game_matrix[2][1] == 1) && (game_status.game_matrix[2][2] == 1))) { // Alarivi
        console.log("Tietokone voitti!");
        alert("Tietokone voitti!");
        game_status.voitto = true;
        frmKohde.txtVuoro.value = "Tietokone voitti!";
        game_status.tietokonevoitto++;
        Pistelaskuri(frmKohde);
        return;
    }
    if (((game_status.game_matrix[0][0] == 1) && (game_status.game_matrix[1][0] == 1)) && ((game_status.game_matrix[1][0] == 1) && (game_status.game_matrix[2][0] == 1))) { // Eka sarake
        console.log("Tietokone voitti!");
        alert("Tietokone voitti!");
        game_status.voitto = true;
        frmKohde.txtVuoro.value = "Tietokone voitti!";
        game_status.tietokonevoitto++;
        Pistelaskuri(frmKohde);
        return;
    }
    if (((game_status.game_matrix[0][1] == 1) && (game_status.game_matrix[1][1] == 1)) && ((game_status.game_matrix[1][1] == 1) && (game_status.game_matrix[2][1] == 1))) { // Toka sarake
        console.log("Tietokone voitti!");
        alert("Tietokone voitti!");
        game_status.voitto = true;
        frmKohde.txtVuoro.value = "Tietokone voitti!";
        game_status.tietokonevoitto++;
        Pistelaskuri(frmKohde);
        return;
    }
    if (((game_status.game_matrix[0][2] == 1) && (game_status.game_matrix[1][2] == 1)) && ((game_status.game_matrix[1][2] == 1) && (game_status.game_matrix[2][2] == 1))) { // Kolmas sarake
        console.log("Tietokone voitti!");
        alert("Tietokone voitti!");
        game_status.voitto = true;
        frmKohde.txtVuoro.value = "Tietokone voitti!";
        game_status.tietokonevoitto++;
        Pistelaskuri(frmKohde);
        return;
    }
    if (((game_status.game_matrix[0][0] == 1) && (game_status.game_matrix[1][1] == 1)) && ((game_status.game_matrix[1][1] == 1) && (game_status.game_matrix[2][2] == 1))) { // Ylävasemmalta alaviistoon
        console.log("Tietokone voitti!");
        alert("Tietokone voitti!");
        game_status.voitto = true;
        frmKohde.txtVuoro.value = "Tietokone voitti!";
        game_status.tietokonevoitto++;
        Pistelaskuri(frmKohde);
        return;
    }
    if (((game_status.game_matrix[0][2] == 1) && (game_status.game_matrix[1][1] == 1)) && ((game_status.game_matrix[1][1] == 1) && (game_status.game_matrix[2][0] == 1))) { // Yläoikealta alaviistoon
        console.log("Tietokone voitti!");
        alert("Tietokone voitti!");
        game_status.voitto = true;
        frmKohde.txtVuoro.value = "Tietokone voitti!";
        game_status.tietokonevoitto++;
        Pistelaskuri(frmKohde);
        return;
    }
    // Pelaajan voittotarkastus: Kolme kakkosta vaakaan (rivi), pystyyn (sarake) tai viistoihin.
    if (((game_status.game_matrix[0][0] == 2) && (game_status.game_matrix[0][1] == 2)) && ((game_status.game_matrix[0][1] == 2) && (game_status.game_matrix[0][2] == 2))) { // Ylärivi
        console.log("Pelaaja voitti!");
        alert("Pelaaja voitti!");
        game_status.voitto = true;
        frmKohde.txtVuoro.value = "Pelaaja voitti!";
        game_status.pelaajavoitto++; // Lisätään pelaajan pistelaskuriin
        Pistelaskuri(frmKohde);
        return;
    }
    if (((game_status.game_matrix[1][0] == 2) && (game_status.game_matrix[1][1] == 2)) && ((game_status.game_matrix[1][1] == 2) && (game_status.game_matrix[1][2] == 2))) { // Keskirivi
        console.log("Pelaaja voitti!");
        alert("Pelaaja voitti!");
        game_status.voitto = true;
        frmKohde.txtVuoro.value = "Pelaaja voitti!";
        game_status.pelaajavoitto++;
        Pistelaskuri(frmKohde);
        return;
    }
    if (((game_status.game_matrix[2][0] == 2) && (game_status.game_matrix[2][1] == 2)) && ((game_status.game_matrix[2][1] == 2) && (game_status.game_matrix[2][2] == 2))) { // Alarivi
        console.log("Pelaaja voitti!");
        alert("Pelaaja voitti!");
        game_status.voitto = true;
        frmKohde.txtVuoro.value = "Pelaaja voitti!";
        game_status.pelaajavoitto++;
        Pistelaskuri(frmKohde);
        return;
    }
    if (((game_status.game_matrix[0][0] == 2) && (game_status.game_matrix[1][0] == 2)) && ((game_status.game_matrix[1][0] == 2) && (game_status.game_matrix[2][0] == 2))) { // Eka sarake
        console.log("Pelaaja voitti!");
        alert("Pelaaja voitti!");
        game_status.voitto = true;
        frmKohde.txtVuoro.value = "Pelaaja voitti!";
        game_status.pelaajavoitto++;
        Pistelaskuri(frmKohde);
        return;
    }
    if (((game_status.game_matrix[0][1] == 2) && (game_status.game_matrix[1][1] == 2)) && ((game_status.game_matrix[1][1] == 2) && (game_status.game_matrix[2][1] == 2))) { // Toka sarake
        console.log("Pelaaja voitti!");
        alert("Pelaaja voitti!");
        game_status.voitto = true;
        frmKohde.txtVuoro.value = "Pelaaja voitti!";
        game_status.pelaajavoitto++;
        Pistelaskuri(frmKohde);
        return;
    }
    if (((game_status.game_matrix[0][2] == 2) && (game_status.game_matrix[1][2] == 2)) && ((game_status.game_matrix[1][2] == 2) && (game_status.game_matrix[2][2] == 2))) { // Kolmas sarake
        console.log("Pelaaja voitti!");
        alert("Pelaaja voitti!");
        game_status.voitto = true;
        frmKohde.txtVuoro.value = "Pelaaja voitti!";
        game_status.pelaajavoitto++;
        Pistelaskuri(frmKohde);
        return;
    }
    if (((game_status.game_matrix[0][0] == 2) && (game_status.game_matrix[1][1] == 2)) && ((game_status.game_matrix[1][1] == 2) && (game_status.game_matrix[2][2] == 2))) { // Ylävasemmalta alaviistoon
        console.log("Pelaaja voitti!");
        alert("Pelaaja voitti!");
        game_status.voitto = true;
        frmKohde.txtVuoro.value = "Pelaaja voitti!";
        game_status.pelaajavoitto++;
        Pistelaskuri(frmKohde);
        return;
    }
    if (((game_status.game_matrix[0][2] == 2) && (game_status.game_matrix[1][1] == 2)) && ((game_status.game_matrix[1][1] == 2) && (game_status.game_matrix[2][0] == 2))) { // Yläoikealta alaviistoon
        console.log("Pelaaja voitti!");
        alert("Pelaaja voitti!");
        game_status.voitto = true;
        frmKohde.txtVuoro.value = "Pelaaja voitti!";
        game_status.pelaajavoitto++;
        Pistelaskuri(frmKohde);
        return;
    }
    // Jos voittoriviä ei ole pelin lopussa, ilmoitetaan asiasta
    if (game_status.i == 9 && game_status.voitto == false) {
        console.log("Ei voittajaa!"); // Ilmoitetaan tilanteesta
        alert("Ei voittajaa! Aloita uusi peli.");
        frmKohde.txtVuoro.value = "Ei voittajaa!";
        game_status.tasapeli++;
        Pistelaskuri(frmKohde);
        return;
    }
}
// Pistelaskuri pitää kirjaa pelattujen pelien tuloksista tekstilaatikoissa
function Pistelaskuri(frmKohde) {
    frmKohde.txtPvoitto.value = game_status.pelaajavoitto; // Vaihdetaan tekstilaatikon arvo
    frmKohde.txtTvoitto.value = game_status.tietokonevoitto;
    frmKohde.txtEvoitto.value = game_status.tasapeli;
}

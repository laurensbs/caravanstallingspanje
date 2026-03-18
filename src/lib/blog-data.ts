export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  content: string[];
  cta?: { label: string; href: string; };
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "caravan-winterklaar-maken",
    title: "Caravan winterklaar maken: de complete checklist",
    excerpt: "Voorkom vorstschade en verrassingen in het voorjaar. Met deze stap-voor-stap checklist maakt u uw caravan helemaal winterklaar.",
    date: "2025-03-15",
    readTime: "7 min",
    category: "Onderhoud",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
    cta: { label: 'Bekijk onze winterklaar-service', href: '/diensten#schoonmaak' },
    content: [
      "Het stallingseizoen nadert en dat betekent dat het tijd wordt om uw caravan winterklaar te maken. Een goede wintervoorbereiding voorkomt vorstschade, schimmel en onverwachte reparaties in het voorjaar. Bij Caravanstalling Spanje zien wij elk jaar caravans met vermijdbare schade. Met deze complete checklist hoeft u zich nergens zorgen over te maken.",

      "## Watersysteem legen\n\nDit is verreweg de belangrijkste stap. Bevroren water in leidingen, de boiler of het toilet kan enorme schade aanrichten. Tap alle kranen open (warm én koud), trek de boiler-aftapplug eruit en blaas de leidingen eventueel door met perslucht. Vergeet de doucheslang en het toiletreservoir niet. Bij ons in Spanje is vorst zeldzaam, maar in de nachten kan het aan de Costa Brava enkele graden onder nul worden.",

      "## Gasinstallatie afsluiten\n\nSluit de gasfles af en koppel de drukregelaar los. Laat de branders kort branden om de restdruk uit de leiding te halen. Controleer de vervaldatum van uw drukregelaar — deze is maximaal 10 jaar geldig. Wij adviseren om de gasinstallatie elke twee jaar te laten keuren.",

      "## Accu en elektra\n\nKoppel de accu los of gebruik een onderhoudsoplader (druppellader). Een volledig geladen accu gaat beter door de winter. Controleer alle zekeringen en test de 230V-aansluiting. Bij binnenstalling op ons terrein is een 230V-aansluiting beschikbaar voor een onderhoudsoplader.",

      "## Buitenzijde reinigen en beschermen\n\nWas de caravan grondig met een milde reiniger. Verwijder vogelpoep, hars en insectenresten — deze vreten in de gelcoat. Breng een laag carnauba-was aan op de gevel. Controleer alle kitnaden rondom ramen, dakluiken en de raillijst. Gescheurde kit is dé oorzaak van vochtinslag.",

      "## Binnenzijde voorbereiden\n\nRuim alle voedingsmiddelen op — ook in de kasten. Laat kastdeurtjes en de koelkast open staan voor ventilatie. Plaats een vochtvreter of silicagel in de woonruimte. Zet de dakluiken op een kiertje als de caravan binnen staat, zodat lucht kan circuleren. Leg muizenvallen neer of gebruik pepermuntolie als natuurlijk afweermiddel.",

      "## Banden en chassis\n\nPomp de banden op tot de maximaal toegestane druk. Zet de caravan op bokken of assteuntjes om stilstandschade aan de banden te voorkomen. Vet de dissel, het steunwiel en alle bewegende delen. Controleer de handrem en laat deze juist wél los staan (op bokken) om vastroesten te voorkomen.",

      "## Wij doen het voor u\n\nBij Caravanstalling Spanje bieden wij een complete winterklaar-service aan. Onze monteurs nemen het hele bovenstaande lijstje voor hun rekening, inclusief een uitgebreide technische controle. Vraag ernaar bij uw volgende bezoek of via het klantportaal."
    ]
  },
  {
    slug: "mooiste-campings-costa-brava",
    title: "De 8 mooiste campings aan de Costa Brava",
    excerpt: "Van Blanes tot aan de Franse grens: onze persoonlijke selectie van de beste campings aan de Spaanse Costa Brava.",
    date: "2025-02-28",
    readTime: "9 min",
    category: "Reisgids",
    image: "https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=800&q=80",
    cta: { label: 'Transport naar uw camping regelen', href: '/diensten#transport' },
    content: [
      "De Costa Brava is niet voor niets al decennialang de favoriete bestemming van Nederlandse en Belgische caravanners. De combinatie van azuurblauw water, beschutte baaien, charmante dorpjes en uitstekende faciliteiten maakt dit stuk Catalaanse kust uniek. Na meer dan 20 jaar in de regio delen wij graag onze favorieten.",

      "## 1. Camping Mas Sant Josep — Santa Cristina d'Aro\n\nEen familiecamping te midden van kurkeiken en pijnbomen. Grote plaatsen (tot 100m²), een prachtig zwembadcomplex en op loopafstand van het strand van Platja d'Aro. Ideaal voor gezinnen met kinderen. De sfeer is relaxed maar de faciliteiten zijn top.",

      "## 2. Camping Begur — Begur\n\nVerscholen in de heuvels achter Begur, met uitzicht over de zee. Kleinschalig, rustig en dicht bij de mooiste calanques van de Costa Brava. Vanuit de camping wandelt u in 15 minuten naar Sa Tuna of Aiguafreda. Perfecte uitvalsbasis voor snorkelaars.",

      "## 3. Camping Interpals — Pals\n\nDirect aan het brede zandstrand van Pals, met de Medes-eilanden aan de horizon. Grote camping met veel voorzieningen zoals tennis, fietsverhuur en een restaurant met zeezicht. De rijstvelden van Pals zijn vlakbij — de paella hier is fenomenaal.",

      "## 4. Camping Castell Montgri — L'Estartit\n\nOp steenworp afstand van het Parc Natural del Montgrí en de Medes-eilanden. Perfecte locatie om te duiken, kajakken of het natuurpark in te trekken. L'Estartit zelf is een gezellig badplaatsje met goede restaurants.",

      "## 5. Camping La Ballena Alegre — Sant Pere Pescador\n\nAan de monding van de rivier de Fluvià, direct aan een kilometerslang zandstrand. Populair bij windsurfers en kitesurfers door de constante tramuntana-wind. Enorm ruim opgezet met plaatsen direct aan het strand.",

      "## 6. Camping Mas Nou — Castelló d'Empúries\n\nEen rustige camping midden in het natuurpark Aiguamolls de l'Empordà. Ideaal voor vogelaars en natuurliefhebbers. De middeleeuwse dorpskern van Castelló d'Empúries is prachtig. Empuriabrava met zijn kanalen is vlakbij.",

      "## 7. Camping Sant Miquel — Colera\n\nVlak bij de Franse grens, klein en pittoresk. De camping ligt verscholen in een dal met oude olijfbomen. Het dorpje Colera heeft een geweldig visrestaurant aan de haven. Voor wie rust en authenticiteit zoekt.",

      "## 8. Camping Cala Gogó — Calonge\n\nDirect aan de baai van Sant Antoni, met zwemparadijs en entertainment voor alle leeftijden. De omgeving van Calonge is perfect voor fietstochtjes door het achterland. De wekelijkse markt in Palamós is een aanrader.",

      "## Transport naar uw camping\n\nMet ons wagenpark van 7 transporteenheden halen wij uw caravan op bij ons terrein en leveren hem af op de camping van uw keuze. Vanaf onze locatie in Sant Climent de Peralta zijn alle bovengenoemde campings binnen een uur rijden bereikbaar. Neem contact op voor een transportofferte."
    ]
  },
  {
    slug: "vochtschade-caravan-voorkomen",
    title: "Vochtschade voorkomen: het stille gevaar voor uw caravan",
    excerpt: "Vocht is de grootste vijand van uw caravan. Leer hoe u vochtschade herkent, voorkomt en wat wij eraan kunnen doen.",
    date: "2025-02-10",
    readTime: "6 min",
    category: "Onderhoud",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
    cta: { label: 'Ontdek CaravanRepair® schadeherstel', href: '/diensten#caravanrepair' },
    content: [
      "Vochtschade is de meest voorkomende en potentieel duurste schade aan caravans. Het werkt sluipend — tegen de tijd dat u vlekken of een muffe geur opmerkt, kan de schade al aanzienlijk zijn. Een houten skelet dat jarenlang nat is geweest, rot weg en dan wordt een reparatie al snel duizenden euro's. Voorkomen is letterlijk beter dan genezen.",

      "## Hoe ontstaat vochtschade?\n\nWater dringt uw caravan binnen via gescheurde kitnaden rondom ramen, dakluiken en de raillijst. De raillijst (de overgang tussen dak en zijwand) is de meest kwetsbare plek. Andere bronnen zijn lekkende dakluiken, gebarsten bevestigingspunten van antennes of zonnepanelen, en condensatie door slechte ventilatie.",

      "## Herkennen van vochtschade\n\nDruk met uw duim stevig op de wand rondom ramen en de raillijst. Voelt de wand zacht of veerkrachtig? Dan zit er vocht in het houten skelet. Andere signalen: loslaten van behang, bruine vlekken op het plafond, een muffe geur, condens op de ramen bij koude ochtenden en opbollend laminaat.",

      "## Voorkomen: de 5 gouden regels\n\n**1. Controleer tweemaal per jaar alle kitnaden.** Kit wordt hard en scheurt na 5-8 jaar. Vervang het tijdig.\n\n**2. Zorg voor goede ventilatie.** Laat dakluiken op een kiertje, zet kastdeurtjes open bij stalling. Gebruik een vochtvreter.\n\n**3. Laat een jaarlijkse vochtmeting uitvoeren.** Met een vochtmeter worden alle kritische punten doorgemeten. Wij doen dit standaard bij onze jaarlijkse keuring.\n\n**4. Repareer kleine schades direct.** Een hagelschadetje of krasje lijkt onschuldig, maar als het beschermende gelcoatlaagje weg is, dringt water het hout in.\n\n**5. Stal uw caravan overdekt.** In een binnenstalling is uw caravan beschermd tegen regen, hagel, UV-straling en grote temperatuurschommelingen.",

      "## Binnenstalling als preventie\n\nOnze geïsoleerde binnenstalling in Sant Climent de Peralta beschermt uw caravan tegen alle weersomstandigheden. Geen regen, geen directe zon, geen extreme temperatuurschommelingen. De ventilatie in de hal is continu actief. Dit is de beste verzekering tegen vochtschade die u kunt krijgen.",

      "## Wat doen wij bij vochtschade?\n\nIn onze werkplaats herstellen wij vochtschade van kleine reparaties (kitnaden vervangen, lokaal paneel vernieuwen) tot volledige reconstructies. Met het gepatenteerde CaravanRepair® systeem herstellen wij bovendien onzichtbaar de geprofileerde buitenwanden — zonder spuiten of verven. Door alle verzekeraars erkend.",

      "## Tweewekelijkse controle\n\nBij Caravanstalling Spanje controleren wij elke twee weken alle gestalde caravans op zichtbare schade, waaronder tekenen van vochtinslag. Jaarlijks voeren wij een uitgebreide technische keuring uit inclusief vochtmeting op alle kritische punten. Het rapport ontvangt u via uw klantportaal."
    ]
  },
  {
    slug: "met-caravan-naar-spanje-wat-u-moet-weten",
    title: "Met de caravan naar Spanje: praktische tips en regelgeving",
    excerpt: "Alles over tolwegen, verplichte uitrusting, snelheden en de beste routes van Nederland naar de Costa Brava.",
    date: "2025-01-22",
    readTime: "8 min",
    category: "Reisgids",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",
    cta: { label: 'Laat ons het transport regelen', href: '/diensten#transport' },
    content: [
      "Elk jaar rijden duizenden Nederlanders en Belgen met hun caravan naar de Costa Brava. Een rit van zo'n 1.400 kilometer die met goede voorbereiding een ontspannen start van de vakantie wordt. In dit artikel delen wij alle praktische informatie die u nodig heeft.",

      "## De route: drie opties\n\n**Route 1: Via Lyon (snelst)** — Nederland → België → Luxemburg → Metz → Lyon → Montpellier → Perpignan → La Jonquera → Costa Brava. Circa 1.400 km, 14-15 uur rijtijd. Veel tolwegen in Frankrijk (budget circa €80-100 enkele reis).\n\n**Route 2: Via Bordeaux (rustiger)** — Nederland → België → Parijs (omleiding) → Tours → Bordeaux → Toulouse → Perpignan → La Jonquera. Langer (1.600 km) maar met prachtige gebieden onderweg.\n\n**Route 3: Via Zwitserland (bergroute)** — Nederland → Duitsland → Basel → Genève → Montpellier → La Jonquera. Spectaculair landschap, maar bergpassen met caravan vergen ervaring. Vignet Zwitserland verplicht.",

      "## Snelheden met caravan in Spanje\n\nSpanje hanteert de volgende limieten voor auto's met aanhanger:\n- Binnen de bebouwde kom: 50 km/u\n- Buitenwegen: 70 km/u\n- Snelwegen (autopista): 90 km/u\n\nLet op: in Frankrijk geldt 130 km/u op de snelweg voor personenauto's, maar voor auto met caravan slechts 90 km/u. Overschrijding wordt zwaar beboet.",

      "## Verplichte uitrusting Spanje\n\n- Twee gevarendriehoeken (een voor en een achter het voertuig)\n- Reflecterend veiligheidshesje (in het bereik van de bestuurder, niet in de kofferruimte)\n- Reservelampenset\n- Extra achteruitkijkspiegel(s) met voldoende zicht langs de caravan\n- Verlengd nummerbord van de auto achterop de caravan (Spaans kenteken vereist Spaanse plaat)\n\nSinds 2024 is een noodremsignaal (automatisch knipperende richtingaanwijzers bij noodstop) verplicht in nieuwere voertuigen.",

      "## Tolwegen en betalen\n\nIn Frankrijk betaalt u tol op de meeste snelwegen. De totale tolkosten van Luxemburg tot La Jonquera bedragen €80-100 met caravan. Betalen kan met creditcard, contant of via een télépéage-badge (Bip&Go of EMOVIS). Tip: rij vóór Lyon van de snelweg af bij Beaune en neem de gratis N-wegen richting Montpellier — scheelt €30.\n\nIn Spanje zijn de meeste autopistas in Catalonië inmiddels tolvrij. De AP-7 langs de Costa Brava is gratis.",

      "## Overnachten onderweg\n\nWij adviseren één overnachting onderweg. Populaire tussenstops:\n- **Aire de camping-car** — gratis of goedkope camperplaatsen langs de route\n- **Camping Le Mas de Reilhe** (Carcassonne) — halverwege, prachtige omgeving\n- **Camping Le Soleil** (Argelès-sur-Mer) — vlak voor de Spaanse grens\n\nRijd niet langer dan 6-7 uur per dag met caravan. Vermoeidheid is de grootste risicofactor.",

      "## Bij aankomst: laat ons het overnemen\n\nMoe van de lange rit? Rijd direct naar ons terrein in Sant Climent de Peralta. Wij plaatsen uw caravan op zijn plek, sluiten alles aan en u kunt direct met de auto naar uw camping of hotel. Bij vertrek halen wij de caravan weer op en stallen hem veilig tot uw volgende bezoek.\n\nWilt u de heenreis overslaan? Wij transporteren uw caravan ook los naar Spanje — neem contact op voor een transportofferte."
    ]
  },
  {
    slug: "caravan-onderhoud-tips",
    title: "10 onderhoudstips waarmee uw caravan jaren langer meegaat",
    excerpt: "Praktische tips van onze monteurs om uw caravan in topconditie te houden. Van bandenspanning tot dakluiken.",
    date: "2025-01-05",
    readTime: "6 min",
    category: "Onderhoud",
    image: "https://images.unsplash.com/photo-1533745848184-3db07256e163?auto=format&fit=crop&w=800&q=80",
    cta: { label: 'Bekijk onze reparatie & onderhoudsdiensten', href: '/diensten#reparatie' },
    content: [
      "Een caravan is een flinke investering en met goed onderhoud gaat hij tientallen jaren mee. Onze monteurs werken dagelijks aan caravans van alle merken en leeftijden. Dit zijn hun tien belangrijkste onderhoudstips.",

      "## 1. Controleer de bandenspanning vóór elke rit\n\nBanden die maanden stilstaan verliezen druk. Rijd nooit met te lage spanning — het vergroot het risico op een klapband enorm. Controleer ook de leeftijd van de banden: ouder dan 5 jaar? Vervangen, ongeacht het profiel. De DOT-code op de band geeft het productiejaar aan.",

      "## 2. Smeer het chassis jaarlijks\n\nDe dissel, het steunwiel, de overloop en alle scharnieren moeten jaarlijks gesmeerd worden met een goede lithiumvet. Het koppelingskogel-mechanisme is hierbij extra belangrijk. Roest op het chassis? Schuur het bij en behandel het met een roestwerende primer.",

      "## 3. Test de remmen vóór het seizoen\n\nDe remmen van een caravan die maandenlang stilstaat kunnen vastlopen. Laat de remmen vóór het rijseizoen controleren door een monteur. De remkabels, remvoeringen en de automatische stelfunctie moeten goed werken. Versleten remmen zijn levensgevaarlijk.",

      "## 4. Vervang kitnaden elke 5-8 jaar\n\nKit rond ramen, dakluiken en de raillijst wordt met de jaren hard en scheurt. Dat is het beginpunt van vochtschade. Laat de kit preventief vervangen — het kost een fractie van wat vochtschade-reparatie kost.",

      "## 5. Was en wax uw caravan tweemaal per jaar\n\nUV-straling tast de gelcoat-beschermlaag van de buitenpanelen aan. Regelmatig wassen en waxen beschermt de buitenzijde en houdt de caravan mooi. Gebruik een speciale caravan-reiniger — geen allesreiniger of hogedrukreiniger op de naden.",

      "## 6. Laat de gasinstallatie om de twee jaar keuren\n\nIn Nederland is een gaskeuring elke twee jaar verplicht (NEN-EN 1949). In Spanje geldt dezelfde norm. De drukregelaar, alle slangen, koppelingen en de boiler worden gecontroleerd. Wij voeren gaskeuringen uit in onze werkplaats.",

      "## 7. Controleer het dak en de dakluiken\n\nHet dak is het meest verwaarloosde deel van een caravan — simpelweg omdat u het niet ziet. Klim er minstens één keer per jaar op (of laat het doen) en controleer op scheuren, losliggende dakluiken en verstopte afvoergaten. Een verstopt afvoergat leidt tot een plasje water op het dak dat door minuscule scheurtjes naar binnen lekt.",

      "## 8. Ventileer, ventileer, ventileer\n\nSchimmel en muffe geur ontstaan door stilstaande vochtige lucht. Zet bij stalling altijd de dakluiken op een kiertje, laat alle kastdeurtjes en de koelkastdeur open. Met een kleine solar-ventilator op het dak houdt u continue luchtcirculatie, ook als de caravan maanden stilstaat.",

      "## 9. Controleer de wielophanging\n\nSchokdempers, veerpakketten en de wiellagers slijten langzaam. Laat ze elke 2-3 jaar controleren. Versleten schokdempers geven een onrustig rijgedrag en verhoogde bandenslijtage. De wiellagers moeten vetvrij draaien — een bromgeluid duidt op slijtage.",

      "## 10. Maak een onderhoudslogboek\n\nNoteer elke reparatie, keuring en onderhoudbeurt met datum. Dit helpt u om niets te vergeten en is waardevol bij verkoop. Via ons klantportaal houden wij automatisch een digitaal onderhoudslogboek bij voor alle gestalde caravans."
    ]
  },
  {
    slug: "caravan-stallen-spanje-of-nederland",
    title: "Caravan stallen in Spanje of Nederland? De voor- en nadelen",
    excerpt: "Twijfelt u waar u uw caravan het beste kunt stallen? Wij vergelijken de kosten, het gemak en de voordelen van stalling in Spanje versus Nederland.",
    date: "2024-12-20",
    readTime: "7 min",
    category: "Reisgids",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
    cta: { label: 'Bekijk onze stallingstarieven', href: '/tarieven' },
    content: [
      "Elk najaar staan duizenden caravaneigenaren voor dezelfde keuze: sla ik mijn caravan op in Nederland of laat ik hem staan in Spanje? Het antwoord hangt af van uw reisgedrag, budget en gemak. In dit artikel zetten wij de voor- en nadelen eerlijk naast elkaar.",

      "## Stalling in Nederland\n\nVoordelen: uw caravan staat dichtbij, u kunt er makkelijk bij voor kleine klussen en u hoeft geen transport te regelen. Nadelen: hogere stalkosten (gemiddeld €80-120/mnd voor binnenstalling), vocht- en vorstschade door het Nederlandse klimaat, en elk voorjaar 3.000 km heen-en-weer rijden met bijbehorende tolkosten, brandstof en slijtage.",

      "## Stalling in Spanje\n\nVoordelen: uw caravan staat waar u hem gebruikt, het milde Spaanse klimaat voorkomt vorst- en vochtschade, lagere maandtarieven, en geen heen-en-weer gerij. Nadelen: u kunt er niet zomaar tussendoor bij, en het eerste transport moet geregeld worden.",

      "## De rekensom\n\nLaten we het uitrekenen. Een retourrit Nederland-Costa Brava kost circa €300 aan brandstof en tol, plus 20 uur rijden. Doe dat twee keer per jaar en u bent €600 plus twee dagen kwijt. Stalling in Nederland: €100/mnd. Stalling bij ons: €65/mnd buiten, €95/mnd binnen. Na aftrek van transportkosten bespaart u bij stalling in Spanje al snel €200-400 per jaar, en u heeft er geen gerij voor.",

      "## Ons advies\n\nAls u minimaal één keer per jaar naar de Costa Brava gaat en uw caravan vaker dan 6 maanden per jaar in een stalling staat, is stalling in Spanje vrijwel altijd voordeliger en praktischer. Uw caravan staat veilig, droog, en klaar wanneer u aankomt.",

      "## Transport regelen wij\n\nDe eerste keer transport regelen wij voor u. Met 7 eigen transporteenheden halen wij uw caravan op in Nederland, België of Duitsland en leveren hem af op onze stalling in Sant Climent de Peralta. Neem contact op voor een vrijblijvende offerte."
    ]
  },
  {
    slug: "costa-brava-verborgen-parels",
    title: "Costa Brava: 10 verborgen parels die u moet bezoeken",
    excerpt: "Vergeet de drukte van Lloret de Mar. Ontdek de mooiste verborgen stranden, dorpjes en natuur aan de Costa Brava.",
    date: "2024-12-05",
    readTime: "8 min",
    category: "Reisgids",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    cta: { label: 'Stal uw caravan aan de Costa Brava', href: '/stalling' },
    content: [
      "De Costa Brava is veel meer dan de bekende badplaatsen. Tussen de rotsige kliffen en helderblauwe baaitjes schuilen dorpjes en stranden die veel toeristen nooit zien. Na 20 jaar in de regio delen wij onze persoonlijke favorieten.",

      "## 1. Peratallada\n\nDit middeleeuwse dorp op 10 minuten van onze stalling is een architectonisch juweeltje. Stenen straatjes, een kasteel en uitstekende restaurants. Bezoek het op zondagochtend voor de markt.",

      "## 2. Cala Estreta\n\nEen verborgen strand nabij Palamós, alleen bereikbaar via een wandelpad door de pijnbomen. Turquoise water en bijna geen toeristen. Neem snorkelspullen mee.",

      "## 3. Pals oude centrum\n\nDe middeleeuwse toren en straatjes van Pals zijn fotogeniek. Klim de toren op voor uitzicht over de rijstvelden tot aan de Medes-eilanden.",

      "## 4. Cap de Creus\n\nHet meest oostelijke punt van het Iberisch schiereiland. Maanlandschap van verweerde rotsen, wilde bloemen en een verlaten klooster. Salvador Dalí liet zich hier inspireren.",

      "## 5. Calella de Palafrugell\n\nWitte huisjes pal aan zee met kleurrijke boten op het strand. In juli klinkt hier habanera-muziek tijdens het festival ter ere van de oude handelsroute met Cuba.",

      "## 6. Vulkanisch gebied La Garrotxa\n\nOp een uur rijden landinwaarts: 40 vulkanen omringd door beukenossen. De Fageda d'en Jordà is het beroemdste beukenbos van Spanje. Perfect voor een dagwandeling.",

      "## 7. Besalú\n\nEen middeleeuws stadje met een spectaculaire Romaanse brug over de rivier Fluvià. Het Joodse kwartier en het rituele bad (mikwe) zijn uniek in Spanje.",

      "## 8. Illes Medes\n\nDe Medes-eilanden voor de kust van L'Estartit vormen een beschermd marien reservaat. Boottochten, duiken en snorkelen tussen octopussen, zeesterren en koraal.",

      "## 9. Sant Martí d'Empúries\n\nHet kleine dorpje naast de Griekse en Romeinse ruïnes van Empúries. Een terrasje met zeezicht terwijl u 2500 jaar geschiedenis overziet.",

      "## 10. Cadaqués\n\nHet witte dorp aan de rand van Cap de Creus, met het Dalí-huis in Portlligat. Kronkelende straatjes, galeries en de beste ansjovis van Catalonië."
    ]
  },
  {
    slug: "caravanrepair-schadeherstel-uitgelegd",
    title: "CaravanRepair® schadeherstel: zo werkt het",
    excerpt: "Alles over het gepatenteerde CaravanRepair® systeem: hoe het werkt, wat het kost en waarom alle verzekeraars het erkennen.",
    date: "2024-11-18",
    readTime: "6 min",
    category: "Onderhoud",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
    cta: { label: 'Vraag CaravanRepair® herstel aan', href: '/diensten#caravanrepair' },
    content: [
      "Hagelschade, stormschade, aanrijdingsschade of vochtschade aan de buitenwand van uw caravan? Vroeger betekende dat een dure en tijdrovende reparatie met verfspatten. Met het gepatenteerde CaravanRepair® systeem herstellen wij de schade onzichtbaar, zonder spuiten en zonder verven.",

      "## Wat is CaravanRepair®?\n\nCaravanRepair® is een gepatenteerd herstelsysteem speciaal ontwikkeld voor de geprofileerde aluminium buitenwanden van caravans en campers. Het systeem duwt deuken en vervormingen mechanisch terug in de originele vorm, zonder de laklaag te beschadigen.",

      "## Welke schades kunnen hersteld worden?\n\nVrijwel alle deukvormige schades: hagelschade (zelfs honderden deuken per paneel), stormschade, parkeerschade, aanrijdingsschade en oppervlakkige vochtschade. De enige beperking is dat de gelcoat-laag intact moet zijn — bij diepe scheuren of gaten is een andere herstelmethode nodig.",

      "## Het proces\n\n**Stap 1: Inspectie.** Onze gecertificeerde monteur beoordeelt de schade en maakt een gedetailleerd schaderapport met foto's.\n\n**Stap 2: Offerte.** U ontvangt een offerte die direct bij uw verzekeraar kan worden ingediend. Wij regelen de communicatie met de verzekeraar.\n\n**Stap 3: Herstel.** De monteur plaatst speciale tools achter het paneel en duwt elke deuk individueel terug. Dit vergt vakmanschap en geduld.\n\n**Stap 4: Controle.** Na herstel wordt elk paneel gecontroleerd onder speciaal licht om te garanderen dat alle deuken 100% hersteld zijn.",

      "## Levenslange garantie\n\nAls officieel CaravanRepair® Masterdealer verlenen wij levenslange garantie op het herstel. De herstelde plekken worden nooit meer zichtbaar. Dat is de kracht van mechanisch herstel versus opvullen en spuiten.",

      "## Verzekeraars en CaravanRepair®\n\nAlle grote Nederlandse verzekeraars erkennen CaravanRepair® als officiële herstelmethode. Dat betekent volledige vergoeding, vaak zonder verlies van no-claim. Wij verzorgen de volledige afhandeling met uw verzekeraar — u hoeft alleen uw polisnummer door te geven.",

      "## Kosten\n\nDe kosten zijn afhankelijk van de omvang van de schade. Een kleine parkeerschade begint vanaf €150. Grote hagelschade (heel het dak + zijwanden) kan oplopen tot €2.000-3.000, maar wordt vrijwel altijd volledig vergoed door de verzekering. Gemiddeld duurt het herstel 2-5 werkdagen."
    ]
  },
  {
    slug: "gaskeuring-caravan-verplicht",
    title: "Gaskeuring caravan: wat u moet weten",
    excerpt: "Is een gaskeuring verplicht? Hoe vaak? En wat wordt er precies gecontroleerd? Wij geven antwoord op alle vragen.",
    date: "2024-11-02",
    readTime: "5 min",
    category: "Onderhoud",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    cta: { label: 'Gaskeuring aanvragen', href: '/diensten#reparatie' },
    content: [
      "De gasinstallatie in uw caravan is een van de belangrijkste veiligheidsaspecten. Onjuist gebruik of slecht onderhoud kan leiden tot koolmonoxidevergiftiging of gasexplosie. Gelukkig is een regelmatige gaskeuring simpel en betaalbaar.",

      "## Is een gaskeuring verplicht?\n\nIn Nederland is een gaskeuring onder de NEN-EN 1949 norm verplicht voor caravans en campers. De keuring moet elke 2 jaar worden uitgevoerd door een gecertificeerd gasinspecteur. In Spanje geldt dezelfde norm. Wij zijn als gecertificeerd bedrijf bevoegd deze keuring uit te voeren.",

      "## Wat wordt er gecontroleerd?\n\nBij een gaskeuring worden alle onderdelen van de gasinstallatie grondig geïnspecteerd:\n- De gasfles(sen) en de opstelling\n- De drukregelaar en de vervaldatum\n- Alle gasleidingen op lekkage (zeepproef en elektronische lekdetector)\n- De aansluitingen op boiler, kooktoestel en verwarming\n- De verbranding en rookgasafvoer van elk toestel\n- De ventilatieopeningen in de vloer en wand",

      "## Kosten en duur\n\nEen volledige gaskeuring duurt circa 30-45 minuten en kost bij ons €75. Na goedkeuring ontvangt u een gaskeuringsrapport dat 2 jaar geldig is. Bij afkeuring vertellen wij precies wat er moet worden vervangen of gerepareerd.",

      "## Wanneer laten keuren?\n\nWij adviseren om de gaskeuring te combineren met het seizoensklaar maken van uw caravan. Zo heeft u alles in één keer geregeld en is uw caravan volledig veilig voor het kampeerseizoen. Bij ons gestalde caravans kunnen de keuring in onze werkplaats laten uitvoeren.",

      "## Tips voor tussentijds onderhoud\n\n- Controleer de vervaldatum van uw drukregelaar (max 10 jaar)\n- Sluit de gasfles altijd af als u de caravan verlaat\n- Gebruik geen gastoestellen als slaapkamerverwarming\n- Test uw koolmonoxidemelder regelmatig\n- Laat losliggende slangen direct vervangen"
    ]
  },
  {
    slug: "caravan-kopen-waar-op-letten",
    title: "Caravan kopen: waar moet u op letten?",
    excerpt: "Van vochtmeting tot bandenprofiel: de 12 belangrijkste checkpunten bij het kopen van een (tweedehands) caravan.",
    date: "2024-10-15",
    readTime: "8 min",
    category: "Onderhoud",
    image: "https://images.unsplash.com/photo-1563783850023-077d97825802?auto=format&fit=crop&w=800&q=80",
    cta: { label: 'Vochtmeting laten uitvoeren', href: '/diensten#reparatie' },
    content: [
      "Een caravan kopen is een grote investering. Of u nu nieuw of tweedehands koopt, er zijn cruciale punten waar u op moet letten om verborgen gebreken te ontdekken. Onze monteurs zien dagelijks caravans met problemen die bij aankoop gemist zijn. Gebruik deze checklist om dure verrassingen te voorkomen.",

      "## 1. Vochtmeting\n\nDit is verreweg het belangrijkste. Vraag altijd om een vochtmeting of neem een vochtmeter mee. Controleer alle ramen, de raillijst, het dak en rondom de dakluiken. Verhoogde vochtwaarden duiden op lekkage en mogelijk rot in het houten skelet. Kosten van vochtschade-reparatie: €1.000-5.000+.",

      "## 2. Buitenwanden\n\nControleer de buitenwanden op deuken, krassen, verkleuring en loslating (delaminatie). Druk met uw handpalm tegen de wand — een holle of zachte plek duidt op vochtschade in het skelet erachter.",

      "## 3. Dak en dakluiken\n\nKlim op het dak (of laat het doen). Controleer op scheuren, losliggende dakluiken, verstopte afvoeren en beschadigd rubber. Het dak is de meest kwetsbare plek voor lekkage.",

      "## 4. Kitnaden\n\nAlle kit rondom ramen, dakluiken en de raillijst moet soepel zijn. Harde, gescheurde of loslatende kit is een lekkagerisico. Vervangen kost €100-200 per raam.",

      "## 5. Banden en chassis\n\nControleer het profiel (minimaal 1,6mm), de leeftijd (DOT-code, max 5 jaar) en kijk op barsten in de flanken. Inspecteer het chassis op roest, vooral onder de vloer en bij de wielophanging. Versleten schokdempers herkennen: druk de achterkant van de caravan naar beneden en laat los — hij mag maximaal 1x terugveren.",

      "## 6. Gasinstallatie\n\nVraag naar het laatste gaskeuringsrapport. Een goedgekeurde gasinstallatie is maximaal 2 jaar oud. Controleer visueel de gasleidingen, slangen en aansluitingen op slijtage.",

      "## 7. Elektra en verlichting\n\nTest alle verlichting (rij-, rem-, achter-, mistlicht), de 12V-installatie en de 230V-aansluiting. Controleer de accu en de oplader. Slechte contacten zijn een veelvoorkomend probleem bij oudere caravans.",

      "## 8. Interieur\n\nCheck op muffe geur (vochtsignaal), vlekken op het plafond, loslatend behang en de staat van de vloer. Open alle kasten en kijk achter meubels. Controleer het toilet, de kranen en de boiler op lekkage.",

      "## 9. Documenten\n\nControleer het kentekenbewijs, de RDW-status en het onderhoudsboek. Vraag naar recente reparaties en keuringen. Een goed bijgehouden onderhoudshistorie is een positief teken.",

      "## Laat het door ons doen\n\nOnzeker over de staat van een caravan? Wij voeren een volledige aankoopkeuring uit voor €149. Dit omvat vochtmeting, technische inspectie, gaskeuring en een uitgebreid rapport met foto's. Zo weet u zeker of de caravan zijn prijs waard is."
    ]
  },
  {
    slug: "zonnepanelen-op-caravan",
    title: "Zonnepanelen op uw caravan: alles wat u moet weten",
    excerpt: "Onafhankelijk kamperen met zonne-energie. Van paneel kiezen tot montage: de complete gids voor zonnepanelen op uw caravan.",
    date: "2024-09-28",
    readTime: "7 min",
    category: "Onderhoud",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80",
    cta: { label: 'Montage aanvragen', href: '/diensten#reparatie' },
    content: [
      "Steeds meer caravaneigenaren kiezen voor een zonnepaneel op het dak. Begrijpelijk: aan de Costa Brava schijnt de zon gemiddeld 300 dagen per jaar. Met een zonnepaneel houdt u uw accu geladen, draait de koelkast en laadt u uw telefoon op — zonder walstroom en zonder lawaai van een aggregaat.",

      "## Welk type paneel kiezen?\n\n**Stijf (monokristallijn):** Hoogste rendement (22-24%), ideaal voor caravandaken. Vast bevestigd met lijm of klemmen.\n\n**Semi-flexibel:** Dunner en lichter, buigt mee met het dakprofiel. Iets lager rendement (18-20%). Let op: goedkopere varianten kunnen na 2-3 jaar in de zon delameren.\n\n**Draagbaar:** Handig als extra, maar minder vermogen. Zet het naast de caravan neer in de zon.",

      "## Hoeveel watt heb ik nodig?\n\nAls vuistregel: 100W is voldoende voor verlichting, telefoon laden en een kleine koelkast op 12V. Wilt u ook een TV, waterpomp en ventilatoren draaien? Kies dan voor 200-300W. Voor een airco of inductiekookplaat heeft u 400W+ nodig plus een flinke accubank.",

      "## De laadregelaar\n\nTussen het paneel en de accu plaatst u een laadregelaar. Kies altijd een MPPT-regelaar (niet PWM) — die haalt 20-30% meer rendement uit uw paneel. De regelaar beschermt uw accu tegen overlading en optimaliseert het laadproces.",

      "## Montage op de caravan\n\nHet paneel wordt bevestigd met speciale lijm of aluminium spoilers die op het dak worden gelijmd. Boor nooit gaten in het dak — dat is vragen om lekkage. De kabel gaat via een waterdichte dakdoorvoer naar de laadregelaar binnenin de caravan.",

      "## Kosten\n\nEen compleet 200W-systeem (paneel + MPPT-regelaar + bekabeling + dakdoorvoer) kost circa €300-500 voor materiaal. Montage door ons: €150-200 inclusief waterdichte afwerking en garantie op de dakdoorvoer.",

      "## Aan de Costa Brava\n\nMet gemiddeld 7-8 uur zon per dag in het seizoen produceert een 200W-paneel al snel 80-120Ah per dag. Meer dan genoeg voor vrijwel alle 12V-apparaten. Ideaal als uw caravan bij ons gestald staat en u af en toe off-grid wilt kamperen."
    ]
  },
  {
    slug: "beste-restaurants-emporda",
    title: "De 7 beste restaurants in het Empordà",
    excerpt: "Van Michelin-sterren tot verborgen dorpsrestaurants: de beste plekken om te eten in de omgeving van onze stalling.",
    date: "2024-09-10",
    readTime: "6 min",
    category: "Reisgids",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    cta: { label: 'Ontdek onze locatie', href: '/locaties' },
    content: [
      "Het Empordà (de streek rondom onze stalling) is een van de beste gastronomische regio's van Spanje. De combinatie van verse vis uit de Middellandse Zee, lokale groenten, olijfolie uit eigen streek en Catalaanse kooktraditie maakt dit een culinair paradijs. Hier zijn onze 7 favorieten.",

      "## 1. Restaurant Bonay — Peratallada\n\nIn het hart van het middeleeuwse Peratallada serveert Bonay Catalaans-mediterrane gerechten op een schaduwrijk terras. De gegrilde inktvis met alioli is legendarisch. Reserveer in het seizoen.",

      "## 2. Can Nau — Canapost\n\nEen onopvallend dorpsrestaurant waar de locals eten. Dagmenu voor €15 inclusief wijn. De cargols (slakken) en het botifarra (Catalaanse worst) zijn huisgemaakt. Alleen lunch op doordeweekse dagen.",

      "## 3. El Celler de Can Roca — Girona\n\nDe nummer 1 van de wereld (meerdere keren). Drie Michelin-sterren. Een hoek van onze stalling vandaan qua afstand, maar een wereld van verschil qua prijs. Reserveer maanden vooruit. Eén keer in uw leven.",

      "## 4. La Plaça — Madremanya\n\nEen dorpsplein, een paar tafels, een korte kaart met lokale ingrediënten en een wijnlijst vol Empordà-wijnen. Simple, eerlijk en onvergetelijk. De lamschouder komt uit het dorp zelf.",

      "## 5. Tragamar — Calella de Palafrugell\n\nRecht aan zee, voeten in het zand. Verse vis en zeevruchten met uitzicht op de boten van Calella. De arroz negro (zwarte rijst met inktvis) is een must. In de zomer drukbezocht.",

      "## 6. Mas Pou — Palau-sator\n\nEen oude boerderij omgetoverd tot restaurant met Michelin Bib Gourmand-status. Seizoensgebonden menu met producten uit eigen moestuin. De crema catalana als dessert is de beste die wij kennen.",

      "## 7. Can Dolç — Camallera\n\nNet buiten Figueres, een familiebedrijf waar drie generaties koken. Geroosterd varkensvlees, zelfgebakken brood en huiswijn uit de ton. Authentiek Catalaans, geen poespas.",

      "## Tip voor onze klanten\n\nAls u uw caravan bij ons ophaalt of komt bezoeken, combineer het met een restaurantbezoek. Wij geven u graag persoonlijke restauranttips op basis van uw voorkeuren. Vraag ernaar!"
    ]
  },
  {
    slug: "caravan-alarm-en-beveiliging",
    title: "Caravan beveiligen: alarm, slot en GPS-tracker",
    excerpt: "Hoe beschermt u uw caravan tegen diefstal? Van disselsot tot GPS-tracker: de beste beveiligingsopties op een rij.",
    date: "2024-08-22",
    readTime: "6 min",
    category: "Onderhoud",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80",
    cta: { label: 'Veilig stallen bij ons', href: '/stalling' },
    content: [
      "Caravandiefstal is helaas een reëel probleem, vooral in het voor- en naseizoen. Een caravan die onbewaakt op een oprit staat, is een makkelijk doelwit. Met de juiste combinatie van mechanische en elektronische beveiliging maakt u het dieven zo moeilijk mogelijk.",

      "## Disselslot\n\nHet disselslot is de eerste verdedigingslinie. Een goed disselslot voorkomt dat de dissel op een trekhaak past. Kies een SCM-goedgekeurd slot (minimaal klasse 3). Populaire merken: AL-KO Safety, Winterhoff en Doublelock. Kosten: €100-300.",

      "## Wielklem\n\nEen wielklem immobiliseert het wiel en maakt wegrijden onmogelijk. Vooral effectief in combinatie met een disselslot — de dief kan dan niet rijden én niet slepen. Kosten: €60-150.",

      "## GPS-tracker\n\nEen verborgen GPS-tracker stuurt de locatie van uw caravan naar uw telefoon. Bij onverwachte verplaatsing ontvangt u direct een alarm. Sommige trackers werken op een eigen accu die maanden meegaat. Kosten: €50-200 + €5-10/mnd abonnement.",

      "## Alarmsysteem\n\nEen caravanalarm detecteert trillingen, beweging of inbraak en geeft een luid alarm. Modernere systemen sturen ook een melding naar uw telefoon. Let op: goedkope systemen geven veel vals alarm bij wind. Investeer in kwaliteit.",

      "## Stalling als beveiliging\n\nDe beste beveiliging is een professionele stalling. Op ons terrein is uw caravan beveiligd met Securitas Direct alarm, 24/7 camerabewaking en een volledig omsloten terrein. Daarnaast is uw caravan standaard verzekerd tegen diefstal. Dat is een complete beveiligingsoplossing voor minder dan u denkt.",

      "## Onze tip\n\nCombineer altijd minimaal twee beveiligingslagen: een mechanisch slot (disselslot of wielklem) plus een elektronisch middel (GPS-tracker of alarm). En overweeg serieus professionele stalling — het voorkomt niet alleen diefstal, maar ook vandalisme, weersinvloeden en slijtage."
    ]
  },
  {
    slug: "kampeerregels-spanje-2025",
    title: "Kampeerregels Spanje 2025: wat mag wel en niet?",
    excerpt: "Wild kamperen, barbecueën, maximale verblijfsduur: de belangrijkste kampeerregels en verkeersregels voor Spanje in 2025.",
    date: "2024-08-05",
    readTime: "7 min",
    category: "Reisgids",
    image: "https://images.unsplash.com/photo-1478827536114-da961b7f86d2?auto=format&fit=crop&w=800&q=80",
    cta: { label: 'Bekijk campingtransport', href: '/diensten#transport' },
    content: [
      "Spanje heeft specifieke regels voor kampeerders die afwijken van Nederlandse gewoonten. Onbekendheid met deze regels kan leiden tot flinke boetes. In dit artikel zetten wij de belangrijkste regels voor 2025 op een rij.",

      "## Wild kamperen\n\nWild kamperen is in heel Spanje verboden, tenzij de lokale gemeente het expliciet toestaat (en dat doen zeer weinig gemeenten). De boetes variëren van €100 tot €3.000, afhankelijk van de regio en of u in een beschermd natuurgebied staat. In Catalonië worden deze boetes streng gehandhaafd.",

      "## Camperplaatsen (áreas de autocaravanas)\n\nSpanje heeft een groeiend netwerk van officiële camperplaatsen. Veel zijn gratis of kosten €5-10/nacht inclusief water en elektra. Apps als Park4Night en Campercontact helpen u bij het vinden van plekken. Nachtrust op parkeerterreinen is niet hetzelfde als kamperen — u mag in uw camper overnachten, maar geen luifel, tafel of stoelen buiten zetten.",

      "## Barbecueën\n\nIn Catalonië geldt van 15 maart tot 15 oktober een streng verbod op open vuur in de natuur, inclusief barbecues. Op campings zijn alleen afgebakende barbecueplekken toegestaan. De boetes zijn hoog (tot €6.000) en bij extreme droogte wordt het verbod uitgebreid.",

      "## Snelheidsregels met caravan\n\nAuto met caravan in Spanje:\n- Bebouwde kom: 50 km/u\n- Buitenwegen: 70 km/u\n- Snelwegen: 90 km/u\n\nOvertredingen boven 20 km/u te hard worden direct beboet (€100-600). Boven de 50 km/u te hard riskeert u rijontzegging.",

      "## Verplichte uitrusting\n\nTwee gevarendriehoeken, reflecterend hesje in handbereik, reservelampenset en extra buitenspiegels. Sinds 2024 is een 'HELP!' sticker op de achterruit aanbevolen voor wie geen noodoproepsysteem (eCall) in de auto heeft.",

      "## Verblijfsduur op campings\n\nOp Spaanse campings mag u in principe het hele jaar staan. De meeste campings aan de Costa Brava zijn open van maart tot en met oktober. Jaarrondcampings hebben vaak speciale wintertarieven. Check altijd de voorwaarden bij uw camping.",

      "## Praktische tips\n\n- Houd altijd uw identiteitsbewijs bij de hand (verplicht in Spanje)\n- Zorg dat uw verzekering ook geldig is voor het buitenland\n- Neem een Europese Ziekteverzekeringskaart (EHIC) mee\n- Download de campingtips van onze blog voor de beste plekken aan de Costa Brava"
    ]
  },
  {
    slug: "caravan-seizoensklaar-lente",
    title: "Caravan seizoensklaar maken voor de lente: de 8 stappen",
    excerpt: "Het kampeerseizoen begint. Met deze 8 stappen maakt u uw caravan klaar voor een zorgeloos kampeerseizoen aan de Costa Brava.",
    date: "2024-07-20",
    readTime: "6 min",
    category: "Onderhoud",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
    cta: { label: 'Seizoensklaar-pakket bestellen (€245)', href: '/tarieven' },
    content: [
      "Na maanden stalling is het tijd om uw caravan klaar te maken voor het nieuwe seizoen. Een goede seizoensvoorbereiding voorkomt vervelende verrassingen op de camping. Bij Caravanstalling Spanje bieden wij een compleet seizoensklaar-pakket aan, maar u kunt het ook zelf doen met deze checklist.",

      "## 1. Visuele inspectie buitenzijde\n\nLoop om de caravan heen en controleer op zichtbare schade: deuken, krassen, loslatende kit, mos of algaanslag. Check het dak en de dakluiken. Noteer alles wat u opvalt voor reparatie.",

      "## 2. Watersysteem vullen en testen\n\nVul de schone-watertank en open alle kranen. Laat het water een paar minuten lopen om het systeem door te spoelen. Controleer op lekkages bij alle koppelingen, de boiler en het toilet. Desinfecteer het watersysteem met een speciaal middel.",

      "## 3. Gasinstallatie controleren\n\nSluit een volle gasfles aan en controleer alle aansluitingen op lekkage (zeepoplossing). Test het kooktoestel, de boiler en eventueel de verwarming. Is de gaskeuring verlopen? Plan een nieuwe keuring in.",

      "## 4. Banden controleren\n\nPomp de banden op tot de voorgeschreven druk. Controleer het profiel (minimaal 1,6mm) en de leeftijd (DOT-code). Let op scheuren in de flanken. Vergeet het reservewiel niet.",

      "## 5. Remmen en verlichting testen\n\nSluit de caravan aan op de auto en test alle verlichting: rijlicht, remlicht, richtingaanwijzers, achteruitrijlicht, mistachterlicht en nummerplaatverlichting. Test de remmen door kort en stevig te remmen bij lage snelheid.",

      "## 6. Accu en elektra\n\nControleer de accuspanning (minimaal 12,4V). Test de 12V-verlichting en stopcontacten. Sluit de 230V-kabel aan en test alle stopcontacten en schakelaars. Controleer de aardlekschakelaar.",

      "## 7. Interieur reinigen en controleren\n\nMaak het interieur grondig schoon. Controleer op sporen van muizen (keutels, knaagschade). Lucht de caravan goed uit. Controleer de werking van alle ramen en dakluiken.",

      "## 8. Proefrit\n\nMaak voor vertrek altijd een korte proefrit van 10-15 km. Let op het remgedrag, de wegligging en eventuele bijgeluiden. Na de rit: controleer de wielbouten.",

      "## Seizoensklaar-pakket\n\nGeen zin om dit allemaal zelf te doen? Bij Caravanstalling Spanje bieden wij een compleet seizoensklaar-pakket aan voor €245. Onze monteurs nemen alle bovenstaande stappen voor hun rekening, inclusief een exterieur-was, interieurreiniging en een uitgebreide technische check. U stapt in een caravan die er als nieuw uitziet."
    ]
  }
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug);
}

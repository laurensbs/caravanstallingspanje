// Lightweight i18n for the public-facing pages.
// Two locales (NL + EN), one flat dictionary, browser-detect default,
// cookie persistence. No external lib — adding next-intl/lingui would
// bloat the bundle for ~145 strings.

export type Locale = 'nl' | 'en';

export const LOCALES: Locale[] = ['nl', 'en'];
export const DEFAULT_LOCALE: Locale = 'nl';
export const COOKIE_NAME = 'cs_locale';

// All visible customer strings live here. Keys are kebab-cased intent,
// not literal Dutch text, so re-wording one language doesn't churn keys.
//
// {0}, {1}, {2} are positional interpolation tokens — see t().
export const STRINGS = {
  // ─── Common ─────────────────────────────────────────────
  'common.contact-email': { nl: 'info@caravanstalling-spanje.com', en: 'info@caravanstalling-spanje.com' },
  'common.contact-phone': { nl: '+34 633 778 699', en: '+34 633 778 699' },
  'common.questions': { nl: 'Vragen?', en: 'Questions?' },
  'common.back-to-website': { nl: 'Terug naar de website', en: 'Back to website' },
  'common.back-to-services': { nl: 'Terug naar diensten', en: 'Back to services' },
  'common.services-link': { nl: 'Diensten', en: 'Services' },
  'common.reference': { nl: 'Referentie:', en: 'Reference:' },
  'common.optional': { nl: '(optioneel)', en: '(optional)' },
  'common.something-wrong': { nl: 'Er ging iets mis', en: 'Something went wrong' },
  'common.connection-error': { nl: 'Verbindingsfout', en: 'Connection error' },
  'common.busy': { nl: 'Bezig…', en: 'One moment…' },
  'common.cancel': { nl: 'Annuleren', en: 'Cancel' },
  'common.continue-to-pay': { nl: 'Doorgaan naar betalen', en: 'Continue to payment' },
  'common.forwarding': { nl: 'Doorsturen…', en: 'Redirecting…' },
  'common.sending': { nl: 'Versturen…', en: 'Sending…' },
  'common.send-request': { nl: 'Aanvraag versturen', en: 'Send request' },
  'common.stripe-redirect': { nl: 'Doorsturen naar Stripe…', en: 'Redirecting to Stripe…' },
  'common.stripe-secure': { nl: 'Je betaling verloopt via een beveiligde verbinding.', en: 'Your payment is processed over a secure connection.' },
  'common.stripe-footer-paid': { nl: 'Je gaat door naar onze beveiligde Stripe-betaalpagina.', en: "You'll continue to our secure Stripe payment page." },
  'common.email-confirmation-footer': {
    nl: 'Je krijgt direct een bevestiging per e-mail. Onze werkplaats neemt zo snel mogelijk contact op.',
    en: "You'll receive a confirmation email immediately. Our workshop will reach out as soon as possible.",
  },
  'common.brand': { nl: 'Caravanstalling', en: 'Caravanstalling' },
  'common.send-failed': { nl: 'Verzenden mislukt', en: 'Sending failed' },
  'common.name': { nl: 'Naam', en: 'Name' },
  'common.email': { nl: 'E-mail', en: 'Email' },
  'common.phone': { nl: 'Telefoon', en: 'Phone' },
  'common.note': { nl: 'Opmerking', en: 'Note' },

  // ─── Contact-pagina ───
  'contact.heading': { nl: 'Stuur ons een bericht', en: 'Send us a message' },
  'contact.intro': {
    nl: 'Vragen over stalling, transport, reparatie of een service? Vul het formulier in — we sturen je snel een persoonlijke reactie.',
    en: 'Questions about storage, transport, repair or a service? Fill in the form — we\'ll send you a personal reply soon.',
  },
  'contact.section-details': { nl: 'Contactgegevens', en: 'Contact details' },
  'contact.section-message': { nl: 'Je bericht', en: 'Your message' },
  'contact.subject': { nl: 'Onderwerp', en: 'Subject' },
  'contact.subject-placeholder': { nl: 'Bv. Vraag over stalling-aanvraag', en: 'e.g. Question about storage request' },
  'contact.message': { nl: 'Bericht', en: 'Message' },
  'contact.message-placeholder': { nl: 'Vertel ons waar we mee kunnen helpen…', en: 'Tell us how we can help…' },
  'contact.submit': { nl: 'Verstuur bericht', en: 'Send message' },
  'contact.or-mail': { nl: 'Of mail direct naar', en: 'Or email us directly at' },

  // ─── Ideeën-pagina ───
  'ideeen.thanks-title': { nl: 'Bedankt voor je idee!', en: 'Thanks for your idea!' },
  'ideeen.thanks-intro': {
    nl: 'We lezen alles en koppelen terug zodra we ermee aan de slag gaan.',
    en: 'We read everything and follow up when we get to work on it.',
  },
  'ideeen.vote-up': { nl: 'Goed idee', en: 'Good idea' },
  'ideeen.vote-down': { nl: 'Geen goed idee', en: 'Not a good idea' },
  'ideeen.vote-thanks': { nl: 'Bedankt voor je stem!', en: 'Thanks for your vote!' },

  // ─── Ideeën pagina makeover ────────────────────────────────
  'ideas.eyebrow': { nl: 'Ideeënbus', en: 'Ideas inbox' },
  'ideas.h1': { nl: 'Wat zou jij willen?', en: 'What would you love?' },
  'ideas.intro': {
    nl: 'Een nieuwe service, een handigheidje voor de camping, een bundel die we missen — alles is welkom. We lezen elk idee.',
    en: 'A new service, a clever campsite tweak, a bundle we\'re missing — everything\'s welcome. We read every idea.',
  },
  'ideas.live-count': { nl: '{0} ideeën deze maand', en: '{0} ideas this month' },
  'ideas.live-count-singular': { nl: '{0} idee deze maand', en: '{0} idea this month' },

  // Compose card
  'ideas.compose-title': { nl: 'Deel je idee', en: 'Share your idea' },
  'ideas.compose-step-cat': { nl: 'Categorie', en: 'Category' },
  'ideas.compose-step-cat-hint': {
    nl: 'Optioneel — helpt ons sneller bij de juiste persoon.',
    en: 'Optional — helps us route it faster.',
  },
  'ideas.compose-step-cat-skip': { nl: 'Geen categorie', en: 'No category' },
  'ideas.compose-step-idea': { nl: 'Je idee', en: 'Your idea' },
  'ideas.compose-step-idea-title': { nl: 'In één regel', en: 'In one line' },
  'ideas.compose-step-idea-title-placeholder': { nl: 'Bv. BBQ-pakket verhuren', en: 'E.g. rent a BBQ kit' },
  'ideas.compose-step-idea-detail': { nl: 'Uitleg', en: 'Tell us more' },
  'ideas.compose-step-idea-detail-hint': { nl: 'Wat zou je voor je zien? Hoe zou het werken?', en: 'What does it look like? How would it work?' },
  'ideas.compose-step-idea-detail-placeholder': {
    nl: 'Vertel zoveel of zo weinig als je wilt — wij lezen alles.',
    en: 'Say as much or little as you like — we read everything.',
  },
  'ideas.compose-step-you': { nl: 'Wie ben je?', en: 'Who are you?' },
  'ideas.compose-step-you-hint': { nl: 'Optioneel — alleen voor terugkoppeling.', en: 'Optional — only for follow-up.' },
  'ideas.compose-name': { nl: 'Naam', en: 'Name' },
  'ideas.compose-name-placeholder': { nl: 'Bv. Jan', en: 'E.g. Jan' },
  'ideas.compose-name-hint': { nl: 'Anoniem mag ook.', en: 'Anonymous is fine.' },
  'ideas.compose-email-placeholder': { nl: 'jij@voorbeeld.nl', en: 'you@example.com' },
  'ideas.compose-email-hint': { nl: 'Alleen als je een terugkoppeling wilt.', en: 'Only if you want feedback.' },
  'ideas.compose-submit': { nl: 'Verstuur mijn idee', en: 'Send my idea' },
  'ideas.compose-submit-busy': { nl: 'Versturen…', en: 'Sending…' },
  'ideas.compose-disclaimer': {
    nl: 'Geen verkooppraatjes, geen spam. Echt.',
    en: 'No sales pitch, no spam. Promise.',
  },

  // Inspiratie chips
  'ideas.inspire-title': { nl: 'Even inspireren', en: 'Inspire me' },
  'ideas.inspire-hint': { nl: 'Klik om als startpunt te gebruiken', en: 'Click to use as starting point' },

  // Categorieën
  'ideas.cat-service': { nl: 'Nieuwe dienst', en: 'New service' },
  'ideas.cat-camping': { nl: 'Camping-tip', en: 'Campsite tip' },
  'ideas.cat-comfort': { nl: 'Comfort', en: 'Comfort' },
  'ideas.cat-verhuur': { nl: 'Verhuur', en: 'Rental' },
  'ideas.cat-zomer': { nl: 'Zomer-extra', en: 'Summer extra' },
  'ideas.cat-klimaat': { nl: 'Klimaat & energie', en: 'Climate & energy' },
  'ideas.cat-anders': { nl: 'Iets heel anders', en: 'Something else' },

  // Feed
  'ideas.feed-title': { nl: 'Wij denken aan…', en: 'On our mind…' },
  'ideas.feed-empty': {
    nl: 'Geen actuele voorstellen om over te stemmen — wees jij de eerste.',
    en: 'No live proposals to vote on — be the first.',
  },
  'ideas.feed-featured-pill': { nl: 'Stem mee', en: 'Vote now' },
  'ideas.feed-vote-prompt': { nl: 'Wat vind jij?', en: 'What do you think?' },
  'ideas.feed-votes-summary': {
    nl: '{0} stemmen · {1}% positief',
    en: '{0} votes · {1}% positive',
  },

  // Done-state
  'ideas.done-title': { nl: 'Top, dit lezen we!', en: 'Got it — we\'ll read it!' },
  'ideas.done-body': {
    nl: 'Bedankt voor het meedenken. Heb je nog een idee?',
    en: 'Thanks for thinking along. Got another one?',
  },
  'ideas.done-another': { nl: 'Nog eentje insturen', en: 'Send another' },
  'ideas.done-back': { nl: 'Terug naar website', en: 'Back to website' },

  // ─── Sold-out (gemeenschappelijk koelkast/airco) ───
  'fridge.sold-out-dates': { nl: 'Op deze data zijn er geen units meer beschikbaar.', en: 'These dates are sold out.' },
  'common.locale-switch': { nl: 'NL', en: 'EN' },
  'common.next': { nl: 'Volgende', en: 'Next' },
  'common.back': { nl: 'Terug', en: 'Back' },
  'common.step-choose': { nl: 'Kiezen', en: 'Choose' },
  'common.step-confirm': { nl: 'Bevestigen', en: 'Confirm' },
  'common.summary': { nl: 'Overzicht', en: 'Summary' },

  // ─── Contact form fields ─────────────────────────────────
  'contact.name': { nl: 'Naam', en: 'Name' },
  'contact.email': { nl: 'E-mail', en: 'Email' },
  'contact.phone': { nl: 'Telefoon', en: 'Phone' },
  'contact.section-heading': { nl: 'Contactgegevens', en: 'Contact details' },
  'contact.registration': { nl: 'Kenteken', en: 'Number plate' },
  'contact.brand': { nl: 'Merk', en: 'Brand' },
  'contact.model': { nl: 'Model', en: 'Model' },
  'contact.location-hint-label': { nl: 'Camping / locatie', en: 'Camping / location' },
  'contact.location-hint-help': { nl: "Optioneel — bv. 'Camping Eurocamping plek 12'", en: "Optional — e.g. 'Camping Eurocamping spot 12'" },
  'contact.note': { nl: 'Opmerking', en: 'Note' },
  'contact.description': { nl: 'Omschrijving', en: 'Description' },

  // ─── Banner ──────────────────────────────────────────────
  'banner.important': { nl: 'Belangrijk:', en: 'Important:' },
  'banner.match-hint': {
    nl: 'gebruik het e-mailadres en telefoonnummer dat bij ons bekend is. Zo koppelen we je aanvraag automatisch aan je klantgegevens.',
    en: 'use the email address and phone number we have on file. That way we link your request to your existing customer record automatically.',
  },

  // ─── Landing ─────────────────────────────────────────────
  'landing.tagline': { nl: 'Meer dan een caravanstalling', en: 'More than just storage' },
  'landing.intro': {
    nl: 'Stalling, reparatie, transport en service aan de Costa Brava — alles via één plek, met vast personeel dat om je tweede huis geeft.',
    en: 'Storage, repair, transport and service on the Costa Brava — all in one place, with a fixed team that cares about your second home.',
  },
  'landing.reviews-count': { nl: '· 25 Google reviews', en: '· 25 Google reviews' },
  'landing.cta-services-title': { nl: 'Diensten', en: 'Services' },
  'landing.cta-services-desc': { nl: 'Reparatie, service, inspectie, transport, stalling.', en: 'Repair, service, inspection, transport, storage.' },
  'landing.cta-fridge-title': { nl: 'Koelkast huren', en: 'Rent a fridge' },
  'landing.cta-fridge-desc': { nl: 'Bezorgd op je staanplaats. Vanaf één week.', en: 'Delivered to your pitch. From one week.' },
  'landing.usp-secure-title': { nl: '24/7 beveiligd', en: '24/7 secured' },
  'landing.usp-secure-body': { nl: "Camera's, alarm + verzekering inbegrepen", en: 'Cameras, alarm + insurance included' },
  'landing.usp-workshop-title': { nl: 'Eigen werkplaats', en: 'On-site workshop' },
  'landing.usp-workshop-body': { nl: 'Reparatie en onderhoud op locatie', en: 'Repairs and maintenance on location' },
  'landing.usp-rating-title': { nl: '4.9 op Google', en: '4.9 on Google' },
  'landing.usp-rating-body': { nl: 'Vast personeel, vaste klanten', en: 'Fixed team, returning customers' },

  // ─── Services hub ────────────────────────────────────────
  'services.heading': { nl: 'Onze diensten', en: 'Our services' },
  'services.intro': {
    nl: 'Kies een dienst om aan te vragen. Online betalen waar mogelijk, anders nemen we contact op.',
    en: 'Pick a service to request. Pay online where possible — otherwise we get in touch.',
  },
  'services.repair-title': { nl: 'Reparatie', en: 'Repair' },
  'services.repair-desc': { nl: 'Schade, beading, onderdelen of een ander probleem aan je caravan.', en: 'Damage, beading, parts or any other issue with your caravan.' },
  'services.service-title': { nl: 'Service', en: 'Service' },
  'services.service-desc': { nl: 'Waxen, schoonmaak, ozonbehandeling en meer onderhoudsdiensten.', en: 'Waxing, cleaning, ozone treatment and more maintenance services.' },
  'services.inspection-title': { nl: 'Inspectie', en: 'Inspection' },
  'services.inspection-desc': { nl: 'Technische keuring met rapport — vóór seizoen, of na schade.', en: 'Technical inspection with report — before season or after damage.' },
  'services.transport-title': { nl: 'Transport', en: 'Transport' },
  'services.transport-desc': { nl: 'Heen-en-terug van stalling naar je camping. Wij regelen het.', en: 'Round-trip from storage to your camping. We handle it.' },
  'services.storage-title': { nl: 'Stalling', en: 'Storage' },
  'services.storage-desc': { nl: 'Caravan stallen op ons terrein — binnen overdekt of buiten op plek.', en: 'Storage on our grounds — covered indoor or outside in a dedicated spot.' },
  'services.fridge-title': { nl: 'Koelkast huren', en: 'Rent a fridge' },
  'services.fridge-desc': { nl: 'Bezorgd op je staanplaats. Vanaf één week.', en: 'Delivered to your pitch. From one week.' },
  'services.ac-title': { nl: 'Airco huren', en: 'Rent an AC' },
  'services.ac-desc': { nl: 'Houd het koel tijdens warme dagen — bezorgd en geïnstalleerd.', en: 'Stay cool during hot days — delivered and installed.' },
  'services.eyebrow': { nl: 'Costa Brava', en: 'Costa Brava' },
  // Per-service CTA's voor de tegels.
  'services.cta.fridge': { nl: 'Boek een koelkast', en: 'Book a fridge' },
  'services.cta.ac': { nl: 'Boek een airco', en: 'Book an AC' },
  'services.cta.storage': { nl: 'Vraag stalling aan', en: 'Request storage' },
  'services.cta.transport': { nl: 'Plan transport', en: 'Plan transport' },
  'services.cta.service': { nl: 'Kies een dienst', en: 'Pick a service' },
  'services.cta.repair': { nl: 'Vraag reparatie aan', en: 'Request a repair' },
  'services.cta.inspection': { nl: 'Vraag inspectie aan', en: 'Request inspection' },
  // Index-pagina specifiek (titel + intro overschrijven)
  'services.index-title': { nl: 'Diensten', en: 'Services' },
  'services.index-intro': {
    nl: 'Koelkasten, airco, stalling, transport, reparatie — kies wat je nodig hebt en we gaan ermee aan de slag.',
    en: 'Fridges, AC units, storage, transport, repair — pick what you need and we go from there.',
  },

  // ─── Repair page ─────────────────────────────────────────
  'repair.heading': { nl: 'Reparatie aanvragen', en: 'Request a repair' },
  'repair.intro': {
    nl: 'Beschrijf wat er moet gebeuren. We koppelen het aan een werkbon in het werkplaats-systeem en nemen contact op.',
    en: 'Describe what needs to happen. We attach it to a work order in our workshop system and reach out.',
  },
  'repair.section-issue': { nl: 'Wat is er aan de hand?', en: "What's going on?" },
  'repair.description-help': {
    nl: 'Wees zo specifiek mogelijk: locatie van de schade, wanneer ontstaan, etc.',
    en: 'Be as specific as you can: location of the damage, when it happened, etc.',
  },
  'repair.description-placeholder': {
    nl: 'Bv. lekkage bij het frontraam links, ontdekt na regen vorige week.',
    en: 'E.g. leak at the left front window, noticed after rain last week.',
  },
  'repair.done-body': {
    nl: "Bedankt! Onze werkplaats heeft je aanvraag ontvangen en bekijkt 'm zo snel mogelijk.",
    en: 'Thank you! Our workshop received your request and will review it as soon as possible.',
  },

  // ─── Inspection page ─────────────────────────────────────
  'inspection.heading': { nl: 'Inspectie aanvragen', en: 'Request an inspection' },
  'inspection.intro': {
    nl: 'Technische keuring met rapport — geschikt voor vóór het seizoen, na schade of voor verkoop.',
    en: 'Technical inspection with report — suitable for pre-season, post-damage or before sale.',
  },
  'inspection.when': { nl: 'Wanneer?', en: 'When?' },
  'inspection.preferred-date': { nl: 'Voorkeursdatum', en: 'Preferred date' },
  'inspection.note-placeholder': {
    nl: 'Specifieke aandachtspunten, gebruiksdoel, etc.',
    en: 'Specific points of attention, intended use, etc.',
  },

  // ─── Service page ────────────────────────────────────────
  'service.heading': { nl: 'Service aanvragen', en: 'Request a service' },
  'service.intro': { nl: 'Kies een service en betaal direct online.', en: 'Pick a service and pay online right away.' },
  'service.which': { nl: 'Welke service?', en: 'Which service?' },
  'service.empty': { nl: 'Er zijn op dit moment geen services beschikbaar. Neem contact op via', en: 'No services available at the moment. Get in touch at' },
  'service.note-section': { nl: 'Toelichting', en: 'Notes' },
  'service.note-placeholder': { nl: 'Aanvullende info, voorkeursdatum, etc.', en: 'Additional info, preferred date, etc.' },
  'service.amount-label': { nl: 'Te betalen', en: 'Amount due' },
  'service.checkout-hint': { nl: 'Je gaat na verzenden naar onze beveiligde Stripe-betaalpagina.', en: "After submitting you'll go to our secure Stripe payment page." },
  'service.done-title': { nl: 'Doorsturen naar betaling…', en: 'Redirecting to payment…' },

  // ─── Transport page ──────────────────────────────────────
  'transport.heading': { nl: 'Transport aanvragen', en: 'Request transport' },
  'transport.intro': {
    nl: 'Wij brengen je caravan vanaf de stalling naar de camping en halen hem op het einde weer op. Eén heen-rit, één terug-rit.',
    en: 'We deliver your caravan from our storage to the camping and pick it up again at the end. One outbound, one return.',
  },
  'transport.section-route': { nl: 'Route', en: 'Route' },
  'transport.from': { nl: 'Van', en: 'From' },
  'transport.to': { nl: 'Naar', en: 'To' },
  'transport.from-placeholder': { nl: 'Camping Eurocamping plek 12', en: 'Camping Eurocamping spot 12' },
  'transport.to-placeholder': { nl: 'Stalling Cruïlles', en: 'Storage Cruïlles' },
  'transport.note-placeholder': {
    nl: 'Bv. afmetingen, contactpersoon ter plaatse, etc.',
    en: 'E.g. dimensions, contact person on site, etc.',
  },
  'transport.amount-label': { nl: 'Transport (vast bedrag)', en: 'Transport (flat fee)' },
  'transport.camping-label': { nl: 'Camping', en: 'Camping' },
  'transport.outbound-date': { nl: 'Heen-datum', en: 'Outbound date' },
  'transport.return-date': { nl: 'Terug-datum', en: 'Return date' },
  'transport.billing-note-title': { nl: 'Facturatie loopt via je stalling.', en: 'Billing goes through your storage account.' },
  'transport.billing-note-body': {
    nl: 'Transport hoort bij de stalling — we rekenen het later met je af. Geen online betaling vereist.',
    en: "Transport is part of your storage — we'll settle it with you later. No online payment required.",
  },

  // ─── Stalling page ───────────────────────────────────────
  'storage.heading': { nl: 'Stalling aanvragen', en: 'Request storage' },
  'storage.intro': {
    nl: 'Caravan stallen op ons terrein aan de Costa Brava — heel jaar vooraf, overdekt of buiten.',
    en: 'Store your caravan on our grounds on the Costa Brava — full year up-front, covered or outside.',
  },
  'storage.section-type': { nl: 'Soort stalling', en: 'Type of storage' },
  'storage.indoor': { nl: 'Binnen', en: 'Indoor' },
  'storage.indoor-desc': { nl: 'Overdekt — beschermd tegen weer en zon.', en: 'Covered — protected from weather and sun.' },
  'storage.outdoor': { nl: 'Buiten', en: 'Outdoor' },
  'storage.outdoor-desc': { nl: 'Vaste plek op afgesloten terrein.', en: 'Dedicated spot on a secured site.' },
  'storage.per-year': { nl: '/ jaar', en: '/ year' },
  'storage.start-section': { nl: 'Startdatum', en: 'Start date' },
  'storage.start-from': { nl: 'Vanaf', en: 'From' },
  'storage.start-help': {
    nl: 'De stalling loopt voor één heel jaar vanaf deze datum.',
    en: 'Storage runs for one full year from this date.',
  },
  'storage.caravan-section': { nl: 'Caravan', en: 'Caravan' },
  'storage.length-meters': { nl: 'Lengte (meter)', en: 'Length (m)' },
  'storage.summary-indoor': { nl: 'Stalling binnen · 1 jaar vooraf', en: 'Indoor storage · 1 year up-front' },
  'storage.summary-outdoor': { nl: 'Stalling buiten · 1 jaar vooraf', en: 'Outdoor storage · 1 year up-front' },

  // ─── Thank-you ───────────────────────────────────────────
  'thanks.payment-title': { nl: 'Betaling ontvangen', en: 'Payment received' },
  'thanks.payment-services': {
    nl: 'Bedankt! Je betaling is geregistreerd. We sturen je een bevestiging per e-mail en nemen contact op zodra we starten.',
    en: "Thank you! Your payment was received. We'll send a confirmation email and get in touch as soon as we start.",
  },
  'thanks.payment-fridge': {
    nl: 'Bedankt! Je koelkasthuur staat klaar. Je krijgt zo een bevestiging per e-mail.',
    en: 'Thank you! Your fridge rental is set. A confirmation email is on its way.',
  },
  'thanks.request-title': { nl: 'Aanvraag ontvangen', en: 'Request received' },
  'thanks.request-body': {
    nl: 'Bedankt! Je krijgt zo een bevestiging per e-mail. Onze werkplaats neemt zo snel mogelijk contact op.',
    en: "Thank you! You'll receive a confirmation email shortly. Our workshop will get in touch as soon as possible.",
  },

  // ─── Fridge page ─────────────────────────────────────────
  'fridge.heading': { nl: 'Bestel een koelkast', en: 'Order a fridge' },
  'fridge.intro': {
    nl: 'Bezorgd op je staanplaats aan de Costa Brava. Minimum één week, daarna per dag.',
    en: 'Delivered to your pitch on the Costa Brava. Minimum one week, then per day.',
  },
  'fridge.which': { nl: 'Welke koelkast?', en: 'Which fridge?' },
  'fridge.per-week': { nl: '/week', en: '/week' },
  'fridge.per-day': { nl: '/dag', en: '/day' },
  'fridge.afterwards': { nl: 'Daarna', en: 'After that' },
  'fridge.period': { nl: 'Periode', en: 'Period' },
  'fridge.start-date': { nl: 'Startdatum', en: 'Start date' },
  'fridge.end-date': { nl: 'Einddatum', en: 'End date' },
  'fridge.minimum-days': { nl: 'Minimum {0} dagen.', en: 'Minimum {0} days.' },
  'fridge.camping': { nl: 'Camping', en: 'Camping' },
  'fridge.camping-placeholder': { nl: 'Bijv. Eurocamping', en: 'E.g. Eurocamping' },
  'fridge.spot-number': { nl: 'Pleknummer', en: 'Spot number' },
  'fridge.first-week': { nl: 'Eerste week', en: 'First week' },
  'fridge.extra-days-one': { nl: '{0} extra dag × {1}', en: '{0} extra day × {1}' },
  'fridge.extra-days-many': { nl: '{0} extra dagen × {1}', en: '{0} extra days × {1}' },
  'fridge.total-days': { nl: 'Totaal · {0} dagen', en: 'Total · {0} days' },
  'fridge.waitlist-on-title': { nl: 'Op de wachtlijst', en: "You're on the waitlist" },
  'fridge.waitlist-on-body-one': {
    nl: 'We hebben je gegevens genoteerd. Zodra er voor jouw periode een {0} vrijkomt, mailen we je direct.',
    en: "We've noted your details. As soon as a {0} becomes available for your period, we'll email you.",
  },
  'fridge.sold-out': { nl: 'Helaas vol', en: 'Sold out' },
  'fridge.sold-out-body-one': {
    nl: 'Voor de gevraagde periode zijn alle {0} al gereserveerd.',
    en: 'All {0} are already reserved for the requested period.',
  },
  'fridge.sold-out-help': {
    nl: 'Laat je gegevens achter en we mailen je zodra er een vrijkomt — of pas je periode aan.',
    en: "Leave your details and we'll email you when one frees up — or adjust your period.",
  },
  'fridge.add-to-waitlist': { nl: 'Plaats me op de wachtlijst', en: 'Add me to the waitlist' },
  'fridge.adjust-period': { nl: 'Periode aanpassen', en: 'Adjust period' },
  'fridge.privacy-note': {
    nl: 'Je gegevens (naam, e-mail, gewenste periode) worden alleen gebruikt om contact op te nemen zodra er plek is.',
    en: 'Your details (name, email, desired period) are only used to get in touch when space frees up.',
  },
  'fridge.device-large': { nl: 'Grote koelkast', en: 'Large fridge' },
  'fridge.device-table': { nl: 'Tafelmodel koelkast', en: 'Tabletop fridge' },
  'fridge.device-large-lower': { nl: 'grote koelkast', en: 'large fridge' },
  'fridge.device-table-lower': { nl: 'tafelmodel koelkast', en: 'tabletop fridge' },
  'fridge.large-plural': { nl: 'grote koelkasten', en: 'large fridges' },
  'fridge.table-plural': { nl: 'tafelmodel koelkasten', en: 'tabletop fridges' },
  'fridge.confirm-title': { nl: 'Aanvraag ontvangen', en: 'Request received' },
  'fridge.confirm-body': {
    nl: 'Bedankt! We hebben je aanvraag voor {0} dagen ontvangen — totaalbedrag {1}. We nemen binnen één werkdag contact op om de huur te bevestigen.',
    en: "Thank you! We received your request for {0} days — total {1}. We'll get back to you within one business day to confirm the rental.",
  },

  // ─── Airco ──────────────────────────────────────────────
  'airco.heading': { nl: 'Huur een airco', en: 'Rent an air conditioner' },
  'airco.intro': {
    nl: 'Verkoeling op je staanplaats — bezorgd, geïnstalleerd en weer opgehaald. Vanaf één week.',
    en: 'Cooling at your pitch — delivered, installed and collected. From one week.',
  },
  'airco.device-name': { nl: 'Airco unit', en: 'Air-con unit' },
  'landing.cta-airco-title': { nl: 'Airco huren', en: 'Rent air-con' },
  'landing.cta-airco-desc': { nl: 'Verkoeling op je staanplaats. Vanaf één week.', en: 'Cooling at your pitch. From one week.' },

  // ─── Homepage hero + CTA ─────────────────────────────────
  'home.eyebrow': { nl: 'Klaar voor de zomer', en: 'Ready for summer' },
  'home.h1-line1': { nl: 'Maak het op je staanplaats', en: 'Make your pitch' },
  'home.h1-line2': { nl: 'meteen comfortabel', en: 'comfortable right away' },
  'home.intro': {
    nl: 'Koelkast, airco of transport van/naar de camping — wij regelen het. Direct online bestellen, betalen en wij staan voor je klaar.',
    en: 'Fridge, AC or transport to and from the campsite — we take care of it. Book online, pay, and we get to work.',
  },
  'home.trust-reviews': { nl: '· 25 reviews', en: '· 25 reviews' },
  'home.trust-experience': { nl: '25 jaar ervaring', en: '25 years experience' },
  'home.trust-workshop': { nl: 'Eigen werkplaats', en: 'On-site workshop' },
  'home.trust-aria': { nl: '4.9 sterren op 25 Google reviews', en: '4.9 stars from 25 Google reviews' },

  // Service-cards (homepage)
  'home.svc-fridge-tag': { nl: 'Vanaf één week', en: 'From one week' },
  'home.svc-fridge-title': { nl: 'Koelkast huren', en: 'Rent a fridge' },
  'home.svc-fridge-desc': {
    nl: 'Bezorgd op je staanplaats — koel bier, verse boodschappen, geen gedoe.',
    en: 'Delivered to your pitch — cold drinks, fresh groceries, no hassle.',
  },
  'home.svc-fridge-price': { nl: 'vanaf {0}/wk', en: 'from {0}/wk' },

  'home.svc-airco-tag': { nl: 'Direct verkoeling', en: 'Instant cooling' },
  'home.svc-airco-title': { nl: 'Airco huren', en: 'Rent an AC unit' },
  'home.svc-airco-desc': {
    nl: 'Verkoeling op je staanplaats — bezorgd, geïnstalleerd en weer opgehaald.',
    en: 'Cooling on your pitch — delivered, installed and collected.',
  },
  'home.svc-airco-price': { nl: '{0}/wk', en: '{0}/wk' },

  'home.svc-transport-tag': { nl: 'Stalling ↔ camping', en: 'Storage ↔ campsite' },
  'home.svc-transport-title': { nl: 'Transport', en: 'Transport' },
  'home.svc-transport-desc': {
    nl: 'Wij brengen je caravan van de stalling naar de camping en weer terug.',
    en: 'We move your caravan from storage to the campsite and back.',
  },

  'home.svc-service-tag': { nl: 'Onderhoud & verzorging', en: 'Maintenance & care' },
  'home.svc-service-title': { nl: 'Service & onderhoud', en: 'Service & maintenance' },
  'home.svc-service-desc': {
    nl: 'Waxen, schoonmaak, ozon-behandeling en meer — onze werkplaats pakt het op.',
    en: 'Waxing, cleaning, ozone treatment and more — our workshop handles it.',
  },
  'home.svc-service-price': { nl: 'op aanvraag', en: 'on request' },
  'home.svc-cta-order': { nl: 'Bestellen', en: 'Order' },

  // Extra dienst-cards op homepage (stalling/reparatie/inspectie).
  'home.svc-storage-tag': { nl: 'Binnen of buiten', en: 'Indoor or outdoor' },
  'home.svc-storage-title': { nl: 'Stalling', en: 'Storage' },
  'home.svc-storage-desc': {
    nl: '24/7 beveiligd terrein, alarm, verzekering inbegrepen — overdekt of buitenplek.',
    en: '24/7 secured site, alarm, insurance included — covered or outside spot.',
  },
  'home.svc-storage-price': { nl: 'op aanvraag', en: 'on request' },

  'home.svc-repair-tag': { nl: 'Eigen werkplaats', en: 'On-site workshop' },
  'home.svc-repair-title': { nl: 'Reparatie', en: 'Repair' },
  'home.svc-repair-desc': {
    nl: 'Schade, beading, onderdelen — onze monteurs lossen het ter plaatse op.',
    en: 'Damage, beading, parts — our mechanics fix it on the spot.',
  },
  'home.svc-repair-price': { nl: 'op aanvraag', en: 'on request' },

  'home.svc-inspection-tag': { nl: 'Vóór seizoen of na schade', en: 'Pre-season or post-damage' },
  'home.svc-inspection-title': { nl: 'Inspectie', en: 'Inspection' },
  'home.svc-inspection-desc': {
    nl: 'Technische keuring met rapport — handig voor verkoop, verzekering of zekerheid.',
    en: 'Technical inspection with report — for sale, insurance or peace of mind.',
  },
  'home.svc-inspection-price': { nl: 'op aanvraag', en: 'on request' },

  'home.svc-cta-info': { nl: 'Meer weten', en: 'Learn more' },
  'home.section-services': { nl: 'Wat kunnen we voor je doen?', en: 'What we can do for you' },
  'home.section-services-intro': {
    nl: 'Alles op één plek — direct online boeken of even een bericht sturen voor een offerte.',
    en: 'Everything in one place — book online or send a message for a quote.',
  },

  // Service-info shared (gebruikt op /diensten/{reparatie,inspectie,stalling})
  'service-info.cta-title': { nl: 'Vraag een offerte aan', en: 'Get a quote' },
  'service-info.cta-body': {
    nl: 'Stuur ons je situatie en we koppelen binnen één werkdag terug. Bellen mag ook — we spreken Nederlands.',
    en: 'Send us your situation and we get back within one business day. Calling works too — we speak English and Dutch.',
  },
  'service-info.cta-form': { nl: 'Stuur een bericht', en: 'Send a message' },

  // Reparatie info
  'repair-info.eyebrow': { nl: 'Eigen werkplaats', en: 'On-site workshop' },
  'repair-info.bullet-1': { nl: 'Carrosserieschade, lekkages, beading en raamreparaties', en: 'Bodywork damage, leaks, beading and window repairs' },
  'repair-info.bullet-2': { nl: 'Origineel onderdeel of gelijkwaardig — altijd in overleg', en: 'Original part or equivalent — always in consultation' },
  'repair-info.bullet-3': { nl: 'Foto-rapport vóór en na, transparante factuur', en: 'Photo report before and after, transparent invoice' },
  'repair-info.bullet-4': { nl: 'Spoedreparatie mogelijk in seizoen', en: 'Emergency repair possible in season' },
  'repair-info.subject': { nl: 'Reparatie-aanvraag', en: 'Repair request' },

  // Inspectie info
  'inspection-info.eyebrow': { nl: 'Vóór seizoen of voor verkoop', en: 'Pre-season or for sale' },
  'inspection-info.bullet-1': { nl: 'Volledige technische keuring met checklist', en: 'Full technical inspection with checklist' },
  'inspection-info.bullet-2': { nl: 'PDF-rapport met foto\'s — handig voor verzekering of koper', en: 'PDF report with photos — useful for insurance or buyer' },
  'inspection-info.bullet-3': { nl: 'Adviezen voor onderhoud of reparaties', en: 'Recommendations for maintenance or repairs' },
  'inspection-info.bullet-4': { nl: 'Optioneel: kentekenkeuring (NL)', en: 'Optional: vehicle test (NL)' },
  'inspection-info.subject': { nl: 'Inspectie-aanvraag', en: 'Inspection request' },

  // Stalling info
  'storage-info.eyebrow': { nl: '24/7 beveiligd', en: '24/7 secured' },
  'storage-info.bullet-1': { nl: 'Camera\'s, alarm en Securitas Direct — verzekering inbegrepen', en: 'Cameras, alarm and Securitas Direct — insurance included' },
  'storage-info.bullet-2': { nl: 'Overdekt of buitenplek, naar voorkeur', en: 'Covered or outside spot, your choice' },
  'storage-info.bullet-3': { nl: 'Vast personeel — je weet bij wie je bent', en: 'Fixed staff — you know who you\'re dealing with' },
  'storage-info.bullet-4': { nl: 'Eigen werkplaats voor onderhoud tijdens stalling', en: 'On-site workshop for maintenance during storage' },
  'storage-info.subject': { nl: 'Stalling-aanvraag', en: 'Storage request' },

  // Reassurance row
  'home.reassure-payment': { nl: 'Beveiligde betaling', en: 'Secure payment' },
  'home.reassure-confirm': { nl: 'Bevestiging in je inbox', en: 'Confirmation in your inbox' },
  'home.reassure-team': { nl: 'Vast team aan de Costa Brava', en: 'Fixed team on the Costa Brava' },
  'home.contact-link': { nl: 'Vragen? Stuur ons een bericht →', en: 'Questions? Send us a message →' },

  // ─── Header navigation ───────────────────────────────────
  'nav.home': { nl: 'Home', en: 'Home' },
  'nav.services': { nl: 'Diensten', en: 'Services' },
  'nav.fridge-rental': { nl: 'Koelkast huren', en: 'Rent a fridge' },
  'nav.contact': { nl: 'Contact', en: 'Contact' },
  'nav.ideas': { nl: 'Ideeën', en: 'Ideas' },
  'nav.cta-services': { nl: 'Bekijk diensten', en: 'View services' },
  'nav.menu-open': { nl: 'Open menu', en: 'Open menu' },
  'nav.menu-close': { nl: 'Sluit menu', en: 'Close menu' },

  // ─── Marketing homepage ──────────────────────────────────
  'home2.hero-eyebrow': { nl: 'Costa Brava · Sant Climent de Peralta', en: 'Costa Brava · Sant Climent de Peralta' },
  'home2.hero-h1-line1': { nl: 'Meer dan alleen', en: 'More than just' },
  'home2.hero-h1-line2': { nl: 'caravanstalling.', en: 'caravan storage.' },
  'home2.hero-intro': {
    nl: 'Stalling, reparatie, onderhoud, transport en verhuur — al meer dan 25 jaar door een vast familieteam aan de Costa Brava.',
    en: 'Storage, repair, maintenance, transport and rentals — by a fixed family team on the Costa Brava for over 25 years.',
  },
  'home2.cta-primary': { nl: 'Bekijk onze diensten', en: 'View our services' },
  'home2.cta-call': { nl: 'Bel +34 633 77 86 99', en: 'Call +34 633 77 86 99' },
  'home2.trust-reviews': { nl: '4.9 · 25 Google reviews', en: '4.9 · 25 Google reviews' },
  'home2.trust-experience': { nl: '25 jaar ervaring', en: '25 years experience' },
  'home2.trust-security': { nl: '24/7 Securitas Direct', en: '24/7 Securitas Direct' },

  // Wie zijn we
  'home2.about-eyebrow': { nl: 'Over ons', en: 'About us' },
  'home2.about-h2': { nl: 'Familiebedrijf aan de Costa Brava', en: 'Family business on the Costa Brava' },
  'home2.about-p1': {
    nl: 'Caravanstalling Spanje is meer dan een opslagplek. We zijn een familiebedrijf met een vast team van zo\'n twaalf medewerkers in het seizoen, een eigen wagenpark, en een werkplaats waar we caravans onderhouden, repareren en klaarmaken voor de zomer.',
    en: 'Caravanstalling Spanje is more than a storage facility. We\'re a family business with a fixed team of around twelve people during the season, our own fleet, and a workshop where we maintain, repair and prepare caravans for summer.',
  },
  'home2.about-p2': {
    nl: 'Onze klanten — vaak Nederlandse en Belgische vakantiegangers — komen jaar na jaar terug. Dat komt omdat we doen wat we beloven: persoonlijk contact, transparante prijzen, en oog voor detail.',
    en: 'Our customers — often Dutch and Belgian travellers — come back year after year. Why? We do what we promise: personal contact, transparent pricing, and attention to detail.',
  },
  'home2.about-p3': {
    nl: 'En als er iets is, weet je bij wie je bent: hetzelfde team, hetzelfde verhaal, elk seizoen.',
    en: 'And if something comes up, you know who you\'re dealing with: same team, same story, every season.',
  },

  // Wat doen we (preview op homepage — 4 hoofdgroepen)
  'home2.services-eyebrow': { nl: 'Wat we doen', en: 'What we do' },
  'home2.services-h2': { nl: 'Alles op één plek', en: 'Everything in one place' },
  'home2.services-intro': {
    nl: 'Vier kerngebieden, naadloos op elkaar afgestemd zodat je nooit meer hoeft te zoeken.',
    en: 'Four core areas, smoothly aligned so you never have to search again.',
  },
  'home2.svc-storage-title': { nl: 'Stalling', en: 'Storage' },
  'home2.svc-storage-desc': { nl: 'Binnen overdekt of buiten op vaste plek — 24/7 beveiligd.', en: 'Indoor covered or outside on a fixed spot — 24/7 secured.' },
  'home2.svc-repair-title': { nl: 'Reparatie & onderhoud', en: 'Repair & maintenance' },
  'home2.svc-repair-desc': { nl: 'Eigen werkplaats, vaste monteurs, transparante factuur.', en: 'On-site workshop, fixed mechanics, transparent invoicing.' },
  'home2.svc-rentals-title': { nl: 'Verhuur', en: 'Rentals' },
  'home2.svc-rentals-desc': { nl: 'Koelkasten, airco, fietsen — bezorgd op je staanplaats.', en: 'Fridges, AC, bikes — delivered to your pitch.' },
  'home2.svc-transport-title': { nl: 'Transport', en: 'Transport' },
  'home2.svc-transport-desc': { nl: 'Wij brengen je caravan van stalling naar camping en weer terug.', en: 'We move your caravan from storage to campsite and back.' },
  'home2.services-cta-all': { nl: 'Bekijk alle diensten', en: 'View all services' },
  'home2.svc-link-more': { nl: 'Meer info', en: 'Learn more' },

  // Waarom ons (USPs)
  'home2.why-eyebrow': { nl: 'Waarom ons', en: 'Why us' },
  'home2.why-h2': { nl: 'Vier redenen waarom je terugkomt', en: 'Four reasons you keep coming back' },
  'home2.usp-secure-title': { nl: '24/7 beveiligd', en: '24/7 secured' },
  'home2.usp-secure-body': {
    nl: 'Camera\'s, alarm en Securitas Direct. Standaard verzekerd op locatie.',
    en: 'Cameras, alarm and Securitas Direct. Standard insurance on-site.',
  },
  'home2.usp-workshop-title': { nl: 'Eigen werkplaats', en: 'On-site workshop' },
  'home2.usp-workshop-body': {
    nl: 'Reparatie, schoonmaak, ozonbehandeling — alles ter plekke.',
    en: 'Repair, cleaning, ozone treatment — everything on the spot.',
  },
  'home2.usp-team-title': { nl: 'Vast team', en: 'Fixed team' },
  'home2.usp-team-body': {
    nl: 'Twaalf medewerkers in het seizoen. Je weet bij wie je bent.',
    en: 'Twelve people during the season. You know who you\'re dealing with.',
  },
  'home2.usp-care-title': { nl: 'Aandacht voor detail', en: 'Attention to detail' },
  'home2.usp-care-body': {
    nl: 'Tweewekelijkse controles, jaarlijkse keuring, stoomreiniging en waxen.',
    en: 'Bi-weekly checks, annual inspection, steam-cleaning and waxing.',
  },

  // Reviews-strip
  'home2.reviews-eyebrow': { nl: 'Reviews', en: 'Reviews' },
  'home2.reviews-h2': { nl: 'Onze klanten over ons', en: 'What customers say' },
  'home2.reviews-cta': { nl: 'Lees alle reviews op Google', en: 'Read all reviews on Google' },

  // Contact
  'home2.contact-eyebrow': { nl: 'Contact', en: 'Contact' },
  'home2.contact-h2': { nl: 'Een belletje of bericht is genoeg', en: 'A call or message is all it takes' },
  'home2.contact-intro': {
    nl: 'We spreken Nederlands, Engels en Spaans. Reageren binnen één werkdag.',
    en: 'We speak Dutch, English and Spanish. We respond within one business day.',
  },
  'home2.contact-address-label': { nl: 'Adres', en: 'Address' },
  'home2.contact-phone-label': { nl: 'Telefoon', en: 'Phone' },
  'home2.contact-email-label': { nl: 'E-mail', en: 'Email' },
  'home2.contact-hours-label': { nl: 'Openingstijden', en: 'Opening hours' },
  'home2.contact-hours-week': { nl: 'Maandag t/m vrijdag · 09:30 – 16:30', en: 'Monday to Friday · 09:30 – 16:30' },
  'home2.contact-hours-weekend': { nl: 'Zaterdag & zondag · gesloten', en: 'Saturday & Sunday · closed' },
  'home2.contact-cta': { nl: 'Stuur een bericht', en: 'Send a message' },

  // ─── Marketing homepage v2 (premium-stijl) ──────────────
  'mk.hero-eyebrow': { nl: 'Sinds 2009 · Costa Brava', en: 'Since 2009 · Costa Brava' },
  'mk.hero-h1-prefix': { nl: 'Veilig', en: 'Safely' },
  'mk.hero-h1-accent': { nl: 'stallen', en: 'stored' },
  'mk.hero-h1-suffix': { nl: 'aan de Costa Brava — alsof je caravan thuiskomt.', en: 'on the Costa Brava — as if your caravan came home.' },
  'mk.hero-lead': {
    nl: 'Binnen- en buitenstalling voor caravan en camper. Standaard verzekerd, 24/7 bewaakt en compleet onderhouden door onze eigen werkplaats. Op 15 minuten van Palamós, op het rustige binnenland van de Costa Brava.',
    en: 'Indoor and outdoor storage for caravan and motorhome. Standard insurance, 24/7 surveillance and complete maintenance by our own workshop. 15 minutes from Palamós, in the quiet inland of the Costa Brava.',
  },
  'mk.hero-cta-primary': { nl: 'Bekijk diensten', en: 'View services' },
  'mk.hero-cta-secondary': { nl: 'Vraag offerte aan', en: 'Request a quote' },
  'mk.hero-trust-rating': { nl: '4,9 / 5', en: '4.9 / 5' },
  'mk.hero-trust-rating-sub': { nl: '25 Google reviews', en: '25 Google reviews' },
  'mk.hero-trust-securitas': { nl: 'Securitas Direct', en: 'Securitas Direct' },
  'mk.hero-trust-securitas-sub': { nl: '24/7 alarm & camera\'s', en: '24/7 alarm & cameras' },
  'mk.hero-trust-team': { nl: 'Vast team', en: 'Fixed team' },
  'mk.hero-trust-team-sub': { nl: '~12 medewerkers in seizoen', en: '~12 staff during season' },

  // Stats-strip
  'mk.stat-customers': { nl: 'Caravans in beheer', en: 'Caravans in care' },
  'mk.stat-years': { nl: 'Jaar ervaring', en: 'Years experience' },
  'mk.stat-insured': { nl: 'Standaard verzekerd', en: 'Standard insured' },
  'mk.stat-guarded': { nl: 'Bewaakt terrein', en: 'Guarded grounds' },

  // Stalling overview (zonder prijzen — gebruiker geeft die niet publiek)
  'mk.storage-eyebrow': { nl: 'Stalling', en: 'Storage' },
  'mk.storage-h2': { nl: 'Drie manieren om je caravan veilig te stallen', en: 'Three ways to safely store your caravan' },
  'mk.storage-intro': {
    nl: 'Inclusief verzekering, tweewekelijkse damage-check en jaarlijkse technische inspectie. Vraag een persoonlijke offerte aan — geen verborgen kosten.',
    en: 'Includes insurance, bi-weekly damage check and annual technical inspection. Request a personal quote — no hidden fees.',
  },
  'mk.storage-outdoor-title': { nl: 'Buitenstalling', en: 'Outdoor storage' },
  'mk.storage-outdoor-desc': {
    nl: 'Open verharde plek op afgesloten terrein. Voor wie z\'n caravan flink gebruikt en makkelijk wil oppakken.',
    en: 'Open paved spot on secured grounds. For frequent users who want easy access.',
  },
  'mk.storage-covered-title': { nl: 'Overdekte stalling', en: 'Covered storage' },
  'mk.storage-covered-desc': {
    nl: 'Onder eigen dak, beschermd tegen regen, hagel en de Spaanse zon. Beste prijs-kwaliteit voor langere termijn.',
    en: 'Under our own roof, protected from rain, hail and the Spanish sun. Best value for the long term.',
  },
  'mk.storage-covered-badge': { nl: 'Meest gekozen', en: 'Most chosen' },
  'mk.storage-indoor-title': { nl: 'Binnenstalling', en: 'Indoor storage' },
  'mk.storage-indoor-desc': {
    nl: 'Volledig in de loods, klimaatstabiel. Voor exclusieve caravans, oldtimers en wie de kleinste schade wil voorkomen.',
    en: 'Fully indoors, climate-stable. For premium caravans, oldtimers and those who want to prevent the smallest damage.',
  },
  'mk.storage-feat-securitas': { nl: 'Securitas + camerabewaking', en: 'Securitas + camera surveillance' },
  'mk.storage-feat-insurance': { nl: 'Verzekering inbegrepen', en: 'Insurance included' },
  'mk.storage-feat-check': { nl: '2-wekelijkse schadecontrole', en: 'Bi-weekly damage check' },
  'mk.storage-feat-uv': { nl: 'Bescherming tegen UV & weer', en: 'UV & weather protection' },
  'mk.storage-feat-tech': { nl: 'Jaarlijkse technische check', en: 'Annual technical check' },
  'mk.storage-feat-priority': { nl: 'Voorrang bij vakantieservice', en: 'Priority for holiday service' },
  'mk.storage-feat-climate': { nl: 'Constante temperatuur', en: 'Constant temperature' },
  'mk.storage-feat-staff': { nl: 'Alleen toegang door personeel', en: 'Staff-only access' },
  'mk.storage-cta': { nl: 'Vraag offerte aan', en: 'Request a quote' },
  'mk.storage-note': {
    nl: 'Specifieke maten of XXL caravan? Neem contact op voor een persoonlijke offerte.',
    en: 'Specific dimensions or XXL caravan? Get in touch for a personal quote.',
  },

  // Services-grid
  'mk.svc-eyebrow': { nl: 'Onze diensten', en: 'Our services' },
  'mk.svc-h2': { nl: 'Meer dan een stalling — een volledige werkplaats', en: 'More than storage — a full workshop' },
  'mk.svc-intro': {
    nl: 'Van een lekke band tot reparatie van hagelschade: we lossen het op zonder dat je zelf hoeft over te komen.',
    en: 'From a flat tire to hail damage repair: we solve it without you having to come over.',
  },
  'mk.svc-repair-title': { nl: 'Reparatie', en: 'Repair' },
  'mk.svc-repair-desc': {
    nl: 'Carrosserieschade, hagel, vocht, beading en gescheurde wanden. Foto-rapport vóór en na.',
    en: 'Bodywork damage, hail, moisture, beading and torn walls. Photo report before and after.',
  },
  'mk.svc-transport-title': { nl: 'Transport', en: 'Transport' },
  'mk.svc-transport-desc': {
    nl: 'We brengen je caravan op afgesproken dag naar de camping. Volledig verzekerd tijdens transport.',
    en: 'We bring your caravan to the campsite on the agreed day. Fully insured during transport.',
  },
  'mk.svc-cleaning-title': { nl: 'Was & wax', en: 'Wash & wax' },
  'mk.svc-cleaning-desc': {
    nl: 'Hogedrukreiniging, polijsten en wax-behandeling tegen de zoute zeelucht.',
    en: 'High-pressure cleaning, polishing and wax treatment against salty sea air.',
  },
  'mk.svc-airco-title': { nl: 'Airco-verhuur', en: 'AC rental' },
  'mk.svc-airco-desc': {
    nl: 'Mobiele airco-units bezorgd op je staanplaats. Onmisbaar in de Spaanse zomer.',
    en: 'Mobile AC units delivered to your pitch. Essential in the Spanish summer.',
  },
  'mk.svc-fridge-title': { nl: 'Koelkast-verhuur', en: 'Fridge rental' },
  'mk.svc-fridge-desc': {
    nl: 'Grote koelkast of tafelmodel — bezorgd op je staanplaats. Vanaf één week.',
    en: 'Large fridge or tabletop — delivered to your pitch. From one week.',
  },
  'mk.svc-inspection-title': { nl: 'Technische inspectie', en: 'Technical inspection' },
  'mk.svc-inspection-desc': {
    nl: 'Jaarlijkse keuring met checklist en foto-rapport. Handig voor verzekering of verkoop.',
    en: 'Annual inspection with checklist and photo report. Useful for insurance or sale.',
  },
  'mk.svc-link-more': { nl: 'Meer info', en: 'Learn more' },

  // Vakantieservice
  'mk.vac-eyebrow': { nl: 'Sleutelklaar pakket', en: 'Turnkey package' },
  'mk.vac-h2': { nl: 'Stap uit het vliegtuig — stap je vakantie in', en: 'Step off the plane — step into your holiday' },
  'mk.vac-intro': {
    nl: 'Met onze Vakantieservice staat je caravan klaar op je gekozen camping zodra jij landt. Wij regelen alles, jij hoeft alleen nog te genieten.',
    en: 'With our Holiday Service your caravan is ready at your chosen campsite the moment you land. We handle everything, you just enjoy.',
  },
  'mk.vac-feat-onsite': { nl: 'Caravan op je plek vóór aankomst', en: 'Caravan at your spot before arrival' },
  'mk.vac-feat-utilities': { nl: 'Aangesloten op water & stroom', en: 'Connected to water & power' },
  'mk.vac-feat-fridge': { nl: 'Koelkast aan op verzoek', en: 'Fridge on by request' },
  'mk.vac-feat-beds': { nl: 'Bedden opgemaakt', en: 'Beds made' },
  'mk.vac-feat-tent': { nl: 'Voortent geplaatst', en: 'Awning set up' },
  'mk.vac-feat-cleaning': { nl: 'Eindschoonmaak na vertrek', en: 'Final cleaning after departure' },
  'mk.vac-cta': { nl: 'Vraag de vakantieservice aan', en: 'Request the holiday service' },

  // Security
  'mk.sec-eyebrow': { nl: 'Beveiliging & verzekering', en: 'Security & insurance' },
  'mk.sec-h2': { nl: 'Vier lagen bescherming, 365 dagen per jaar', en: 'Four layers of protection, 365 days a year' },
  'mk.sec-intro': {
    nl: 'Niet één feature, maar een volledig systeem dat samenwerkt om jouw caravan te beschermen — ook in de winter wanneer je niet in Spanje bent.',
    en: 'Not just one feature, but a full system that works together to protect your caravan — also in winter when you\'re not in Spain.',
  },
  'mk.sec-cam-title': { nl: 'Camera\'s & alarm', en: 'Cameras & alarm' },
  'mk.sec-cam-desc': {
    nl: 'Volledig terrein bewaakt door Securitas Direct. Bewegingsdetectie en directe alarm-melding.',
    en: 'Entire grounds monitored by Securitas Direct. Motion detection and direct alarm response.',
  },
  'mk.sec-fence-title': { nl: 'Afgesloten terrein', en: 'Enclosed grounds' },
  'mk.sec-fence-desc': {
    nl: 'Toegang alleen voor personeel of na afspraak. Hekwerk en code-toegang aan elke poort.',
    en: 'Access only for staff or by appointment. Fencing and code access at every gate.',
  },
  'mk.sec-insurance-title': { nl: 'Verzekering inbegrepen', en: 'Insurance included' },
  'mk.sec-insurance-desc': {
    nl: 'Standaard gedekt: brand, water, hagel, storm, inbraak en diefstal. Geen losse polis nodig.',
    en: 'Standard cover: fire, water, hail, storm, break-in and theft. No separate policy needed.',
  },
  'mk.sec-check-title': { nl: 'Schadecontrole', en: 'Damage check' },
  'mk.sec-check-desc': {
    nl: 'Elke twee weken visuele check door ons team. Jaarlijkse technische inspectie voor het rijseizoen.',
    en: 'Bi-weekly visual check by our team. Annual technical inspection before the driving season.',
  },

  // Reviews
  'mk.rev-eyebrow': { nl: 'Wat klanten zeggen', en: 'What customers say' },
  'mk.rev-h2': { nl: 'Vier sterren plus negen tienden van een ster', en: 'Four stars plus nine tenths of a star' },
  'mk.rev-score-num': { nl: '4,9', en: '4.9' },
  'mk.rev-score-base': { nl: 'Gebaseerd op', en: 'Based on' },
  'mk.rev-score-count': { nl: '25 Google reviews', en: '25 Google reviews' },

  // About
  'mk.about-eyebrow': { nl: 'Over ons', en: 'About us' },
  'mk.about-h2': { nl: 'Een Nederlands familiebedrijf in het hart van Catalonië', en: 'A Dutch family business in the heart of Catalonia' },
  'mk.about-p1': {
    nl: 'Sinds 2009 zorgen wij — een Nederlandse familie — voor de caravans en campers van Nederlandse en Belgische gasten. Onze aanpak: persoonlijk, eerlijk, oog voor detail.',
    en: 'Since 2009, we — a Dutch family — care for the caravans and motorhomes of Dutch and Belgian guests. Our approach: personal, honest, attentive.',
  },
  'mk.about-p2': {
    nl: 'Onze locatie ligt rustig in het binnenland, op 15 minuten van het strand bij Palamós en op een halfuur van Girona. Op het terrein heb je alles bij elkaar: stalling, werkplaats, transport en verkoop.',
    en: 'Our location is quiet inland, 15 minutes from the beach at Palamós and half an hour from Girona. On-site you have everything: storage, workshop, transport and sales.',
  },
  'mk.about-quote': {
    nl: '"Sinds 2009 hebben we het privilege om de zorg voor jouw caravan over te nemen."',
    en: '"Since 2009 we\'ve had the privilege of caring for your caravan."',
  },
  'mk.about-cta-tour': { nl: 'Plan een rondleiding', en: 'Schedule a tour' },
  'mk.about-cta-story': { nl: 'Lees ons verhaal', en: 'Read our story' },

  // FAQ
  'mk.faq-eyebrow': { nl: 'Veelgestelde vragen', en: 'Frequently asked' },
  'mk.faq-h2': { nl: 'Antwoorden op wat onze klanten vragen', en: 'Answers to what our customers ask' },
  'mk.faq-q1': { nl: 'Wat is er inbegrepen in de prijs?', en: 'What\'s included in the price?' },
  'mk.faq-a1': {
    nl: 'Een opslagplaats, 24/7 bewaking, verzekering tegen brand, water, weer en diefstal, een tweewekelijkse damage-check en een jaarlijkse technische inspectie. Aanvullende diensten zoals transport, schoonmaak of reparatie reken je per keer af.',
    en: 'A storage spot, 24/7 surveillance, insurance against fire, water, weather and theft, a bi-weekly damage check and an annual technical inspection. Additional services such as transport, cleaning or repair are billed per use.',
  },
  'mk.faq-q2': { nl: 'Hoe lang van tevoren moet ik reserveren?', en: 'How far in advance should I book?' },
  'mk.faq-a2': {
    nl: 'Voor het zomerseizoen raden we minimaal 4 weken aan. Buiten het seizoen is er meestal direct beschikbaarheid. Vraag een offerte aan en je krijgt binnen 24 uur uitsluitsel.',
    en: 'For the summer season we recommend at least 4 weeks. Off-season usually has immediate availability. Request a quote and we\'ll respond within 24 hours.',
  },
  'mk.faq-q3': { nl: 'Kan ik mijn caravan op elk moment ophalen?', en: 'Can I pick up my caravan anytime?' },
  'mk.faq-a3': {
    nl: 'Ja, op afspraak. We werken op afspraak omdat we dan zorgen dat je caravan klaar staat (banden gecontroleerd, dak schoongemaakt, koelkast aan). Meld je 48 uur van tevoren.',
    en: 'Yes, by appointment. We work by appointment so we can make sure your caravan is ready (tires checked, roof cleaned, fridge on). Notify us 48 hours in advance.',
  },
  'mk.faq-q4': { nl: 'Doen jullie ook onderhoud terwijl ik in Nederland ben?', en: 'Do you also do maintenance while I\'m abroad?' },
  'mk.faq-a4': {
    nl: 'Ja, dat is precies onze kracht. Spreek af wat er moet gebeuren — banden, remmen, hagelschade, airco — en wij sturen foto\'s van het werk naar je toe. Bij aankomst is alles klaar.',
    en: 'Yes, that\'s our strength. Agree on what needs to happen — tires, brakes, hail damage, AC — and we send photos of the work. By arrival everything is ready.',
  },
  'mk.faq-q5': { nl: 'Stallen jullie ook campers?', en: 'Do you also store motorhomes?' },
  'mk.faq-a5': {
    nl: 'Ja. Voor campers gelden dezelfde mogelijkheden als voor caravans: binnen, overdekt of buiten op afgesloten terrein. Boten stallen we niet — we richten ons volledig op caravans en campers.',
    en: 'Yes. The same options apply to motorhomes as to caravans: indoor, covered or outdoors on a fenced site. We don\'t store boats — we focus exclusively on caravans and motorhomes.',
  },

  // CTA-strip
  'mk.cta-h2': { nl: 'Klaar om je caravan in goede handen te geven?', en: 'Ready to put your caravan in good hands?' },
  'mk.cta-sub': { nl: 'Bel ons direct of vraag online een offerte aan.', en: 'Call us directly or request a quote online.' },
  'mk.cta-call': { nl: '+34 633 77 86 99', en: '+34 633 77 86 99' },
  'mk.cta-quote': { nl: 'Vraag offerte aan', en: 'Request a quote' },

  // Diensten-hub (de oude homepage-content)
  'diensten.hub-eyebrow': { nl: 'Diensten', en: 'Services' },
  'diensten.hub-h1': { nl: 'Direct online boekbaar', en: 'Book online directly' },
  'diensten.hub-intro': {
    nl: 'Kies een dienst, vul je gegevens in, betaal veilig via Stripe — wij gaan ermee aan de slag.',
    en: 'Pick a service, fill in your details, pay securely via Stripe — we get to work.',
  },
  'diensten.hub-reassure-payment': { nl: 'Beveiligde betaling via Stripe', en: 'Secure payment via Stripe' },
  'diensten.hub-reassure-confirm': { nl: 'Bevestiging direct in je inbox', en: 'Confirmation straight to your inbox' },
  'diensten.hub-reassure-team': { nl: 'Vast team aan de Costa Brava', en: 'Fixed team on the Costa Brava' },

  // ─── Footer ──────────────────────────────────────────────
  'footer.tagline': {
    nl: 'Stalling, reparatie, verkoop en verhuur aan de Costa Brava. Familiebedrijf, 24/7 beveiligd, volledig verzekerd.',
    en: 'Indoor & outdoor caravan storage, repair, sales and rentals on the Costa Brava. Family-run, secured 24/7, fully insured.',
  },
  'footer.reviews': { nl: '4.9 / 5 · 25 reviews', en: '4.9 / 5 · 25 reviews' },
  'footer.security': { nl: 'Securitas Direct', en: 'Securitas Direct' },
  'footer.heading-contact': { nl: 'Contact', en: 'Contact' },
  'footer.heading-services': { nl: 'Diensten', en: 'Services' },
  'footer.heading-info': { nl: 'Informatie', en: 'Information' },
  'footer.hours': { nl: 'Ma–Vr 09:30 – 16:30', en: 'Mon–Fri 09:30 – 16:30' },
  'footer.hours-closed': { nl: 'Za & Zo gesloten', en: 'Sat & Sun closed' },
  'footer.svc-fridge': { nl: 'Koelkast & airco huren', en: 'Fridges & AC rental' },
  'footer.svc-airco': { nl: 'Airco-units', en: 'AC units' },
  'footer.svc-storage': { nl: 'Stalling (binnen/buiten)', en: 'Storage (indoor/outdoor)' },
  'footer.svc-transport': { nl: 'Transport', en: 'Transport' },
  'footer.svc-service': { nl: 'Service & reparatie', en: 'Service & repair' },
  'footer.svc-inspection': { nl: 'Inspectie', en: 'Inspection' },
  'footer.info-contact': { nl: 'Contact', en: 'Contact' },
  'footer.info-ideas': { nl: 'Ideeënbus', en: 'Ideas inbox' },
  'footer.info-about': { nl: 'Over ons', en: 'About us' },
  'footer.info-news': { nl: 'Nieuws', en: 'News' },
  'footer.info-faq': { nl: 'Veelgestelde vragen', en: 'FAQ' },
  'footer.info-privacy': { nl: 'Privacy', en: 'Privacy' },
  'footer.info-cookies': { nl: 'Cookies', en: 'Cookies' },
  'footer.info-processors': { nl: 'Verwerkers', en: 'Data processors' },
  'footer.copyright': {
    nl: '© {0} Caravan Storage Spain S.L. · Alle rechten voorbehouden.',
    en: '© {0} Caravan Storage Spain S.L. · All rights reserved.',
  },

  // ─── Cookie banner & legal ──────────────────────────────
  'cookies.title': { nl: 'Cookies & privacy', en: 'Cookies & privacy' },
  'cookies.body': {
    nl: 'We gebruiken essentiële cookies om de site te laten werken. Met jouw toestemming gebruiken we ook analytische en marketing-cookies om de site te verbeteren. Je keuze is altijd aan te passen.',
    en: 'We use essential cookies to make this site work. With your permission we also use analytics and marketing cookies to improve the site. You can change your choice at any time.',
  },
  'cookies.accept-all': { nl: 'Alles accepteren', en: 'Accept all' },
  'cookies.reject-all': { nl: 'Alles weigeren', en: 'Reject all' },
  'cookies.customize': { nl: 'Voorkeuren', en: 'Preferences' },
  'cookies.save': { nl: 'Voorkeuren opslaan', en: 'Save preferences' },
  'cookies.cat-essential': { nl: 'Essentieel', en: 'Essential' },
  'cookies.cat-essential-desc': {
    nl: 'Nodig om in te loggen, formulieren te versturen en betalingen te verwerken. Altijd aan.',
    en: 'Required to log in, submit forms and process payments. Always on.',
  },
  'cookies.cat-analytics': { nl: 'Analytisch', en: 'Analytics' },
  'cookies.cat-analytics-desc': {
    nl: 'Helpt ons te begrijpen welke pagina\'s werken en welke niet. Geanonimiseerd.',
    en: 'Helps us understand which pages work and which don\'t. Anonymised.',
  },
  'cookies.cat-marketing': { nl: 'Marketing', en: 'Marketing' },
  'cookies.cat-marketing-desc': {
    nl: 'Voor advertenties en gepersonaliseerde inhoud op andere websites.',
    en: 'For advertising and personalised content on other websites.',
  },
  'cookies.more-info': { nl: 'Meer informatie', en: 'More information' },
  'cookies.policy-link': { nl: 'Cookiebeleid', en: 'Cookie policy' },
  'cookies.privacy-link': { nl: 'Privacyverklaring', en: 'Privacy policy' },
  'legal.privacy-title': { nl: 'Privacyverklaring', en: 'Privacy policy' },
  'legal.cookies-title': { nl: 'Cookiebeleid', en: 'Cookie policy' },
  'legal.processors-title': { nl: 'Verwerkers', en: 'Data processors' },
  'legal.last-updated': { nl: 'Laatst bijgewerkt', en: 'Last updated' },
} as const satisfies Record<string, Record<Locale, string>>;

export type StringKey = keyof typeof STRINGS;

// t('key', 'value-for-{0}', 'value-for-{1}', …) — keeps it tiny.
export function translate(locale: Locale, key: StringKey, ...args: (string | number)[]): string {
  const entry = STRINGS[key];
  let s = (entry?.[locale] ?? entry?.[DEFAULT_LOCALE] ?? key) as string;
  args.forEach((v, i) => {
    s = s.replaceAll(`{${i}}`, String(v));
  });
  return s;
}

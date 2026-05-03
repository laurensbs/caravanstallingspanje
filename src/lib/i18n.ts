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
  'ideeen.vote-down': { nl: 'Niet voor mij', en: 'Not for me' },
  'ideeen.vote-thanks': { nl: 'Bedankt voor je stem!', en: 'Thanks for your vote!' },

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

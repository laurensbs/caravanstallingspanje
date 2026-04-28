// Campings on the Costa Brava we deliver to / pick up from.
// Grouped by comarca and sub-region — used in the campingpicker dropdown.

export type Camping = {
  id: number;
  name: string;
  location: string;
};

export type CampingGroup = {
  comarca: 'La Selva' | 'Baix Empordà' | 'Alt Empordà';
  subregion: string;
  campings: Camping[];
};

export const CAMPING_GROUPS: CampingGroup[] = [
  // ─── La Selva ─────────────────────────────────────────
  {
    comarca: 'La Selva',
    subregion: 'Lloret de Mar',
    campings: [
      { id: 1, name: "Camping Kim's", location: 'Lloret de Mar' },
    ],
  },

  // ─── Baix Empordà ─────────────────────────────────────
  {
    comarca: 'Baix Empordà',
    subregion: "Santa Cristina d'Aro / Sant Feliu de Guíxols",
    campings: [
      { id: 2, name: 'Camping Mas Sant Josep',  location: "Santa Cristina d'Aro" },
      { id: 3, name: 'Camping Sant Pol',        location: 'Sant Feliu de Guíxols' },
      { id: 4, name: 'Camping Eurocamping',     location: 'Calonge' },
    ],
  },
  {
    comarca: 'Baix Empordà',
    subregion: "Platja d'Aro",
    campings: [
      { id: 5,  name: 'Camping Riembau',                       location: "Platja d'Aro" },
      { id: 6,  name: "Camping Vall d'Or",                     location: "Platja d'Aro" },
      { id: 7,  name: "Camping El Delfín Verde Platja d'Aro",  location: "Platja d'Aro" },
      { id: 8,  name: 'Camping Costa Brava',                   location: "Platja d'Aro" },
      { id: 9,  name: 'Camping Benelux',                       location: "Platja d'Aro" },
      { id: 10, name: "Camping King's",                        location: "Platja d'Aro" },
    ],
  },
  {
    comarca: 'Baix Empordà',
    subregion: 'Calonge / Sant Antoni de Calonge',
    campings: [
      { id: 11, name: 'Camping Cala Gogó',                     location: 'Calonge' },
      { id: 12, name: 'Camping Treumal',                       location: 'Calonge' },
      { id: 13, name: 'Camping Internacional de Calonge',      location: 'Calonge' },
      { id: 14, name: 'Camping Tres Estrellas Costa Brava',    location: 'Calonge' },
      { id: 15, name: 'Camping Moby Dick',                     location: 'Calonge' },
    ],
  },
  {
    comarca: 'Baix Empordà',
    subregion: 'Palamós',
    campings: [
      { id: 16, name: 'Camping Castell',                  location: 'Palamós' },
      { id: 17, name: 'Camping Internacional de Palamós', location: 'Palamós' },
      { id: 18, name: 'Camping Palamós',                  location: 'Palamós' },
    ],
  },
  {
    comarca: 'Baix Empordà',
    subregion: 'Calella de Palafrugell / Tamariu / Begur',
    campings: [
      { id: 19, name: 'Camping La Siesta',                location: 'Calella de Palafrugell' },
      { id: 20, name: 'Camping Calella de Palafrugell',   location: 'Calella de Palafrugell' },
      { id: 21, name: 'Camping Tamariu',                  location: 'Tamariu' },
      { id: 22, name: 'Camping Begur',                    location: 'Begur' },
    ],
  },
  {
    comarca: 'Baix Empordà',
    subregion: 'Pals',
    campings: [
      { id: 23, name: 'Camping Mas Patoxas',     location: 'Pals' },
      { id: 24, name: 'Camping Sandaya Cypsela', location: 'Pals' },
      { id: 25, name: 'Camping Interpals',       location: 'Pals' },
      { id: 26, name: 'Camping Playa Brava',     location: 'Pals' },
    ],
  },
  {
    comarca: 'Baix Empordà',
    subregion: 'Torroella de Montgrí',
    campings: [
      { id: 27, name: 'Camping Relax Nat',         location: 'Torroella de Montgrí' },
      { id: 28, name: 'Camping Relax-Ge',          location: 'Torroella de Montgrí' },
      { id: 29, name: 'Camping El Delfín Verde',   location: 'Torroella de Montgrí' },
      { id: 30, name: 'Camping Ter',               location: 'Torroella de Montgrí' },
    ],
  },
  {
    comarca: 'Baix Empordà',
    subregion: "L'Estartit",
    campings: [
      { id: 31, name: 'Camping Castell Montgrí',  location: "L'Estartit" },
      { id: 32, name: 'Camping Les Medes',        location: "L'Estartit" },
      { id: 33, name: "Camping El Moliní",        location: "L'Estartit" },
      { id: 34, name: 'Camping La Sirena',        location: "L'Estartit" },
      { id: 35, name: 'Camping Rifort',           location: "L'Estartit" },
      { id: 36, name: "Camping L'Estartit",       location: "L'Estartit" },
    ],
  },

  // ─── Alt Empordà ───────────────────────────────────────
  {
    comarca: 'Alt Empordà',
    subregion: "L'Escala",
    campings: [
      { id: 37, name: 'Camping Empordà',     location: "L'Escala" },
      { id: 38, name: 'Camping Lacus',       location: "L'Escala" },
      { id: 39, name: 'Camping Punta Milà',  location: "L'Escala" },
      { id: 40, name: 'Camping Illa Mateua', location: "L'Escala" },
      { id: 41, name: "Camping L'Escala",    location: "L'Escala" },
    ],
  },
  {
    comarca: 'Alt Empordà',
    subregion: 'Sant Pere Pescador',
    campings: [
      { id: 42, name: 'Camping La Ballena Alegre', location: 'Sant Pere Pescador' },
      { id: 43, name: 'Camping Las Dunas',         location: 'Sant Pere Pescador' },
      { id: 44, name: 'Camping El Riu',            location: 'Sant Pere Pescador' },
      { id: 45, name: 'Camping Aquarius',          location: 'Sant Pere Pescador' },
      { id: 46, name: 'Camping Nautilus',          location: 'Sant Pere Pescador' },
      { id: 47, name: 'Camping Las Palmeras',      location: 'Sant Pere Pescador' },
      { id: 48, name: 'Camping La Gaviota',        location: 'Sant Pere Pescador' },
      { id: 49, name: "Camping L'Àmfora",          location: 'Sant Pere Pescador' },
    ],
  },
  {
    comarca: 'Alt Empordà',
    subregion: "Castelló d'Empúries / Empuriabrava",
    campings: [
      { id: 50, name: 'Camping Nàutic Almata', location: "Castelló d'Empúries" },
      { id: 51, name: 'Camping Laguna',        location: "Castelló d'Empúries" },
    ],
  },
];

export const ALL_CAMPINGS: Camping[] = CAMPING_GROUPS.flatMap((g) => g.campings);

export const CAMPING_NAMES: string[] = ALL_CAMPINGS.map((c) => c.name);

export function findCamping(name: string): Camping | undefined {
  const target = name.trim().toLowerCase();
  return ALL_CAMPINGS.find((c) => c.name.toLowerCase() === target);
}

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

type SeedBooking = {
  camping?: string;
  start_date?: string;
  end_date?: string;
  spot_number?: string;
  status?: 'compleet' | 'controleren';
  notes?: string;
};

type SeedFridge = {
  name: string;
  email?: string;
  extra_email?: string;
  device_type?: string;
  notes?: string;
  bookings: SeedBooking[];
};

const Y = 2026;
const d = (m: number, day: number) => `${Y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const SEED_DATA: SeedFridge[] = [
  { name: 'Ad Jansen', email: 'a.jansen01@onsnet.nu', bookings: [
    { camping: "Camping Vall d'Aro", start_date: d(4, 9), status: 'controleren', notes: 'Mailen; einddatum onbekend.' },
  ]},
  { name: 'Alice van Toer Mostert', email: 'alicemostert@hotmail.nl', bookings: [
    { camping: 'Sandaya Cypsela', start_date: d(4, 19), end_date: d(5, 1), status: 'compleet' },
  ]},
  { name: 'Desiree Lips', email: 'desireelips73@gmail.com', device_type: 'Tafelmodel koelkast', bookings: [
    { camping: 'Sandaya Cypsela', start_date: d(4, 24), end_date: d(5, 3), status: 'compleet' },
    { camping: 'Calella de Palafrugell', start_date: d(7, 13), end_date: d(7, 29), status: 'compleet' },
  ]},
  { name: 'Serena Kraakman', email: 'sereentje14@hotmail.com', notes: 'Samengevoegd uit 2 vermeldingen.', bookings: [
    { camping: 'Camping Mas Sant Josep', start_date: d(4, 25), end_date: d(5, 8), spot_number: 'D0224', status: 'compleet' },
    { camping: 'Camping Mas Sant Josep', start_date: d(7, 8), end_date: d(7, 29), spot_number: 'D1205', status: 'compleet' },
  ]},
  { name: 'Francien Kieboom', email: 'familliekieboom2016@gmail.com', notes: '2 verschillende locaties met 2 verschillende datums bevestigd.', bookings: [
    { camping: 'International de Calonge', start_date: d(5, 29), end_date: d(6, 13), spot_number: 'F15', status: 'compleet' },
    { camping: 'International de Calonge', start_date: d(7, 25), end_date: d(8, 19), spot_number: 'F15', status: 'compleet' },
  ]},
  { name: 'Gordon Pichel', email: 'gordonpichel@gmail.com', bookings: [
    { camping: 'Camping Cala Gogo', start_date: d(6, 14), end_date: d(7, 3), status: 'compleet' },
  ]},
  { name: 'Henk Zoutewelle', email: 'henk.zoutewelle@gmail.com', bookings: [
    { camping: 'Camping Begur', start_date: d(6, 14), end_date: d(6, 26), status: 'compleet' },
  ]},
  { name: 'P Geurts', email: 'ouwe1960@gmail.com', bookings: [
    { camping: 'Camping Riembau', start_date: d(6, 15), end_date: d(7, 5), status: 'compleet' },
  ]},
  { name: 'Wim Dorgelo', email: 'wim.dorgelo@outlook.com', bookings: [
    { camping: 'El Delfin Verde Torroella', start_date: d(6, 15), end_date: d(7, 1), status: 'compleet' },
  ]},
  { name: 'Michele Koning / Kevin van de Valk', email: 'chel.koning@gmail.com', bookings: [
    { camping: 'Camping Kings', start_date: d(6, 27), end_date: d(7, 21), status: 'compleet' },
  ]},
  { name: 'Ruud de Kemp', email: 'ruuddekemp@kpnmail.nl', bookings: [
    { camping: 'Camping Las Dunas', start_date: d(6, 28), end_date: d(7, 18), status: 'compleet' },
  ]},
  { name: 'Jolanda Polak', email: 'bpolak@home.nl', bookings: [
    { camping: 'Camping Las Dunas', start_date: d(7, 1), end_date: d(8, 12), status: 'compleet' },
  ]},
  { name: 'Monique Douma', email: 'robin.lars@live.nl', notes: 'Samengevoegd uit 2 vermeldingen.', bookings: [
    { camping: 'International de Calonge', start_date: d(7, 4), end_date: d(7, 20), spot_number: 'F37', status: 'compleet' },
    { camping: 'International de Calonge', start_date: d(8, 21), end_date: d(9, 10), spot_number: 'B05', status: 'compleet' },
  ]},
  { name: 'Marieke Wulffraat', email: 'd.j.d.w@hotmail.nl', notes: "Samengevoegd met vermelding 'Gootjes Wulffraat Marieke'.", bookings: [
    { camping: 'Eurocamping', start_date: d(7, 6), end_date: d(7, 23), status: 'compleet' },
  ]},
  { name: 'Van Breda - Oudheusden', email: 'dennis-kim@kpnmail.nl', notes: 'E-mail stond los in de bron.', bookings: [
    { camping: 'Eurocamping', start_date: d(7, 8), end_date: d(7, 25), spot_number: 'Zone D, 583', status: 'compleet' },
  ]},
  { name: 'Niels Besse', email: 'nielsbesse@ziggo.nl', bookings: [
    { camping: 'Eurocamping', start_date: d(7, 9), end_date: d(7, 24), spot_number: 'A69', status: 'compleet' },
  ]},
  { name: 'David Silva Ramos', email: 'david-silvaramos@hotmail.com', bookings: [
    { camping: 'Camping Mas Sant Josep', start_date: d(7, 11), end_date: d(7, 31), spot_number: 'D13-12', status: 'compleet' },
  ]},
  { name: 'Jan Loots', email: 'j.loots@kpnmail.nl', bookings: [
    { camping: 'Camping Riembau', start_date: d(7, 11), end_date: d(7, 31), spot_number: '2042', status: 'compleet' },
  ]},
  { name: 'Miriam Nouwens', email: 'miriamnouwens@live.nl', bookings: [
    { camping: 'Camping Cala Gogo', start_date: d(7, 11), end_date: d(8, 1), status: 'compleet' },
  ]},
  { name: 'Sabine Kroon', email: 'sabine.kroon@hotmail.com', notes: "E-mailadres genormaliseerd uit 'Sabine.kroon at hotmail.com'.", bookings: [
    { camping: 'Eurocamping', start_date: d(7, 11), end_date: d(8, 5), status: 'compleet' },
  ]},
  { name: 'Morena Prasing', email: 'prasing.morena@gmail.com', bookings: [
    { camping: 'Camping Laguna', start_date: d(7, 12), end_date: d(8, 3), status: 'compleet' },
  ]},
  { name: 'Priscilla de Hommel', email: 'prisgio@live.nl', notes: 'Samengevoegd uit 2 vermeldingen; tweede vermelding had geen datum.', bookings: [
    { camping: 'Camping Cala Gogo', start_date: d(7, 12), end_date: d(8, 1), status: 'compleet' },
  ]},
  { name: 'Anita Seuren', email: 'anitaseuren@hotmail.com', bookings: [
    { camping: 'Camping Mas Sant Josep', start_date: d(7, 13), end_date: d(7, 29), spot_number: 'B03 plek 25', status: 'compleet' },
  ]},
  { name: 'Johan vd Ploeg', email: 'j.vanderploeg@quicknet.nl', notes: 'Samengevoegd uit 2 vermeldingen.', bookings: [
    { camping: 'Eurocamping Sant Antoni de Calonge', start_date: d(7, 13), end_date: d(7, 30), spot_number: 'Zone D, plaats 652', status: 'compleet' },
  ]},
  { name: 'Leen Hagoort', email: 'cora@hagoortgroep.nl', bookings: [
    { camping: 'Eurocamping', start_date: d(7, 13), end_date: d(8, 2), status: 'compleet' },
  ]},
  { name: 'Jennie Bezembinder - Koopmans', email: 'jenniebezembinder@live.nl', bookings: [
    { camping: "Camping Treumal, Platja d'Aro", start_date: d(7, 14), end_date: d(8, 2), status: 'compleet' },
  ]},
  { name: 'Angeline Petri', email: 'angeline.petri@gmail.com', bookings: [
    { camping: 'Eurocamping', start_date: d(7, 15), end_date: d(7, 22), status: 'compleet' },
  ]},
  { name: 'Mike Bos', email: 'mikebos86@outlook.com', bookings: [
    { camping: 'Illa Mateua', start_date: d(7, 15), end_date: d(8, 1), status: 'compleet' },
  ]},
  { name: 'Ronald Schalkwijk', email: 'rojo95@gmail.com', bookings: [
    { camping: 'Camping Cala Gogo', start_date: d(7, 15), end_date: d(8, 2), status: 'compleet' },
  ]},
  { name: 'Cindy Beunk / Bosters', email: 'cbeunk@live.nl', bookings: [
    { camping: 'Camping Mas Sant Josep', start_date: d(7, 16), end_date: d(8, 9), spot_number: 'D09-17', status: 'compleet' },
  ]},
  { name: 'Bart en Karina Verburg', email: 'fam.verburg@gmail.com', bookings: [
    { camping: 'International de Calonge', start_date: d(7, 18), end_date: d(8, 15), spot_number: 'L29', status: 'compleet' },
  ]},
  { name: 'Debbie Wijnings', email: 'dwijnings@gmail.com', device_type: "Grote koelkast + 2 airco's + 1 gasfles", bookings: [
    { camping: 'Eurocamping Sant Antoni de Calonge', start_date: d(7, 18), end_date: d(8, 7), status: 'compleet' },
  ]},
  { name: 'Mischa en Iris Hendriks', email: 'mischa.iris.hendriks@gmail.com', notes: "In bron staat 'op de site' bij datum.", bookings: [
    { camping: 'Camping Cala Gogo', start_date: d(7, 18), end_date: d(8, 8), spot_number: '729', status: 'compleet' },
  ]},
  { name: 'Yvet Scholten', notes: 'Gemaild; ontbrekende gegevens bevestigd (camping, e-mail en einddatum ontbreken).', bookings: [
    { start_date: d(7, 18), status: 'controleren' },
  ]},
  { name: 'Imro Boessen', email: 'imbro.boessen@gmail.com', bookings: [
    { camping: 'El Delfin Verde Pals', start_date: d(7, 19), end_date: d(8, 6), status: 'compleet' },
  ]},
  { name: 'Rolf Klarenbeek', email: 'rolfklarenbeek74@hotmail.com', bookings: [
    { camping: 'El Delfin Verde Pals', start_date: d(7, 19), end_date: d(8, 6), status: 'compleet' },
  ]},
  { name: 'Jessica Sibbing', email: 'jessibbing@gmail.com', bookings: [
    { camping: 'Eurocamping', start_date: d(7, 20), end_date: d(8, 10), status: 'compleet' },
  ]},
  { name: 'Joke Vrugteveen', email: 'jokevrugteveen@concepts.nl', device_type: 'Grote koelkast + airco', bookings: [
    { camping: 'El Delfin Verde Torroella', start_date: d(7, 21), end_date: d(8, 4), status: 'compleet' },
  ]},
  { name: 'Wilco van Noordenne', email: 'wvannoordenne@hotmail.com', device_type: 'Grote koelkast + airco unit', bookings: [
    { camping: 'Camping Playa Brava', start_date: d(7, 21), end_date: d(8, 10), status: 'compleet' },
  ]},
  { name: 'Bianca de Jong', email: 'biancadejong2@gmail.com', notes: 'Samengevoegd uit 2 vermeldingen.', bookings: [
    { camping: 'Camping Empordà', start_date: d(7, 22), end_date: d(8, 7), status: 'compleet' },
  ]},
  { name: 'Mariska Trooster', email: 'mtrooster84@hotmail.com', bookings: [
    { camping: "El Delfin Platja d'Aro", start_date: d(7, 22), end_date: d(8, 12), status: 'compleet' },
  ]},
  { name: 'Prisilla Mensink', email: 'prisilla.mensink@gmail.com', bookings: [
    { camping: 'Camping Illa Mateua', start_date: d(7, 23), end_date: d(8, 13), status: 'compleet' },
  ]},
  { name: 'Edwin en Rita Hazebroek', email: 'ritahazebroek@gmail.com', device_type: 'Tafelmodel koelkast', notes: "Samengevoegd met vermelding 'Rita Hazebroek'.", bookings: [
    { camping: 'Eurocamping', start_date: d(7, 24), end_date: d(8, 10), spot_number: 'Zone B, plaats 310', status: 'compleet' },
  ]},
  { name: 'Robert Stigt', email: 'info@stigtservices.nl', notes: 'Camping/date-velden hersteld op basis van de bronvolgorde.', bookings: [
    { camping: 'Eurocamping', start_date: d(7, 24), end_date: d(8, 21), status: 'compleet' },
  ]},
  { name: 'Sharon Wiggers', email: 'sharwiggers@outlook.com', notes: 'Samengevoegd uit 2 vermeldingen; oude e-mailvariant verwijderd.', bookings: [
    { camping: 'Camping Mas Sant Josep', start_date: d(7, 24), end_date: d(8, 13), spot_number: 'D06-12', status: 'compleet' },
  ]},
  { name: 'Jan Netten', email: 'nettenallin@hotmail.com', bookings: [
    { camping: 'Camping Las Dunas', start_date: d(7, 25), end_date: d(8, 16), status: 'compleet' },
  ]},
  { name: 'Dave van Roij', email: 'davevanroij@gmail.com', extra_email: 'davevanroij@icloud.com', bookings: [
    { camping: 'Camping Cala Gogo', start_date: d(7, 26), end_date: d(8, 10), status: 'compleet' },
  ]},
  { name: 'Marielle Rijnders', email: 'hamarijnders@outlook.com', notes: 'Pleknummer A23 is niet helemaal zeker; samengevoegd uit 2 vermeldingen.', bookings: [
    { camping: 'Sandaya Cypsela Resort Pals', start_date: d(7, 26), end_date: d(8, 19), spot_number: 'A23', status: 'controleren' },
  ]},
  { name: 'Michel Penraat', email: 'michelpenraat@kpnmail.nl', bookings: [
    { camping: 'Eurocamping', start_date: d(7, 27), end_date: d(8, 14), status: 'compleet' },
  ]},
  { name: 'Jan de Boer', email: 'jandeboer1971@ziggo.nl', notes: 'Samengevoegd uit 2 vermeldingen.', bookings: [
    { camping: 'Eurocamping', start_date: d(7, 28), end_date: d(8, 14), spot_number: 'B339', status: 'compleet' },
  ]},
  { name: 'Laura Lousma', email: 'ivanl@hotmail.com', device_type: 'Airco', bookings: [
    { camping: 'Camping Castell Montgrí', start_date: d(7, 29), end_date: d(8, 12), status: 'compleet' },
  ]},
  { name: 'Jochem en Suzanne Boon', email: 'jochem-suzanne@delta.nl', bookings: [
    { camping: 'Eurocamping', start_date: d(7, 31), end_date: d(8, 21), spot_number: 'G705', status: 'compleet' },
  ]},
  { name: 'Judith Voorn', email: 'jmvoorn@gmail.com', bookings: [
    { camping: 'Camping Las Dunas', start_date: d(8, 2), end_date: d(8, 15), spot_number: 'O1966', status: 'compleet' },
  ]},
  { name: 'Steve en Hilary Smith', email: 'steveavsmith@hotmail.com', bookings: [
    { camping: 'Relax G', start_date: d(8, 2), end_date: d(8, 17), spot_number: 'Plot 125', status: 'compleet' },
  ]},
  { name: 'Rene Dijkgraaf', email: 'depapenberg16@gmail.com', bookings: [
    { camping: 'Camping Cala Gogo', start_date: d(8, 4), end_date: d(8, 21), spot_number: 'Plot 693', status: 'compleet' },
  ]},
  { name: 'Rene Veltkamp', email: 'rveltkamp@ziggo.nl', notes: 'Gegevens dubbel gecheckt en bevestigd.', bookings: [
    { camping: 'Eurocamping Sant Antoni de Calonge', start_date: d(8, 20), end_date: d(9, 10), spot_number: 'A93', status: 'compleet' },
  ]},
];

export async function GET() { return seed(); }
export async function POST() { return seed(); }

async function seed() {
  try {
    const existing = await sql`SELECT COUNT(*) as count FROM fridges`;
    if (Number(existing[0].count) > 0) {
      return NextResponse.json({ error: `Already ${existing[0].count} fridges. Delete them first if you want to re-seed.` }, { status: 400 });
    }

    let fridgeCount = 0;
    let bookingCount = 0;
    for (const row of SEED_DATA) {
      const fridgeRes = await sql`INSERT INTO fridges (name, email, extra_email, device_type, notes)
        VALUES (${row.name}, ${row.email || null}, ${row.extra_email || null}, ${row.device_type || 'Grote koelkast'}, ${row.notes || null}) RETURNING id`;
      const fridgeId = fridgeRes[0].id;
      fridgeCount++;
      for (const b of row.bookings) {
        await sql`INSERT INTO fridge_bookings (fridge_id, camping, start_date, end_date, spot_number, status, notes)
          VALUES (${fridgeId}, ${b.camping || null}, ${b.start_date || null}::date, ${b.end_date || null}::date, ${b.spot_number || null}, ${b.status || 'compleet'}, ${b.notes || null})`;
        bookingCount++;
      }
    }

    return NextResponse.json({ success: true, fridges: fridgeCount, bookings: bookingCount });
  } catch (error) {
    console.error('Fridge seed error:', error);
    return NextResponse.json({ error: 'Failed to seed fridge data' }, { status: 500 });
  }
}

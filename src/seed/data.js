/**
 * Demo content for StudioSpace.
 *
 * Rules this file follows:
 * - No lorem ipsum. Every sentence is real copy a host could have written.
 * - All images are Unsplash CDN URLs that were checked for a 200 response.
 * - Host identity is denormalised onto the studio (ownerName/ownerEmail/ownerImage).
 *   BetterAuth owns the `user` collection, so the seed never hand-writes user
 *   documents; that is what the account bootstrap in seed.js is for.
 */

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

export const EXAMINER = {
  email: "examiner@studiospace.dev",
  password: "Exam@1234",
  name: "Ayesha Rahman",
  image: "",
};

export const HOSTS = [
  { email: "tanvir@studiospace.dev", name: "Tanvir Hasan", image: "" },
  { email: "nusrat@studiospace.dev", name: "Nusrat Jahan", image: "" },
  { email: "arif@studiospace.dev", name: "Arif Chowdhury", image: "" },
  { email: "meher@studiospace.dev", name: "Meherun Nesa", image: "" },
];

const owner = (email) => {
  if (email === EXAMINER.email) {
    return { ownerEmail: EXAMINER.email, ownerName: EXAMINER.name, ownerImage: EXAMINER.image };
  }
  const host = HOSTS.find((candidate) => candidate.email === email);
  if (!host) throw new Error(`Unknown host: ${email}`);
  return { ownerEmail: host.email, ownerName: host.name, ownerImage: host.image };
};

export const STUDIOS = [
  {
    title: "Northlight Photo Loft",
    category: "Photo Studio",
    hourlyRate: 3200,
    securityDeposit: 8000,
    maxCapacity: 15,
    location: "Gulshan 2, Dhaka",
    imageUrl: img("1493225457124-a3eb161ffa5f"),
    gallery: [img("1542038784456-1ea8e935640e"), img("1502920917128-1aa500764cbd"), img("1554048612-b6a482bc67e5")],
    amenities: ["Cyc Wall", "Blackout Curtains", "Styling Room", "Wi-Fi", "Parking", "Makeup Station"],
    overview:
      "A north-facing daylight loft with a twelve foot cyc wall, blackout curtains and a dedicated styling room. The space is set up for editorial, e-commerce and portrait work, and two Profoto packs are included in the hourly rate.",
    rating: 4.9,
    reviewCount: 48,
    featured: true,
    ...owner(EXAMINER.email),
  },
  {
    title: "Cyc Wall Collective",
    category: "Photo Studio",
    hourlyRate: 2800,
    securityDeposit: 6000,
    maxCapacity: 12,
    location: "Tejgaon, Dhaka",
    imageUrl: img("1542038784456-1ea8e935640e"),
    gallery: [img("1554048612-b6a482bc67e5"), img("1493225457124-a3eb161ffa5f"), img("1497366754035-f200968a6e72")],
    amenities: ["Three-sided Cyc", "Drive-in Access", "Grip Equipment", "Tethering Station", "Air Conditioning"],
    overview:
      "An industrial photo bay in Tejgaon with a three-sided white cyc, drive-in access for small vehicles and a separate hair and makeup corner. Grip, stands and a tethering station are always on set, so you can walk in with a camera and start shooting.",
    rating: 4.7,
    reviewCount: 31,
    featured: true,
    ...owner("arif@studiospace.dev"),
  },
  {
    title: "Softbox Studio 12",
    category: "Photo Studio",
    hourlyRate: 2100,
    securityDeposit: 4000,
    maxCapacity: 8,
    location: "Dhanmondi, Dhaka",
    imageUrl: img("1502920917128-1aa500764cbd"),
    gallery: [img("1497215842964-222b430dc094"), img("1542038784456-1ea8e935640e"), img("1497366811353-6870744d04b2")],
    amenities: ["Two Softboxes", "Shooting Table", "Paper Rolls", "Wi-Fi", "Coffee Bar"],
    overview:
      "A compact Dhanmondi studio built for product and headshot work. Two softboxes, a shooting table and a paper roll backdrop stay set up between bookings, which makes it a practical choice for short sessions and catalogue days.",
    rating: 4.4,
    reviewCount: 19,
    featured: false,
    ...owner("meher@studiospace.dev"),
  },
  {
    title: "Frame 24 Film Stage",
    category: "Film Stage",
    hourlyRate: 6500,
    securityDeposit: 15000,
    maxCapacity: 40,
    location: "Banani, Dhaka",
    imageUrl: img("1524253482453-3fed8d2fe12b"),
    gallery: [img("1517457373958-b7bdd4587205"), img("1497366216548-37526070297c"), img("1600566753086-00f18fb6b3ea")],
    amenities: ["24 ft Truss Grid", "Loading Bay", "Green Room", "Production Office", "Generator Backup", "Parking"],
    overview:
      "A sound-treated film stage with a twenty four foot truss grid, a loading bay wide enough for a van, and a green room that doubles as a production office. Pre-light visits are free when you book four hours or more.",
    rating: 4.9,
    reviewCount: 57,
    featured: true,
    ...owner("tanvir@studiospace.dev"),
  },
  {
    title: "Monsoon Backlot",
    category: "Film Stage",
    hourlyRate: 4800,
    securityDeposit: 10000,
    maxCapacity: 30,
    location: "Uttara Sector 7, Dhaka",
    imageUrl: img("1497366216548-37526070297c"),
    gallery: [img("1521737604893-d14cc237f11d"), img("1454165804606-c3d57bc86b40"), img("1524253482453-3fed8d2fe12b")],
    amenities: ["Rain Rig", "Weathered Facade", "Covered Area", "Crew Parking", "Power Distribution"],
    overview:
      "An open backlot with a weathered brick facade, a rain rig and enough parking for a small crew. It is the closest thing to an outdoor set inside Dhaka, and the covered area keeps a shoot running straight through the monsoon.",
    rating: 4.5,
    reviewCount: 23,
    featured: false,
    ...owner("tanvir@studiospace.dev"),
  },
  {
    title: "The Quiet Booth",
    category: "Podcast Lounge",
    hourlyRate: 1500,
    securityDeposit: 3000,
    maxCapacity: 6,
    location: "Bashundhara R/A, Dhaka",
    imageUrl: img("1598488035139-bdbb2231ce04"),
    gallery: [img("1478737270239-2f02b77fc618"), img("1600607687939-ce8a6c25118c"), img("1600585154340-be6161a56a0c")],
    amenities: ["Broadcast Mics", "Rodecaster Desk", "Acoustic Panels", "Wi-Fi", "Lounge"],
    overview:
      "A two-person podcast room with broadcast microphones, a Rodecaster desk and acoustic panels on every wall. Record, edit and publish in one sitting, then leave with a clean stereo file on your own drive.",
    rating: 4.8,
    reviewCount: 64,
    featured: true,
    ...owner("nusrat@studiospace.dev"),
  },
  {
    title: "Frequency Room",
    category: "Podcast Lounge",
    hourlyRate: 1200,
    securityDeposit: 2500,
    maxCapacity: 4,
    location: "Mohammadpur, Dhaka",
    imageUrl: img("1478737270239-2f02b77fc618"),
    gallery: [img("1598488035139-bdbb2231ce04"), img("1600585154340-be6161a56a0c"), img("1497366754035-f200968a6e72")],
    amenities: ["Vocal Booth", "Engineer Desk", "Headphones", "Air Conditioning"],
    overview:
      "A small, warm-sounding room for voice-over and solo recording. The booth fits one speaker comfortably, and the engineer's desk stays outside the glass so direction happens without opening the door mid-take.",
    rating: 4.3,
    reviewCount: 17,
    featured: false,
    ...owner("arif@studiospace.dev"),
  },
  {
    title: "Mic & Mango",
    category: "Podcast Lounge",
    hourlyRate: 1350,
    securityDeposit: 2500,
    maxCapacity: 5,
    location: "Khilgaon, Dhaka",
    imageUrl: img("1516280440614-37939bbacd81"),
    gallery: [img("1520523839897-bd0b52f945a0"), img("1600566753086-00f18fb6b3ea"), img("1478737270239-2f02b77fc618")],
    amenities: ["Three Mics", "Backup Recorder", "Guest Lounge", "Wi-Fi", "Coffee Bar"],
    overview:
      "A friendly three-mic setup for panel shows and interview series, with a mango-coloured backdrop that photographs well. We include headphones, a backup recorder and a lounge for guests waiting between segments.",
    rating: 4.6,
    reviewCount: 28,
    featured: false,
    ...owner("nusrat@studiospace.dev"),
  },
  {
    title: "Sargam Music Suite",
    category: "Music Suite",
    hourlyRate: 2600,
    securityDeposit: 6000,
    maxCapacity: 10,
    location: "Mirpur DOHS, Dhaka",
    imageUrl: img("1520523839897-bd0b52f945a0"),
    gallery: [img("1511671782779-c97d3d27a1d4"), img("1516280440614-37939bbacd81"), img("1497366811353-6870744d04b2")],
    amenities: ["Tuned Upright Piano", "Drum Kit", "Control Room", "Isolation Booth", "Wi-Fi"],
    overview:
      "A rehearsal and recording suite with a tuned upright piano, a drum kit and a separate control room. Bands use it for pre-production, and solo artists book it when they need a room that sounds good without hauling gear.",
    rating: 4.8,
    reviewCount: 39,
    featured: true,
    ...owner(EXAMINER.email),
  },
  {
    title: "Analog Attic",
    category: "Music Suite",
    hourlyRate: 3000,
    securityDeposit: 7000,
    maxCapacity: 12,
    location: "Baridhara, Dhaka",
    imageUrl: img("1600607687939-ce8a6c25118c"),
    gallery: [img("1516110833967-0b5716ca1387"), img("1497215728101-856f4ea42174"), img("1497366754035-f200968a6e72")],
    amenities: ["Tape Machine", "Vintage Amps", "Pedal Wall", "Lounge", "Street Parking"],
    overview:
      "A characterful attic room full of vintage amps, a tape machine and a wall of pedals. It suits singer-songwriter sessions and anything that benefits from a little room noise instead of a perfectly dead space.",
    rating: 4.5,
    reviewCount: 21,
    featured: false,
    ...owner("meher@studiospace.dev"),
  },
  {
    title: "The Workbench",
    category: "Workshop",
    hourlyRate: 1800,
    securityDeposit: 3500,
    maxCapacity: 20,
    location: "Motijheel, Dhaka",
    imageUrl: img("1517457373958-b7bdd4587205"),
    gallery: [img("1521737604893-d14cc237f11d"), img("1454165804606-c3d57bc86b40"), img("1497366754035-f200968a6e72")],
    amenities: ["Four Benches", "Spray Booth", "Shared Hand Tools", "Storage Lockers", "Loading Access", "Wi-Fi"],
    overview:
      "A bright maker space with four work benches, a spray booth and a wall of shared hand tools. It is built for prop making, small fabrication runs and workshops where everyone needs room to spread out and make a mess.",
    rating: 4.7,
    reviewCount: 33,
    featured: true,
    ...owner(EXAMINER.email),
  },
  {
    title: "Clay & Craft Room",
    category: "Workshop",
    hourlyRate: 1600,
    securityDeposit: 3000,
    maxCapacity: 16,
    location: "Gulshan 1, Dhaka",
    imageUrl: img("1600585154340-be6161a56a0c"),
    gallery: [img("1497215842964-222b430dc094"), img("1493663284031-b7e3aefcae8e"), img("1600566753086-00f18fb6b3ea")],
    amenities: ["Six Wheels", "Kiln", "Long Tables", "Aprons", "Sink", "Coffee Bar"],
    overview:
      "A calm ceramics and craft room with six wheels, a kiln and long tables for group sessions. Aprons, tools and a sink are included, and the kiln can be booked for a bisque firing after your class.",
    rating: 4.6,
    reviewCount: 26,
    featured: false,
    ...owner("meher@studiospace.dev"),
  },
];

/**
 * Offsets are relative to the moment the seed runs, so the demo never shows a
 * "past" booking after the project sits idle for a week.
 */
export const BOOKING_SEEDS = [
  {
    studioTitle: "Frame 24 Film Stage",
    daysFromNow: 3,
    startHour: 10,
    endHour: 14,
    status: "Pending",
    note: "Client wants a pre-light walkthrough at 9:30. Bringing two models and a crew of six.",
  },
  {
    studioTitle: "The Quiet Booth",
    daysFromNow: 6,
    startHour: 18,
    endHour: 20,
    status: "Confirmed",
    note: "Recording two episodes of the Founders in Dhaka podcast. Please keep the desk in stereo.",
  },
];

export const REVIEW_SEEDS = [
  {
    studioTitle: "Northlight Photo Loft",
    userEmail: "rifat.karim@example.com",
    userName: "Rifat Karim",
    rating: 5,
    comment:
      "The daylight is exactly as advertised and the cyc wall was already clean and lit when we arrived. We shot a twelve-look editorial without moving a single stand.",
  },
  {
    studioTitle: "Frame 24 Film Stage",
    userEmail: "sadia.islam@example.com",
    userName: "Sadia Islam",
    rating: 5,
    comment:
      "Huge space, quiet air conditioning and a loading bay that saved us an hour of carrying gear. The green room became our production office for the day.",
  },
  {
    studioTitle: "The Quiet Booth",
    userEmail: "mahin.chowdhury@example.com",
    userName: "Mahin Chowdhury",
    rating: 4,
    comment:
      "Recorded two episodes back to back and the audio needed almost no cleanup. Only note is that the room gets warm when three people are inside, so book the longer slot.",
  },
  {
    studioTitle: "Sargam Music Suite",
    userEmail: "farhana.akter@example.com",
    userName: "Farhana Akter",
    rating: 5,
    comment:
      "The upright piano is genuinely in tune and the control room let us listen back together instead of crowding around one pair of headphones. We booked it again for next month.",
  },
  {
    studioTitle: "The Workbench",
    userEmail: "rafiul.haque@example.com",
    userName: "Rafiul Haque",
    rating: 4,
    comment:
      "Plenty of bench space for a six-person prop workshop and the spray booth was a lifesaver. Bring your own clamps if you need more than a few.",
  },
  {
    studioTitle: "Monsoon Backlot",
    userEmail: "tasnim.zara@example.com",
    userName: "Tasnim Zara",
    rating: 5,
    comment:
      "It rained through most of our shoot and the covered area kept the whole scene dry. The brick facade reads beautifully on camera without any set dressing.",
  },
];

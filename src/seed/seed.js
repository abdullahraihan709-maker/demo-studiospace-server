import { env } from "../config/env.js";
import { connectDB, disconnectDB } from "../config/db.js";
import { Booking, Review, Studio } from "../models/index.js";
import { BOOKING_SEEDS, EXAMINER, HOSTS, REVIEW_SEEDS, STUDIOS } from "./data.js";

const SIGNUP_TIMEOUT_MS = 10_000;
const HOUR_MS = 60 * 60 * 1000;

/**
 * The examiner must be able to log in with a normal password, so the account is
 * created through BetterAuth's real sign-up endpoint rather than by writing a
 * `user` document by hand. Hand-written documents miss the password hash format
 * and break sign-in in ways that are painful to debug.
 *
 * The Next app therefore has to be running for this step. Everything else in the
 * seed works without it; a clear warning is printed if the account is skipped.
 */
async function ensureExaminerAccount() {
  const base = (process.env.BETTER_AUTH_URL || env.clientOrigins[0] || "http://localhost:3000").replace(/\/+$/, "");
  const endpoint = `${base}/api/auth/sign-up/email`;

  console.log(`[seed] checking examiner account through ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: base },
      body: JSON.stringify({
        email: EXAMINER.email,
        password: EXAMINER.password,
        name: EXAMINER.name,
      }),
      signal: AbortSignal.timeout(SIGNUP_TIMEOUT_MS),
    });

    if (response.ok) {
      console.log(`[seed] examiner account created: ${EXAMINER.email}`);
      return true;
    }

    if (response.status === 409 || response.status === 422) {
      console.log(`[seed] examiner account already exists: ${EXAMINER.email}`);
      return true;
    }

    const detail = await response.text().catch(() => "");
    console.warn(`[seed] sign-up returned ${response.status}: ${detail.slice(0, 240)}`);
    return false;
  } catch (error) {
    console.warn(`[seed] could not reach the client at ${base} (${error.message}).`);
    console.warn("[seed] The examiner account was skipped. Fix it in one of two ways:");
    console.warn("[seed]   1. start the client with `npm run dev`, then run `npm run seed` again");
    console.warn(`[seed]   2. register manually at ${base}/register with:`);
    console.warn(`[seed]      email: ${EXAMINER.email}`);
    console.warn(`[seed]      password: ${EXAMINER.password}`);
    return false;
  }
}

function slotStart(daysFromNow, hour) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function buildBookings(studioByTitle) {
  return BOOKING_SEEDS.map((seed) => {
    const studio = studioByTitle.get(seed.studioTitle);
    if (!studio) throw new Error(`Booking references an unknown studio: ${seed.studioTitle}`);

    const startAt = slotStart(seed.daysFromNow, seed.startHour);
    const endAt = slotStart(seed.daysFromNow, seed.endHour);
    const hours = (endAt.getTime() - startAt.getTime()) / HOUR_MS;

    return {
      studioId: studio._id,
      studioTitle: studio.title,
      studioImage: studio.imageUrl,
      hourlyRate: studio.hourlyRate,
      userEmail: EXAMINER.email,
      userName: EXAMINER.name,
      startAt,
      endAt,
      hours,
      totalPrice: Math.round(hours * studio.hourlyRate + studio.securityDeposit),
      status: seed.status,
      note: seed.note,
    };
  });
}

function buildReviews(studioByTitle) {
  return REVIEW_SEEDS.map((seed) => {
    const studio = studioByTitle.get(seed.studioTitle);
    if (!studio) throw new Error(`Review references an unknown studio: ${seed.studioTitle}`);

    return {
      studioId: studio._id,
      userEmail: seed.userEmail,
      userName: seed.userName,
      userImage: "",
      rating: seed.rating,
      comment: seed.comment,
    };
  });
}

async function run() {
  console.log("[seed] StudioSpace demo data");
  await connectDB();

  const accountReady = await ensureExaminerAccount();

  const [studiosBefore, bookingsBefore, reviewsBefore] = await Promise.all([
    Studio.countDocuments(),
    Booking.countDocuments(),
    Review.countDocuments(),
  ]);

  console.log(
    `[seed] replacing ${studiosBefore} studios, ${bookingsBefore} bookings and ${reviewsBefore} reviews`,
  );

  await Promise.all([Studio.deleteMany({}), Booking.deleteMany({}), Review.deleteMany({})]);

  const studios = await Studio.insertMany(STUDIOS);
  const studioByTitle = new Map(studios.map((studio) => [studio.title, studio]));

  const bookings = await Booking.insertMany(buildBookings(studioByTitle));
  const reviews = await Review.insertMany(buildReviews(studioByTitle));

  // Guarantee the indexes the queries depend on, including the unique review
  // index and the booking interval index behind the double-booking check.
  await Promise.all([Studio.syncIndexes(), Booking.syncIndexes(), Review.syncIndexes()]);

  const byCategory = studios.reduce((totals, studio) => {
    totals[studio.category] = (totals[studio.category] ?? 0) + 1;
    return totals;
  }, {});
  const featured = studios.filter((studio) => studio.featured).length;
  const owned = studios.filter((studio) => studio.ownerEmail === EXAMINER.email).length;

  console.log("");
  console.log("[seed] done");
  console.log(`  studios   : ${studios.length} (${featured} featured, ${owned} owned by the examiner)`);
  console.log(
    `  categories: ${Object.entries(byCategory)
      .map(([category, count]) => `${category} ${count}`)
      .join(" | ")}`,
  );
  console.log(`  bookings  : ${bookings.length} (${bookings.map((booking) => booking.status).join(", ")})`);
  console.log(`  reviews   : ${reviews.length}`);
  console.log(`  hosts     : ${HOSTS.length} host profiles + the examiner account`);
  console.log("");
  console.log("  Examiner login");
  console.log(`    email   : ${EXAMINER.email}`);
  console.log(`    password: ${EXAMINER.password}`);
  console.log(
    accountReady
      ? "    status  : ready to sign in"
      : "    status  : NOT CREATED - start the client and run the seed again",
  );
  console.log("");
}

run()
  .then(async () => {
    await disconnectDB();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("[seed] failed:", error.message);
    if (error.errors) {
      for (const [field, detail] of Object.entries(error.errors)) {
        console.error(`  - ${field}: ${detail.message}`);
      }
    }
    await disconnectDB().catch(() => {});
    process.exit(1);
  });

# Product Spec & Decision Log

> This file is the review context for Prelint. Every statement below is a decision the code must follow.
> Statements are short and checkable on purpose. If a decision changes, change it here in the same PR
> that changes the code, so the review sees an approved decision instead of drift.

**Product:** a web app that helps working mothers combine parenting with work.
**Stage:** hackathon MVP, built in one day by a team of 7.
**Owner of this file:** tech lead.

---

## 1. Users and problem

- P-1. The primary user is a working mother, or a mother returning to work, with children aged 0–6.
- P-2. The app also serves the co-parent: the father's (or second parent's) workplace is part of every commute calculation.
- P-3. Babysitters are a second user type. They have their own profile and can accept emergency requests.
- P-4. The app serves one city with real data in the MVP. It does not claim national coverage.

## 2. MVP scope

### In scope
- S-1. **Institution finder (hero feature):** ranks nurseries and kindergartens for a family.
- S-2. **Emergency mode (hero feature):** a parent creates an emergency childcare request; their support network and nearby available babysitters see it and can accept it.
- S-3. **Babysitters and reviews:** babysitter profiles, verification badges, parent reviews.
- S-4. **Mom-friendly jobs:** a list of job offers with filters.
- S-5. **Profile and onboarding:** addresses, children, ranking preferences.

### Out of scope (do not build in the MVP)
- S-6. No AI features: no LLM calls, no chat assistant, no AI summaries, no embeddings, no AI scoring. AI is planned for a later phase.
- S-7. No forum, comments section, or chat between users.
- S-8. No payments, bookings with prices charged, or invoices.
- S-9. No native mobile app, Capacitor, Expo, or app store build. The MVP is a responsive web app.
- S-10. No PWA service worker or push notifications until both hero features are done. Live updates in emergency mode use Supabase Realtime.
- S-11. No internationalisation framework. The UI is in Polish only. Ukrainian and English are planned for later.
- S-12. No public API for third parties. Route Handlers exist only for this app's own frontend.
- S-13. No admin panel.

## 3. Institution finder

- F-1. Candidates are nurseries (`nursery`), kindergartens (`kindergarten`), children's clubs (`club`) and `other`.
- F-2. Candidates are filtered by the child's age (`min_age_months` / `max_age_months`) and by a maximum radius from home before scoring.
- F-3. The score uses the real daily commute: home → institution → work, calculated for both parents. The parent with the smaller detour is assumed to do the drop-off.
- F-4. Commute detour is the extra travel time compared with the direct trip home → work.
- F-5. Opening hours must cover the parents' working hours plus commute. Each minute of gap lowers the score.
- F-6. Price, public vs private, and rating are also part of the score.
- F-7. The user sets the weight of each factor with sliders in the profile. Weights are stored in `profiles.ranking_weights`.
- F-8. The final score is normalised to 0–100.
- F-9. Every result returns human-readable reasons in Polish, for example "+7 min dla mamy" or "zamknięte 30 min za wcześnie dla taty". A score without reasons is not allowed.
- F-10. Ranking is computed on the server in `app/api/ranking/route.ts`. The scoring logic lives in `lib/scoring/` as pure functions with unit tests.
- F-11. Travel times come from the OpenRouteService Matrix API, in one request per ranking.
- F-12. When OpenRouteService fails or is rate-limited, the ranking falls back to straight-line distance from PostGIS converted to estimated minutes. The UI must still show results.
- F-13. Results for demo data are cached to protect the OpenRouteService rate limit.
- F-14. Institution data comes from public Polish registries: RSPO for kindergartens and Rejestr Żłobków i Klubów Dziecięcych for nurseries. Each row keeps its `source`.

## 4. Emergency mode

- E-1. Emergency mode is a support network. The app does not suggest leaving a child at a kindergarten or nursery ad hoc, because institutions do not accept that.
- E-2. A request has a child, a start time, an end time, a location and a status.
- E-3. Statuses are exactly: `open`, `accepted`, `cancelled`, `done`. No other statuses.
- E-4. A request is sent to the parent's support contacts and to babysitters who are `available_now` within the search radius.
- E-5. The first person who accepts gets the request. After acceptance, other people can no longer accept it.
- E-6. Only the parent who created the request can cancel it or mark it `done`.
- E-7. Status changes are shown live through Supabase Realtime. The parent does not need to refresh.
- E-8. Before a babysitter accepts, they see only the approximate area of the request, not the exact address. The exact address is shown after acceptance.
- E-9. The child's age is shown with the request. The child's full name is shown only after acceptance.

## 5. Babysitters and reviews

- B-1. A babysitter profile has a name, bio, hourly rate, location, availability and a verification badge.
- B-2. `is_verified` is shown as a badge. In the MVP it is set in seed data or by the team, not by an automated identity check.
- B-3. The profile shows a declaration of no criminal record and a link to the public Polish sex offenders register (Rejestr Sprawców Przestępstw na Tle Seksualnym).
- B-4. Ratings are whole numbers from 1 to 5.
- B-5. A parent can review a babysitter only after an emergency request between them has the status `done`.
- B-6. A parent can leave one review per completed request.
- B-7. The average rating and the number of reviews are shown on the list and on the profile.

## 6. Jobs

- J-1. Job offers can be filtered by: remote, part-time, flexible hours, family benefits.
- J-2. Job offers come from seed data in the MVP. No scraping of job portals.
- J-3. A job offer links out to the original offer with `url`. The app does not handle applications.
- J-4. The "Mom-Friendly Score" for jobs is planned for the AI phase and is not built in the MVP.

## 7. Profile and onboarding

- O-1. Onboarding collects: home address, mother's work address and hours, optional second parent's work address and hours, and children.
- O-2. Address types are exactly: `home`, `work_mother`, `work_father`.
- O-3. Addresses are geocoded with Nominatim during onboarding and stored as coordinates.
- O-4. For a child the app stores only a first name and birth date. No photos of children, no health data, no school records.
- O-5. Ranking weights have sensible defaults, so a user who skips the sliders still gets a ranking.

## 8. Privacy and safety

- C-1. Every table has Row Level Security enabled. A new table without RLS policies is not allowed.
- C-2. A user can read and change only their own profile, children, addresses, support contacts and emergency requests.
- C-3. Home and work addresses are never shown to other users.
- C-4. Support contacts are private to the parent who added them.
- C-5. Data the app does not need is not collected. Do not add fields such as IP logs, device fingerprints or analytics on children.
- C-6. Users can delete their account, and their children, addresses and support contacts are deleted with it.

## 9. Architecture decisions

- A-1. The app is one Next.js project (App Router, TypeScript). There is no separate backend service.
- A-2. Supabase is the only backend: Postgres with PostGIS, Auth, Realtime and Storage. Do not add Firebase, another database, or another auth provider.
- A-3. There is no ORM. Database access uses the Supabase JS client.
- A-4. All data fetching goes through typed functions in `lib/data/`. Components and pages do not call `supabase.from(...)` directly.
- A-5. Simple create/read/update/delete goes through the Supabase client with RLS. Custom Route Handlers exist only for logic that needs secrets or heavy computation, such as ranking.
- A-6. Database types are generated into `lib/database.types.ts` with `supabase gen types`. Nobody edits that file by hand.
- A-7. Database changes are made only as migration files in `supabase/migrations/`. Migrations are additive: add tables and columns, do not rename or drop them during the hackathon.
- A-8. Geo columns use `geography(Point, 4326)` with a GiST index. Distance and radius queries use PostGIS functions.
- A-9. Maps use MapLibre GL (or Leaflet) with OpenStreetMap tiles. Do not add Google Maps or Mapbox.
- A-10. Routing uses OpenRouteService. Geocoding uses Nominatim. Do not add other routing or geocoding vendors.
- A-11. UI uses Tailwind CSS and shadcn/ui. Do not add another component library or CSS framework.
- A-12. Shared UI components live in `components/`. Feature code lives in its own folder under `app/`.
- A-13. Hosting is Vercel. Every PR gets a preview deploy. A merge to `main` deploys production.
- A-14. All environments (local, preview, production) use one Supabase project during the hackathon.

## 10. Secrets

- K-1. Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` may use the `NEXT_PUBLIC_` prefix.
- K-2. `ORS_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-only. They are never imported in client components and never prefixed with `NEXT_PUBLIC_`.
- K-3. The service role key is used only where RLS must be bypassed on purpose, such as seed and import scripts. It is not used to work around a missing RLS policy.
- K-4. No secret is committed to the repository.

## 11. UI and UX

- U-1. The UI is mobile-first. Every screen is designed for about 390 px width first, then extended to desktop.
- U-2. Navigation on mobile is a bottom navigation bar.
- U-3. Touch targets are at least 44 px high. No interaction works only on hover.
- U-4. All user-facing text is in Polish.
- U-5. Empty, loading and error states exist for every list and for the ranking.
- U-6. Real seed data with gaps (missing hours, long names, no reviews) must render without breaking the layout.

## 12. Domain language

Use these names. Do not introduce synonyms in code.

| Concept | Name in code | Name in UI (Polish) | Do not use in code |
|---|---|---|---|
| Nursery, kindergarten, club | `institution` | placówka, żłobek, przedszkole, klub dziecięcy | facility, school, daycare, venue |
| Babysitter | `caregiver` | niania, opiekunka | nanny, sitter, babysitter, carer |
| Parent's trusted person | `support_contact` | zaufana osoba | friend, helper, emergency_contact |
| Urgent childcare need | `emergency_request` | zgłoszenie awaryjne | booking, job, order, ticket |
| Parent account | `profile` | profil | account, member, customer |
| Score of an institution | `ranking` / `score` | dopasowanie | rating (rating is only for reviews) |
| Parent's opinion of a caregiver | `review` | opinia | feedback, comment, testimonial |

## 13. Code language

- L-1. Code, identifiers, database names, comments and commit messages are in English.
- L-2. User-facing text is in Polish.

## 14. Roadmap (not in the MVP, listed so reviews flag early work on it)

1. PWA: manifest, icons, Serwist service worker, Web Push for emergency requests.
2. AI layer: emergency assistant, review summaries, Mom-Friendly Score for jobs, semantic search.
3. Calendar integration and closure warnings.
4. Q&A instead of a classic forum.
5. Native app with Capacitor or Expo.
6. Ukrainian and English UI.

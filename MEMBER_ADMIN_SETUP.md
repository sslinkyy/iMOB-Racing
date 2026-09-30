# iMob Racing members and admin setup

The draft adds Firebase-backed account creation, login, password reset, Google
sign-in, public profiles, image uploads, video/website links, a member directory,
and an admin dashboard. The dashboard edits the homepage feature, publishes
team updates, manages store products, changes admin access, and moderates media.
Netlify continues hosting the static website. No new hosting provider is needed.

## Required before enabling on the live site

1. Open the existing Firebase project `imob-racing-website`. In Project settings,
   copy its registered web app configuration into `CONFIG.FIREBASE_CONFIG` in
   `config.js`. The inherited values have not been verified. The web app config
   is public; do not put service-account credentials or store secrets here.
2. Enable Email/Password and optionally Google in Authentication > Sign-in method.
   Add `imobracingonline.com`, `www.imobracingonline.com`, and the review hostname
   `deploy-preview-18--imobracing.netlify.app` to Authentication > Settings >
   Authorized domains. Confirm your Google sign-in support email.
3. Enable Cloud Firestore and Cloud Storage in this project. Confirm the bucket
   in the web app configuration. Confirm any required billing in the Firebase
   console before enabling uploads.
4. Review `firestore.rules` and `storage.rules` against the project's existing
   collections and integrations. Export current rules before replacing them.
   The supplied rules intentionally deny old profile writes and deny all
   unlisted paths. They retain private access to legacy profile records and
   read-only access to legacy images, and preserve public store-product reads.
   Do not publish these rules blindly if other applications share this project.
5. Publish the supplied Firestore and Storage rules in their Firebase console
   Rules tabs. Storage uses Firestore role checks; enable the cross-service
   permission when Firebase prompts. Alternatively use Firebase CLI:
   `firebase deploy --project imob-racing-website --only firestore:rules,storage`.
   Netlify deployment does not deploy Firebase rules.
6. Create/sign in to your owner account. In Authentication > Users copy its UID.
   In Firestore create `roles/<YOUR_UID>` with boolean fields `admin: true` and
   `owner: true` using the Firebase console. Never offer a public “first admin”
   button. Owner documents cannot be changed by website clients. Any owner
   recovery/change is done through the trusted Firebase console.
7. Open `admin.html` as that owner. Other members must sign in at least once to
   appear in the private admin member index. Admins can promote/demote other
   non-owner members, but cannot change their own roles. Changes are observed
   live and enforced by Firestore/Storage rules, not only by UI visibility.
8. Test with two separate accounts: member A cannot edit B or access admin
   writes; promoted B can manage content; demoted B loses admin write access.
   Test profile edits without selecting replacement photos, multiple uploads,
   password reset, sign-out, and removal of uploaded media.
9. Check the Netlify preview's homepage updates, linked videos and contact form.
   Confirm Google sign-in and uploads on the production hostname before merging.

## Data and privacy

- `memberProfiles/<uid>` contains public name, bio and avatar URL, never email.
- `memberProfiles/<uid>/media/<id>` contains pictures or HTTPS links.
- `members/<uid>` contains private email and last login-update time. Only the
  member and admins can read it; only admins can list members.
- `roles/<uid>` contains admin/owner flags. A member cannot assign themselves.
- `siteContent/home` contains admin-managed feature media and intro text.
- `showcase/<id>` contains team updates with a published/draft flag. Only
  published updates are public; drafts are admin-only.
- `store-items/<id>` retains the existing store integration.
- Images are limited to JPG, PNG, WebP or GIF and 10 MB by Storage rules.
  New profile uploads have unique paths inside that member's UID folder.
- Member bios and captions are plain text. Links require HTTPS; YouTube embeds
  use a validated video ID. User content is never inserted as raw HTML.
- Older profile text/avatar can be imported when the member first opens their
  editor. Old photo lists and rich formatting are not automatically migrated;
  the old records remain intact. They require a reviewed one-time migration.
- Photos, links and bios are publicly visible. The login screen/profile editor
  tell members this before they save or upload.
- Homepage feature/team-update subscriptions keep the last static fallback
  if Firebase is unavailable. Latest YouTube cards are optional.

## Operational limits

Draft code is reviewable, but live auth, Storage, role enforcement and backend
rules need the setup above. UI checks alone cannot prove deployed permissions.
Member directory and media lists are paginated. Admin update/product lists show
up to 100 records; homepage shows 12 newest published updates. Older updates
remain in Firestore. Removing media deletes its uploaded file and profile entry.
Replacing avatars/showcase photos may leave old files; use a reviewed storage
cleanup if needed. No account deletion, bans, video-file upload, rich text or
private galleries are included. Videos are linked/embedded, not uploaded.

The former Snipcart secret was removed from current code, but must still be
revoked/rotated because Git history and deployed copies may retain it.

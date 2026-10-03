# LockScreened Supabase Live Schema Manifest

> Updated: 2026-10-03
>
> This file documents the live **LockScreened Development** Supabase project.
> It exists because `supabase/lockscreened-schema.sql` is an older baseline and
> must **not** be treated as an exact representation of the current live schema
> until a full consolidated schema export is committed.

## Project

- Project: LockScreened Development
- Project ref: `vndfiqblyndnantsntnq`
- Region: `us-west-2`
- Environment intent: Creator Studio development / alpha
- Event Hub is a separate project and must never be modified by LockScreened work.

## Applied migrations

These migrations are currently applied to the live project, in order:

1. `20261003004656_creator_studio_foundation_v1`
2. `20261003004717_lock_down_auto_rls_helper`
3. `20261003004801_optimize_creator_studio_rls`
4. `20261003005615_secure_collection_claim_and_publish_flow`
5. `20261003010244_gate_background_publishing_on_verified_claim`
6. `20261003015419_create_guarded_creator_storage`
7. `20261003015641_add_private_background_source_assets`
8. `20261003015828_secure_background_publish_pipeline`
9. `20261003051015_add_published_trait_render_assets`
10. `20261003051032_require_public_render_assets_for_layered_publish`
11. `20261003051217_add_creator_public_project_profile`
12. `20261003051605_add_published_mint_override_lane`
13. `20261003053421_add_protected_creator_public_slugs`
14. `20261003053833_require_published_phone_background_for_project_launch`
15. `20261003054531_protect_live_project_background_lifecycle`
16. `20261003054637_add_safe_creator_project_archive_lifecycle`
17. `20261003054816_add_server_verified_trait_validation_gate`
18. `20261003055751_add_persistent_creator_studio_action_rate_limits`
19. `20261003060430_limit_duplicate_and_open_founder_claims`
20. `20261003060440_track_creator_project_publish_time`
21. `20261003060650_lock_verified_collection_identity_fields`
22. `20261003060719_add_trusted_creator_studio_audit_trail`
23. `20261003060935_hide_internal_security_definer_functions_from_rpc`

## Security invariants

Future migrations and application changes must preserve these guarantees:

- All Creator Studio application tables have RLS enabled.
- Normal founders never receive a service-role / `sb_secret_` credential.
- Private founder source art lives only in `creator-source-private`.
- Collector-facing derived files live in `published-public`.
- Public database reads require the parent collection to be published.
- A collection must have a verified claim before official publishing.
- Automatic founder verification requires **current collection authority**.
- Verified-creator-only evidence is a manual-review signal, not automatic authority.
- Known flagship collection IDs are reserved from normal founder claiming.
- Verified collection source identity cannot be changed by the founder.
- Flagship / legacy-lock fields are not founder-controlled.
- Layered projects require a current server-recorded reconstruction validation pass.
- Changing trait layers/assets invalidates prior reconstruction validation.
- A project cannot publish without at least one published phone background.
- The last phone background cannot be unpublished while its parent project is live.
- Project unpublish/archive operations preserve creator source data.
- Pending claims are duplicate-limited and volume-limited.
- Privileged Studio actions are persistently rate-limited per authenticated founder.
- Privileged Studio API routes reject cross-site browser origins.
- Trigger-only security-definer functions are not RPC-callable.
- Security-relevant claim/project/background transitions are written to the trusted audit log.

## Storage limits

### `creator-source-private`

- private bucket
- bucket-level max file size: 8 MB
- allowed MIME: PNG, WebP, JPEG
- application trait-file cap: 2 MB
- application collection hard source-art cap: 150 MB
- preferred collection target: 50 MB

### `published-public`

- public bucket
- max file size: 8 MB
- allowed MIME: PNG, WebP, JPEG
- receives only explicitly published derivatives/copies

## Public project model

Creator Studio public projects use:

- protected vanity slug (`public_slug`)
- project profile (`public_profile`)
- server-maintained `published_at`
- published background packages/assets
- published trait-render derivatives
- optional published mint-specific overrides

The homepage shows a small recent set of published Creator Lockers. The scalable
directory is `/projects`.

## Launch blockers still intentionally open

Do **not** advertise public founder onboarding as production-ready until all of
these have been completed and tested:

1. Add the server-only `SUPABASE_SECRET_KEY` to the production Vercel project.
2. Configure Supabase Web3 Auth rate limits.
3. Enable CAPTCHA/bot protection for Web3 auth.
4. Pin/confirm production and preview Auth redirect URLs.
5. Complete the planned HttpOnly/Secure/SameSite founder-session migration.
6. Run a real wallet test matrix (at minimum Phantom + Solflare) against the
   deployed preview.
7. Run the latest feature branch through a successful Vercel build after the
   free-plan build-rate window resets.
8. Only then consider merging `feature/creator-studio-foundation` into main.

## Flagship safety

Creator Studio is additive.

Do not rewrite or normalize the existing bespoke flagship routes, curated
background libraries, compositor exceptions, case-sensitive paths, or legacy
asset naming merely to make them match the generalized Creator Studio engine.

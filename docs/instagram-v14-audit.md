# Instagram V14 handoff audit — 2026-10-20

## Verified baseline
- Repository: kimkik0808-cell/iphone-ios26
- main commit: e7c3e7992b14c1ccc4106351b6cc447153619d11
- Commit title: V8.1: Fix Instagram story and DM avatar sizing; simplify interface text
- index.html blob: 44dcb9ea754293c0c25656d7bd893d6eaf8e25f0
- Backup branch: backup/v8.1-before-instagram-20261020
- Development branch: work/instagram-dual-account-v14
- No application source changes or deployment made during this audit.

## Later files
index_v13.html was found and its Instagram script was read directly. No exact index_v12.html was found in filename search or the project folder inventory.

V13 is an incomplete working file, not a verified release:
- Account identifiers include leejaehyunow and nuyheaj.
- Public account directory has the three requested members.
- New media identifiers (jh_big_avatar, jy_avatar, yj_avatar, sw_avatar, jy_post1–5, yj_paris1–7, sw_post1–2) are referenced but absent from the embedded media dictionaries. The dictionaries still contain earlier V8.1 assets.
- Own post photo counts remain 6 and 3, rather than the requested 4 and 6.
- Public profile grid renders individual carousel images as separate grid entries, and displays a hardcoded 47-post count.
- Likes, bookmarks, follows and posts share state across the accounts.
- Private profile and contacts still use celebrity media rather than default gray silhouettes.
- Public inbox includes fans and fabricated member conversations; requests page is empty.
- Stories are prepopulated.
- Reels animate still photos instead of playing videos.
- Uploaded data-URL posts are excluded from persistence; comments are not persisted.

## Asset access blocker
The project folder inventory contains the uploaded photos/screenshots, but the supported local file transfer failed with HTTP 403. Inventory visibility and successful text reading do not establish successful access to local original image bytes. Do not guess photo identities/order or substitute unrelated imagery. Obtain working copies of the original images (a ZIP upload is suitable) before the visual merge.

## Implementation requirements
Preserve the V8.1 phone shell, wallpaper, passcode, home screen and other apps. Limit application changes to Instagram.
- Account-keyed persistent state, including interactions, comments, chats, uploads and stories.
- Public profile: exactly two seeded posts with 4 and 6 images, one cover per carousel.
- Public feed: selected posts from tbzuyeon, eric.is.youngjae and sunwoo only.
- Public DM: read-only fan requests, no fabricated replies.
- Private profile: nuyheaj, unverified, private, initially 0 posts / 376 followers / 23 following.
- Private DM: yeon, youngjjjj, sw0412, xxx only; neutral relationship for xxx.
- Private feed: four fictional everyday friends; document fictional relationships here, never present them as verified real-world relationships.
- Default gray avatars throughout the private account.
- No seeded stories; allow image selection, publication and viewing.
- Actual video playback for Reels; never pass still-image animation off as video.

## Video source proposal
Use owner-provided MP4 videos cleared for public display and host stable assets with the static project. A device-local video picker can support immediate testing without shared uploads. Keep the two account catalogs separate; retain a future media-provider interface for shared uploads. Third-party videos require a separately verified source and usage terms before inclusion. No source has yet been approved or integrated.

## Verification gate
Application implementation and browser tests remain pending. Do not merge or claim a V14 deployment until asset matching and these tests succeed:
unlock/open Instagram; account switch both ways; 4/6-photo carousels; teammate feed/profiles; public requests with no reply input; four private chats; persistence after reload with no cross-account leakage; private counts; post/Story creation; real video play/pause and vertical navigation; mobile avatar bounds, image aspect ratios and status-bar layout.

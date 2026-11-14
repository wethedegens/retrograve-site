import styles from "./FounderStudioFAQ.module.css";
const groups=[
  {
    "title": "Getting started",
    "items": [
      [
        "What do I need before I start?",
        "Use the wallet that controls your Solana collection, your original artwork, a short project description, and the links you want holders to see. Keep a separate backup of your artwork."
      ],
      [
        "My collection has not minted yet. Can I prepare it now?",
        "Choose the pre-mint option to work privately. After mint, attach the real collection and verify its current authority. A private pre-mint setup is not a public holder locker."
      ],
      [
        "Should I choose layered traits or finished artwork?",
        "Choose layered traits when you have the original separate images used to build each NFT. Choose finished artwork when you only have complete NFT images. The available customization and publishing checks differ; finished artwork does not automatically become editable layers."
      ],
      [
        "Can I mint NFTs or manage a marketplace here?",
        "Studio prepares wallpaper experiences for collections. It does not mint or transfer NFTs, set marketplace prices, or manage collection sales."
      ],
      [
        "Can every collection publish immediately?",
        "Publishing depends on the supported collection type, artwork setup, validation and current collection authority. Some rendering modes are still launch-limited. If publishing is unavailable after setup, ask for help rather than recreating the project."
      ]
    ]
  },
  {
    "title": "Wallet and collection verification",
    "items": [
      [
        "My wallet is connected. Why does Studio still ask me to sign in?",
        "Connecting gives the page your wallet address. Signing the separate login message verifies that you control it. Use the same wallet for both. Studio sign-in is an off-chain message, not a transfer or token approval."
      ],
      [
        "Which address should I enter to verify my collection?",
        "Enter the Solana collection address, not an individual NFT mint or your wallet address. Owning an NFT from a collection does not by itself give authority to publish that collection’s locker."
      ],
      [
        "Why did collection verification fail?",
        "Check the collection address and the connected wallet. The wallet must have current on-chain authority supported by Studio. If a team wallet or multisig controls the collection, do not assume your personal wallet will qualify; ask for help with the actual authority setup."
      ],
      [
        "What if collection authority changes later?",
        "Sensitive publishing actions recheck current authority. An earlier verification badge does not guarantee the same wallet can publish later. Existing saved artwork does not give another wallet publication rights."
      ],
      [
        "The wallet request was rejected or no approval window appeared. What should I do?",
        "Unlock the wallet, confirm the selected account, then retry Connect or Sign in. On a phone, open the site inside Phantom’s browser. A rejected request is not a successful sign-in. Never share a seed phrase or private key."
      ],
      [
        "Why does sign-in say the message belongs to another app?",
        "Check that you opened the intended LockScreened address. Test links and the live site can have different sign-in origins. Report the URL and error to support; do not approve a message for an unfamiliar site or change wallet security settings."
      ],
      [
        "Why can’t I see my saved project?",
        "Make sure the Studio session and connected wallet match the wallet used to create the draft, and that you are on the same site address. A preview and the live site may use different environments. Look in My LockScreened projects before creating another draft."
      ]
    ]
  },
  {
    "title": "Artwork, uploads and validation",
    "items": [
      [
        "How should I organize layered artwork?",
        "Use the original layer folders and transparent artwork from your collection. Folder names and trait values need to match the NFT metadata. Review the detected layers and their order before saving. An optional trait can be absent from an NFT; a trait that is present needs a valid matching image."
      ],
      [
        "Does choosing a folder save the artwork online?",
        "No. Choosing a folder or saving its layer map is not the same as uploading the images. Use the private upload action, wait for its saved-project check, and confirm the saved file count before closing the page."
      ],
      [
        "An upload failed halfway through. Do I need to start over?",
        "Keep the original folder and read the displayed error. Files already saved remain private. Retry the folder and confirm the final saved-project check before assuming the upload completed. Do not delete the project to troubleshoot an upload."
      ],
      [
        "The rebuilt NFT looks different from the original. What should I check?",
        "Check layer order, trait names, transparency, source variants and the layer designated as Background. Compare the rebuild with the minted image. A successful metadata check alone does not prove the images visually match."
      ],
      [
        "What does Run Trait Validation actually check?",
        "It checks a sample of real minted NFT metadata against the saved trait library. A pass confirms the sampled supported trait mappings, not every NFT or visual accuracy. Use the private reconstruction previews and test downloads to review the result."
      ],
      [
        "Why is an NFT marked unavailable?",
        "Its artwork may be missing, ambiguous or part of an explicitly reviewed exception list. Unavailable NFTs stay blocked rather than generating a misleading wallpaper. For a first launch, you can leave reviewed exceptions unavailable; this does not automatically excuse new missing artwork."
      ],
      [
        "Why did validation pass before, but publishing is blocked now?",
        "Artwork or layer-order changes can make an earlier validation out of date. Review the current saved setup, rerun validation and read the publishing message. Do not treat an old passing badge as approval for changed artwork."
      ]
    ]
  },
  {
    "title": "Appearance and holder downloads",
    "items": [
      [
        "Are page backgrounds the same as downloadable wallpaper backgrounds?",
        "No. Page appearance decorates the welcome page, owned-NFT gallery and wallpaper editor. Wallpaper background packages are choices included in a holder’s downloaded image. Set up and save them separately."
      ],
      [
        "Can each page have a different background?",
        "Yes. Page appearance can use one shared background or separate settings for the welcome page, gallery and editor. Save the appearance changes when ready. Saving appearance on an already published project can update what holders see."
      ],
      [
        "What do holders see when choosing backgrounds?",
        "In layered Studio lockers, holders can use their selected NFT’s original background plus published extra backgrounds offered by the creator. They do not get a browser for all original collection backgrounds."
      ],
      [
        "How do phone, iPad and desktop layouts work?",
        "Set and review a starting layout for each device type. Holders can adjust their own download without changing your defaults. Test the native PNG, not just the small browser preview. Larger scaling can crop artwork or soften small images."
      ],
      [
        "Can I add a logo or seasonal overlay?",
        "Use the logo and overlay controls available in the project. Check the selected device and preview the downloaded PNG. Page decoration is separate. PNG downloads are still images, even if an effect looks like animation."
      ],
      [
        "How do holders save an image on an iPhone?",
        "Open the locker inside Phantom, make the wallpaper, and choose Save PNG. On the finished-image screen, touch and hold the image to save it to Photos, or use the share option if the browser supports it. Back to editor returns to the controls."
      ]
    ]
  },
  {
    "title": "Publishing, privacy and troubleshooting",
    "items": [
      [
        "Does Preview publish my project?",
        "No. A private preview is for reviewing a draft. The private collector pilot can be limited to the founder and is not a holder invitation link. Use the regular published project URL for holders once publication is complete."
      ],
      [
        "What is the difference between publishing a background and publishing the locker?",
        "Publishing a background makes that extra background publicly accessible and available for the project. It does not publish the project itself. Publish Locker is a separate step with collection authority and readiness checks."
      ],
      [
        "Does publishing expose my original trait library?",
        "Layered Studio uses private source files to render wallpapers on the server. Holders receive bounded preview images and finished downloads, not original trait files or private source links. Published extra background images are public, so only publish artwork you intend to share."
      ],
      [
        "Why is Publish Locker missing or blocked?",
        "Check verified collection authority, project details, current validation and the required published background or artwork treatment. Even when the setup checklist is complete, the server may still block an unsupported rendering mode or launch configuration. Read the exact error and ask for help."
      ],
      [
        "Will publishing in a preview make the production website live?",
        "Not necessarily. Project publication and website deployment are separate. A protected test website can use a different backend or configuration from production. Confirm the final public URL and release environment before inviting holders."
      ],
      [
        "Can I hide a published locker or remove a background?",
        "Unpublishing a locker hides its public Studio page while retaining saved project data and private sources. Unpublishing a background removes it from offered choices; previously published files or downloaded copies can still exist. Background removal uses an archive for recovery rather than erasing original files."
      ],
      [
        "A holder sees no NFTs or loading takes too long. What should I check?",
        "Check the wallet account, collection and sign-in first. The gallery is paged, so use Next for additional NFTs. If loading times out, retry after a short wait. For support, include the project URL, device, exact error and an NFT mint address if relevant—never a login token or private key."
      ],
      [
        "What should I check before inviting holders?",
        "Review the welcome page and links, use the regular holder route, select an owned supported NFT, customize it, and save a PNG on desktop and phone. If you cannot test with another holder wallet, keep that limitation explicit and make it an early check with invited holders."
      ],
      [
        "Where can I get help?",
        "Use the Community link and describe where you got stuck. Include the project URL, what you expected, the exact message and a screenshot. Keep private source files private unless there is an agreed secure upload method. Never post API keys, wallet secrets or session tokens."
      ]
    ]
  }
];
export default function FounderStudioFAQ(){return <section id="founder-faq" className={styles.faq} aria-labelledby="founder-faq-heading"><h2 id="founder-faq-heading">Founder Studio FAQ</h2><p className={styles.intro}>Help with setup, artwork, wallet sign-in and publishing. Open a question below.</p>{groups.map(group=><section key={group.title} className={styles.group}><h3>{group.title}</h3>{group.items.map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</section>)}</section>;}

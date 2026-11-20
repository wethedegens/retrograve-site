"use client";

import { useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import StudioWalletAuth from "../../components/studio/StudioWalletAuth";
import { getFreshSession } from "../../lib/lockscreened/web3AuthClient";
import { extractSolanaWalletAddress } from "../../lib/lockscreened/authIdentity";
import { founderDraftSettings } from "../../lib/lockscreened/founderDraft";
import { localTraitHandoff } from "../../lib/lockscreened/localTraitHandoff";

export default function PrivateDraftSave({ settings, configured, sourceFiles = [] }: { settings: any; configured: boolean; sourceFiles?:File[] }) {
  const wallet = useWallet();
  const draftId = useRef<string | null>(null);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [savedId, setSavedId] = useState("");
  const [message, setMessage] = useState("");

  async function save() {
    if (busyRef.current || savedId) return;
    busyRef.current = true; setBusy(true); setMessage("");
    try {
      if (!configured) throw new Error("Confirm your artwork setup first.");
      founderDraftSettings(settings);
      const session = await getFreshSession();
      const address = wallet.publicKey?.toBase58();
      if (!session || !address || extractSolanaWalletAddress(session.user) !== address) {
        throw new Error("Connect your founder wallet and sign in below before saving.");
      }
      draftId.current ||= crypto.randomUUID();
      const response = await fetch("/api/studio/local-founder-draft", {
        method: "POST", headers: { "content-type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify({ draftId: draftId.current, settings }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save your private draft.");
      if(sourceFiles.length) {
        try {
          await localTraitHandoff(session.user.id, result.id, sourceFiles);
          setMessage("Private settings saved. Your selected folder is ready in this browser for the workspace—no need to choose it again. Upload private sources there to keep the artwork online. Nothing is published or verified.");
        } catch {
          setMessage("Private settings saved. This browser could not keep the folder for the next screen. Choose it again in the workspace to upload privately. Nothing is published or verified.");
        }
      } else setMessage("Private settings saved. Original artwork still needs a private upload. Nothing is published or verified.");
      setSavedId(result.id);
      window.dispatchEvent(new CustomEvent("lockscreened-studio-data-changed"));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save your draft."); }
    finally { busyRef.current = false; setBusy(false); }
  }

  return <div style={{ marginTop: 24 }}>
    <h3>Keep this setup in your private Studio</h3>
    <p>This creates a separate unpublished development project. For an already live collection, its address stays an unverified note until you complete the collection verification step. Source images are not uploaded here.</p>
    <StudioWalletAuth />
    <button type="button" onClick={save} disabled={busy || !configured || Boolean(savedId)}>{savedId ? "Private draft saved" : busy ? "Saving private draft…" : "Save private draft"}</button>
    {message ? <p role="status">{message}</p> : null}
    {savedId ? <p><a href={`/studio/manage/${savedId}`}>Open private project workspace →</a><br/>Continue editing in the workspace. This walkthrough does not update the saved copy.</p> : null}
  </div>;
}

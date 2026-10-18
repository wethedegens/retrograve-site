// app/lib/lockscreened/server/currentAuthority.ts
import { extractSolanaWalletAddress } from "../authIdentity";
import {
  inspectCollectionAuthority,
  walletHasAuthorityEvidence,
} from "./heliusAuthority";

export async function requireCurrentCollectionAuthority(args: {
  user: any;
  collectionAddress: string;
}) {
  const walletAddress = extractSolanaWalletAddress(args.user);

  if (!walletAddress) {
    throw new Error("No verified Solana wallet identity was found.");
  }

  const snapshot = await inspectCollectionAuthority(args.collectionAddress, {
    fresh: true,
  });

  const authority = walletHasAuthorityEvidence(walletAddress, snapshot);

  if (!authority.allowed) {
    throw new Error(
      "This wallet is no longer the current collection authority. Publishing is locked until authority is verified again."
    );
  }

  return {
    walletAddress,
    snapshot,
    evidence: authority.evidence,
  };
}

// app/lib/lockscreened/server/currentAuthority.ts
import { extractSolanaWalletAddress } from "../authIdentity";
import {
  inspectCollectionAuthority,
  walletHasAuthorityEvidence,
} from "./heliusAuthority";

export class StudioAuthorityError extends Error {
  status = 403;

  constructor(message: string) {
    super(message);
    this.name = "StudioAuthorityError";
  }
}

export function studioSecurityErrorStatus(error: unknown) {
  if (error instanceof StudioAuthorityError) return error.status;
  const message = error instanceof Error ? error.message : "";
  if (/flagship|not found|does not belong|unsafe|blocked|no valid solana|no verified solana/i.test(message)) return 403;
  return 500;
}

export async function requireCurrentCollectionAuthority(args: {
  user: any;
  collectionAddress: string;
}) {
  const walletAddress = extractSolanaWalletAddress(args.user);

  if (!walletAddress) {
    throw new StudioAuthorityError("No verified Solana wallet identity was found.");
  }

  const snapshot = await inspectCollectionAuthority(args.collectionAddress, {
    fresh: true,
  });

  const authority = walletHasAuthorityEvidence(walletAddress, snapshot);

  if (!authority.allowed) {
    throw new StudioAuthorityError(
      "This wallet is no longer the current collection authority. Sensitive Studio actions are locked until authority is verified again."
    );
  }

  return {
    walletAddress,
    snapshot,
    evidence: authority.evidence,
  };
}

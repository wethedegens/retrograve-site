"use client";

import { useEffect, useState } from "react";
import {
  beginStudioTotp,
  cancelStudioTotp,
  getStudioTotpState,
  requestStudioVerificationEmail,
  verifyStudioTotp,
  type LockScreenedSession,
  type StudioTotpEnrollment,
  type StudioTotpState,
} from "../../lib/lockscreened/web3AuthClient";
import styles from "./StudioFounderMfa.module.css";

export default function StudioFounderMfa({ session }: { session: LockScreenedSession }) {
  const [state, setState] = useState<StudioTotpState | null>(null);
  const [setup, setSetup] = useState<StudioTotpEnrollment | null>(null);
  const [factorId, setFactorId] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    getStudioTotpState(session).then(
      (next) => {
        if (!active) return;
        setState(next);
        setFactorId(next.factors[0]?.id ?? "");
      },
      () => { if (active) setMessage("Could not load two-step verification. Reload Studio to try again."); }
    );
    return () => { active = false; };
  }, [session]);

  async function sendEmail() {
    setBusy(true);
    setMessage("");
    try {
      await requestStudioVerificationEmail(session, email);
      setMessage("Open the verification link in your email, then return to this Studio tab and select Check verification status.");
    } catch {
      setMessage("Could not send the verification email. Check the address and try again later.");
    } finally {
      setBusy(false);
    }
  }

  async function checkEmail() {
    setBusy(true);
    setMessage("");
    try {
      const next = await getStudioTotpState(session);
      setState(next);
      setMessage(next.confirmedEmail ? "Email verified." : "Email confirmation is still pending.");
    } catch {
      setMessage("Sign in with your wallet again, then check your verification status.");
    } finally {
      setBusy(false);
    }
  }

  async function start() {
    setBusy(true);
    setMessage("");
    try {
      setSetup(await beginStudioTotp(session));
    } catch {
      setMessage("Could not start verification code setup. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!setup) return;
    setBusy(true);
    setMessage("");
    try {
      await cancelStudioTotp(session, setup.id);
      setSetup(null);
      setCode("");
    } catch {
      setMessage("Could not cancel setup. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    const id = setup?.id ?? factorId;
    if (!id || !/^\d{6}$/.test(code)) return;
    setBusy(true);
    setMessage("");
    try {
      await verifyStudioTotp(session, id, code);
      setSetup(null);
      setCode("");
      setMessage("Two-step verification complete.");
    } catch {
      setCode("");
      setMessage("That code could not be verified. Enter a current code and try again.");
    } finally {
      setBusy(false);
    }
  }

  const needsCode = !!setup || Boolean(state?.confirmedEmail && state.factors.length && !state.verified);
  return (
    <section className={styles.panel} aria-label="Founder two-step verification">
      <h2>Founder two-step verification</h2>
      <p>Verify your email once. For sensitive Studio actions, enter a six-digit code from Apple Passwords or your authenticator app.</p>
      {state && !state.confirmedEmail && (
        <>
          <form className={styles.form} onSubmit={(event) => { event.preventDefault(); void sendEmail(); }}>
            <label>Founder email
              <input className={styles.email} type="email" autoComplete="email" maxLength={254}
                value={email} onChange={(event) => setEmail(event.target.value)} required disabled={busy} />
            </label>
            <button type="submit" disabled={busy || !email.trim()}>Send verification email</button>
          </form>
          <button type="button" onClick={checkEmail} disabled={busy}>Check verification status</button>
        </>
      )}
      {state?.verified && <p className={styles.verified}>Verified for this session</p>}
      {state?.confirmedEmail && !state.verified && !state.factors.length && !setup &&
        <button type="button" onClick={start} disabled={busy}>Set up verification codes</button>}
      {setup && (
        <div className={styles.setup}>
          <p>Scan the QR code with your iPhone Camera to open Apple Passwords, or scan it in your authenticator app.</p>
          <p>If Apple Passwords asks to add the code without a website, you can save it anyway. Then enter the current six-digit code below.</p>
          <p>Keep the QR code and setup key private.</p>
          {/* The provider-supplied QR is a local data URL and is never sent to an image server. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setup.qr} width={180} height={180} alt="Authenticator setup QR code" />
          <details><summary>Enter a setup key instead</summary><code>{setup.secret}</code></details>
          <button type="button" onClick={cancel} disabled={busy}>Cancel setup</button>
        </div>
      )}
      {needsCode && !setup && <p>Enter the current LockScreened Studio code from Apple Passwords or your authenticator app.</p>}
      {needsCode && (
        <form className={styles.form} onSubmit={(event) => { event.preventDefault(); void verify(); }}>
          {!setup && (state?.factors.length ?? 0) > 1 &&
            <label>Authenticator
              <select value={factorId} onChange={(event) => setFactorId(event.target.value)} disabled={busy}>
                {state?.factors.map((factor, index) =>
                  <option key={factor.id} value={factor.id}>{factor.friendly_name || `Authenticator ${index + 1}`}</option>)}
              </select>
            </label>}
          <label>Six-digit verification code
            <input value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required disabled={busy} />
          </label>
          <button type="submit" disabled={busy || code.length !== 6}>Verify code</button>
        </form>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}

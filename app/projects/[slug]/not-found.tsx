import LockScreenedStateScreen from "../../components/studio/LockScreenedStateScreen";

export default function ProjectNotFound() {
  return (
    <LockScreenedStateScreen
      eyebrow="LOCKSCREENED CREATOR LOCKER"
      title="Locker not published"
      message="This Creator Studio project is unavailable, still in draft, or the address has changed."
      action={<a href="/">VIEW LOCKSCREENED</a>}
    />
  );
}

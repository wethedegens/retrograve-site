// app/my-miners/page.tsx
import { redirect } from "next/navigation";

export default function MyMinersPage() {
  // We don’t use /my-miners — keep it as a clean redirect.
  redirect("/enchanted-miners");
}

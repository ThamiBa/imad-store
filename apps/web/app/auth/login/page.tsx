import { redirect } from "next/navigation";

// Customer login is disabled — guest checkout only.
// Admin login lives at /admin (separate route).
export default function LoginPage() {
    redirect("/");
}

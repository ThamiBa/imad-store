import { redirect } from "next/navigation";

// Customer registration is disabled — guest checkout only.
export default function RegisterPage() {
    redirect("/");
}

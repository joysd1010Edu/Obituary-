import { redirect } from "next/navigation";

/**
 * Redirects obsolete OTP verification route back to register.
 */
export default function VerifyPage() {
  redirect("/register");
}

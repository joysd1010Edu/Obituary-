import type { Metadata } from "next";

import LoginContainer from "../../../Component/public/auth/login/LoginContainer";

export const metadata: Metadata = {
  title: "Log In",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Wrapper for the login page.
 *
 * @returns {JSX.Element} The login container.
 */
export default function LoginPage() {
  return <LoginContainer />;
}

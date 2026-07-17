import type { Metadata } from "next";

import RegisterContainer from "../../../Component/public/auth/register/RegisterContainer";

export const metadata: Metadata = {
  title: "Create an Account",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Wrapper for the register page.
 *
 * @returns {JSX.Element} The register container.
 */
export default function RegisterPage() {
  return <RegisterContainer />;
}

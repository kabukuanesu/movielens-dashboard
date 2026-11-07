import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movie Lens Data Analytics Dashboard | Sign Up",
  description: "This is a demonstration of extracting insights from the Movie Lens dataset using a Next.js admin dashboard template.",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}

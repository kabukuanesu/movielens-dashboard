import SignInForm from "@/components/auth/SignInForm";
import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Movie Lens Data Analytics Dashboard | Sign In",
  description: "This is a demonstration of extracting insights from the Movie Lens dataset using a Next.js admin dashboard template.",
};

export default async function SignIn({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SignInForm />;
}
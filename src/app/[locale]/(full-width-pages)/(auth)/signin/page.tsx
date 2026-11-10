import SignInForm from "@/components/auth/SignInForm";
import { setRequestLocale } from "next-intl/server";
import { Metadata } from "next";
import { Suspense } from "react"; // Add this import

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

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}

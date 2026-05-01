import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, LockKeyhole, Sparkles, UploadCloud } from "lucide-react";
import { auth } from "@/auth";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { TopNav } from "@/components/marketing/top-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in | LaunchPix",
  description: "Sign in to LaunchPix with Google and start generating polished launch visuals from raw screenshots."
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user?.email) redirect("/dashboard/projects");

  return (
    <>
      <TopNav />
      <main className="app-shell py-12 sm:py-16 lg:py-20">
        <section className="grid gap-8 lg:grid-cols-[0.98fr_0.82fr] lg:items-center">
          <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-6 text-center sm:p-8 lg:p-10 dark:border-white/[0.08] dark:bg-[#050810]">
            <p className="eyebrow">Google sign in</p>
            <h1 className="hero-title mx-auto mt-5 max-w-3xl text-balance">
              Sign in once. Get straight back to your launch visuals.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
              Use your Google account to enter LaunchPix. No password, no manual email entry, no separate signup form.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: LockKeyhole, title: "No password drag", text: "Google handles account access securely without another credential." },
                { icon: UploadCloud, title: "Your context stays put", text: "Return to the same project brief, screenshots, and generation state." },
                { icon: Sparkles, title: "Signup is automatic", text: "First-time Google users get a LaunchPix workspace on sign in." }
              ].map((item) => (
                <div key={item.title} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 dark:border-white/[0.07] dark:bg-[#080d16]">
                  <item.icon className="mx-auto size-5 text-cyan-400" />
                  <p className="mt-4 font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[22px] border border-slate-200 bg-slate-50 p-5 dark:border-white/[0.08] dark:bg-[#080d16]">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:text-left">
                <CheckCircle2 className="size-5 text-cyan-400" />
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                  New users are signed up automatically with Google. Returning users continue into the same workspace tied to their Google email.
                </p>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden rounded-[30px]">
            <CardContent className="space-y-6 p-6 text-center sm:p-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Continue with Google</p>
                <h2 className="mt-3 text-2xl font-semibold">One-click access</h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-600 dark:text-slate-400">
                  Choose your Google account and LaunchPix will take care of sign in or signup automatically.
                </p>
              </div>

              <GoogleSignInButton />

              <div className="space-y-2 text-sm leading-6 text-slate-500">
                <p>
                  Need help accessing your account?{" "}
                  <a className="font-medium text-foreground underline underline-offset-4" href="mailto:support@launchpix.app">
                    support@launchpix.app
                  </a>
                </p>
                <p>
                  By continuing, you agree to our <Link href="/terms" className="underline underline-offset-4">Terms</Link> and{" "}
                  <Link href="/privacy" className="underline underline-offset-4">Privacy Policy</Link>.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}

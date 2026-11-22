"use client";

import { useState } from "react";
import {
  Button,
  Description,
  FieldError,
  FieldGroup,
  Fieldset,
  Form,
  Input,
  InputGroup,
  Label,
  TextField,
  toast,
} from "@heroui/react";
import {
  Eye,
  EyeClosed,
  GraduationCap,
  Users,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { primeJwtToken } from "@/lib/api/client";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [isPending, setIsPending] = useState(false);

  const router = useRouter();

  // Google OAuth (optional). Better Auth sends the user to Google and
  // then back to `callbackURL`. The credentials live only on the server
  // in .env.local, so nothing secret is exposed in the browser.
  // const handleGoogleSignIn = async () => {
  //   const callbackURL =
  //     new URLSearchParams(window.location.search).get("callbackUrl") || "/";

  //   setIsPending(true);
  //   const { error } = await authClient.signIn.social({
  //     provider: "google",
  //     callbackURL,
  //   });

  //   if (error) {
  //     toast.warning(
  //       error.message ||
  //         "Could not sign in with Google. Continue with google is comming soon",
  //     );
  //     setIsPending(false);
  //   }
  // };

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string)?.trim() ?? "";
    const password = (formData.get("password") as string) ?? "";

    if (!email || !password) {
      toast.warning("Please fill in your email and password");
      return;
    }

    setIsPending(true);

    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    setIsPending(false);

    if (error) {
      toast.warning(`Sign in failed! ${error.message ?? ""}`);
      return;
    }

    await primeJwtToken();

    toast.success(`Welcome back, ${data.user.name}!`);

    const callbackUrl = new URLSearchParams(window.location.search).get(
      "callbackUrl",
    );
    const isTuitionApplyReturn =
      callbackUrl !== null &&
      /^\/tuitions\/[^/?#\\]+\?apply=1$/.test(callbackUrl) &&
      !callbackUrl.includes("%") &&
      !callbackUrl.startsWith("//");

    if (isTuitionApplyReturn && data.user.role === "student") {
      router.replace(callbackUrl);
      router.refresh();
      return;
    }

    if (data.user.role === "tutor") {
      router.push("/dashboard/tutor");
    } else if ((data.user.role as string) === "admin") {
      router.push("/dashboard/admin");
    } else {
      router.push("/dashboard/student");
    }

    router.refresh();
  };

  const inputClass =
    "h-10 w-full rounded-lg border border-emerald-300 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none transition-all placeholder:text-gray-500 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  const passwordGroupClass =
    "h-10 rounded-lg border border-emerald-300 bg-white shadow-sm transition-all focus-within:border-emerald-600 focus-within:ring-2 focus:ring-emerald-100";

  return (
    <main className="min-h-screen bg-[#F4F8F5] px-4 py-6 sm:px-6 lg:py-8">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl bg-white shadow-xl shadow-emerald-950/5 lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-[#123C3A] p-9 text-white lg:block xl:p-11">
          <div className="absolute -right-24 -top-24 size-80 rounded-full border-[50px] border-white/5" />
          <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-emerald-400/10 blur-2xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-400 text-[#123C3A]">
                <GraduationCap size={27} />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Mentor<span className="text-emerald-400">Lagbe</span>
              </span>
            </div>

            <div className="mt-10">
              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-medium text-emerald-300">
                Welcome Back!
              </span>

              <h1 className="mt-6 max-w-md text-4xl leading-tight font-bold xl:text-5xl">
                Pick Up Where
                <br />
                You Left Off.
                <br />
                <span className="text-emerald-400">Keep Growing.</span>
              </h1>

              <p className="mt-4 max-w-md text-sm leading-7 text-gray-300">
                Sign in to manage your tuitions, track applications, and
                continue your learning or teaching journey.
              </p>
            </div>

            <div className="mt-8 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                  <Users size={20} />
                </div>
                <div>
                  <p className="font-semibold">A community that supports you</p>
                  <p className="text-sm text-gray-300">
                    Learn and grow together
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="font-semibold">Trusted learning platform</p>
                  <p className="text-sm text-gray-300">
                    Find the right guidance for your future
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-7 sm:px-10 sm:py-7 lg:px-11 xl:px-14">
          <div className="mx-auto max-w-md">
            <div className="mb-5">
              <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 lg:hidden">
                <GraduationCap size={25} />
              </div>

              <p className="text-xs font-bold tracking-widest text-emerald-700">
                SIGN IN TO YOUR ACCOUNT
              </p>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173D32] sm:text-3xl">
                Welcome back
              </h2>
              <p className="mt-1.5 text-sm text-gray-600">
                Enter your email and password to continue.
              </p>
            </div>

            <Form className="w-full" onSubmit={onSubmit}>
              <Fieldset className="w-full">
                <Fieldset.Legend className="sr-only">
                  Sign in to your account
                </Fieldset.Legend>

                <FieldGroup className="gap-3">
                  <TextField isRequired name="email" type="email">
                    <Label className="text-sm font-semibold text-gray-800">
                      Email Address
                    </Label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={inputClass}
                    />
                    <FieldError />
                  </TextField>

                  <TextField isRequired name="password">
                    <Label className="text-sm font-semibold text-gray-800">
                      Password
                    </Label>
                    <InputGroup className={passwordGroupClass}>
                      <InputGroup.Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="w-full px-3 text-sm text-gray-800 placeholder:text-gray-500"
                      />
                      <InputGroup.Suffix className="pr-2">
                        <Button
                          isIconOnly
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeClosed size={17} className="text-gray-600" />
                          ) : (
                            <Eye size={17} className="text-gray-600" />
                          )}
                        </Button>
                      </InputGroup.Suffix>
                    </InputGroup>
                    <Description className="text-xs text-gray-600">
                      Use the password you created when signing up.
                    </Description>
                    <FieldError />
                  </TextField>
                </FieldGroup>

                <Fieldset.Actions className="w-full">
                  <Button
                    type="submit"
                    isDisabled={isPending}
                    className="h-12 w-full rounded-lg bg-emerald-600 text-sm font-semibold text-white shadow-md shadow-emerald-900/10 transition-all hover:bg-emerald-700"
                  >
                    {isPending ? "Signing in..." : "Sign In"}
                  </Button>
                </Fieldset.Actions>
              </Fieldset>
            </Form>

            <button
              type="button"
              // onClick={handleGoogleSignIn}
              disabled={isPending}
              className="mt-3 flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.64v3.02h3.88c2.27-2.09 3.54-5.17 3.54-8.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11A12 12 0 0 0 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.62H1.28a12 12 0 0 0 0 10.76l3.99-3.11z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.28 6.62l3.99 3.11C6.22 6.87 8.87 4.75 12 4.75z"
                />
              </svg>
              Continue with Google (Coming Soon)
            </button>

            <p className="mt-4 text-center text-sm md:text-lg text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                onClick={(event) => {
                  const callbackUrl = new URLSearchParams(
                    window.location.search,
                  ).get("callbackUrl");
                  if (
                    callbackUrl &&
                    /^\/tuitions\/[^/?#\\]+\?apply=1$/.test(callbackUrl) &&
                    !callbackUrl.includes("%")
                  ) {
                    event.preventDefault();
                    router.push(
                      `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`,
                    );
                  }
                }}
                className="font-semibold text-emerald-700 text-sm md:text-lg transition-colors hover:text-emerald-900 hover:underline hover:underline-offset-2"
              >
                Sign up
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SignInPage;

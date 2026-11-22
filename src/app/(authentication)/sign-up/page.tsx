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
  BookOpen,
  ShieldCheck,
  Users,
  ImagePlus,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { primeJwtToken } from "@/lib/api/client";
import { useRouter } from "next/navigation";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "tutor">(
    "student",
  );

  const router = useRouter();

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const image = formData.get("image") as File;
    console.log(image);

    if (!image || image.size === 0) {
      toast.warning("Please select a profile image.");
      return;
    }

    const imageData = new FormData();
    imageData.append("image", image);

    const imageRes = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      {
        method: "POST",
        body: imageData,
      },
    );

    console.log(imageRes);

    const imageResult = await imageRes.json();
    console.log(imageResult);

    if (!imageRes.ok || !imageResult.success) {
      toast.warning("Image upload failed!");
      return;
    }
    const userData = Object.fromEntries(formData.entries()) as {
      name: string;
      image: string;
      email: string;
      password: string;
      confirmPassword: string;
      role: string;
    };
    userData.image = imageResult.data.url;
    console.log("user data from the form", userData);

    if (
      !userData.name ||
      !userData.email ||
      !userData.password ||
      !userData.confirmPassword
    ) {
      toast.warning("Please fill up all the information");
      return;
    }

    if (userData.password.length < 8) {
      toast.warning("Password must be 8 character");
      return;
    }

    if (userData.password !== userData.confirmPassword) {
      toast.warning("The password are not match");
      return;
    }

    const { data, error } = await authClient.signUp.email({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      image: userData.image,
      callbackURL: "/",
      role: selectedRole, // "student" or "tutor" — saved in the DB
    });

    if (data) {
      await primeJwtToken();

      toast.success("Sign up successful!");
      const callbackUrl = new URLSearchParams(window.location.search).get(
        "callbackUrl",
      );
      const isTuitionApplyReturn =
        callbackUrl !== null &&
        /^\/tuitions\/[^/?#\\]+\?apply=1$/.test(callbackUrl) &&
        !callbackUrl.includes("%") &&
        !callbackUrl.startsWith("//");

      router.push(
        isTuitionApplyReturn && selectedRole === "student" ? callbackUrl : "/",
      );
    }

    if (error) {
      toast.warning(`Sign up failed! ${error.message ?? ""}`);
    }
    form.reset();
    router.refresh();
    // toast.success("Form submitted successfully!");
  };

  const inputClass =
    "h-10 w-full rounded-lg border border-emerald-300 bg-white px-3 text-sm text-gray-800 shadow-sm outline-none transition-all placeholder:text-gray-500 hover:border-emerald-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

  const passwordGroupClass =
    "h-10 rounded-lg border border-emerald-300 bg-white shadow-sm transition-all focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-100";

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
                Your Learning Journey Starts Here
              </span>

              <h1 className="mt-6 max-w-md text-4xl leading-tight font-bold xl:text-5xl">
                Learn Better.
                <br />
                Grow Faster.
                <br />
                <span className="text-emerald-400">Achieve More.</span>
              </h1>

              <p className="mt-4 max-w-md text-sm leading-7 text-gray-300">
                Connect with experienced tutors, discover the right tuition, and
                take the next step toward your academic goals.
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
                GET STARTED FOR FREE
              </p>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173D32] sm:text-3xl">
                Create your account
              </h2>
              <p className="mt-1.5 text-sm text-gray-600">
                Join MentorLagbe and find the right path to success.
              </p>
            </div>

            <Form className="w-full" onSubmit={onSubmit}>
              <Fieldset className="w-full">
                <Fieldset.Legend className="sr-only">
                  Create your account
                </Fieldset.Legend>

                <FieldGroup className="gap-3">
                  <div>
                    <Label className="mb-2 block text-sm font-semibold text-gray-800">
                      Join as
                    </Label>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedRole("student")}
                        className={`flex items-center gap-3 rounded-lg border p-2.5 text-left transition-all ${
                          selectedRole === "student"
                            ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600"
                            : "border-emerald-200 bg-white hover:border-emerald-400"
                        }`}
                      >
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                            selectedRole === "student"
                              ? "bg-emerald-600 text-white"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            Student
                          </p>
                          <p className="text-xs text-gray-600">Find a tutor</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRole("tutor")}
                        className={`flex items-center gap-3 rounded-lg border p-2.5 text-left transition-all ${
                          selectedRole === "tutor"
                            ? "border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600"
                            : "border-emerald-200 bg-white hover:border-emerald-400"
                        }`}
                      >
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                            selectedRole === "tutor"
                              ? "bg-emerald-600 text-white"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          <GraduationCap size={19} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            Tutor
                          </p>
                          <p className="text-xs text-gray-600">
                            Teach students
                          </p>
                        </div>
                      </button>
                    </div>

                    <input type="hidden" name="role" value={selectedRole} />
                  </div>

                  <TextField
                    isRequired
                    name="name"
                    validate={(value) =>
                      value.trim().length < 3
                        ? "Name must be at least 3 characters"
                        : null
                    }
                  >
                    <Label className="text-sm font-semibold text-gray-800">
                      Full Name
                    </Label>
                    <Input
                      name="name"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className={inputClass}
                    />
                    <FieldError />
                  </TextField>

                  <TextField name="image" type="file">
                    <Label className="text-sm font-semibold text-gray-800">
                      Profile Image
                    </Label>
                    <label className="group flex min-h-[66px] cursor-pointer items-center gap-3 rounded-lg border border-dashed border-emerald-400 bg-emerald-50/50 px-4 py-3 transition-all hover:border-emerald-600 hover:bg-emerald-50">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm transition-colors group-hover:bg-emerald-100">
                        <ImagePlus size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          Choose profile picture
                        </p>
                        <p className="mt-0.5 text-xs text-gray-600">
                          JPG, PNG or WEBP
                        </p>
                      </div>
                      <span className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white">
                        Browse
                      </span>
                      <input
                        type="file"
                        name="image"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                      />
                    </label>
                  </TextField>

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

                  <TextField
                    isRequired
                    name="password"
                    minLength={8}
                    validate={(value) => {
                      if (value.length < 8) {
                        return "Password must be at least 8 characters";
                      }
                      if (!/[A-Z]/.test(value)) {
                        return "Include at least one uppercase letter";
                      }
                      if (!/[0-9]/.test(value)) {
                        return "Include at least one number";
                      }
                      return null;
                    }}
                  >
                    <Label className="text-sm font-semibold text-gray-800">
                      Password
                    </Label>
                    <InputGroup className={passwordGroupClass}>
                      <InputGroup.Input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
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
                      At least 8 characters, 1 uppercase letter and 1 number.
                    </Description>
                    <FieldError />
                  </TextField>

                  <TextField isRequired name="confirmPassword" minLength={8}>
                    <Label className="text-sm font-semibold text-gray-800">
                      Confirm Password
                    </Label>
                    <InputGroup className={passwordGroupClass}>
                      <InputGroup.Input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        className="w-full px-3 text-sm text-gray-800 placeholder:text-gray-500"
                      />
                      <InputGroup.Suffix className="pr-2">
                        <Button
                          isIconOnly
                          type="button"
                          size="sm"
                          variant="ghost"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeClosed size={17} className="text-gray-600" />
                          ) : (
                            <Eye size={17} className="text-gray-600" />
                          )}
                        </Button>
                      </InputGroup.Suffix>
                    </InputGroup>
                    <FieldError />
                  </TextField>

                  <input type="hidden" name="plan" value="free" />
                </FieldGroup>

                <Fieldset.Actions className=" w-full">
                  <Button
                    type="submit"
                    className="h-12 w-full rounded-lg bg-emerald-600  text-sm font-semibold text-white shadow-md shadow-emerald-900/10 transition-all hover:bg-emerald-700"
                  >
                    Create Account / Sign Up
                  </Button>
                </Fieldset.Actions>
              </Fieldset>
            </Form>

            <p className="mt-4 text-center text-sm md:text-lg text-gray-600">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="font-semibold text-emerald-700 text-sm md:text-lg transition-colors hover:text-emerald-900 hover:underline hover:underline-offset-2"
              >
                Sign in
              </Link>
            </p>

            <p className="mt-3 text-center text-xs leading-5 text-gray-500">
              By creating an account, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SignUpPage;

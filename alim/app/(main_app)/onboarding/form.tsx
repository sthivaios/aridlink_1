"use client";

import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { PasswordRequirement } from "@/components/password-requirement";
import { useState } from "react";
import { userSignup } from "@/app/(main_app)/onboarding/signup-action";
import { toast } from "sonner";
import { SubmitEvent } from "react";

export function SignupForm(props: {
  submitCallbackFunctionAction: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordWentAbove128, setPasswordWentAbove128] =
    useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);
  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);

  const requirements = {
    validEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    minLength: password.length >= 12,
    maxLength: password.length <= 128,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    confirmed: password == confirmPassword,
    fullNameNotEmpty: fullName.length > 0,
  };
  const allRequirementsMet = Object.values(requirements).every(Boolean);

  function clearFields() {
    setEmail("");
    setPassword("");
    setFullName("");
    setConfirmPassword("");
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const { error } = await userSignup({
      email,
      password,
      fullName,
    });

    if (!error) {
      clearFields();
      toast.success("Account creation successful.");
      props.submitCallbackFunctionAction();
    } else {
      toast.error(error.message);
    }
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="fullname"
            className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
          >
            Full Name
          </label>
        </div>
        <Input
          id="fullname"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          className="border-Input h-10 w-full border bg-card px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground/60 focus:border-ring"
        />
      </div>
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="flex flex-row items-center justify-between text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
        >
          Operator ID / email
          <span
            className={`text-red-600 transition-opacity duration-150 ease-in-out ${
              requirements.validEmail || email.length === 0
                ? "opacity-0"
                : "opacity-100"
            }`}
          >
            invalid email address
          </span>
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            console.log(requirements);
            console.log(
              `text-red-600 opacity-${requirements.validEmail || email.length === 0 ? "0" : "1"} transition-opacity duration-300 ease-in-out`
            );
          }}
          placeholder="john.doe@acme.com"
          className="border-Input h-10 w-full border bg-card px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground/60 focus:border-ring"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
          >
            Password
          </label>
        </div>
        <div className="relative flex h-max w-full flex-row items-center p-0">
          <Input
            id="password"
            type={passwordHidden ? "password" : "text"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value.length > 128) {
                setPasswordWentAbove128(true);
              }
            }}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            placeholder="••••••••••••"
            className="border-Input h-10 w-full border bg-card pr-22 pl-3 text-sm transition-colors outline-none placeholder:text-muted-foreground/60 focus:border-ring"
          />
          <Button
            className="absolute right-1 w-20"
            onClick={() => {
              setPasswordHidden(!passwordHidden);
            }}
            onMouseDown={(e) => e.preventDefault()}
            type="button"
          >
            {passwordHidden ? "Show" : "Hide"}
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="confirm-password"
            className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
          >
            Confirm Password
          </label>
        </div>
        <Input
          id="confirm-password"
          type={passwordHidden ? "password" : "text"}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
          }}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          placeholder="••••••••••••"
          className="border-Input h-10 w-full border bg-card px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground/60 focus:border-ring"
        />
      </div>

      <AnimatePresence>
        {passwordFocused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-1 overflow-hidden"
          >
            <PasswordRequirement
              message="Password must be at least 12 characters"
              fulfilled={requirements.minLength}
            />
            <PasswordRequirement
              message="Password must contain an uppercase letter"
              fulfilled={requirements.uppercase}
            />
            <PasswordRequirement
              message="Password must contain a number"
              fulfilled={requirements.number}
            />
            <PasswordRequirement
              message="Password must contain a special character"
              fulfilled={requirements.special}
            />
            <PasswordRequirement
              message="Passwords must match"
              fulfilled={
                requirements.confirmed &&
                !(password.length === 0 || confirmPassword.length === 0)
              }
            />

            <AnimatePresence>
              {passwordWentAbove128 ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-1 overflow-hidden"
                >
                  <PasswordRequirement
                    message="Password must be at most 128 characters"
                    fulfilled={requirements.maxLength}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        className="flex h-10 w-full items-center justify-center gap-2 bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        disabled={!allRequirementsMet}
        onMouseDown={(e) => e.preventDefault()}
      >
        Create account
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </Button>
    </form>
  );
}

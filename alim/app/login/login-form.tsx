import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

function LoginForm(props: {
  setAuthenticatedCallback: (arg0: boolean) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function clearFields() {
    setEmail("");
    setPassword("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { error } = await authClient.signIn.email({
      email: email,
      password: password,
    });

    if (!error) {
      clearFields();
      props.setAuthenticatedCallback(true);
      toast.success("Authentication successful!");
    } else {
      toast.error(error.message);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
        >
          Operator ID / email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="field-admin@alim.local"
          className="border-Input h-10 w-full border bg-card px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground/60 focus:border-ring"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase"
          >
            Password
          </label>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••••"
          className="border-Input h-10 w-full border bg-card px-3 text-sm transition-colors outline-none placeholder:text-muted-foreground/60 focus:border-ring"
        />
      </div>

      <Button
        type="submit"
        className="flex h-10 w-full items-center justify-center gap-2 bg-primary font-mono text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Authenticate
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </Button>
    </form>
  );
}

export default LoginForm;

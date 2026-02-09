import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import client from "@/api/client";

const loginSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8)
    .refine((password) => /[A-Z]/.test(password), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((password) => /[a-z]/.test(password), {
      message: "Password must contain at least one lowercase letter",
    })
    .refine((password) => /[0-9]/.test(password), {
      message: "Password must contain at least one number",
    })
    .refine((password) => /[!@#$%^&*_()`.<>;:'"`{}]/.test(password), {
      message:
        "Password must contain at least one special character (!@#$%^&*)",
    }),
});

export function Login() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    const { data: loginData, error } = await client.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(`Login failed: ${error.message}`);
      return;
    }
    toast.success("You submitted the following values:", {
      description: (
        <pre>
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Card className="p-10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold mb-4">Login</CardTitle>
        <CardDescription>Login to your account and get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          id="form-rhf-login"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-2">
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="you@example.com"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-2">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="form-rhf-login" className="w-full">
          Login
        </Button>
      </CardFooter>
    </Card>
  );
}

export default Login;

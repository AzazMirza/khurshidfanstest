"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z
  .object({
    name: z.string(),
    identifier: z
      .string()
      .refine(
        (value) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
          /^\+?[1-9]\d{1,14}$/.test(value),
        { message: "Enter a valid email or phone number" }
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[a-zA-Z]/, "Password must include at least one letter.")
      .regex(/[0-9]/, "Password must include at least one number."),
    confirmpassword: z.string(),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords do not match",
    path: ["confirmpassword"],
  });

const SignUp02Page = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      name: "",
      identifier: "",
      password: "",
      confirmpassword: "",
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          identifier: data.identifier,
          password: data.password,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Signup failed");

      alert("Signup successful!");
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  };

  // --------------------
  // Google Sign-Up Logic
  // --------------------
  useEffect(() => {
    const loadGoogle = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        /* global google */
        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: handleGoogleResponse,
        });

        google.accounts.id.renderButton(
          document.getElementById("googleSignUpBtn"),
          {
            theme: "filled_black",
            size: "large",
            width: "100%",
            text: "continue_with",
          }
        );
      };
      document.body.appendChild(script);
    };
    loadGoogle();
  }, []);

  const handleGoogleResponse = async (response: any) => {
    try {
      const res = await fetch("/api/google-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) throw new Error("Google signup failed");
      const data = await res.json();
      alert("Google sign-up successful!");
      router.push("/dashboard"); // or your desired page
    } catch (err) {
      console.error(err);
      alert("Google signup failed");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0">
        <img
          src="/images/BLDC-COVER.jpg"
          alt="Background"
          className="w-full h-full object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center px-8 py-10 rounded-2xl shadow-lg backdrop-blur-lg bg-[var(--nav-color)]/20 border border-white/70">
        <img
          src="/images/khurshid fans logo.png"
          alt="khurshid fans logo"
          className="h-12"
        />
        <p className="mt-4 text-xl font-semibold tracking-tight text-white">
          Sign up to Khurshid Fans
        </p>

        {/* ----------------------- */}
        {/* Google Sign-Up Button */}
        {/* ----------------------- */}
        <div
          id="googleSignUpBtn"
          className="mt-8 w-full gap-3 bg-white/20 hover:bg-white/30 text-white border border-white/40 cursor-pointer rounded-md"
        />

        <div className="my-7 w-full flex items-center justify-center overflow-hidden text-white">
          <Separator className="bg-white/40" />
          <span className="text-sm px-2">OR</span>
          <Separator className="bg-white/40" />
        </div>

        <Form {...form}>
          <form
            className="w-full space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Name</FormLabel>
                  <FormControl>
                    <Input
                      type="string"
                      placeholder="Enter your name"
                      className="w-full bg-white/30 border border-white/40 text-white placeholder-white/70"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            {/* Email/Phone Field */}
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => {
                const isPhone = /^\+?[0-9]*$/.test(field.value);
                return (
                  <FormItem>
                    <FormLabel className="text-white">Email/Phone</FormLabel>
                    <FormControl>
                      <Input
                        type={isPhone ? "tel" : "email"}
                        inputMode={isPhone ? "tel" : "email"}
                        placeholder="Enter your email or phone number"
                        className="w-full bg-white/30 border border-white/40 text-white placeholder-white/70"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                );
              }}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      className="w-full bg-white/30 border border-white/40 text-white placeholder-white/70"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmpassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      className="w-full bg-white/30 border border-white/40 text-white placeholder-white/70"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="mt-4 w-full bg-[var(--gold-btn-color)] hover:bg-[var(--gold-btn-hover)] text-black cursor-pointer"
            >
              Continue
            </Button>
          </form>
        </Form>

        <div className="mt-5 space-y-5">
          <p className="text-sm text-center text-white/80">
            Already have an account?
            <Link
              href="/login"
              className="ml-1 underline text-white/80 hover:text-[var(--gold-btn-color)]"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp02Page;





















// "use client";

// import { useEffect } from "react";
// import Script from "next/script";
// import { Button } from "@/components/ui/button";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { zodResolver } from "@hookform/resolvers/zod";
// import Link from "next/link";
// import { useForm } from "react-hook-form";
// import { z } from "zod";

// // ✅ Form validation schema
// const formSchema = z
//   .object({
//     name: z.string(),
//     identifier: z
//       .string()
//       .refine(
//         (value) =>
//           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
//           /^\+?[1-9]\d{1,14}$/.test(value),
//         { message: "Enter a valid email or phone number" }
//       ),
//     password: z
//       .string()
//       .min(8, "Password must be at least 8 characters long")
//       .regex(/[a-zA-Z]/, "Password must include at least one letter.")
//       .regex(/[0-9]/, "Password must include at least one number."),
//     confirmpassword: z.string(),
//   })
//   .refine((data) => data.password === data.confirmpassword, {
//     message: "Passwords do not match",
//     path: ["confirmpassword"],
//   });

// const SignUp02Page = () => {
//   const form = useForm<z.infer<typeof formSchema>>({
//     defaultValues: {
//       name: "",
//       identifier: "",
//       password: "",
//       confirmpassword: "",
//     },
//     resolver: zodResolver(formSchema),
//   });

//   // ✅ Manual signup (email/phone + password)
//   const onSubmit = async (data: z.infer<typeof formSchema>) => {
//     try {
//       const response = await fetch("/api/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           name: data.name,
//           identifier: data.identifier,
//           password: data.password,
//         }),
//       });

//       const result = await response.json();
//       if (!response.ok) throw new Error(result.error || "Signup failed");

//       alert("Signup successful!");
//     } catch (error: any) {
//       console.error(error);
//       alert(error.message);
//     }
//   };

//   // ✅ Google Sign-in setup
//   useEffect(() => {
//     // Called when Google returns the credential
//     (window as any).handleCredentialResponse = async (response: any) => {
//       try {
//         const res = await fetch("/api/signup", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ credential: response.credential }),
//         });

//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || "Google signup failed");

//         alert("Signed up successfully with Google!");
//       } catch (error: any) {
//         console.error("Google signup error:", error);
//         alert(error.message);
//       }
//     };
//   }, []);

//   return (
//     <div className="relative min-h-screen flex items-center justify-center">
//       {/* ✅ Load Google Identity Services */}
//       <Script
//         src="https://accounts.google.com/gsi/client"
//         strategy="afterInteractive"
//       />

//       <div className="absolute inset-0">
//         <img
//           src="/images/BLDC-COVER.jpg"
//           alt="Background"
//           className="w-full h-full object-cover blur-sm"
//         />
//         <div className="absolute inset-0 bg-black/60" />
//       </div>

//       <div className="relative z-10 w-full max-w-md flex flex-col items-center px-8 py-10 rounded-2xl shadow-lg backdrop-blur-lg bg-[var(--nav-color)]/20 border border-white/70">
//         <img
//           src="/images/khurshid fans logo.png"
//           alt="khurshid fans logo"
//           className="h-12"
//         />
//         <p className="mt-4 text-xl font-semibold tracking-tight text-white">
//           Sign up to Khurshid Fans
//         </p>

//         {/* ✅ Google Sign-In Button */}
//         <div
//           id="g_id_onload"
//           data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
//           data-callback="handleCredentialResponse"
//           data-auto_prompt="false"
//         ></div>

//         <div
//           className="g_id_signin mt-6"
//           data-type="standard"
//           data-size="large"
//           data-theme="outline"
//           data-text="signin_with"
//           data-shape="rectangular"
//           data-logo_alignment="left"
//         ></div>

//         {/* Separator */}
//         <div className="my-7 w-full flex items-center justify-center overflow-hidden text-white">
//           <Separator className="bg-white/40" />
//           <span className="text-sm px-2">OR</span>
//           <Separator className="bg-white/40" />
//         </div>

//         {/* ✅ Normal Signup Form */}
//         <Form {...form}>
//           <form
//             className="w-full space-y-4"
//             onSubmit={form.handleSubmit(onSubmit)}
//           >
//             {/* Name */}
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-white">Name</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="text"
//                       placeholder="Enter your name"
//                       className="w-full bg-white/30 border border-white/40 text-white placeholder-white/70"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage className="text-red-300" />
//                 </FormItem>
//               )}
//             />

//             {/* Email/Phone */}
//             <FormField
//               control={form.control}
//               name="identifier"
//               render={({ field }) => {
//                 const isPhone = /^\+?[0-9]*$/.test(field.value);
//                 return (
//                   <FormItem>
//                     <FormLabel className="text-white">Email/Phone</FormLabel>
//                     <FormControl>
//                       <Input
//                         type={isPhone ? "tel" : "email"}
//                         inputMode={isPhone ? "tel" : "email"}
//                         placeholder="Enter your email or phone number"
//                         className="w-full bg-white/30 border border-white/40 text-white placeholder-white/70"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage className="text-red-300" />
//                   </FormItem>
//                 );
//               }}
//             />

//             {/* Password */}
//             <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-white">Password</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="password"
//                       placeholder="Enter your password"
//                       className="w-full bg-white/30 border border-white/40 text-white placeholder-white/70"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage className="text-red-300" />
//                 </FormItem>
//               )}
//             />

//             {/* Confirm Password */}
//             <FormField
//               control={form.control}
//               name="confirmpassword"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-white">Confirm Password</FormLabel>
//                   <FormControl>
//                     <Input
//                       type="password"
//                       placeholder="Confirm Password"
//                       className="w-full bg-white/30 border border-white/40 text-white placeholder-white/70"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage className="text-red-300" />
//                 </FormItem>
//               )}
//             />

//             <Button
//               type="submit"
//               className="mt-4 w-full bg-[var(--gold-btn-color)] hover:bg-[var(--gold-btn-hover)] text-black cursor-pointer"
//             >
//               Continue
//             </Button>
//           </form>
//         </Form>

//         {/* Footer */}
//         <div className="mt-5 space-y-5">
//           <p className="text-sm text-center text-white/80">
//             Already have an account?
//             <Link
//               href="/login"
//               className="ml-1 underline text-white/80 hover:text-[var(--gold-btn-color)]"
//             >
//               Log in
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SignUp02Page;

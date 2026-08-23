"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import useAuth from "../../../../hooks/useAuth";
import { useAxios } from "../../../../context/AxiosProvider";
import { toast } from "sonner";

const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, "First name must be at least 2 characters."),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Za-z]/, "Password must include at least one letter.")
      .regex(/[0-9]/, "Password must include at least one number."),
    confirmPassword: z.string().min(8, "Confirm your password."),
    profilePicture: z.any().optional(),
    logo: z.any().optional(),
    address: z.object({
      street: z.string().trim().min(1, "Street is required."),
      city: z.string().trim().min(1, "City is required."),
      state: z.string().trim().min(1, "State is required."),
      postalCode: z
        .string()
        .trim()
        .min(1, "Postal code is required."),
      country: z.string().trim().min(1, "Country is required."),
    }),
    terms: z.boolean().refine(Boolean, "You must agree before creating an account."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Renders the register form with client-side validation.
 *
 * @returns {JSX.Element} The register form.
 */
export default function RegisterForm() {
  const router = useRouter();
  const api = useAxios();
  const { setSession } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      profilePicture: undefined,
      logo: undefined,
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      terms: true,
    },
  });

  const [profilePicturePreview, setProfilePicturePreview] = useState<string>();
  const [logoPreview, setLogoPreview] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(
    () => () => {
      if (profilePicturePreview) {
        URL.revokeObjectURL(profilePicturePreview);
      }

      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    },
    [logoPreview, profilePicturePreview],
  );

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName.trim());
      formData.append("lastName", data.lastName.trim());
      formData.append("email", data.email.trim().toLowerCase());
      formData.append("password", data.password);
      formData.append("address", JSON.stringify(data.address));

      if (data.profilePicture && data.profilePicture.length > 0) {
        formData.append("profilePhoto", data.profilePicture[0]);
      }

      const response = await api.post("/auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { user, accessToken, refreshToken } = response.data;

      if (user && accessToken && refreshToken) {
        setSession(
          {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            userImage: user.profilePhotoUrl || "/Source/person.jpg",
            role: user.role,
            tokenApplied: user.tokenApplied,
            tokenApproveStatus: user.tokenApproveStatus,
            token: user.token,
            funeralHome: user.funeralHome,
          },
          accessToken,
          refreshToken,
        );
        toast.success("Account created successfully!");
        router.replace("/");
      } else {
        toast.success("Account created successfully! Please log in.");
        router.replace("/login");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  });

  const filePreviewClassName =
    "flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-[10px] border border-[#e6e1da] bg-white text-center transition hover:border-[#cfc7be]";

  return (
    <form
      onSubmit={onSubmit}
      className="mt-7 w-full rounded-[18px] border border-[#e8e2db] bg-white px-6 py-7 shadow-[0_1px_3px_rgba(15,23,42,0.03),0_10px_30px_rgba(15,23,42,0.05)] sm:px-7"
      style={{ maxWidth: 560 }}
    >
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-6">
        <div className="space-y-2">
          <label
            className="block text-[0.92rem] font-semibold text-[#2f2c29]"
            htmlFor="firstName"
          >
            First Name
          </label>
          <input
            id="firstName"
            placeholder="John"
            className="h-12 w-full rounded-[10px] border border-[#e6e1da] bg-white px-4 text-[0.98rem] text-[#2f2c29] outline-none transition placeholder:text-[#b2ada7] focus:border-[#b4aba1]"
            {...register("firstName")}
          />
          {errors.firstName ? (
            <p className="text-sm text-red-600">{errors.firstName.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label
            className="block text-[0.92rem] font-semibold text-[#2f2c29]"
            htmlFor="lastName"
          >
            Last Name
          </label>
          <input
            id="lastName"
            placeholder="Doe"
            className="h-12 w-full rounded-[10px] border border-[#e6e1da] bg-white px-4 text-[0.98rem] text-[#2f2c29] outline-none transition placeholder:text-[#b2ada7] focus:border-[#b4aba1]"
            {...register("lastName")}
          />
          {errors.lastName ? (
            <p className="text-sm text-red-600">{errors.lastName.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <label
          className="block text-[0.92rem] font-semibold text-[#2f2c29]"
          htmlFor="email"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="your@email.com"
          className="h-12 w-full rounded-[10px] border border-[#e6e1da] bg-white px-4 text-[0.98rem] text-[#2f2c29] outline-none transition placeholder:text-[#b2ada7] focus:border-[#b4aba1]"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="grid gap-5 pt-1 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-6">
        <div className="space-y-2">
          <label className="block text-[0.92rem] font-semibold text-[#2f2c29]" htmlFor="street">Street</label>
          <input id="street" placeholder="123 Main St" className="h-12 w-full rounded-[10px] border border-[#e6e1da] bg-white px-4 text-[0.98rem] text-[#2f2c29] outline-none transition placeholder:text-[#b2ada7] focus:border-[#b4aba1]" {...register("address.street")} />
          {errors.address?.street ? <p className="text-sm text-red-600">{errors.address.street.message}</p> : null}
        </div>
        <div className="space-y-2">
          <label className="block text-[0.92rem] font-semibold text-[#2f2c29]" htmlFor="city">City</label>
          <input id="city" placeholder="City" className="h-12 w-full rounded-[10px] border border-[#e6e1da] bg-white px-4 text-[0.98rem] text-[#2f2c29] outline-none transition placeholder:text-[#b2ada7] focus:border-[#b4aba1]" {...register("address.city")} />
          {errors.address?.city ? <p className="text-sm text-red-600">{errors.address.city.message}</p> : null}
        </div>
        <div className="space-y-2">
          <label className="block text-[0.92rem] font-semibold text-[#2f2c29]" htmlFor="state">State</label>
          <input id="state" placeholder="State" className="h-12 w-full rounded-[10px] border border-[#e6e1da] bg-white px-4 text-[0.98rem] text-[#2f2c29] outline-none transition placeholder:text-[#b2ada7] focus:border-[#b4aba1]" {...register("address.state")} />
          {errors.address?.state ? <p className="text-sm text-red-600">{errors.address.state.message}</p> : null}
        </div>
        <div className="space-y-2">
          <label className="block text-[0.92rem] font-semibold text-[#2f2c29]" htmlFor="postalCode">Postal Code</label>
          <input id="postalCode" placeholder="Postal Code" className="h-12 w-full rounded-[10px] border border-[#e6e1da] bg-white px-4 text-[0.98rem] text-[#2f2c29] outline-none transition placeholder:text-[#b2ada7] focus:border-[#b4aba1]" {...register("address.postalCode")} />
          {errors.address?.postalCode ? <p className="text-sm text-red-600">{errors.address.postalCode.message}</p> : null}
        </div>
        <div className="space-y-2">
          <label className="block text-[0.92rem] font-semibold text-[#2f2c29]" htmlFor="country">Country</label>
          <input id="country" placeholder="Country" className="h-12 w-full rounded-[10px] border border-[#e6e1da] bg-white px-4 text-[0.98rem] text-[#2f2c29] outline-none transition placeholder:text-[#b2ada7] focus:border-[#b4aba1]" {...register("address.country")} />
          {errors.address?.country ? <p className="text-sm text-red-600">{errors.address.country.message}</p> : null}
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <label
          className="block text-[0.92rem] font-semibold text-[#2f2c29]"
          htmlFor="profilePicture"
        >
          Profile Picture
        </label>
        <label htmlFor="profilePicture" className={filePreviewClassName}>
          {profilePicturePreview ? (
            <Image
              src={profilePicturePreview}
              alt="Profile picture preview"
              width={500}
              height={288}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="space-y-2 text-[#b2ada7]">
              <Upload className="mx-auto h-5 w-5" />
              <p className="text-[0.88rem] font-medium">Profile picture</p>
            </div>
          )}
        </label>
        <input
          id="profilePicture"
          type="file"
          accept="image/*"
          className="sr-only"
          {...register("profilePicture", {
            onChange: (event) => {
              const file = event.target.files?.[0];
              setProfilePicturePreview((current) => {
                if (current) {
                  URL.revokeObjectURL(current);
                }

                return file ? URL.createObjectURL(file) : undefined;
              });
            },
          })}
        />
      </div>

      <div className="grid gap-5 pt-5 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-6">
        <div className="space-y-2">
          <label
            className="block text-[0.92rem] font-semibold text-[#2f2c29]"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              className="h-12 w-full rounded-[10px] border border-[#e6e1da] bg-white px-4 pr-11 text-[0.98rem] text-[#2f2c29] outline-none transition placeholder:text-[#b2ada7] focus:border-[#b4aba1]"
              {...register("password")}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#8e857c] transition hover:text-[#2f2c29]"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          ) : null}
          <p className="text-[0.8rem] leading-5 text-[#6e6963]">
            At least 8 characters with letters and numbers
          </p>
        </div>
        <div className="space-y-2">
          <label
            className="block text-[0.92rem] font-semibold text-[#2f2c29]"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              className="h-12 w-full rounded-[10px] border border-[#e6e1da] bg-white px-4 pr-11 text-[0.98rem] text-[#2f2c29] outline-none transition placeholder:text-[#b2ada7] focus:border-[#b4aba1]"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#8e857c] transition hover:text-[#2f2c29]"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword ? (
            <p className="text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2.5 text-[0.88rem] text-[#4a4743]">
        <input
          id="terms"
          type="checkbox"
          defaultChecked
          className="mt-0.5 h-4 w-4 rounded border-[#9b9187] accent-[#1e3a5f]"
          {...register("terms")}
        />
        <label htmlFor="terms" className="leading-6">
          I agree to the{" "}
          <Link href="#" className="font-medium text-[#1e3a5f]">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="font-medium text-[#1e3a5f]">
            Privacy Policy
          </Link>
        </label>
      </div>
      {errors.terms ? (
        <p className="mt-2 text-sm text-red-600">{errors.terms.message}</p>
      ) : null}

      <button
        disabled={isSubmitting}
        className="mt-4 h-11 w-full rounded-[8px] bg-[#1e3a5f] text-[0.95rem] font-medium text-white transition hover:bg-[#17304f] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
      >
        Create Account
      </button>

      <p className="mt-4 text-center text-[0.9rem] text-[#7b746d]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#1e3a5f]">
          Sign in
        </Link>
      </p>
    </form>
  );
}

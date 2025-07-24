"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { signUpSchema, signInSchema } from "@/lib/validations/auth"

export async function signUp(prevState: any, formData: FormData) {
  const rawFormData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    username: formData.get("username") as string,
    displayName: formData.get("displayName") as string,
  }

  // Validate form data
  const validatedFields = signUpSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, username, displayName } = validatedFields.data

  try {
    const supabase = await createClient()

    // Check if username already exists
    const { data: existingUser } = await supabase.from("users").select("username").eq("username", username).single()

    if (existingUser) {
      return {
        success: false,
        errors: { username: ["Username already exists"] },
      }
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return {
        success: false,
        errors: { email: [authError.message] },
      }
    }

    if (authData.user) {
      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        username,
        display_name: displayName,
      })

      if (profileError) {
        return {
          success: false,
          errors: { username: [profileError.message] },
        }
      }
    }
  } catch (error: any) {
    console.error("Sign up error:", error)
    return {
      success: false,
      errors: { email: ["An unexpected error occurred. Please try again."] },
    }
  }

  // Redirect outside of try-catch to avoid catching the redirect error
  redirect("/dashboard")
}

export async function signIn(prevState: any, formData: FormData) {
  const rawFormData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  // Validate form data
  const validatedFields = signInSchema.safeParse(rawFormData)

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        errors: { email: [error.message] },
      }
    }
  } catch (error: any) {
    console.error("Sign in error:", error)
    return {
      success: false,
      errors: { email: ["An unexpected error occurred. Please try again."] },
    }
  }

  // Redirect outside of try-catch to avoid catching the redirect error
  redirect("/dashboard")
}

export async function signOut() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  } catch (error) {
    console.error("Sign out error:", error)
  }

  redirect("/login")
}

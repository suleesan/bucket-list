import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCheckEmailMessage, setShowCheckEmailMessage] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN") {
          setCurrentUser(session?.user || null);
        } else if (event === "SIGNED_OUT") {
          setCurrentUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Sign up and create profile
  async function signup(username, email, password) {
    // Check if username is taken
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) throw new Error("Username already taken");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;

    // Create profile immediately after signup
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        username,
      },
    ]);

    if (profileError) {
      console.error("Error creating profile:", profileError);
      throw new Error("Failed to create profile");
    }

    // Show check email message if confirmation is required
    setShowCheckEmailMessage(true);

    return data.user;
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Check if profile exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .single();

    // If no profile exists, create one
    if (!profile) {
      const { error: insertError } = await supabase.from("profiles").insert([
        {
          id: data.user.id,
          username: email.split("@")[0], // Default username from email
        },
      ]);
      if (insertError) throw insertError;
    }

    return data.user;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading,
    showCheckEmailMessage,
    setShowCheckEmailMessage,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

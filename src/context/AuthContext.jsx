import { createContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verificar sesión activa al inicio
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchar cambios en tiempo real (login, logout, refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Funciones auxiliares para login/signup/logout
  const signInWithEmail = (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = (email, password) => {
    return supabase.auth.signUp({ email, password });
  };

  const signOut = () => {
    return supabase.auth.signOut();
  };

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signInWithEmail,
    signUp,
    signOut,
  };

  // Renderizado condicional: No mostramos la app hasta verificar la sesión
  return (
    <AuthContext.Provider value={value}>
      {!loading ? (
        children
      ) : (
        <div style={{ textAlign: "center", marginTop: "20%" }}>
          Cargando autenticación...
        </div>
      )}
    </AuthContext.Provider>
  );
};

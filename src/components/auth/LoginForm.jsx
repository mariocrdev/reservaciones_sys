import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Asumiendo React Router
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import BackgroundAuth from "../global/BackgroundAuth";

export function LoginForm({ className, ...props }) {
  const { signInWithEmail } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const { error } = await signInWithEmail(email, password);
      if (error) throw error;

      // Redirección exitosa
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden -z-10 opacity-3">
        <BackgroundAuth
          className="
      absolute
      inset-0
      w-full
      h-full
      scale-105
      transition-transform
      duration-8000
      ease-out
    "
          preserveAspectRatio="xMidYMid slice"
        />
      </div>

      <div
        className={cn(
          "flex flex-col gap-6 w-full max-w-sm relative z-10",
          className,
        )}
        {...props}
      >
        <Card className="overflow-hidden p-0 shadow-xl bg-card/5 backdrop-blur-sm">
          <CardContent className="grid p-0">
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
                  <p className="text-muted-foreground text-balance">
                    Inicia sesión en tu cuenta
                  </p>
                </div>

                {error && (
                  <div className="bg-destructive/15 text-destructive text-sm p-2 rounded-md text-center">
                    {error}
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-2 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </Field>

                <Field>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                </Field>

                <div className="text-center text-sm">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    to="/auth/register"
                    className="underline underline-offset-4"
                  >
                    Regístrate
                  </Link>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <div className="text-muted-foreground px-6 text-center text-sm">
          Al continuar, aceptas nuestros <a href="#">Términos de Servicio</a> y{" "}
          <a href="#">Política de Privacidad</a>.
        </div>
      </div>
    </div>
  );
}

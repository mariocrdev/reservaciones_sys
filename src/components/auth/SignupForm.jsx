import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import BackgroundAuth from "../global/BackgroundAuth";

export function SignupForm({ className, ...props }) {
  const { signUp } = useAuth(); // Asegúrate de agregar signUp al AuthContext
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
    const confirmPassword = formData.get("confirm-password");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password);
      if (error) throw error;

      // Dependiendo de tu config de Supabase, puedes redirigir al login
      // o mostrar un mensaje de "Verifica tu email"
      alert("¡Cuenta creada! Por favor verifica tu correo para validarlo.");
      navigate("/auth/login");
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
          <CardContent className="grid p-0 ">
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Ingresa tu correo para crear tu cuenta
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
                  <FieldDescription>
                    Lo usaremos para contactarte.
                  </FieldDescription>
                </Field>

                <Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="confirm-password">
                        Confirmar Contraseña
                      </FieldLabel>
                      <Input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        required
                      />
                    </Field>
                  </div>
                  <FieldDescription>
                    Debe tener al menos 8 caracteres.
                  </FieldDescription>
                </Field>

                <Field>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>
                </Field>

                <FieldDescription className="text-center">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    to="/auth/login"
                    className="underline underline-offset-4"
                  >
                    Inicia sesión
                  </Link>
                </FieldDescription>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <FieldDescription className="px-6 text-center">
          Al continuar, aceptas nuestros <a href="#">Términos de Servicio</a> y{" "}
          <a href="#">Política de Privacidad</a>.
        </FieldDescription>
      </div>
    </div>
  );
}

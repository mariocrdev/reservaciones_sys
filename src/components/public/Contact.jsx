import { useState, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import {
  Send,
  Mail,
  User,
  Phone,
  MessageSquare,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import landingContent from "@/data/landingContent.json";
import { toast } from "sonner";

const iconMap = {
  Phone,
  Mail,
  MessageSquare,
};

const Contact = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    mensaje: "",
  });
  const [captchaToken, setCaptchaToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const captchaRef = useRef(null);

  const { title, description, info: contactInfo } = landingContent.contact;

  const ContactIcon = ({ iconName, className }) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className={className} /> : null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      toast.message("Error de verificación", {
        description: "Por favor complete la verificación de hCaptcha",
      });

      return;
    }

    setIsSubmitting(true);

    try {
      // Paso 1: Verificar el token de hCaptcha con la Edge Function
      const verifyResponse = await fetch(
        "https://frshjudvbrrcsptrgeeo.supabase.co/functions/v1/verify-hcaptcha",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: captchaToken }),
        },
      );

      const verifyResult = await verifyResponse.json();

      if (!verifyResult.success) {
        toast.message("Error de verificación", {
          description:
            verifyResult.error ||
            "La verificación de hCaptcha falló. Intente nuevamente.",
        });

        setIsSubmitting(false);
        return;
      }

      // Paso 2: Si la verificación es exitosa, enviar los datos a Formspree
      const response = await fetch("https://formspree.io/f/mgvalner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          "h-captcha-response": captchaToken,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setFormData({ nombre: "", correo: "", telefono: "", mensaje: "" });
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(""); // Resetear el token
        setIsSuccess(true);

        toast.message("Mensaje enviado", {
          description: "Gracias por contactarnos. Responderemos a la brevedad.",
        });

        // Resetear el estado de éxito después de 5 segundos
        setTimeout(() => {
          setIsSuccess(false);
        }, 5000);
      } else {
        toast.message("Error al enviar", {
          description:
            result.error ||
            "Hubo un problema al enviar su mensaje. Intente nuevamente.",
        });
      }
    } catch (error) {
      toast.message("Error al enviar", {
        description:
          "Hubo un problema al procesar su solicitud. Intente nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-20 bg-gray-50 dark:bg-sport-blueDark/50"
    >
      <div className="container mx-auto px-4 max-w-[100vw] overflow-hidden">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-4 py-1.5 text-sm font-medium bg-sport-AquaLight/10 text-sport-AquaLight border-none">
            Contáctanos
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-sport-darkMatte dark:text-white">
            {title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Columna izquierda: Información de contacto */}
          <div className="lg:col-span-2">
            <Card className="h-full bg-white dark:bg-sport-blueDark/60 border-0 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-r from-sport-AquaLight to-sport-blueOcean" />
              <CardHeader className="pt-32 pb-6 relative z-10">
                <CardTitle className="text-2xl font-bold text-sport-darkMatte dark:text-white">
                  Información de Contacto
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Utiliza cualquiera de estos medios para comunicarte con
                  nosotros
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`shrink-0 p-3 rounded-full ${item.color}`}>
                      <ContactIcon iconName={item.icon} className="h-6 w-6" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {item.title}
                      </h4>
                      <p className="text-base font-medium text-sport-darkMatte dark:text-white">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>

              <div className="absolute bottom-0 right-0 w-32 h-32 bg-sport-AquaLight/5 rounded-full translate-x-1/4 translate-y-1/4" />
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-sport-AquaLight/10 rounded-full translate-x-1/3 translate-y-1/3" />
            </Card>
          </div>

          {/* Columna derecha: Formulario (unchanged for brevity) */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg bg-white dark:bg-sport-blueDark/60">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-sport-darkMatte dark:text-white">
                  Envíanos un mensaje
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Completa el formulario y te responderemos lo antes posible
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-sport-darkMatte dark:text-white mb-2">
                      ¡Mensaje enviado!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-md">
                      Gracias por contactarnos. Hemos recibido tu mensaje y te
                      responderemos a la brevedad.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label
                          htmlFor="nombre"
                          className="text-sport-darkMatte dark:text-white"
                        >
                          Nombre completo
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Ingrese su nombre"
                            required
                            className="pl-10 border-gray-200 dark:border-gray-700 focus:border-sport-AquaLight dark:focus:border-sport-AquaLight"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="correo"
                          className="text-sport-darkMatte dark:text-white"
                        >
                          Correo electrónico
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="correo"
                            name="correo"
                            type="email"
                            value={formData.correo}
                            onChange={handleChange}
                            placeholder="ejemplo@correo.com"
                            required
                            className="pl-10 border-gray-200 dark:border-gray-700 focus:border-sport-AquaLight dark:focus:border-sport-AquaLight"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="telefono"
                        className="text-sport-darkMatte dark:text-white"
                      >
                        Número telefónico
                      </Label>
                      <div className="relative flex">
                        <div className="flex items-center justify-center px-3 border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-md bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                          +593
                        </div>
                        <Input
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          type="tel"
                          placeholder="Ingrese su número telefónico"
                          required
                          className="rounded-l-none border-gray-200 dark:border-gray-700 focus:border-sport-AquaLight dark:focus:border-sport-AquaLight"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="mensaje"
                        className="text-sport-darkMatte dark:text-white"
                      >
                        Mensaje
                      </Label>
                      <Textarea
                        id="mensaje"
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleChange}
                        placeholder="Escriba su mensaje aquí..."
                        required
                        className="min-h-30 border-gray-200 dark:border-gray-700 focus:border-sport-AquaLight dark:focus:border-sport-AquaLight"
                      />
                    </div>

                    <div className="flex justify-center items-center w-full pt-2">
                      <div className="max-w-xs w-full">
                        <HCaptcha
                          sitekey={
                            import.meta.env.VITE_APP_HCAPTCHA_SITE_KEY ||
                            "10000000-ffff-ffff-ffff-000000000001"
                          }
                          onVerify={(token) => setCaptchaToken(token)}
                          onExpire={() => setCaptchaToken(null)}
                          ref={captchaRef}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || !captchaToken}
                      className="w-full bg-sport-AquaLight hover:bg-sport-AquaLight/90 text-white"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Enviando...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Enviar mensaje
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

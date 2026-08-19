import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  Search,
  Calendar,
  CreditCard,
  GraduationCap,
  Users,
  Clock,
  ShieldCheck,
  Mail,
  Phone,
  MessageCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const categories = [
    { id: "all", label: "Todos los temas", icon: HelpCircle },
    { id: "reservations", label: "Reservas", icon: Calendar },
    { id: "memberships", label: "Membresías", icon: CreditCard },
    { id: "courses", label: "Cursos y Clases", icon: GraduationCap },
    { id: "payments", label: "Pagos y Vouchers", icon: FileText },
    { id: "family", label: "Familiares e Hijos", icon: Users },
  ];

  const faqs = [
    {
      category: "reservations",
      question: "¿Cómo reservo una cancha o instalación deportiva?",
      answer:
        "Dirígete a la sección 'Mis Reservaciones' o al catálogo principal, selecciona la instalación deportiva de tu interés (cancha de tenis, fútbol, piscina, etc.), elige la fecha deseada y consulta los turnos disponibles en tiempo real. Al seleccionar un horario, se creará tu reserva en estado 'Pendiente' con un tiempo de gracia de 30 minutos para registrar tu pago.",
    },
    {
      category: "reservations",
      question: "¿Por qué mi reserva tiene un temporizador de 30 minutos?",
      answer:
        "Para garantizar la disponibilidad justa entre todos los miembros, las reservas nuevas se apartan de forma provisional durante 30 minutos. Si dentro de ese tiempo subes tu comprobante de pago, el temporizador se pausa indefinidamente mientras el administrador aprueba tu pago. Si no se registra ningún comprobante antes de que expire el tiempo, el turno se liberará automáticamente.",
    },
    {
      category: "reservations",
      question: "¿Puedo cancelar una reserva ya realizada?",
      answer:
        "Sí. Puedes cancelar tus reservas pendientes o activas desde la sección 'Mis Reservaciones' haciendo clic en el botón 'Cancelar'. Recuerda hacerlo con anticipación para permitir que otros socios utilicen el espacio.",
    },
    {
      category: "memberships",
      question: "¿Qué beneficios incluye una membresía y cómo la activo?",
      answer:
        "Nuestras membresías te otorgan acceso prioritario o ilimitado a las instalaciones, descuentos especiales en cursos y promociones exclusivas. Puedes seleccionar tu plan mensual o anual en la pestaña 'Membresías', subir tu comprobante de pago y, en cuanto el administrador valide la transacción, tu membresía quedará inmediatamente activa calculando la vigencia exacta de forma automática.",
    },
    {
      category: "memberships",
      question: "¿Puedo renovar mi membresía antes de que venza?",
      answer:
        "¡Totalmente! Si renuevas tu plan antes de la fecha de caducidad, el sistema sumará automáticamente la nueva duración a partir de tu fecha de fin actual, sin perder ningún día de antigüedad ni vigencia.",
    },
    {
      category: "courses",
      question: "¿Cómo inscribo a mis hijos o familiares en los cursos?",
      answer:
        "Primero, registra los datos de tus hijos o dependientes en la sección 'Mi familia'. Luego, ve a 'Cursos', selecciona el taller deportivo (por ejemplo, Natación infantil o Tenis) y al momento de inscribirte podrás elegir si la inscripción es para ti o para uno de tus familiares registrados.",
    },
    {
      category: "courses",
      question: "¿Qué ocurre cuando se llenan los cupos de un curso?",
      answer:
        "Cada grupo o slot de curso cuenta con un aforo máximo garantizado. Cuando el cupo llega al límite, el sistema no permite nuevas inscripciones para evitar sobrecupos y mantener la calidad del entrenamiento con nuestros instructores.",
    },
    {
      category: "payments",
      question: "¿Cómo subo mi comprobante o voucher de pago?",
      answer:
        "Desde la vista de 'Mis Reservaciones', 'Mis Inscripciones' o 'Membresías', haz clic en 'Subir Comprobante' en el ítem correspondiente. Selecciona la foto o captura de tu transferencia bancaria en formato PNG, JPG o PDF. El sistema la asociará de inmediato a tu pago y pausará los temporizadores de vencimiento.",
    },
    {
      category: "payments",
      question: "¿Cuánto tarda la administración en validar mi pago?",
      answer:
        "La revisión de comprobantes se realiza habitualmente en un lapso de 15 a 45 minutos durante el horario operativo del centro deportivo. Recibirás una confirmación en tiempo real en tu panel.",
    },
    {
      category: "family",
      question: "¿Qué información debo registrar de mis dependientes?",
      answer:
        "En la pestaña 'Mi familia' debes ingresar nombre, apellido, fecha de nacimiento, género y cualquier nota médica o alergia relevante (por ejemplo, precauciones para clases de natación o actividades físicas intensas).",
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 p-8 md:p-12 shadow-sm">
        <div className="relative max-w-2xl space-y-4">
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none px-3 py-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            Centro de Ayuda y Soporte
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            ¿En qué podemos ayudarte hoy?
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Encuentra respuestas rápidas sobre tus reservas, membresías activas, cursos deportivos, validación de pagos y gestión familiar.
          </p>

          {/* Search bar */}
          <div className="relative pt-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar preguntas frecuentes (ej. reservar cancha, subir voucher, cancelar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-6 bg-background/90 backdrop-blur border-border/80 text-sm shadow-sm rounded-xl focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quick Flow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader className="pb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
              <Calendar className="w-5 h-5" />
            </div>
            <CardTitle className="text-base font-semibold">1. Reserva tu Espacio</CardTitle>
            <CardDescription className="text-xs">
              Elige cancha o área deportiva y escoge tu turno disponible en tiempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="link" asChild className="p-0 h-auto text-xs text-primary font-medium">
              <Link to="/my-reservations">Ir a Reservaciones →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader className="pb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <CardTitle className="text-base font-semibold">2. Sube tu Comprobante</CardTitle>
            <CardDescription className="text-xs">
              Adjunta tu voucher de transferencia bancaria para pausar el temporizador y validar.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="link" asChild className="p-0 h-auto text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Link to="/my-reservations">Ver mis pagos pendientes →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader className="pb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2">
              <GraduationCap className="w-5 h-5" />
            </div>
            <CardTitle className="text-base font-semibold">3. Cursos e Hijos</CardTitle>
            <CardDescription className="text-xs">
              Inscribe a tus dependientes en escuelas formativas con cupos asegurados.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="link" asChild className="p-0 h-auto text-xs text-purple-600 dark:text-purple-400 font-medium">
              <Link to="/dashboard/courses">Explorar Cursos →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Category Pills */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Preguntas Frecuentes
          </h2>
          <span className="text-xs text-muted-foreground">
            Mostrando {filteredFaqs.length} temas de ayuda
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pb-2">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setOpenFaqIndex(null);
                }}
                className={`rounded-lg text-xs gap-2 transition-all ${
                  isActive ? "shadow-xs" : "border-border/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-xl border-border/80 bg-muted/20">
              <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
              <p className="text-sm font-medium text-foreground">No se encontraron resultados</p>
              <p className="text-xs text-muted-foreground mt-1">
                Intenta con otros términos de búsqueda o selecciona otra categoría.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
                className="mt-4 text-xs"
              >
                Restablecer filtros
              </Button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "border-primary/50 bg-primary/5 shadow-xs"
                      : "border-border/60 bg-card hover:border-border"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-medium text-sm text-foreground focus:outline-none"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary/70 shrink-0" />
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs md:text-sm text-muted-foreground leading-relaxed border-t border-primary/10">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Support & Contact Cards */}
      <div className="pt-6 border-t border-border/60">
        <div className="mb-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            ¿Necesitas asistencia personalizada?
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Nuestro equipo de recepción y atención al socio está disponible para asistirte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/60 bg-card/60">
            <CardContent className="pt-5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">WhatsApp y Chat Directo</h3>
                <p className="text-xs text-muted-foreground">+593 123 456 789</p>
                <p className="text-[11px] text-muted-foreground/80">Atención ágil para dudas de reservas y pagos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardContent className="pt-5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Correo de Soporte</h3>
                <p className="text-xs text-muted-foreground">contacto@centrodeportivo.com</p>
                <p className="text-[11px] text-muted-foreground/80">Respuestas formales y solicitudes especiales</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60">
            <CardContent className="pt-5 flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Horario de Atención</h3>
                <p className="text-xs text-muted-foreground">Lun - Vie: 6:00 AM - 10:00 PM</p>
                <p className="text-[11px] text-muted-foreground/80">Sábados y Domingos: 8:00 AM - 8:00 PM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

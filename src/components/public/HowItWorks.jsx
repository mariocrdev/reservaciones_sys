import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const steps = [
  {
    icon: "solar:users-group-two-rounded-bold",
    step: "01",
    title: "Registro y Perfil Familiar",
    badge: "Socio + Familia",
    desc: "Crea tu cuenta de socio en minutos. Registra a tus hijos o dependientes con sus notas médicas y detalles para inscribirlos en sus clases de forma centralizada.",
    formalTitle: "Registro de Usuario y Configuración del Perfil Familiar",
    formalDesc: "Para iniciar el uso de la plataforma, el usuario debe realizar la creación de una cuenta de socio principal utilizando su correo electrónico. Una vez completado el registro inicial, el sistema permite configurar el perfil y, de forma opcional, añadir a los miembros del núcleo familiar o dependientes (hijos, cónyuge, etc.).",
    keyPoints: [
      "Identidad Única de Socio: Cada usuario principal posee un identificador único que vincula de manera segura sus datos de contacto y facturación.",
      "Gestión de Dependientes: El registro de familiares permite la inscripción directa de menores de edad en las actividades correspondientes.",
      "Ficha Médica de Control: Es posible adjuntar observaciones médicas o restricciones específicas (crucial para actividades acuáticas o de alta exigencia física), garantizando que los instructores cuenten con la información necesaria para resguardar la seguridad de los participantes."
    ],
    color: "from-cyan-500/10 to-blue-500/10 hover:border-cyan-500/30",
    iconColor: "text-cyan-400",
    stepBadge: "bg-cyan-500",
  },
  {
    icon: "solar:calendar-add-bold",
    step: "02",
    title: "Elige Actividad o Membresía",
    badge: "Reserva o Curso",
    desc: "Reserva canchas en tiempo real por hora, inscríbete en cursos deportivos (Tenis, Natación, Pádel) con instructores, o adquiere tu membresía mensual/anual.",
    formalTitle: "Selección de Servicios Deportivos y Adquisición de Membresías",
    formalDesc: "La plataforma ofrece un portafolio diversificado de servicios deportivos y de acondicionamiento físico adaptados a las necesidades y objetivos de los usuarios.",
    keyPoints: [
      "Reserva de Instalaciones por Hora: Visualización en tiempo real de la disponibilidad de canchas de tenis, pádel, piscina o áreas de gimnasio para su reserva individual sin necesidad de llamadas telefónicas.",
      "Inscripción a Cursos y Clases: Acceso a ciclos de enseñanza (como natación, tenis, acondicionamiento funcional) liderados por instructores certificados, con un control riguroso de la capacidad máxima por sesión.",
      "Planes de Membresía Flexibles: Adquisición de suscripciones (Básica, Premium o Familiar) con facturación periódica (mensual o anual) para el acceso libre a las instalaciones del club de acuerdo con la categoría elegida."
    ],
    color: "from-violet-500/10 to-purple-500/10 hover:border-violet-500/30",
    iconColor: "text-violet-400",
    stepBadge: "bg-violet-500",
  },
  {
    icon: "solar:clock-circle-bold",
    step: "03",
    title: "Bloqueo Temporal y Pago",
    badge: "Hold de 30 mins",
    desc: "Las reservas de cancha se apartan por 30 minutos. Sube tu comprobante de pago para detener el temporizador de expiración y asegurar tu cupo temporal.",
    formalTitle: "Bloqueo Preventivo de Cupo y Procesamiento de Pago",
    formalDesc: "Con la finalidad de garantizar la equidad y evitar duplicidades en el uso de los espacios deportivos, el sistema cuenta con un protocolo automatizado de reserva temporal.",
    keyPoints: [
      "Temporizador de Retención: Al pre-reservar una instalación, el sistema bloquea el horario seleccionado durante un periodo de 30 minutos bajo el estado 'Pendiente'.",
      "Carga de Comprobante de Pago: Durante este lapso, el usuario debe realizar la transferencia correspondiente y registrar el comprobante de pago en el sistema.",
      "Garantía de Cupo: La carga del archivo digital detiene de inmediato el temporizador de expiración automática, protegiendo la reserva de cancelaciones involuntarias mientras el pago entra en proceso de revisión administrativa."
    ],
    color: "from-amber-500/10 to-orange-500/10 hover:border-amber-500/30",
    iconColor: "text-amber-400",
    stepBadge: "bg-amber-500",
  },
  {
    icon: "solar:cup-star-bold",
    step: "04",
    title: "Validación y ¡A Entrenar!",
    badge: "Confirmación Instantánea",
    desc: "El administrador aprueba tu pago, lo que confirma tu reserva, incrementa los inscritos del curso o activa tu membresía. ¡Revisa tu horario y entrena!",
    formalTitle: "Verificación Administrativa y Activación del Servicio",
    formalDesc: "Una vez cargado el comprobante de pago, el equipo administrativo realiza la conciliación del depósito para proceder a la activación formal del servicio.",
    keyPoints: [
      "Confirmación Inmediata: Al verificarse el pago, la reserva cambia a estado 'Confirmado' o la suscripción de membresía pasa a estado 'Activo'.",
      "Actualización de Cupos: Para los cursos, la vacante queda formalmente asignada al usuario o a su familiar, reduciendo la disponibilidad global de manera automática.",
      "Acceso y Control: El usuario podrá visualizar en su panel personal el cronograma de clases, horarios autorizados e historial de transacciones, quedando plenamente habilitado para ingresar y hacer uso de las instalaciones."
    ],
    color: "from-emerald-500/10 to-green-500/10 hover:border-emerald-500/30",
    iconColor: "text-emerald-400",
    stepBadge: "bg-emerald-500",
  },
];

const HowItWorks = () => {
  const [selectedStep, setSelectedStep] = useState(null);

  return (
    <section id="como-funciona" className="py-24 bg-background relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-sport-AquaLight/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-sport-blueOcean/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Encabezado */}
        <div className="text-center mb-20 space-y-4">
          <Badge className="px-4 py-1 uppercase tracking-widest text-xs font-bold bg-sport-AquaLight/10 text-sport-AquaLight border-none">
            Proceso de Gestión
          </Badge>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            ¿Cómo funciona nuestro sistema?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Diseñado para brindarte control total sobre tus actividades. Selecciona un paso a continuación para obtener información detallada sobre su funcionamiento.
          </p>
        </div>

        {/* Pasos */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 relative">
          

          {steps.map((s, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center text-center group bg-card/40 backdrop-blur-sm border border-border/60 hover:border-border rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer select-none"
              onClick={() => setSelectedStep(s)}
            >
              {/* Gradiente sutil interno al hacer hover */}
              <div className={`absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500 pointer-events-none ${s.color}`} />

              {/* Número de paso flotante */}
              <div className="mb-2 text-xs font-black tracking-widest text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
                PASO {s.step}
              </div>

              {/* Círculo del icono */}
              <div className="relative z-10 w-24 h-24 rounded-2xl bg-card border border-border/80 shadow-md flex items-center justify-center mb-6 transition-all duration-500 group-hover:shadow-lg group-hover:scale-110">
                <Icon icon={s.icon} className={`w-11 h-11 transition-transform duration-300 group-hover:rotate-6 ${s.iconColor}`} />
                <span className={`absolute -bottom-4  px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold shadow-sm ${s.stepBadge}`}>
                  {s.badge}
                </span>
              </div>

              {/* Título */}
              <div className="relative z-10 space-y-2">
                <h3 className="text-lg font-bold group-hover:text-foreground transition-colors duration-300">
                  {s.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de información detallada */}
        <Dialog open={selectedStep !== null} onOpenChange={(open) => { if (!open) setSelectedStep(null); }}>
          <DialogContent className="max-w-xl">
            <DialogHeader className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl bg-card border border-border/80 shadow-md flex items-center justify-center">
                  <Icon icon={selectedStep?.icon} className={`w-7 h-7 ${selectedStep?.iconColor}`} />
                </div>
                <div>
                  <Badge className={`px-2.5 py-0.5 rounded-full text-white text-[10px] font-bold tracking-wider uppercase border-none ${selectedStep?.stepBadge}`}>
                    Paso {selectedStep?.step}
                  </Badge>
                  <DialogTitle className="text-xl font-bold mt-1 text-foreground leading-tight">
                    {selectedStep?.formalTitle}
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <div className="py-4 space-y-5">
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                {selectedStep?.formalDesc}
              </DialogDescription>

              {selectedStep?.keyPoints && (
                <div className="space-y-3 bg-muted/40 rounded-2xl p-5 border border-border/50">
                  <h4 className="font-bold text-xs uppercase tracking-widest text-foreground/80">
                    Lineamientos del Procedimiento
                  </h4>
                  <ul className="space-y-3">
                    {selectedStep.keyPoints.map((point, index) => {
                      const [title, desc] = point.split(": ");
                      return (
                        <li key={index} className="flex gap-3 text-xs leading-relaxed text-muted-foreground align-top">
                          <Icon icon="solar:check-circle-bold" className={`w-4 h-4 shrink-0 mt-0.5 ${selectedStep.iconColor}`} />
                          <div>
                            <strong className="text-foreground font-semibold">{title}: </strong>
                            {desc}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <DialogFooter className="sm:justify-end">
              <DialogClose asChild>
                <Button type="button" className="rounded-full bg-sport-AquaLight hover:bg-sport-AquaLight/90 text-white font-semibold">
                  Entendido
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* CTA Button */}
        <div className="mt-16 text-center">
          <Link to="/auth/login">
            <Button
              size="lg"
              className="rounded-full px-8 py-6 bg-sport-AquaLight hover:bg-sport-AquaLight/90 text-white shadow-xl hover:shadow-2xl hover:shadow-sport-AquaLight/20 transition-all hover:scale-105 group font-semibold"
            >
              <Icon icon="solar:login-2-bold" className="mr-2 h-5 w-5" />
              Comenzar ahora
              <ChevronRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;


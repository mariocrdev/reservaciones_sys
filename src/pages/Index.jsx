import { useState, useEffect } from "react";
import {
  ArrowUp,
  Calendar,
  Star,
  Award,
  Users,
  MapPin,
  Clock,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Importar componentes existentes
import Navbar from "@/components/public/NavBar";
import Hero from "@/components/public/Hero";
import Services from "@/components/public/Services";
import AboutUs from "@/components/public/AboutUs";
import Footer from "@/components/public/Footer";
import Contact from "@/components/public/Contact";
import landingContent from "@/data/landingContent.json";
import StatsSection from "@/components/public/Stats";
import Facilities from "@/components/public/FacilitiesSection";

const iconMap = {
  Calendar,
  Users,
  Award,
  Star,
  MapPin,
  Clock,
};

// Componente principal de la página de inicio
const HomePage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Controlar cuándo mostrar el botón de volver arriba
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Función para volver al inicio de la página
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const StatIcon = ({ iconName }) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="h-8 w-8" /> : null;
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Sección de Estadísticas */}
      <StatsSection/>

      {/* Servicios */}
      <Services />

      {/* Sección de Instalaciones */}
      <Facilities/>

      {/* Sobre Nosotros */}
      <AboutUs />

      {/* Sección de Membresías */}
      <section
        id="membresia"
        className="py-16 bg-gray-50 dark:bg-sport-blueDark/50"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {landingContent.memberships.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {landingContent.memberships.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {landingContent.memberships.plans.map((plan) => (
              <div key={plan.id} className={plan.popular ? "self-start" : ""}>
                <Card
                  className={`overflow-hidden transition-all duration-300 hover:shadow-lg relative ${
                    plan.popular ? "border-2 border-sport-AquaLight" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0">
                      <Badge className="m-2 bg-sport-AquaLight text-white">
                        Más Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        /{plan.period}
                      </span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <div className="shrink-0 pt-1">
                            <svg
                              className="h-5 w-5 text-sport-AquaLight"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span className="ml-3 text-gray-600 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Testimonios */}
      <section
        id="testimonios"
        className="py-16 bg-white dark:bg-sport-blueDark/80"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {landingContent.testimonials.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {landingContent.testimonials.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {landingContent.testimonials.list.map((testimonial) => (
              <div key={testimonial.id}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < testimonial.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <div className="shrink-0">
                        <img
                          src={testimonial.avatar || "/placeholder.svg"}
                          alt={testimonial.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-lg font-semibold">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Horarios */}
      <section
        id="horarios"
        className="py-16 bg-white dark:bg-sport-blueDark/80"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {landingContent.hours.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {landingContent.hours.description}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 bg-sport-AquaLight/10">
                    <h3 className="text-2xl font-bold mb-6 text-sport-blueOcean dark:text-sport-AquaLight">
                      Horario Regular
                    </h3>
                    <ul className="space-y-4">
                      {landingContent.hours.schedule.map((item, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 mr-3 text-sport-AquaLight" />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <span>{item.time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-8 bg-sport-blueOcean text-white">
                    <h3 className="text-2xl font-bold mb-6">
                      Información Adicional
                    </h3>
                    <ul className="space-y-4">
                      {landingContent.hours.additionalInfo.map(
                        (info, index) => {
                          const IconComp = iconMap[info.icon] || MapPin;
                          return (
                            <li
                              key={index}
                              className="flex items-start pb-2 border-b border-white/20"
                            >
                              <IconComp className="h-5 w-5 mr-3 shrink-0 mt-1" />
                              <div>
                                <span className="font-medium block mb-1">
                                  {info.label}
                                </span>
                                <span className="text-sm text-gray-200">
                                  {info.value}
                                </span>
                              </div>
                            </li>
                          );
                        },
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sección de Contacto */}
      <Contact />

      {/* Footer */}
      <Footer />

      {/* Botón para volver arriba */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-sport-AquaLight text-white shadow-lg z-50 hover:bg-sport-AquaLight/90 transition-colors"
          aria-label="Volver arriba"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default HomePage;

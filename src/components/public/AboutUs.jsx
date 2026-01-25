import { useRef } from "react";
import { Award, Clock, MapPin, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import landingContent from "@/data/landingContent.json";

const iconMap = {
  Award,
  Clock,
  MapPin,
  Users,
};

const AboutUs = () => {
  const { features, tabs: tabContent, title } = landingContent.aboutUs;

  const FeatureIcon = ({ iconName }) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="h-5 w-5 text-sport-AquaLight" /> : null;
  };

  return (
    <section id="nosotros" className="py-16 bg-white dark:bg-sport-blueDark">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Columna izquierda: Información */}
          <div>
            <Badge className="mb-4 px-4 py-1.5 text-sm font-medium bg-sport-AquaLight/10 text-sport-AquaLight border-none">
              Sobre Nosotros
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-sport-darkMatte dark:text-white">
              {title.split("de la ciudad")[0]}{" "}
              <span className="text-sport-AquaLight">de la ciudad</span>
            </h2>

            <Tabs defaultValue="historia" className="mt-8">
              <TabsList className="bg-gray-100 dark:bg-sport-blueDark/60 p-1 rounded-full w-full max-w-md">
                <TabsTrigger
                  value="historia"
                  className="rounded-full data-[state=active]:bg-sport-AquaLight data-[state=active]:text-white"
                >
                  Historia
                </TabsTrigger>
                <TabsTrigger
                  value="mision"
                  className="rounded-full data-[state=active]:bg-sport-AquaLight data-[state=active]:text-white"
                >
                  Misión
                </TabsTrigger>
                <TabsTrigger
                  value="equipo"
                  className="rounded-full data-[state=active]:bg-sport-AquaLight data-[state=active]:text-white"
                >
                  Equipo
                </TabsTrigger>
              </TabsList>

              {Object.entries(tabContent).map(([key, value]) => (
                <TabsContent key={key} value={key} className="mt-6">
                  <div className="md:hidden mb-4 rounded-lg overflow-hidden h-48">
                    <img
                      src={value.image || "/placeholder.svg"}
                      alt={value.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-sport-darkMatte dark:text-white">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {value.content}
                  </p>
                </TabsContent>
              ))}
            </Tabs>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="shrink-0 mt-1 bg-sport-AquaLight/10 p-2 rounded-full">
                    <FeatureIcon iconName={feature.icon} />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-sport-darkMatte dark:text-white">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* <div className="mt-8">
              <Button className="bg-sport-AquaLight hover:bg-sport-AquaLight/90 text-white rounded-full group">
                <span>Conoce más sobre nosotros</span>
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div> */}
          </div>

          {/* Columna derecha: Imágenes */}
          <div className="hidden lg:block">
            <div className="relative h-150 overflow-hidden">
              {" "}
              {/* Added overflow-hidden */}
              {/* Imagen principal */}
              <div className="absolute top-0 right-0 w-4/5 h-80 rounded-lg shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Instalaciones del club"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Imagen secundaria 1 */}
              <div className="absolute top-64 left-0 w-2/3 h-64 rounded-lg shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Entrenamiento grupal"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Imagen secundaria 2 */}
              <div className="absolute bottom-0 right-12 w-1/2 h-56 rounded-lg shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Entrenamiento personal"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decoración */}
              <div className="absolute -bottom-6 left-10 w-20 h-20 rounded-full bg-sport-AquaLight/20 z-10" />
              <div className="absolute top-12 left-16 w-12 h-12 rounded-full bg-sport-AquaLight/10 z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;

import {
  MapPin,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  ArrowRight,
  TurtleIcon as Tennis,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import landingContent from "@/data/landingContent.json";

const iconMap = {
  Facebook,
  Twitter,
  Instagram,
};

const Footer = () => {
  const {
    quickLinks,
    servicesLinks,
    socialLinks,
    clubInfo,
    newsletter,
  } = landingContent.footer;

  const {
    
    hours,
  } = landingContent;

  // Mapa de iconos sociales usando los nombres del JSON
  const SocialIcon = ({ iconName }) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="h-5 w-5" /> : null;
  };

  return (
    <footer className="bg-sport-dark text-white pt-20 pb-8">
      <div className="container mx-auto px-4">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-16">
          {/* Club info */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-sport-AquaLight/20 rounded-full"></div>
                <img
                  src="/logo-sin-fondo-1-1920x1920.png"
                  alt="Portoviejo Tenis Club"
                  className="h-full w-full object-contain "
                  onError={(e) => {
                    const target = e.target;
                    target.src = "/placeholder.svg?height=64&width=64";
                  }}
                />
              </div>
              <div>
                <span className="font-bold text-xl text-white">Portoviejo</span>
                <span className="block text-sm text-sport-AquaLight font-medium">
                  Tennis Club
                </span>
              </div>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">
              {clubInfo.description}
            </p>

            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="bg-white/10 hover:bg-sport-AquaLight/20 p-3 rounded-full transition-colors duration-300"
                  aria-label={social.label}
                >
                  <SocialIcon iconName={social.icon} />
                </a>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-sport-AquaLight shrink-0 mt-1" />
                <span className="text-gray-300">{clubInfo.address}</span>
              </div>
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-3 text-sport-AquaLight shrink-0 mt-1" />
                <span className="text-gray-300">{clubInfo.phone}</span>
              </div>
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-3 text-sport-AquaLight shrink-0 mt-1" />
                <span className="text-gray-300">{clubInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold mb-6 relative">
              {quickLinks.title}
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-sport-AquaLight"></span>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-sport-AquaLight transition-colors duration-300 flex items-center group"
                  >
                    <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-6 group-hover:ml-0" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold mb-6 relative">
              {servicesLinks.title}
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-sport-AquaLight"></span>
            </h3>
            <ul className="space-y-3">
              {servicesLinks.map((service, index) => (
                <li key={index}>
                  <a
                    href={service.href}
                    className="text-gray-300 hover:text-sport-AquaLight transition-colors duration-300 flex items-center group"
                  >
                    <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -ml-6 group-hover:ml-0" />
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold mb-6 relative">
              {hours.title}
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-sport-AquaLight"></span>
            </h3>
            <ul className="space-y-3">
              {hours.schedule.map((item, index) => (
                <li key={index} className="flex items-start">
                  <Clock className="h-5 w-5 mr-3 text-sport-AquaLight shrink-0 mt-1" />
                  <div>
                    <span className="text-white font-medium">{item.days}:</span>
                    <span className="text-gray-300 ml-2">{item.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          {/* <div className="lg:col-span-2">
            <h3 className="text-lg font-bold mb-6 relative">
              {newsletter.title}
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-sport-AquaLight"></span>
            </h3>
            <p className="text-gray-300 mb-4">{newsletter.description}</p>
            <div className="flex">
              <Input
                type="email"
                placeholder="Tu email"
                className="rounded-r-none border-gray-700 bg-gray-800 focus:border-sport-AquaLight"
              />
              <Button className="rounded-l-none bg-sport-AquaLight hover:bg-sport-AquaLight/90">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div> */}
        </div>

        <Separator className="bg-gray-800" />

        {/* Bottom section */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Portoviejo Tennis Club. Todos los
            derechos reservados.
          </p>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-gray-400 hover:text-sport-AquaLight text-sm"
            >
              Términos y Condiciones
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-sport-AquaLight text-sm"
            >
              Política de Privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

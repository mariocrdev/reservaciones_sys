import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogIn,
  Home,
  LayoutDashboard,
  BadgeDollarSign,
  MessageSquareQuote,
  Clock,
  Handshake,
  Building2,
  UsersRound,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import landingContent from "@/data/landingContent.json";
import { ThemeToggle } from "../global/ThemeToggle";

const iconMap = {
  Home,
  Handshake,
  Building2,
  UsersRound,
  Mail,
  BadgeDollarSign,
  MessageSquareQuote,
  Clock,
};

const Navbar = () => {
  const { session } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // scrolled state variable was defined but unused in visual logic previously, 
  // keeping logic intact but could be used for extra style changes if needed.
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState("light");
  const [activeSection, setActiveSection] = useState("inicio");

  // Detectar sección activa
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "inicio",
        "servicios",
        "instalaciones",
        "nosotros",
        "membresia",
        "testimonios",
        "horarios",
        "contact",
      ];
      let current = "inicio";
      
      // Lógica de scroll
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            current = section;
          }
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Alternar tema claro/oscuro
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
  };

  // Cargar tema desde localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const mainNavLinks = landingContent.navbar.mainLinks;
  const secondaryNavLinks = landingContent.navbar.secondaryLinks;
  const allNavLinks = [...mainNavLinks, ...secondaryNavLinks];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        // Diseño condicional: Transparente arriba, Glass al bajar
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-b border-border/40 py-2 shadow-sm" 
          : "bg-transparent py-4 border-b border-white/5 backdrop-blur-[2px]"
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo y nombre */}
          <div className="flex items-center gap-2">
            <a href="#" className="flex items-center group">
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full overflow-hidden border border-white/10 transition-transform group-hover:scale-105">
                <img
                  src="https://files.mariocr.dev/perfil.jpeg"
                  alt="reservacionSys"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target;
                    target.src = "/placeholder.svg?height=64&width=64";
                  }}
                />
              </div>
            </a>
          </div>

          {/* Desktop Menu - Minimalista y sin contenedores sólidos */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-1">
              {mainNavLinks.map((link) => {
                 const isActive = activeSection === link.href.substring(1);
                 return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-2 text-sm font-medium transition-all relative",
                      isActive 
                        ? "text-primary font-semibold" 
                        : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    {link.label}
                    {/* Indicador de activo: pequeño punto brillante o línea suave */}
                    <span 
                        className={cn(
                            "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary transition-all duration-300 rounded-full",
                            isActive ? "w-4 opacity-100" : "w-0 opacity-0"
                        )} 
                    />
                  </a>
                );
              })}

              {/* Menú desplegable "Más" */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="px-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-transparent data-[state=open]:text-primary"
                  >
                    Más
                    <ChevronDown className="ml-1 h-3 w-3 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 backdrop-blur-xl bg-background/90 border-border/50">
                  {secondaryNavLinks.map((link) => {
                    const IconComp = iconMap[link.icon];
                    return (
                      <DropdownMenuItem key={link.href} asChild className="focus:bg-primary/10 cursor-pointer rounded-md">
                        <a href={link.href} className="flex items-center gap-3 py-2">
                          {IconComp && <IconComp className="h-4 w-4 text-primary" />}
                          <span className="text-sm">{link.label}</span>
                        </a>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="h-4 w-px bg-border/50 mx-2" /> {/* Separador sutil */}

            <div className="flex items-center gap-3">
              <ThemeToggle />

              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-full border-border/50 bg-background/50 hover:bg-background/80 backdrop-blur-sm pl-2 pr-4 gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-3 w-3 text-primary" />
                      </div>
                      <span className="hidden xl:inline text-sm font-normal">Mi Cuenta</span>
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 backdrop-blur-xl bg-background/90">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        <span>Mi Panel</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        <span>Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button size="sm" className="rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                    <LogIn className="h-3 w-3 mr-2" />
                    <span>Ingresar</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-3">
            <ThemeToggle />
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMenu} 
                className="hover:bg-transparent text-foreground"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Full width glass dropdown */}
      <div 
        className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-in-out border-b border-border/40",
            isMenuOpen ? "max-h-[80vh] opacity-100 bg-background/95 backdrop-blur-xl shadow-2xl" : "max-h-0 opacity-0"
        )}
      >
        <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Grid de enlaces limpio */}
            <div className="grid grid-cols-2 gap-3">
              {allNavLinks.map((link) => {
                const IconComp = iconMap[link.icon];
                const isActive = activeSection === link.href.substring(1);
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-xl transition-all border border-transparent",
                      isActive 
                        ? "bg-primary/10 border-primary/20 text-primary" 
                        : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {IconComp && (
                      <IconComp className={cn("h-5 w-5 mb-2", isActive ? "text-primary" : "text-muted-foreground")} />
                    )}
                    <span className="text-xs font-medium">{link.label}</span>
                  </a>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border/50">
              {session ? (
                <Link to="/dashboard" onClick={closeMenu}>
                  <Button className="w-full rounded-full" size="lg">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Ir al Panel
                  </Button>
                </Link>
              ) : (
                <Link to="/auth" onClick={closeMenu}>
                  <Button className="w-full rounded-full" size="lg">
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
            </div>
          </div>
      </div>
    </nav>
  );
};

export default Navbar;
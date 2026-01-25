import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import {
  Home,
  CalendarDays,
  User,
  Settings,
  LayoutDashboard,
  LogOut,
  CalendarCheck,
  Medal,
  Blocks,
  CalendarCheck2,
  Bell,
  ChevronDown,
  HelpCircle,
  Moon,
  Sun,
  UserCircle,
  ChevronRight,
  BookOpen,
  Clock,
  Calendar,
  Users,
} from "lucide-react";
import { GraduationCap } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useProfilesStore from "@/stores/profile/profilesStore";
import Loading from "@/components/global/Loading";

const userNavItems = [
  {
    title: "Panel",
    url: "/dashboard",
    icon: Home,
    description: "Vista general de tu cuenta",
  },
  {
    title: "Instalaciones",
    url: "/facilities",
    icon: CalendarDays,
    description: "Reserva canchas y espacios",
  },
  {
    title: "Cursos",
    url: "/courses",
    icon: BookOpen,
    description: "Inscripciones a cursos",
  },
  {
    title: "Inscripciones",
    url: "/enrolments",
    icon: Calendar,
    description: "Gestiona tus inscripciones a los cursos",
  },
  {
    title: "Mi Perfil",
    url: "/profile",
    icon: UserCircle,
    description: "Gestiona tu información",
  },
  {
    title: "Niños",
    url: "/profile/childrens",
    icon: Users,
    description: "Gestiona la informacion de tus niños",
  },
];

const adminNavItems = [
  {
    title: "Panel Admin",
    url: "/admin",
    icon: LayoutDashboard,
    description: "Vista general administrativa",
  },
  {
    title: "Instalaciones",
    url: "/admin/facilities",
    icon: Blocks,
    description: "Gestión de instalaciones",
    badge: "3",
  },
  {
    title: "Reservas",
    icon: CalendarCheck,
    description: "Gestión de reservas y horarios",
    subItemsReservations: [
      {
        title: "Reservas",
        url: "/admin/reservations",
        icon: CalendarCheck,
        description: "Administración de reservas",
        badge: "5",
      },
      {
        title: "Horarios reservas",
        url: "/admin/schedules",
        icon: Clock,
        description: "Configuración de horarios",
      },
    ],
  },
  {
    title: "Cursos",
    icon: BookOpen,
    description: "Gestión de reservas y horarios",
    subItemsCourses: [
      {
        title: "Cursos",
        url: "/admin/courses",
        icon: BookOpen,
        description: "Administración de cursos",
      },
      {
        title: "Instructores",
        url: "/admin/instructors",
        icon: GraduationCap,
        description: "Administrar los instructores para los cursos",
      },
      {
        title: "Inscripciones",
        url: "/admin/enrolments",
        icon: Calendar,
        description: "Manejo de inscripciones a cursos",
      },
    ],
  },
];

export function AppSidebar({ children }) {
  const { session, signOut, isAdmin, loading: loadingAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState("light");
  const {
    profile,
    getProfileByUserId,
    loading: loadingProfile,
  } = useProfilesStore();
  // State to manage expanded/collapsed state of Reservas & Courses section
  const [isReservasExpanded, setIsReservasExpanded] = useState(false);
  const [isCoursesExpanded, setIsCoursesExpanded] = useState(false);

  useEffect(() => {
    if (session.user.id) {
      getProfileByUserId(session.user.id);
    }
  }, [getProfileByUserId]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleSignOut = async () => {
    const { error } = await signOut.mutateAsync();
    if (error) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cierre de sesión exitoso",
        description: "Hasta pronto!",
      });
    }
    return <Navigate to="/auth" replace />;
  };

  const getPageTitle = () => {
    if (location.pathname === "/dashboard") return "Mi Panel";
    if (location.pathname === "/facilities") return "Instalaciones";
    if (location.pathname === "/profile") return "Mi Perfil";
    if (location.pathname === "/admin") return "Administración";
    if (location.pathname === "/courses") return "Cursos";
    if (location.pathname === "/enrolments") return "Inscripciones";
    if (location.pathname === "/profile/childrens") return "Niños";
    if (location.pathname.includes("/facilities/"))
      return "Detalle de Instalación";
    return "Tennis Club Portoviejo";
  };

  const getUserInitials = () => {
    if (!session?.user?.email) return "U";
    return session.user.email.charAt(0).toUpperCase();
  };

  if (loadingProfile || loadingAuth) {
    return <Loading />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="border-b border-border">
            <div className="flex h-16 items-center px-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="relative h-10 w-10 overflow-hidden rounded-md bg-primary/10">
                  <img
                    className="h-full w-full object-contain p-1"
                    src="/logo-sin-fondo-1-1920x1920.png"
                    alt="Portoviejo Tenis Club"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=40&width=40";
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">Tennis Club</span>
                  <span className="text-xs text-muted-foreground">
                    Portoviejo
                  </span>
                </div>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {session && (
              <>
                {isAdmin && (
                  <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center text-primary font-medium">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Administración
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {adminNavItems.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            {item.subItemsReservations ? (
                              <>
                                <SidebarMenuButton
                                  onClick={() =>
                                    setIsReservasExpanded(!isReservasExpanded)
                                  }
                                  className="flex items-center justify-between"
                                  tooltip={item.description}
                                >
                                  <div className="flex items-center">
                                    <item.icon className="mr-2 h-4 w-4" />
                                    <span>{item.title}</span>
                                  </div>
                                  <ChevronRight
                                    className={`h-4 w-4 transition-transform ${
                                      isReservasExpanded ? "rotate-90" : ""
                                    }`}
                                  />
                                </SidebarMenuButton>
                                {isReservasExpanded && (
                                  <div className="ml-6">
                                    {item.subItemsReservations.map(
                                      (subItem) => (
                                        <SidebarMenuItem key={subItem.title} className="mt-1">
                                          <SidebarMenuButton
                                            asChild
                                            isActive={
                                              location.pathname === subItem.url
                                            }
                                            tooltip={subItem.description}
                                          >
                                            <Link to={subItem.url}>
                                              <subItem.icon />
                                              <span>{subItem.title}</span>
                                            </Link>
                                          </SidebarMenuButton>
                                        </SidebarMenuItem>
                                      )
                                    )}
                                  </div>
                                )}
                              </>
                            ) : item.subItemsCourses ? (
                              <>
                                <SidebarMenuButton
                                  onClick={() =>
                                    setIsCoursesExpanded(!isCoursesExpanded)
                                  }
                                  className="flex items-center justify-between"
                                  tooltip={item.description}
                                >
                                  <div className="flex items-center">
                                    <item.icon className="mr-2 h-4 w-4" />
                                    <span>{item.title}</span>
                                  </div>
                                  <ChevronRight
                                    className={`h-4 w-4 transition-transform ${
                                      isCoursesExpanded ? "rotate-90" : ""
                                    }`}
                                  />
                                </SidebarMenuButton>
                                {isCoursesExpanded && (
                                  <div className="ml-6">
                                    {item.subItemsCourses.map((subItem) => (
                                      <SidebarMenuItem key={subItem.title} className="mt-1">
                                        <SidebarMenuButton
                                          asChild
                                          isActive={
                                            location.pathname === subItem.url
                                          }
                                          tooltip={subItem.description}
                                        >
                                          <Link to={subItem.url}>
                                            <subItem.icon />
                                            <span>{subItem.title}</span>
                                          </Link>
                                        </SidebarMenuButton>
                                      </SidebarMenuItem>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : (
                              <SidebarMenuButton
                                asChild
                                isActive={location.pathname === item.url}
                                tooltip={item.description}
                              >
                                <Link to={item.url} className="relative">
                                  <item.icon />
                                  <span>{item.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            )}
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                )}

                <SidebarGroup>
                  <SidebarGroupLabel className="flex items-center text-primary font-medium">
                    <User className="mr-2 h-4 w-4" />
                    Usuario
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {userNavItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={location.pathname === item.url}
                            tooltip={item.description}
                          >
                            <Link to={item.url}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel className="flex items-center text-primary font-medium">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Soporte
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip="Centro de ayuda">
                          <a href="#" target="_blank" rel="noopener noreferrer">
                            <HelpCircle />
                            <span>Ayuda</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </>
            )}
          </SidebarContent>
          <SidebarFooter className="border-t border-border">
            {session && (
              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar>
                    <AvatarImage src={profile[0]?.profile_image_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm truncate max-w-[150px]">
                      {session.user?.email || "Usuario"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {isAdmin ? "Administrador" : "Miembro"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTheme}
                    className="justify-start"
                  >
                    {theme === "light" ? (
                      <Moon className="mr-2 h-4 w-4" />
                    ) : (
                      <Sun className="mr-2 h-4 w-4" />
                    )}
                    {theme === "light" ? "Oscuro" : "Claro"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="justify-start"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Salir
                  </Button>
                </div>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col flex-1">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="font-semibold">{getPageTitle()}</div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 py-6">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile[0]?.profile_image_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block">
                      {profile[0]?.first_name} {profile[0]?.last_name}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AppSidebar;

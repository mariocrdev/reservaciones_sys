import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Navigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfile } from "@/hooks/useProfile";
import Loading from "@/components/global/Loading";
import {
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  ChevronsUpDown,
  ChevronDown,
  UserCircle,
  Home,
} from "lucide-react";
import { toast } from "sonner";

const userNavItems = [
  {
    title: "Panel",
    url: "/dashboard",
    icon: "lucide:layout-dashboard",
    description: "Vista general de tu cuenta",
  },
  {
    title: "Cursos",
    url: "/dashboard/courses",
    icon: "solar:book-bookmark-bold-duotone",
    description: "Inscripciones a cursos",
  },
  {
    title: "Membresías",
    url: "/memberships",
    icon: "lucide:credit-card",
    description: "Adquiere y gestiona tus membresías",
  },
  {
    title: "Mis Reservaciones",
    url: "/my-reservations",
    icon: "fluent-mdl2:reservation-orders",
    description: "Gestiona tus reservas de instalaciones",
  },
  {
    title: "Inscripciones",
    url: "/dashboard/enrolments",
    icon: "lucide:clipboard-list",
    description: "Gestiona tus inscripciones a los cursos",
  },
  {
    title: "Mi Perfil",
    url: "/profile",
    icon: "lucide:user",
    description: "Gestiona tu información",
  },
  {
    title: "Mi familia",
    url: "/profile/family",
    icon: "lucide:users",
    description: "Gestiona la informacion de tus niños",
  },
];

const adminNavItems = [
  {
    title: "Panel Admin",
    url: "/admin/dashboard",
    icon: "solar:widget-bold-duotone",
    description: "Vista general administrativa",
  },
  {
    title: "Usuarios",
    url: "/admin/users",
    icon: "solar:widget-bold-duotone",
    description: "Gestión de usuarios",
  },
  {
    title: "Pagos",
    url: "/admin/payments",
    icon: "solar:bill-list-bold-duotone",
    description: "Gestión de pagos y comprobantes",
  },

  {
    title: "Reservas",
    icon: "solar:calendar-mark-bold-duotone",
    description: "Gestión de reservas y horarios",
    subItemsReservations: [
      {
        title: "Instalaciones",
        url: "/admin/facilities",
        icon: "solar:city-bold-duotone",
        description: "Gestión de instalaciones",
        badge: "3",
      },
      {
        title: "Reservas",
        url: "/admin/reservations",
        icon: "solar:calendar-mark-bold-duotone",
        description: "Administración de reservas",
        badge: "5",
      },
    ],
  },

  {
    title: "Membresías",
    icon: "solar:users-group-rounded-bold-duotone",
    description: "Gestión de suscripciones y planes de membresía",
    subItemsReservations: [
      {
        title: "Planes",
        url: "/admin/memberships",
        icon: "solar:tag-price-bold-duotone",
        description: "Gestión de planes de membresía",
      },
      {
        title: "Suscripciones",
        url: "/admin/subscriptions",
        icon: "solar:users-group-rounded-bold-duotone",
        description: "Gestión de suscripciones de usuarios",
      },
    ],
  },
  {
    title: "Cursos",
    icon: "solar:notebook-bold-duotone",
    description: "Gestión de cursos e inscripciones",
    subItemsCourses: [
      {
        title: "Cursos",
        url: "/admin/courses",
        icon: "solar:book-bookmark-bold-duotone",
        description: "Administración de cursos",
      },
      {
        title: "Inscripciones",
        url: "/admin/enrolments",
        icon: "solar:clipboard-check-bold-duotone",
        description: "Manejo de inscripciones a cursos",
      },
    ],
  },
];

export function AppSidebar({ children }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebarContent>{children}</AppSidebarContent>
    </SidebarProvider>
  );
}

function AppSidebarContent({ children }) {
  const { session, signOut, loading: loadingAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { data: profile, isLoading: loadingProfile } = useProfile(
    session?.user?.id,
  );
  const isAdmin = profile?.role === "admin";
  const { state } = useSidebar();
  // State to manage expanded/collapsed state of Reservas & Courses section
  const [isReservasExpanded, setIsReservasExpanded] = useState(false);
  const [isCoursesExpanded, setIsCoursesExpanded] = useState(false);

  // Estado dinámico para manejar la expansión de submenús
  // La clave es el título del item, el valor es booleano (expandido o no)
  const [expandedItems, setExpandedItems] = useState({});

  const toggleItem = (title) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Theme logic removed - handled by ThemeContext

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Error al cerrar sesión");
    } else {
      toast.success("sesión cerrada correctamente");
      navigate("/auth/login");
    }
  };

  const getPageTitle = () => {
    if (location.pathname === "/dashboard") return "Mi Panel";
    if (location.pathname === "/facilities") return "Instalaciones";
    if (location.pathname === "/profile") return "Mi Perfil";
    if (location.pathname === "/admin/dashboard") return "Panel Global";
    if (location.pathname === "/admin") return "Administración";
    if (location.pathname === "/admin/memberships")
      return "Planes de Membresía";
    if (location.pathname === "/admin/payments") return "Gestión de Pagos";
    if (location.pathname === "/my-reservations") return "Mis Reservaciones";
    if (location.pathname === "/memberships") return "Membresías";
    if (location.pathname === "/dashboard/courses") return "Cursos";
    if (location.pathname === "/dashboard/enrolments") return "Mis Inscripciones";
    if (location.pathname === "/profile/childrens") return "Niños";
    if (location.pathname.includes("/facilities/"))
      return "Detalle de Instalación";
    return "Club Deportivo";
  };

  const getUserInitials = () => {
    if (!session?.user?.email) return "U";
    return session.user.email.charAt(0).toUpperCase();
  };

  const renderMenuItem = (item) => {
    // Determinar si el item tiene subitems (cualquier propiedad que empiece con 'subItems')
    const subItemsKey = Object.keys(item).find(key => key.startsWith('subItems'));
    const subItems = subItemsKey ? item[subItemsKey] : null;
    const isExpanded = expandedItems[item.title] || false;

    return (
      <SidebarMenuItem key={item.title}>
        {subItems ? (
          state === "collapsed" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.description}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Icon icon={item.icon} className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="start"
                className="min-w-56 rounded-lg bg-sidebar text-sidebar-foreground border-sidebar-border"
              >
                <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {subItems.map((subItem) => (
                  <DropdownMenuItem key={subItem.title} asChild>
                    <Link
                      to={subItem.url}
                      className="flex items-center w-full cursor-pointer gap-2"
                    >
                      <Icon icon={subItem.icon} className="h-4 w-4" />
                      <span>{subItem.title}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <SidebarMenuButton
                onClick={() => toggleItem(item.title)}
                className="flex items-center justify-between"
                tooltip={item.description}
              >
                <div className="flex items-center">
                  <Icon icon={item.icon} className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </div>
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""
                    }`}
                />
              </SidebarMenuButton>
              {isExpanded && (
                <div className="ml-6 border-l pl-2">
                  {subItems.map((subItem) => (
                    <SidebarMenuItem key={subItem.title} className="mt-1">
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === subItem.url}
                        tooltip={subItem.description}
                      >
                        <Link to={subItem.url}>
                          <Icon icon={subItem.icon} className="h-4 w-4" />
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </div>
              )}
            </>
          )
        ) : (
          <SidebarMenuButton
            asChild
            isActive={location.pathname === item.url}
            tooltip={item.description}
          >
            <Link to={item.url} className="relative">
              <Icon icon={item.icon} className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    );
  };

  if (loadingProfile || loadingAuth) {
    return <Loading />;
  }

  return (
    <>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                    <Icon
                      icon="emojione-monotone:sports-medal"
                      className="size-5"
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      Club Deportivo
                    </span>
                    <span className="truncate text-xs">Portoviejo</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {session && (
            <>
              {isAdmin && (
                <SidebarGroup>
                  <SidebarGroupLabel className="flex items-center text-primary font-medium">
                    <Icon
                      icon="solar:widget-bold-duotone"
                      className="mr-2 h-4 w-4"
                    />
                    Administración
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {adminNavItems.map(renderMenuItem)}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}

              <SidebarGroup>
                <SidebarGroupLabel className="flex items-center text-primary font-medium">
                  <Icon icon="tdesign:user-filled" className="mr-2 h-4 w-4" />
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
                            <Icon icon={item.icon} className="h-4 w-4" />
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
                  <Icon icon="bx:support" className="mr-2 h-4 w-4" />
                  Soporte
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Centro de ayuda">
                        <a href="#" target="_blank" rel="noopener noreferrer">
                          <Icon
                            icon="material-symbols:contact-support"
                            className="h-4 w-4"
                          />
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
        <SidebarFooter>
          {session && (
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={profile?.profile_image_url || ""} />
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {profile?.first_name
                            ? `${profile?.first_name} ${profile?.last_name}`
                            : "Usuario"}
                        </span>
                        <span className="truncate text-xs">
                          {session.user?.email}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage src={profile?.profile_image_url || ""} />
                          <AvatarFallback className="rounded-lg">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {profile?.first_name} {profile?.last_name}
                          </span>
                          <span className="truncate text-xs">
                            {session.user?.email}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={toggleTheme}
                      className="cursor-pointer"
                    >
                      {theme === "light" ? (
                        <Moon className="mr-2 h-4 w-4" />
                      ) : (
                        <Sun className="mr-2 h-4 w-4" />
                      )}
                      <span>
                        {theme === "light" ? "Modo Oscuro" : "Modo Claro"}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </SidebarFooter>
      </Sidebar>
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-5 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <div className="font-semibold">{getPageTitle()}</div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </>
  );
}

export default AppSidebar;

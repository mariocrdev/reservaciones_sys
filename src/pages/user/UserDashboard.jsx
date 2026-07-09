import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useUserReservations } from "@/hooks/useReservations";
import { useEnrolments } from "@/hooks/useEnrolments";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import {
  Calendar,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Users,
  BookOpen,
  CreditCard,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_MAP = {
  // Reservations & Enrolments
  pending:   { label: "Pendiente",  color: "text-amber-500",  bg: "bg-amber-500/10",  icon: Clock        },
  confirmed: { label: "Confirmada", color: "text-emerald-500",bg: "bg-emerald-500/10", icon: CheckCircle2 },
  cancelled: { label: "Cancelada",  color: "text-rose-500",   bg: "bg-rose-500/10",   icon: XCircle      },
  completed: { label: "Completada", color: "text-sky-500",    bg: "bg-sky-500/10",    icon: CheckCircle2 },
  // Subscriptions
  active:    { label: "Activa",     color: "text-emerald-500",bg: "bg-emerald-500/10", icon: CheckCircle2 },
  inactive:  { label: "Inactiva",   color: "text-gray-400",   bg: "bg-gray-400/10",   icon: AlertCircle  },
  past_due:  { label: "Vencida",    color: "text-rose-500",   bg: "bg-rose-500/10",   icon: AlertCircle  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] ?? { label: status, color: "text-muted-foreground", bg: "bg-muted", icon: AlertCircle };
  const Ico = s.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full", s.bg, s.color)}>
      <Ico className="w-3 h-3" />
      {s.label}
    </span>
  );
};

/** Parse a Postgres tsrange like "[2026-04-23 10:00, 2026-04-23 11:00)" */
const parseTsRange = (tsrange) => {
  if (!tsrange) return null;
  const match = tsrange.match(/\[(.+),\s*(.+)\)/);
  if (!match) return null;
  return { start: new Date(match[1].trim()), end: new Date(match[2].trim()) };
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const formatTime = (d) =>
  d ? new Date(d).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "—";

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color = "text-sport-AquaLight", bg = "bg-sport-AquaLight/10", loading }) => (
  <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-4">
    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", bg)}>
      <Icon icon={icon} className={cn("w-6 h-6", color)} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">{label}</p>
      {loading ? (
        <Skeleton className="h-7 w-16 mb-1" />
      ) : (
        <p className="text-2xl font-extrabold tracking-tight">{value ?? "—"}</p>
      )}
      {sub && <p className="text-xs text-muted-foreground mt-0.5 truncate">{sub}</p>}
    </div>
  </div>
);

// ─── Quick Actions ─────────────────────────────────────────────────────────────
const quickActions = [
  {
    icon: "solar:calendar-add-bold",
    label: "Reservar instalación",
    desc: "Canchas, piscina, gimnasio…",
    to: "/my-reservations",
    color: "bg-cyan-500/10 text-cyan-500",
  },
  {
    icon: "solar:book-2-bold",
    label: "Ver catálogo de cursos",
    desc: "Natación, tenis, padel…",
    to: "/dashboard/courses",
    color: "bg-violet-500/10 text-violet-500",
  },
  {
    icon: "solar:card-2-bold",
    label: "Mis membresías",
    desc: "Planes activos y renovaciones",
    to: "/memberships",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: "solar:users-group-rounded-bold",
    label: "Gestionar familia",
    desc: "Inscribir a tus hijos en cursos",
    to: "/profile/family",
    color: "bg-emerald-500/10 text-emerald-500",
  },
];

// ─── Subscription Widget ───────────────────────────────────────────────────────
const SubscriptionWidget = ({ subs, loading }) => {
  const active = subs?.find((s) => s.status === "active");

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          Membresía Actual
        </h3>
        <Link to="/memberships" className="text-xs text-sport-AquaLight hover:underline font-medium">
          Gestionar
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      ) : active ? (
        <>
          <p className="font-bold text-lg mb-1">
            {active.plan?.product?.name} — {active.plan?.name ?? "Plan"}
          </p>
          <StatusBadge status={active.status} />
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Inicio</p>
              <p>{formatDate(active.start_date)}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Vence</p>
              <p>{formatDate(active.end_date)}</p>
            </div>
          </div>
          {/* Days remaining bar */}
          {active.end_date && (() => {
            const total = new Date(active.end_date) - new Date(active.start_date);
            const remaining = new Date(active.end_date) - Date.now();
            const pct = Math.max(0, Math.min(100, (remaining / total) * 100));
            return (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Tiempo restante</span>
                  <span>{Math.ceil(remaining / 86400000)} días</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          <p className="text-sm mb-3">Sin membresía activa</p>
          <Link to="/memberships">
            <Button size="sm" className="rounded-full bg-sport-AquaLight hover:bg-sport-AquaLight/90 text-white text-xs">
              Ver planes
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

// ─── Recent Reservations ───────────────────────────────────────────────────────
const RecentReservations = ({ reservations, loading }) => {
  const recent = reservations?.slice(0, 4) ?? [];

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          Mis Reservaciones
        </h3>
        <Link to="/my-reservations" className="text-xs text-sport-AquaLight hover:underline font-medium">
          Ver todas
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : recent.length === 0 ? (
        <EmptyState
          icon="solar:calendar-add-linear"
          text="No tienes reservaciones aún."
          linkTo="/my-reservations"
          linkLabel="Hacer reservación"
        />
      ) : (
        <ul className="space-y-3">
          {recent.map((r) => {
            const range = parseTsRange(r.booked_period);
            return (
              <li key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon icon="solar:buildings-bold" className="w-5 h-5 text-cyan-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{r.facilities?.name ?? "Instalación"}</p>
                  {range && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(range.start)} · {formatTime(range.start)} – {formatTime(range.end)}
                    </p>
                  )}
                </div>
                <StatusBadge status={r.status} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

// ─── Recent Enrolments ─────────────────────────────────────────────────────────
const RecentEnrolments = ({ enrolments, loading }) => {
  const recent = enrolments?.slice(0, 4) ?? [];

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          Mis Inscripciones
        </h3>
        <Link to="/dashboard/enrolments" className="text-xs text-sport-AquaLight hover:underline font-medium">
          Ver todas
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      ) : recent.length === 0 ? (
        <EmptyState
          icon="solar:book-2-linear"
          text="Sin inscripciones activas."
          linkTo="/dashboard/courses"
          linkLabel="Explorar cursos"
        />
      ) : (
        <ul className="space-y-3">
          {recent.map((e) => {
            const courseName = e.course_slots?.courses?.name ?? "Curso";
            const category   = e.course_slots?.courses?.category ?? "";
            const member     = e.profiles
              ? `${e.profiles.first_name} ${e.profiles.last_name}`
              : e.family_members
                ? `${e.family_members.first_name} ${e.family_members.last_name} (hijo/a)`
                : "";
            return (
              <li key={e.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon icon="solar:book-bookmark-bold" className="w-5 h-5 text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{courseName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[category, member].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <StatusBadge status={e.status} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon, text, linkTo, linkLabel }) => (
  <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
      <Icon icon={icon} className="w-6 h-6 text-muted-foreground" />
    </div>
    <p className="text-sm text-muted-foreground">{text}</p>
    {linkTo && (
      <Link to={linkTo}>
        <Button size="sm" variant="outline" className="rounded-full text-xs h-7 px-4">
          {linkLabel}
        </Button>
      </Link>
    )}
  </div>
);

// ─── Greeting ─────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "¡Buenos días";
  if (h < 19) return "¡Buenas tardes";
  return "¡Buenas noches";
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
const UserDashboard = () => {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data: profile, isLoading: loadingProfile } = useProfile(userId);
  const { data: reservations, isLoading: loadingRes } = useUserReservations(userId);
  const { enrolments, loading: loadingEnr, fetchUserEnrolments } = useEnrolments();
  const { data: familyMembers, isLoading: loadingFamily } = useFamilyMembers();

  // Fetch enrolments on mount
  useMemo(() => { fetchUserEnrolments(); }, [fetchUserEnrolments]);

  // ── Derived metrics ──────────────────────────────────────────
  const metrics = useMemo(() => {
    const totalRes           = reservations?.length ?? 0;
    const confirmedRes       = reservations?.filter((r) => r.status === "confirmed").length ?? 0;
    const pendingRes         = reservations?.filter((r) => r.status === "pending").length ?? 0;

    const activeEnrolments   = enrolments?.filter((e) => ["confirmed","pending"].includes(e.status)).length ?? 0;

    // Subscriptions come nested in profile or we fetch from reservations service
    // For now we parse from enrolments context — subscriptions are fetched via MembershipService
    // We'll show family count directly
    const familyCount        = familyMembers?.length ?? 0;

    return { totalRes, confirmedRes, pendingRes, activeEnrolments, familyCount };
  }, [reservations, enrolments, familyMembers]);

  const displayName = profile?.first_name
    ? `${profile.first_name}!`
    : session?.user?.email?.split("@")[0] ?? "Usuario!";

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* ── Greeting banner ── */}
      <div className="rounded-2xl bg-gradient-to-r from-sport-blueOcean to-sport-blueOcean/80 text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-white/20">
            <AvatarImage src={profile?.profile_image_url ?? ""} />
            <AvatarFallback className="bg-white/15 text-white font-bold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white/70 text-sm">{getGreeting()},</p>
            {loadingProfile ? (
              <Skeleton className="h-8 w-40 bg-white/20" />
            ) : (
              <h1 className="text-2xl font-extrabold tracking-tight">{displayName}</h1>
            )}
            <p className="text-white/60 text-xs mt-0.5">{session?.user?.email}</p>
          </div>
        </div>
        <Link to="/my-reservations">
          <Button className="rounded-full bg-sport-AquaLight hover:bg-sport-AquaLight/90 text-white font-semibold shadow-lg text-sm px-5 shrink-0">
            <Icon icon="solar:calendar-add-bold" className="mr-2 w-4 h-4" />
            Nueva Reserva
          </Button>
        </Link>
      </div>

      {/* ── Stat grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="solar:calendar-mark-bold"
          label="Total reservas"
          value={metrics.totalRes}
          sub={`${metrics.confirmedRes} confirmadas`}
          color="text-cyan-500"
          bg="bg-cyan-500/10"
          loading={loadingRes}
        />
        <StatCard
          icon="solar:hourglass-bold"
          label="Reservas pendientes"
          value={metrics.pendingRes}
          sub="Esperando pago"
          color="text-amber-500"
          bg="bg-amber-500/10"
          loading={loadingRes}
        />
        <StatCard
          icon="solar:book-bookmark-bold"
          label="Cursos activos"
          value={metrics.activeEnrolments}
          sub="Inscripciones vigentes"
          color="text-violet-500"
          bg="bg-violet-500/10"
          loading={loadingEnr}
        />
        <StatCard
          icon="solar:users-group-rounded-bold"
          label="Miembros familia"
          value={metrics.familyCount}
          sub="Dependientes registrados"
          color="text-emerald-500"
          bg="bg-emerald-500/10"
          loading={loadingFamily}
        />
      </div>

      {/* ── Quick actions ── */}
      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-sport-AquaLight" />
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to}>
              <div className="group rounded-2xl border border-border bg-card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", action.color)}>
                  <Icon icon={action.icon} className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm leading-snug">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground mt-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column: reservations + enrolments */}
        <div className="lg:col-span-2 space-y-6">
          <RecentReservations reservations={reservations} loading={loadingRes} />
          <RecentEnrolments   enrolments={enrolments}    loading={loadingEnr}  />
        </div>

        {/* Right column: subscription + family */}
        <div className="space-y-6">
          <SubscriptionWidget subs={[]} loading={false} />

          {/* Family members widget */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                Mi Familia
              </h3>
              <Link to="/profile/family" className="text-xs text-sport-AquaLight hover:underline font-medium">
                Gestionar
              </Link>
            </div>

            {loadingFamily ? (
              <div className="space-y-2">
                {[1, 2].map((i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
              </div>
            ) : !familyMembers?.length ? (
              <EmptyState
                icon="solar:user-plus-rounded-linear"
                text="Aún no tienes miembros familiares."
                linkTo="/profile/family"
                linkLabel="Agregar persona"
              />
            ) : (
              <ul className="space-y-2">
                {familyMembers.map((m) => {
                  const age = m.date_of_birth
                    ? Math.floor((Date.now() - new Date(m.date_of_birth)) / 31557600000)
                    : null;
                  return (
                    <li key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-sm shrink-0">
                        {m.first_name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{m.first_name} {m.last_name}</p>
                        {age !== null && <p className="text-xs text-muted-foreground">{age} años</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Profile completion nudge */}
          {!loadingProfile && (!profile?.first_name || !profile?.phone) && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-amber-600 dark:text-amber-400 mb-1">
                    Completa tu perfil
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Agrega tu nombre y teléfono para agilizar las reservas.
                  </p>
                  <Link to="/profile">
                    <Button size="sm" className="rounded-full text-xs h-7 px-4 bg-amber-500 hover:bg-amber-500/90 text-white">
                      Actualizar perfil
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;

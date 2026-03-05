import { useGlobalMetrics } from "@/hooks/admin/useAdminDashboard";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import {
    Users,
    Building2,
    BookOpen,
    CalendarDays,
    UserCheck,
    GraduationCap,
    Banknote,
    TrendingUp,
    Activity
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
    const { data: metrics, isLoading, isError } = useGlobalMetrics();

    if (isError) {
        return (
            <div className="flex justify-center p-8 text-red-500">
                Error al cargar las métricas globales del sistema.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Panel Principal</h1>
                <p className="text-muted-foreground mt-2">
                    Resumen global de actividad y rendimiento del sistema.
                </p>
            </div>

            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 text-muted-foreground pb-2">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-[60px] mb-2" />
                                <Skeleton className="h-3 w-[120px]" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : metrics ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Fila 1: Finanzas e Ingresos */}
                    <Card className="bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-400">
                                Ingresos Recientes (Mes)
                            </CardTitle>
                            <Banknote className="h-4 w-4 text-green-600 dark:text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                                {new Intl.NumberFormat("es-CR", {
                                    style: "currency",
                                    currency: "USD",
                                }).format(metrics.finances?.paid?.amount || 0)}
                            </div>
                            <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">
                                <TrendingUp className="inline w-3 h-3 mr-1" />
                                {metrics.finances?.paid?.count || 0} transacciones exitosas
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Suscripciones Activas
                            </CardTitle>
                            <UserCheck className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.subscriptions}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Membresías vigentes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Inscripciones
                            </CardTitle>
                            <GraduationCap className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.enrolments}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Alumnos en cursos
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Reservaciones
                            </CardTitle>
                            <CalendarDays className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.reservations}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Instalaciones agendadas
                            </p>
                        </CardContent>
                    </Card>

                    {/* Fila 2: Entidades del Sistema */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Usuarios Totales
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.users}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Perfiles registrados
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Instalaciones Operativas
                            </CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.facilities}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Espacios activos
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Cursos Ofertados
                            </CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.courses}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Programas activos
                            </p>
                        </CardContent>
                    </Card>

                    {/* Card for failed/pending payments overview */}
                    <Card className="bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Cobros Pendientes
                            </CardTitle>
                            <Activity className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {new Intl.NumberFormat("es-CR", {
                                    style: "currency",
                                    currency: "USD",
                                }).format(metrics.finances?.pending?.amount || 0)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {metrics.finances?.pending?.count || 0} transacciones agendadas
                            </p>
                        </CardContent>
                    </Card>

                </div>
            ) : null}

            {/* Aqui en el futuro se pueden añadir Charts (Recharts) */}

        </div>
    );
}


import { useState, useEffect } from "react";
import { useAdminSubscriptions } from "@/hooks/admin/useAdminSubscriptions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BadgeCheck, Clock, Ban, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from "@/components/global/Loading";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { SubscriptionPaymentsModal } from "@/components/admin/subscriptions/SubscriptionPaymentsModal";
import { Copy, CreditCard, Users } from "lucide-react";

export default function SubscriptionsManagement() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState(null);
    const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);
    const limit = 20;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Reset page on status filter change
    useEffect(() => {
        setPage(1);
    }, [statusFilter]);

    const { data, isLoading, isError } = useAdminSubscriptions(
        page,
        limit,
        debouncedSearch,
        statusFilter === "all" ? "" : statusFilter
    );

    if (isLoading) return <Loading />;
    if (isError)
        return <div className="p-4 text-red-500">Error al cargar suscripciones</div>;

    const { subscriptions = [], count = 0 } = data || {};
    const totalPages = Math.ceil(count / limit);

    const getStatusBadge = (status) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>;
            case "pending":
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendiente</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Cancelado</Badge>;
            case "past_due":
                return <Badge variant="destructive">Vencido</Badge>;
            case "inactive":
                return <Badge variant="secondary">Inactivo</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">
                    Gestión de Suscripciones
                </h2>
                <div className="text-sm text-muted-foreground">
                    Total: {count} suscripciones
                </div>
            </div>

            <div className="flex gap-4">
                <Input
                    placeholder="Buscar por nombre o email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
                <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                        <SelectItem value="past_due">Vencido</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Plan / Producto</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Inicio</TableHead>
                            <TableHead>Fin</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscriptions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No se encontraron suscripciones.
                                </TableCell>
                            </TableRow>
                        ) : (
                            subscriptions.map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={sub.profile?.profile_image_url} />
                                                <AvatarFallback>{sub.profile?.first_name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {sub.profile?.first_name} {sub.profile?.last_name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{sub.profile?.email}</span>
                                            </div>
                                            {sub.family_member && (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full ml-1">
                                                            <Users className="h-4 w-4 text-blue-500" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-80">
                                                        <div className="grid gap-4">
                                                            <div className="space-y-2">
                                                                <h4 className="font-medium leading-none">Familiar</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Suscripción para miembro de la familia.
                                                                </p>
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <div className="grid grid-cols-3 items-center gap-4">
                                                                    <span className="text-sm font-medium">Nombre:</span>
                                                                    <span className="col-span-2 text-sm">
                                                                        {sub.family_member.first_name} {sub.family_member.last_name}
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-3 items-center gap-4">
                                                                    <span className="text-sm font-medium">Nacimiento:</span>
                                                                    <span className="col-span-2 text-sm">
                                                                        {sub.family_member.date_of_birth ? format(new Date(sub.family_member.date_of_birth), "dd MMM yyyy", { locale: es }) : "-"}
                                                                    </span>
                                                                </div>
                                                                {sub.family_member.medical_notes && (
                                                                    <div className="grid grid-cols-3 items-start gap-4">
                                                                        <span className="text-sm font-medium">Notas:</span>
                                                                        <span className="col-span-2 text-sm text-muted-foreground">
                                                                            {sub.family_member.medical_notes}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{sub.plan?.product?.name}</span>
                                            <span className="text-xs text-muted-foreground">{sub.plan?.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                                    <TableCell>
                                        {sub.start_date ? format(new Date(sub.start_date), "dd MMM yyyy", { locale: es }) : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {sub.end_date ? format(new Date(sub.end_date), "dd MMM yyyy", { locale: es }) : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {sub.plan?.price} {sub.plan?.currency}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedSubscriptionId(sub.id);
                                                setIsPaymentsModalOpen(true);
                                            }}
                                            title="Ver historial de pagos"
                                        >
                                            <CreditCard className="h-4 w-4 mr-2" />
                                            Pagos
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Página {page} de {totalPages || 1}
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => (totalPages > p ? p + 1 : p))}
                        disabled={page >= totalPages}
                    >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>


            <SubscriptionPaymentsModal
                subscriptionId={selectedSubscriptionId}
                open={isPaymentsModalOpen}
                onOpenChange={setIsPaymentsModalOpen}
            />
        </div >
    );
}

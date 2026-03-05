import { useEffect } from "react";
import { useAdminEnrolments } from "@/hooks/useEnrolments";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    User,
    MapPin,
    Calendar,
    CreditCard,
} from "lucide-react";

export default function AdminEnrolments() {
    const {
        enrolments,
        loading,
        error,
        page,
        setPage,
        totalPages,
        totalCount,
        fetchAllEnrolments,
    } = useAdminEnrolments();

    useEffect(() => {
        fetchAllEnrolments(page);
    }, [page, fetchAllEnrolments]);

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1);
    };

    const renderStatusBadge = (status) => {
        switch (status) {
            case "confirmed":
                return <Badge className="bg-green-600 hover:bg-green-700">Confirmada</Badge>;
            case "pending":
                return <Badge variant="outline" className="text-amber-600 border-amber-500">Pendiente</Badge>;
            case "cancelled":
                return <Badge variant="destructive">Cancelada</Badge>;
            case "completed":
                return <Badge variant="secondary">Completada</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const renderPaymentStatusBadge = (status) => {
        switch (status) {
            case "paid":
                return <Badge className="bg-green-600">Aprobado</Badge>;
            case "pending":
                return <Badge variant="outline" className="text-amber-600 border-amber-500">En Revisión</Badge>;
            case "failed":
            case "refunded":
                return <Badge variant="destructive">{status === "failed" ? "Fallido" : "Reembolsado"}</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (loading && enrolments.length === 0) {
        return <div className="flex justify-center p-8">Cargando inscripciones...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-8">Error: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inscripciones</h1>
                    <p className="text-muted-foreground">
                        Gestiona todas las inscripciones a cursos del sistema.
                    </p>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Fecha</TableHead>
                            <TableHead>Curso / Horario</TableHead>
                            <TableHead>Estudiante</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Detalles</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {enrolments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No se encontraron inscripciones registradas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            enrolments.map((enr) => {
                                const isChild = !!enr.child_id;
                                const studentName = isChild
                                    ? `${enr.family_members?.first_name} ${enr.family_members?.last_name}`
                                    : `${enr.profiles?.first_name} ${enr.profiles?.last_name}`;
                                const course = enr.course_slots?.courses;
                                const payment = enr.payments?.length > 0 ? enr.payments[0] : null;

                                return (
                                    <TableRow key={enr.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-medium">
                                            {format(new Date(enr.created_at), "dd MMM yyyy", { locale: es })}
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(enr.created_at), "hh:mm a")}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-semibold">{course?.name}</div>
                                            <div className="text-xs text-muted-foreground mt-1 truncate max-w-50">
                                                {enr.course_slots?.facilities?.name} - {enr.course_slots?.price ? `$${enr.course_slots.price}` : "Gratis"}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span>{studentName}</span>
                                            </div>
                                            {isChild && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Registrado por: {enr.enroller?.first_name}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {renderStatusBadge(enr.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Ver detalles</span>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 p-0" align="end">
                                                    <div className="p-4 border-b bg-muted/30">
                                                        <h4 className="font-semibold text-lg">{course?.name}</h4>
                                                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                                                            <MapPin className="h-3 w-3 mr-1" />
                                                            {enr.course_slots?.facilities?.name}
                                                        </p>
                                                    </div>

                                                    <div className="p-4 space-y-4">
                                                        {/* Información del Estudiante */}
                                                        <div>
                                                            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Estudiante</h5>
                                                            <div className="text-sm">
                                                                <p className="font-medium">{studentName}</p>
                                                                <p className="text-muted-foreground">{isChild ? 'Familiar / Dependiente' : 'Titular'}</p>
                                                            </div>
                                                        </div>

                                                        {/* Fechas */}
                                                        <div>
                                                            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center">
                                                                <Calendar className="h-3 w-3 mr-1" /> Fechas
                                                            </h5>
                                                            <div className="text-sm grid grid-cols-2 gap-2">
                                                                <div>
                                                                    <span className="text-muted-foreground">Inicio:</span><br />
                                                                    {enr.start_date || enr.course_slots?.start_date ? format(new Date(enr.start_date || enr.course_slots.start_date), "dd/MM/yyyy") : 'N/A'}
                                                                </div>
                                                                <div>
                                                                    <span className="text-muted-foreground">Fin:</span><br />
                                                                    {enr.end_date || enr.course_slots?.end_date ? format(new Date(enr.end_date || enr.course_slots.end_date), "dd/MM/yyyy") : 'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Pago */}
                                                        <div className="pt-2 border-t">
                                                            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center">
                                                                <CreditCard className="h-3 w-3 mr-1" /> Información de Pago
                                                            </h5>
                                                            {payment ? (
                                                                <div className="text-sm space-y-2">
                                                                    <div className="flex justify-between">
                                                                        <span className="text-muted-foreground">Estado:</span>
                                                                        {renderPaymentStatusBadge(payment.status)}
                                                                    </div>
                                                                    <div className="flex justify-between">
                                                                        <span className="text-muted-foreground">Monto:</span>
                                                                        <span className="font-medium">${payment.amount}</span>
                                                                    </div>
                                                                    {payment.proof_url && (
                                                                        <a
                                                                            href={payment.proof_url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-primary hover:underline text-xs block mt-2"
                                                                        >
                                                                            Ver comprobante adjunto ↗
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground italic">No hay pago registrado</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-muted-foreground">
                        Mostrando página {page} de {totalPages} ({totalCount} registros en total)
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePreviousPage}
                            disabled={page === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                            disabled={page === totalPages}
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

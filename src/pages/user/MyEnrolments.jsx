import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEnrolments } from "@/hooks/useEnrolments";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    Calendar,
    Clock,
    MapPin,
    MoreVertical,
    XCircle,
    CreditCard,
    User,
    Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnrolmentPaymentUploadDialog } from "@/components/user/enrolments/EnrolmentPaymentUploadDialog";
import Loading from "@/components/global/Loading";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";

const EnrolmentCard = ({ enrolment, onCancel, onPaymentSuccess }) => {
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    const isCancelled = enrolment.status === "cancelled";
    const isConfirmed = enrolment.status === "confirmed";
    const showActions = !isCancelled && enrolment.status !== "completed" && !isConfirmed;

    const handleCancel = async () => {
        try {
            await onCancel(enrolment.id);
            setIsCancelDialogOpen(false);
            toast.success("Inscripción cancelada correctamente");
        } catch (error) {
            // Error handled in hook/service theoretically, could display message here if needed
        }
    };

    const getStatusBadge = () => {
        if (isCancelled) return <Badge variant="destructive">Cancelada</Badge>;
        if (enrolment.status === "confirmed") return <Badge className="bg-green-600 hover:bg-green-700">Confirmada</Badge>;
        if (enrolment.status === "completed") return <Badge variant="secondary">Completada</Badge>;
        if (enrolment.status === "pending") {
            return (
                <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                    Pendiente de Pago
                </Badge>
            );
        }
        return <Badge variant="secondary">{enrolment.status}</Badge>;
    };

    const course = enrolment.course_slots?.courses;
    const slot = enrolment.course_slots;

    // Check if there is an existing payment
    const payment = enrolment.payments?.length > 0 ? enrolment.payments[0] : null;

    // Disable payment upload if payment exists
    const canUploadPayment = showActions && enrolment.status === "pending" && !payment;

    return (
        <>
            <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col p-0 self-start relative">
                <div className="h-40 bg-muted relative group overflow-hidden">
                    {course?.image_url ? (
                        <img
                            src={course.image_url}
                            alt={course.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary/50 text-muted-foreground">
                            <BookOpen className="h-8 w-8 opacity-50" />
                        </div>
                    )}
                    {course?.category && (
                        <Badge className="absolute top-2 left-2 bg-background/90 text-foreground backdrop-blur-sm">
                            {course.category}
                        </Badge>
                    )}
                </div>

                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1.5 w-full">
                        <div className="flex justify-between items-start pr-8">
                            <CardTitle className="text-lg line-clamp-1" title={course?.name}>
                                {course?.name || "Curso Reservado"}
                            </CardTitle>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                            {getStatusBadge()}

                            <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                {enrolment.child_id ? (
                                    <><Users className="h-3 w-3 mr-1" /> {enrolment.family_members?.first_name}</>
                                ) : (
                                    <><User className="h-3 w-3 mr-1" /> {enrolment.profiles?.first_name}</>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions Dropdown */}
                    {showActions && (
                        <div className="absolute right-2 top-42">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => setIsCancelDialogOpen(true)}
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancelar Inscripción
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="space-y-3 pb-5">
                    <div className="space-y-2 mb-4 border-t pt-3">
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-2 h-4 w-4 shrink-0" />
                            <span className="truncate">
                                {enrolment.start_date && enrolment.end_date ? (
                                    `${format(new Date(enrolment.start_date), "MMM d", { locale: es })} - ${format(new Date(enrolment.end_date), "MMM d", { locale: es })}`
                                ) : slot?.start_date ? (
                                    `${format(new Date(slot.start_date), "MMM d", { locale: es })} - ${format(new Date(slot.end_date), "MMM d", { locale: es })}`
                                ) : (
                                    `Cíclo: ${slot?.duration || 'Regular'}`
                                )}
                            </span>
                        </div>
                        {slot?.facilities && (
                            <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="mr-2 h-4 w-4 shrink-0" />
                                <span className="truncate">{slot.facilities.name}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center border-t border-dashed pt-3 pb-1">
                        <span className="text-sm font-medium text-muted-foreground">Total:</span>
                        <span className="text-lg font-bold text-primary">
                            {new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'USD' }).format(slot?.price || 0)}
                        </span>
                    </div>

                    {canUploadPayment && (
                        <div className="pt-2">
                            <Button
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                                onClick={() => setIsPaymentDialogOpen(true)}
                            >
                                <CreditCard className="mr-2 h-4 w-4" />
                                Pagar e Inscribirme
                            </Button>
                        </div>
                    )}

                    {payment && (
                        <div className="pt-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full text-muted-foreground shadow-sm">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Ver Comprobante
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 p-4" align="center" side="top">
                                    <h4 className="font-semibold text-sm mb-3 pb-2 border-b">Detalles del Pago</h4>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Estado:</span>
                                            <Badge variant={
                                                payment.status === 'paid' ? 'default' :
                                                    payment.status === 'pending' ? 'outline' :
                                                        'destructive'
                                            } className={payment.status === 'paid' ? 'bg-green-600' : payment.status === 'pending' ? 'text-amber-600 border-amber-500' : ''}>
                                                {payment.status === 'paid' ? 'Aprobado' :
                                                    payment.status === 'pending' ? 'En Revisión' :
                                                        'Rechazado'}
                                            </Badge>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Monto:</span>
                                            <span className="font-medium">
                                                {new Intl.NumberFormat('es-CR', { style: 'currency', currency: payment.currency || 'USD' }).format(payment.amount)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">Fecha:</span>
                                            <span>
                                                {format(new Date(payment.created_at), "dd MMM yyyy", { locale: es })}
                                            </span>
                                        </div>

                                        {payment.proof_url && (
                                            <div className="pt-2 border-t mt-2">
                                                <a
                                                    href={payment.proof_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full flex items-center justify-center py-2 px-4 bg-muted/50 hover:bg-muted text-primary text-sm font-medium rounded-md transition-colors"
                                                >
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Abrir Archivo
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog
                open={isCancelDialogOpen}
                onOpenChange={setIsCancelDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Cancelar inscripción?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se liberará tu cupo en el curso.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Volver</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Sí, cancelar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <EnrolmentPaymentUploadDialog
                open={isPaymentDialogOpen}
                onOpenChange={setIsPaymentDialogOpen}
                enrolment={enrolment}
                onSuccess={onPaymentSuccess}
            />
        </>
    );
};

export default function MyEnrolments() {
    const { enrolments, loading, fetchUserEnrolments, cancelEnrolment } = useEnrolments();

    useEffect(() => {
        fetchUserEnrolments();
    }, [fetchUserEnrolments]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Mis Inscripciones</h1>
                    <p className="text-muted-foreground">
                        Administra tus cursos y los de tu familia.
                    </p>
                </div>
                <Button asChild className="w-full md:w-auto shadow-sm">
                    <Link to="/dashboard/courses">
                        <BookOpen className="mr-2 h-4 w-4" /> Explorar Cursos
                    </Link>
                </Button>
            </div>

            {loading ? (
                <Loading />
            ) : enrolments?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolments.map((enr) => (
                        <EnrolmentCard
                            key={enr.id}
                            enrolment={enr}
                            onCancel={cancelEnrolment}
                            onPaymentSuccess={fetchUserEnrolments}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/10">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No estás inscrito en ningún curso</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        Explora nuestro catálogo de cursos disponibles e inscríbete para comenzar a aprender.
                    </p>
                    <Button asChild variant="outline">
                        <Link to="/dashboard/courses">
                            Ver Cursos Disponibles
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}

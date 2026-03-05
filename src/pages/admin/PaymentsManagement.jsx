import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  MapPin,
  MoreHorizontal,
  User,
  BookOpen,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  useAdminPayments,
  useUpdatePaymentStatus,
  usePaymentConceptDetails,
  useAdminPaymentsSummary,
} from "@/hooks/admin/useAdminPayments";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const formatPeriod = (period) => {
  if (!period) return "-";
  const matches = period.match(/\["([^"]+?)","([^"]+?)"\)/);
  if (!matches) return period;

  const start = new Date(matches[1]);
  const end = new Date(matches[2]);

  return (
    <div className="flex flex-col text-sm">
      <span className="capitalize">
        {format(start, "EEEE d 'de' MMMM", { locale: es })}
      </span>
      <span className="text-muted-foreground">
        {format(start, "HH:mm")} - {format(end, "HH:mm")}
      </span>
    </div>
  );
};

// Lazy loading component for Concepto details
const PaymentConceptButton = ({ payment }) => {
  const [open, setOpen] = useState(false);
  const { data: details, isLoading } = usePaymentConceptDetails(open ? payment : null);

  if (payment.payment_type === "reservation") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-2"
          >
            <CalendarDays className="w-4 h-4" />
            <span className="text-xs font-medium">Reserva</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <h4 className="font-medium leading-none border-b pb-2">
              Detalles de la Reserva
            </h4>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : details ? (
              <>
                <div>
                  <div className="text-sm font-medium flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Instalación
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {details.facilities?.name}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Horario
                  </div>
                  <div className="pl-6">{formatPeriod(details.booked_period)}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Precio Total
                    </span>
                    <span className="font-medium text-sm">
                      {new Intl.NumberFormat("es-CR", {
                        style: "currency",
                        currency: "USD",
                      }).format(details.total_price)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Estado Reserva
                    </span>
                    <Badge variant="secondary" className="mt-0.5 text-xs capitalize">
                      {details.status}
                    </Badge>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Error al cargar detalles</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (payment.payment_type === "subscription") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2"
          >
            <User className="w-4 h-4" />
            <span className="text-xs font-medium">Suscripción</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <h4 className="font-medium leading-none border-b pb-2">
              Detalles de Suscripción
            </h4>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : details ? (
              <>
                <div>
                  <div className="text-sm font-medium mb-1">Plan</div>
                  <p className="text-sm text-muted-foreground">
                    {details.membership_plans?.name || "Plan Desconocido"} ({details.membership_plans?.duration})
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Titular/Beneficiario</div>
                  <p className="text-sm text-muted-foreground">
                    {details.family_members
                      ? `Familiar: ${details.family_members.first_name} ${details.family_members.last_name}`
                      : "Usuario Titular"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Estado Susc.
                    </span>
                    <Badge variant="secondary" className="mt-0.5 text-xs capitalize">
                      {details.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Renovación Auto.
                    </span>
                    <span className="text-sm">
                      {details.auto_renew ? "Sí" : "No"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Error al cargar detalles</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (payment.payment_type === "enrolment") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-medium">Inscripción</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <h4 className="font-medium leading-none border-b pb-2">
              Detalles de Inscripción
            </h4>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : details ? (
              <>
                <div>
                  <div className="text-sm font-medium flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    Curso
                  </div>
                  <p className="text-sm text-muted-foreground pl-6 font-semibold">
                    {details.course_slots?.courses?.name}
                  </p>
                  <p className="text-xs text-muted-foreground pl-6">
                    {details.course_slots?.facilities?.name}
                  </p>
                </div>
                <div>
                  <div className="text-sm font-medium flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Estudiante
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">
                    {details.child_id
                      ? `${details.family_members?.first_name} ${details.family_members?.last_name} (Familiar)`
                      : `${details.profiles?.first_name} ${details.profiles?.last_name} (Titular)`}
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <span className="text-xs text-muted-foreground block">
                    Estado Inscripción
                  </span>
                  <Badge variant="secondary" className="mt-0.5 text-xs capitalize">
                    {details.status}
                  </Badge>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Error al cargar detalles</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <span className="text-sm text-muted-foreground capitalize">
      {payment.payment_type === "unknown" ? "Indefinido" : payment.payment_type || "-"}
    </span>
  );
};

export default function PaymentsManagement() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [summaryTimeRange, setSummaryTimeRange] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const pageSize = 10;


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useAdminPayments({
    page,
    pageSize,
    status: statusFilter,
    searchQuery: debouncedSearch,
  });

  const { data: summaryData } = useAdminPaymentsSummary(summaryTimeRange);
  const updateStatusMutation = useUpdatePaymentStatus();

  const handleStatusUpdate = (id, newStatus) => {
    updateStatusMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: () =>
          toast.success(
            `Pago ${newStatus === "paid" ? "aprobado" : "rechazado"}`,
          ),
        onError: () => toast.error("Error al actualizar pago"),
      },
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Pagado</Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            Pendiente
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Fallido</Badge>;
      case "refunded":
        return <Badge variant="secondary">Reembolsado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestión de Pagos
          </h1>
          <p className="text-muted-foreground">
            Revisa comprobantes y administra el estado de los pagos.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex gap-4 items-center">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o correo..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="paid">Pagados</SelectItem>
              <SelectItem value="failed">Fallidos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Resumen Financiero</h2>
          <Select
            value={summaryTimeRange}
            onValueChange={setSummaryTimeRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rango de Tiempo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo el tiempo</SelectItem>
              <SelectItem value="1">Último mes</SelectItem>
              <SelectItem value="3">Últimos 3 meses</SelectItem>
              <SelectItem value="6">Últimos 6 meses</SelectItem>
              <SelectItem value="12">Último año</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {summaryData && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagados</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("es-CR", {
                    style: "currency",
                    currency: "USD",
                  }).format(summaryData.paid?.amount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summaryData.paid?.count || 0} transacciones
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("es-CR", {
                    style: "currency",
                    currency: "USD",
                  }).format(summaryData.pending?.amount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summaryData.pending?.count || 0} transacciones
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fallidos</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("es-CR", {
                    style: "currency",
                    currency: "USD",
                  }).format(summaryData.failed?.amount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summaryData.failed?.count || 0} transacciones
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reembolsados</CardTitle>
                <Info className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("es-CR", {
                    style: "currency",
                    currency: "USD",
                  }).format(summaryData.refunded?.amount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summaryData.refunded?.count || 0} transacciones
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID / Usuario</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Comprobante</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24">
                  Cargando pagos...
                </TableCell>
              </TableRow>
            ) : data?.data?.length > 0 ? (
              data.data.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="font-medium text-xs text-muted-foreground mb-1">
                      {payment.id.slice(0, 8)}...
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {payment.profiles?.first_name}{" "}
                        {payment.profiles?.last_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {payment.profiles?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {/* Concepto / Tipo de Pago Lazy Loaded */}
                    <PaymentConceptButton payment={payment} />
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {new Intl.NumberFormat("es-CR", {
                        style: "currency",
                        currency: payment.currency || "USD",
                      }).format(payment.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="capitalize">
                    {payment.payment_method || "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(payment.created_at), "PPP p", {
                      locale: es,
                    })}
                  </TableCell>
                  <TableCell>
                    {payment.proof_url ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Info className="w-4 h-4 mr-1" /> Ver
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-80 sm:w-[400px] p-0 overflow-hidden"
                          align="start"
                        >
                          <div className=" flex items-center justify-center p-4 min-h-[200px]">
                            <img
                              src={payment.proof_url}
                              alt="Comprobante"
                              className="max-w-full max-h-[400px] object-contain rounded-md shadow-sm"
                            />
                          </div>
                          <div className="p-3 border-t flex justify-end gap-2">
                            <a
                              href={payment.proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:underline"
                            >
                              Abrir en nueva pestaña
                            </a>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        Sin comprobante
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(payment.id, "paid")}
                          disabled={payment.status === "paid"}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> Aprobar Pago
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusUpdate(payment.id, "failed")
                          }
                          disabled={payment.status === "failed"}
                          className="text-destructive focus:text-destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Rechazar Pago
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center h-24 text-muted-foreground"
                >
                  No se encontraron pagos.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((old) => Math.max(old - 1, 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <div className="text-sm font-medium">Página {page}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setPage((old) =>
              !data?.data || data.data.length < pageSize ? old : old + 1,
            )
          }
          disabled={!data?.data || data.data.length < pageSize}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

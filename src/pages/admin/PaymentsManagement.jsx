import { useState } from "react";
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
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  useAdminPayments,
  useUpdatePaymentStatus,
} from "@/hooks/admin/useAdminPayments";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PaymentsManagement() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const pageSize = 10;

  const { data, isLoading } = useAdminPayments({
    page,
    pageSize,
    status: statusFilter,
  });
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

  const formatPeriod = (period) => {
    if (!period) return "-";
    // Parse PostgreSQL tsrange format: "[\"2024-02-10 10:00:00\",\"2024-02-10 11:00:00\")"
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

        {/* Filters */}
        <div className="flex gap-2 items-center">
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
                    {/* Concepto / Tipo de Pago */}
                    {payment.reservations ? (
                      <Popover>
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

                            {/* Facility Info */}
                            <div>
                              <div className="text-sm font-medium flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                Instalación
                              </div>
                              <p className="text-sm text-muted-foreground pl-6">
                                {payment.reservations.facilities?.name}
                              </p>
                            </div>

                            {/* Date Info */}
                            <div>
                              <div className="text-sm font-medium flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                Horario
                              </div>
                              <div className="pl-6">
                                {formatPeriod(
                                  payment.reservations.booked_period,
                                )}
                              </div>
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
                                  }).format(payment.reservations.total_price)}
                                </span>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground block">
                                  Estado Reserva
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="mt-0.5 text-xs capitalize"
                                >
                                  {payment.reservations.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
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

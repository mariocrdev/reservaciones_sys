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
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAdminReservations } from "@/hooks/admin/useAdminReservations";
import { toast } from "sonner";

export default function ReservationsManagement() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all"); // all, today, week, month
  const [statusFilter, setStatusFilter] = useState("all");
  const pageSize = 10;

  const { data, isLoading } = useAdminReservations({
    page,
    pageSize,
    filter,
    status: statusFilter,
  });
  console.log("🚀 ~ ReservationsManagement ~ data:", data);

  const getStatusBadge = (status, expiresAt) => {
    const isExpired = status === 'pending' && expiresAt && new Date(expiresAt) < new Date();

    if (status === 'cancelled' || isExpired) {
      return <Badge variant="destructive">Cancelada</Badge>;
    }

    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Confirmada</Badge>
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
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Helper to format tsrange string for display
  const formatPeriod = (rangeStr) => {
    if (!rangeStr) return "";
    const clean = rangeStr.replace(/[\[\]\(\)]/g, "");
    const [start, end] = clean.split(",");

    if (!start || !end) return rangeStr;

    const startDate = new Date(start.trim().replace(/"/g, ""));
    const endDate = new Date(end.trim().replace(/"/g, ""));

    return `${format(startDate, "PPP p", { locale: es })} - ${format(endDate, "p", { locale: es })}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reservaciones</h1>
          <p className="text-muted-foreground">
            Gestiona todas las reservaciones del sistema.
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
              <SelectItem value="confirmed">Confirmadas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-4 w-px bg-border mx-2" />

          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => {
              setFilter("all");
              setPage(1);
            }}
            size="sm"
          >
            Todos
          </Button>
          <Button
            variant={filter === "today" ? "default" : "outline"}
            onClick={() => {
              setFilter("today");
              setPage(1);
            }}
            size="sm"
          >
            Hoy
          </Button>
          <Button
            variant={filter === "week" ? "default" : "outline"}
            onClick={() => {
              setFilter("week");
              setPage(1);
            }}
            size="sm"
          >
            Esta Semana
          </Button>
          <Button
            variant={filter === "month" ? "default" : "outline"}
            onClick={() => {
              setFilter("month");
              setPage(1);
            }}
            size="sm"
          >
            Este Mes
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID / Usuario</TableHead>
              <TableHead>Instalación</TableHead>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Pago</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Cargando reservaciones...
                </TableCell>
              </TableRow>
            ) : data?.data?.length > 0 ? (
              data.data.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>
                    <div className="font-medium text-xs text-muted-foreground mb-1">
                      {reservation.id.slice(0, 8)}...
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {reservation.profiles?.first_name}{" "}
                        {reservation.profiles?.last_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {reservation.profiles?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{reservation.facilities?.name}</TableCell>
                  <TableCell className="text-sm">
                    {formatPeriod(reservation.booked_period)}
                  </TableCell>
                  <TableCell>{getStatusBadge(reservation.status, reservation.expires_at)}</TableCell>
                  <TableCell>
                    {reservation.payments[0] ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 p-0 hover:bg-transparent"
                          >
                            {reservation.payments[0].status === "paid" ? (
                              <div className="flex items-center text-green-600 gap-1 font-medium cursor-pointer hover:underline">
                                <CheckCircle className="w-4 h-4" /> Pagado
                              </div>
                            ) : (
                              <div className="flex items-center text-yellow-600 gap-1 font-medium cursor-pointer hover:underline">
                                <Filter className="w-4 h-4" />{" "}
                                {reservation.payments[0].status}
                              </div>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">
                                Detalles del Pago
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Información asociada al pago de esta reserva.
                              </p>
                            </div>
                            <div className="grid gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Monto:
                                </span>
                                <span className="font-medium">
                                  {new Intl.NumberFormat("es-CR", {
                                    style: "currency",
                                    currency:
                                      reservation.payments[0].currency || "USD",
                                  }).format(reservation.payments[0].amount)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Estado:
                                </span>
                                <span className="capitalize">
                                  {reservation.payments[0].status}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Método:
                                </span>
                                <span className="capitalize">
                                  {reservation.payments[0].payment_method ||
                                    "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Fecha:
                                </span>
                                <span>
                                  {reservation.payments[0].created_at
                                    ? format(
                                      new Date(
                                        reservation.payments[0].created_at,
                                      ),
                                      "dd/MM/yyyy HH:mm",
                                    )
                                    : "-"}
                                </span>
                              </div>
                              {reservation.payments[0].proof_url && (
                                <div className="pt-2 mt-2 border-t">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="link"
                                        className="text-blue-600 hover:underline flex items-center gap-1 text-xs h-auto p-0"
                                      >
                                        <Info className="w-3 h-3" /> Ver
                                        Comprobante
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 sm:w-[400px] p-0 overflow-hidden">
                                      <img
                                        src={reservation.payments[0].proof_url}
                                        alt="Comprobante de pago"
                                        className="w-full h-auto object-contain bg-slate-50"
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              )}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-muted-foreground"
                >
                  No se encontraron reservaciones.
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

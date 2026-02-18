import { useState, useEffect } from "react";
import { useAdminUsers, useUpdateUserRole } from "@/hooks/admin/useAdminUsers";
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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Loading from "@/components/global/Loading";
import { toast } from "sonner";

export default function UsersManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const limit = 20;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search change
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset page on role filter change
  useEffect(() => {
    setPage(1);
  }, [roleFilter]);

  const { data, isLoading, isError } = useAdminUsers(
    page,
    limit,
    debouncedSearch,
    roleFilter === "all" ? "" : roleFilter,
  );
  // data matches { users: [], count: number } from UserService because hook returns query Fn result directly
  // Actually hook returns { data, isLoading, ... } from useQuery, so `data` above IS the result object: { users, count }

  const updateUserRole = useUpdateUserRole();

  const handleRoleChange = (userId, newRole) => {
    updateUserRole.mutate(
      { userId, role: newRole },
      {
        onSuccess: () => {
          toast.success("Rol actualizado correctamente");
        },
        onError: (error) => {
          console.error(error);
          toast.error("Error al actualizar el rol");
        },
      },
    );
  };

  if (isLoading) return <Loading />;
  if (isError)
    return <div className="p-4 text-red-500">Error al cargar usuarios</div>;

  const { users = [], count = 0 } = data || {};
  const totalPages = Math.ceil(count / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Gestión de Usuarios
        </h2>
        <div className="text-sm text-muted-foreground">
          Total: {count} usuarios
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="member">Miembro</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="instructor">Instructor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Avatar</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Rol</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                console.log("🚀 ~ UsersManagement ~ user:", user)
                return <TableRow key={user.id}>
                  <TableCell>
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.profile_image_url}
                        alt={user.first_name}
                      />
                      <AvatarFallback>
                        {user.first_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {user.first_name} {user.last_name}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user.id, value)
                      }
                      disabled={updateUserRole.isPending}
                    >
                      <SelectTrigger className="w-35">
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Miembro</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>;
              })
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
    </div>
  );
}

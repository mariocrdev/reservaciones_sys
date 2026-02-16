-- 1. TIPOS DE DATOS (ENUMS)
-- Ayudan a mantener la integridad de datos mejor que strings sueltos
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.subscription_status as enum ('pending', 'active', 'inactive', 'past_due', 'cancelled');
create type public.app_role as enum ('admin', 'instructor', 'member', 'staff');

--[][][][][][[][][][][][][][][][][][][[][][][][][][][][][][][][[][][][][][][]BUCKETS

--FACILITIES

--{RLS}

-- Permite que cualquiera vea las imágenes
CREATE POLICY "public_view_assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'public_assets' );

-- GESTIÓN TOTAL ADMIN (Insert + Update + Delete)
-- 'FOR ALL' cubre todas las operaciones.
-- Al combinar USING (existentes) y WITH CHECK (nuevos), cubres todo el ciclo.
CREATE POLICY "admin_manage_assets"
ON storage.objects FOR ALL
TO authenticated
USING ( 
    bucket_id = 'public_assets' 
    AND public.has_role(auth.uid(), 'admin'::public.app_role) 
)
WITH CHECK ( 
    bucket_id = 'public_assets' 
    AND public.has_role(auth.uid(), 'admin'::public.app_role) 
);

--<><><><><><><><><><><><><><><><><><><><><><><><><><><><>

--payment_vouchers

--{RLS}

create policy "Admin full access vouchers"
on storage.objects for all
to authenticated
using (
  bucket_id = 'payment_vouchers' 
  and public.has_role(auth.uid(), 'admin'::public.app_role)
)
with check (
  bucket_id = 'payment_vouchers' 
  and public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Max 5MB por archivo
create policy "User upload own folder with rate limit"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'payment_vouchers' 
  AND
  -- 1. Restricción de Carpeta: Debe coincidir con su Auth UID
  (storage.foldername(name))[1] = auth.uid()::text
  AND
  -- 2. RATE LIMITER: Máximo 5 archivos en la última 1 hora
  (
    SELECT count(*)
    FROM storage.objects
    WHERE bucket_id = 'payment_vouchers'
    AND owner = auth.uid()
    AND created_at > (now() - interval '1 hour') -- Ventana de tiempo
  ) < 10 -- Límite de 10 archivos
);
--[][][][][][[][][][][][][][][][][][][[][][][][][][][][][][][][[][][][][][][][][][][]

--------------------------------------------------------------------------PROFILES

create table public.profiles (
  id uuid not null references auth.users (id) on delete CASCADE,
  first_name text null,
  last_name text null,
  email text null, -- Opcional, ya que auth.users lo tiene, pero útil para joins rápidos
  phone text null,
  address text null,
  city text null,
  profile_image_url text null,
  stripe_customer_id text null, -- Previsión para futuro
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  primary key (id)
);

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.email,
    now(),
    now()
  );
  return new;
end;
$$;

--{RLS}

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));

--<><><><><><><><><><><><><><><><><><><><><><><><><><><><>

-- TABLE family_members

-- Tabla para registrar hijos o dependientes
create table public.family_members (
  id uuid not null default gen_random_uuid() primary key,
  parent_id uuid not null references public.profiles(id) on delete cascade,
  
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  gender text null check (gender in ('M', 'F', 'Other')),
  
  -- Metadatos opcionales (ej: alergias, notas médicas para la natación)
  medical_notes text null,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Index para búsquedas rápidas
create index idx_family_members_parent on public.family_members(parent_id);

--{RLS} family_members
alter table public.family_members enable row level security;

-- 1. Padres gestionan a sus hijos (CRUD completo)
create policy "Parents manage their children"
on public.family_members
for all
using ( auth.uid() = parent_id )
with check ( auth.uid() = parent_id );

-- 2. Admins ven todo
create policy "Admins view all children"
on public.family_members
for select
using ( public.has_role(auth.uid(), 'admin'::public.app_role) );

--------------------------------------------------------------------------USER ROLES

create table public.user_roles (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  role public.app_role not null default 'member'::app_role,
  created_at timestamp with time zone null default now(),
  constraint user_roles_pkey primary key (id),
  constraint user_roles_user_id_role_key unique (user_id, role),
  constraint user_roles_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) 
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public -- Buena práctica de seguridad
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

create or replace function public.handle_new_profile_role()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'member'); -- Asigna 'member' por defecto
  return new;
end;
$$;

create trigger on_profile_created
after insert on public.profiles
for each row
execute function public.handle_new_profile_role();

--{RLS}

CREATE POLICY "Only admins can manage roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));

alter table public.profiles
alter column phone type varchar(20);

alter table public.profiles
alter column email type varchar(150);

alter table public.profiles
alter column city type varchar(100);

alter table public.profiles
alter column first_name type varchar(100);

alter table public.profiles
alter column last_name type varchar(100);

alter table public.profiles
alter column address type varchar(150);

--------------------------------------------------------------------------INSTALACIONES - RESERVACIONES

-- TABLE type_facilities

create table public.type_facilities (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null,
  description text null,
  updated_at timestamp with time zone not null default now(),
  constraint type_facilities_pkey primary key (id)
) TABLESPACE pg_default;

--{RLS}

CREATE POLICY "Only admins can manage type_facilities" ON public.type_facilities USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Enable read access for all users" ON public.type_facilities FOR SELECT USING (true);

--<><><><><><><><><><><><><><><><><><><><><><><><><><><><>

-- TABLE facilities

create table public.facilities (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  image_urls jsonb null,
  is_active boolean not null default true,
  created_at timestamp with time zone null default now(),
  type_id uuid not null,
  capacity integer not null default 1,
  price_per_hour numeric(10, 2) null,
  updated_at timestamp with time zone not null default now(),
  constraint facilities_pkey primary key (id),
  constraint facilities_type_id_fkey foreign KEY (type_id) references type_facilities (id) on update CASCADE on delete RESTRICT
) TABLESPACE pg_default;

--{RLS}

CREATE POLICY "Only admins can manage facilities" ON public.facilities USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Enable read access for all users" ON public.facilities FOR SELECT USING (true);

--<><><><><><><><><><><><><><><><><><><><><><><><><><><><>

-- TABLE facility_hours

create table public.facility_hours (
  id uuid not null default gen_random_uuid (),
  facility_id uuid not null,
  day_of_week integer not null,
  open_time time without time zone not null,
  close_time time without time zone not null,
  constraint facility_hours_pkey primary key (id),
  constraint facility_hours_facility_id_fkey foreign KEY (facility_id) references facilities (id) on delete CASCADE,
  constraint facility_hours_check check ((close_time > open_time)),
  constraint facility_hours_day_of_week_check check (
    (
      (day_of_week >= 0)
      and (day_of_week <= 6)
    )
  ),
  constraint no_overlapping_shifts EXCLUDE using gist (
    facility_id
    with
      =,
      day_of_week
    with
      =,
      tsrange (
        ('2000-01-01'::date + open_time),
        ('2000-01-01'::date + close_time)
      )
    with
      &&
  )
) TABLESPACE pg_default;

--{RLS}

alter table public.facility_hours enable row level security;

CREATE POLICY "Only admins can manage facility_hours" ON public.facility_hours USING (public.has_role(auth.uid(), 'admin'::public.app_role));

create policy "Public view hours" on public.facility_hours for select using (true);

--<><><><><><><><><><><><><><><><><><><><><><><><><><><><>

-- TABLE facility_blockages

-- Tabla para festivos, mantenimientos o bloqueos especiales
create table public.facility_blockages (
  id uuid not null default gen_random_uuid() primary key,
  facility_id uuid references public.facilities(id) on delete cascade,
  blocked_period tsrange not null, -- El rango de tiempo bloqueado
  reason text, -- Ej: "Feriado Nacional", "Mantenimiento Pista"
  created_at timestamp with time zone default now(),
  
  -- Constraint para evitar que se creen bloqueos superpuestos (opcional pero recomendado)
  constraint no_overlapping_blocks EXCLUDE using gist (
    facility_id with =,
    blocked_period with &&
  )
);

-- Índice para acelerar la búsqueda de bloqueos
create index blockages_range_idx on public.facility_blockages using gist (facility_id, blocked_period);

--{RLS}

alter table public.facility_blockages enable row level security;

-- Los usuarios normales pueden leer (para ver por qué está cerrado si hicieras una UI de calendario)
create policy "Public view blockages" on public.facility_blockages for select using (true);

-- Solo admins pueden crear/borrar bloqueos
create policy "Admins manage blockages" on public.facility_blockages 
  using (public.has_role(auth.uid(), 'admin'::public.app_role));

--<><><><><><><><><><><><><><><><><><><><><><><><><><><><>

-- TABLE reservations

-- Usamos tsrange (Time Stamp Range) para manejar rangos de tiempo
create table public.reservations (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id),
  facility_id uuid not null references public.facilities(id),
  
  -- Rango de tiempo de la reserva (ej: [2026-01-30 10:00, 2026-01-30 11:00))
  booked_period tsrange not null, 
  
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  total_price numeric(10, 2) not null default 0,
  expires_at timestamp with time zone null, -- Para reservas temporales (pendientes)
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- CONSTRAINT DE NO SOLAPAMIENTO
  -- Esto evita que dos reservas ocupen el mismo espacio-tiempo en la misma facility
  -- Requiere la extensión btree_gist: create extension if not exists btree_gist;
  exclude using gist (
    facility_id with =,
    booked_period with &&
  ) where (status != 'cancelled')
);

-- Función para setear el timer automáticamente
create or replace function public.set_reservation_timer()
returns trigger
language plpgsql
as $$
begin
  -- Si es nueva y está pendiente, le damos 15 minutos
  if new.status = 'pending' and new.expires_at is null then
      new.expires_at := now() + interval '30 minutes';
  end if;
  return new;
end;
$$;

-- Activar el trigger antes de insertar
create trigger set_timer_on_insert
before insert on public.reservations
for each row
execute function public.set_reservation_timer();

-- Función para obtener slots disponibles
create or replace function get_available_slots(
  input_facility_id uuid,
  input_date date,
  slot_interval interval default '1 hour'
)
returns table (
  slot_start time,
  slot_end time,
  is_available boolean
)
language plpgsql
security definer
as $$
declare
  shift record; -- Variable para guardar cada turno (mañana/tarde)
  curr_ts timestamp;
  end_ts timestamp;
  day_int int;
begin
  day_int := extract(dow from input_date); -- 1. Obtener el día de la semana (0-6)

  -- 2. BUCLE EXTERNO: Iterar por cada turno definido para ese día (ej: Turno mañana, Turno tarde)
  for shift in 
    select open_time, close_time 
    from public.facility_hours 
    where facility_id = input_facility_id 
    and day_of_week = day_int
    order by open_time asc
  loop
  
    -- Definir inicio y fin de ESTE turno específico
    curr_ts := input_date + shift.open_time;
    end_ts := input_date + shift.close_time;

    -- 3. BUCLE INTERNO: Generar slots dentro de este turno
    while curr_ts < end_ts loop
      
      -- Verificamos que el slot quepa en el turno
      if (curr_ts + slot_interval) <= end_ts then
      
        -- NUEVA VALIDACIÓN: EL FILTRO DE TIEMPO
        -- Solo devolvemos el slot si la hora de inicio es MAYOR a "ahora mismo".
        -- Esto funciona mágicamente para:
        -- 1. Hoy: Oculta las horas pasadas.
        -- 2. Mañana: Muestra todo (porque mañana > hoy).
        -- 3. Ayer: No muestra nada (porque ayer < hoy).
        
        if curr_ts > now() then
        
            return query 
            select 
              curr_ts::time, 
              (curr_ts + slot_interval)::time,
              (
              -- 1. Verificar si el slot está disponible
              not exists (
                select 1 
                from public.reservations r
                where r.facility_id = input_facility_id
                -- LÓGICA ACTUALIZADA AQUÍ:
                -- El slot está ocupado si:
                -- 1. No está cancelada Y
                -- 2. (Está confirmada O (Está pendiente Y el tiempo NO ha expirado))
                and r.status != 'cancelled'
                and (
                    r.status = 'confirmed' 
                    or 
                    (r.status = 'pending' and (r.expires_at is null or r.expires_at > now()))
                )
                and r.booked_period && tsrange(curr_ts, curr_ts + slot_interval)
              )
              
              AND
              
              -- 2. Verificar que NO exista un bloqueo (Festivo/Mantenimiento)
              not exists (
                select 1
                from public.facility_blockages b
                where b.facility_id = input_facility_id
                -- El operador && verifica si los rangos se solapan
                and b.blocked_period && tsrange(curr_ts, curr_ts + slot_interval)
              )
            );
              
              
        end if; -- Fin del check de tiempo futuro
          
      end if;

      -- Avanzar al siguiente slot
      curr_ts := curr_ts + slot_interval;
      
    end loop;
  end loop;
end;
$$;

-- Función para cancelar reservas pendientes que expiraron
create or replace function public.cancel_expired_reservations()
returns void
language plpgsql
security definer
as $$
begin
  update public.reservations
  set status = 'cancelled',
      updated_at = now()
  where status = 'pending'
  and expires_at is not null
  and expires_at < now();
end;
$$;

select cron.schedule(
  'cancel_expired_reservations',
  '0 * * * *',
  $$ select public.cancel_expired_reservations(); $$
);

--{RLS}

-- 1. Activar seguridad en la tabla
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICA ADMIN: Control Total (Todo en uno)
-- El admin puede ver, crear, editar y borrar cualquier reserva.
CREATE POLICY "admin_manage_all_reservations"
ON public.reservations
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3. POLÍTICA USUARIO: Ver sus propias reservas
CREATE POLICY "users_view_own_reservations"
ON public.reservations
FOR SELECT
TO authenticated
USING ( auth.uid() = user_id );

-- 4. POLÍTICA USUARIO: Crear reservas (Solo a su nombre)
-- El 'WITH CHECK' asegura que no puedan crear una reserva a nombre de otro.
CREATE POLICY "users_create_own_reservations"
ON public.reservations
FOR INSERT
TO authenticated
WITH CHECK (
    -- Regla 1: Solo a su nombre
    auth.uid() = user_id
    
    AND
    
    -- Regla 2: Obligatorio que nazca como 'pending'. 
    -- Si intentan enviar 'confirmed' o 'cancelled', esto fallará.
    status = 'pending'
    
    AND
    
    -- Regla 3: Límite de cantidad (Máximo 3 pendientes)
    (
      SELECT count(*) 
      FROM public.reservations 
      WHERE user_id = auth.uid() 
      AND status = 'pending'
    ) < 3
);

-- 5. POLÍTICA USUARIO: Eliminar sus propias reservas
-- CREATE POLICY "users_delete_own_reservations"
-- ON public.reservations
-- FOR DELETE
-- TO authenticated
-- USING ( auth.uid() = user_id );

CREATE POLICY "users_cancel_own_reservations"
ON public.reservations
FOR UPDATE
TO authenticated
USING (
  -- Solo puede tocar sus propias reservas
  auth.uid() = user_id
)
WITH CHECK (
  -- Sigue siendo su reserva
  auth.uid() = user_id
  AND
  -- El único estado permitido después del UPDATE
  status = 'cancelled'
);


--------------------------------------------------------------------------MEMBRESÍAS - SUSCRIPCIONES

-- TABLE membership_products

create table public.membership_products (
  id uuid not null default gen_random_uuid() primary key,
  name text not null, -- Ej: "Plan Gold", "Plan Platinum"
  description text null,
  features jsonb not null default '[]'::jsonb, -- Ej: ["Piscina", "Toalla"]
  image_url text null, -- Url de la imagen del plan
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

--{RLS}

-- Habilitar RLS
alter table public.membership_products enable row level security;

-- 1. Todo el mundo puede ver los productos (incluso sin login)
create policy "Productos son públicos"
on public.membership_products
for select
using ( true );

-- 2. Solo Admin puede crear/editar/borrar productos
create policy "Admin gestiona productos"
on public.membership_products
for all
using (public.has_role(auth.uid(), 'admin'::public.app_role));

--<><><><><><><><><><><><><><><><><><><><><><><><><><><><>

-- TABLE membership_plans

create table public.membership_plans (
  id uuid not null default gen_random_uuid() primary key,
  product_id uuid not null references public.membership_products(id) on delete cascade,
  
  name text null, -- Opcional, Ej: "Mensual", "Anual (Ahorra 20%)"
  price numeric(10, 2) not null,
  currency text default 'USD',
  duration interval not null, -- '1 month', '1 year'
  
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

--{RLS}

-- Habilitar RLS
alter table public.membership_plans enable row level security;

-- 1. Todo el mundo puede ver los planes (incluso sin login)
create policy "Planes son públicos"
on public.membership_plans
for select
using ( true );

-- 2. Solo Admin puede crear/editar/borrar planes
create policy "Admin gestiona planes"
on public.membership_plans
for all
using (public.has_role(auth.uid(), 'admin'::public.app_role));

--<><><><><><><><><><><><><><><><><><><><><><><><><><><><>

-- TABLE subscriptions

-- Registra la suscripción real del usuario
create table public.subscriptions (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.membership_plans(id),
  family_member_id uuid references public.family_members(id) on delete restrict, -- Opcional, para suscripciones de hijos
  
  status public.subscription_status not null default 'pending',
  
  -- Fechas críticas
  start_date timestamp with time zone, 
  end_date timestamp with time zone, 
  
  auto_renew boolean default false,
  cancellation_reason text null, -- Útil para saber por qué se van
  
  cancelled_at timestamp with time zone null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

CREATE UNIQUE INDEX idx_unique_owner_active_subscription
ON public.subscriptions (user_id, plan_id)
WHERE status IN ('active', 'inactive', 'past_due', 'pending')  -- Solo revisa las activas/pendientes
AND family_member_id IS NULL;         -- Solo aplica cuando es para sí mismo

CREATE UNIQUE INDEX idx_unique_family_active_subscription
ON public.subscriptions (family_member_id, plan_id)
WHERE status IN ('active', 'inactive', 'past_due', 'pending')
AND family_member_id IS NOT NULL;

--{RLS}

-- A. Trigger para INSERT (Creación)

-- Aunque el usuario intente enviar status: 'active' o end_date: '2030-01-01', este trigger forzará los valores por defecto. Así solo "aceptamos" realmente user_id y plan_id.

create or replace function public.sanitize_new_subscription()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Si es Admin, dejamos pasar todo tal cual
  if public.has_role(auth.uid(), 'admin'::public.app_role) then
    return new;
  end if;

  -- Si es Usuario normal, FORZAMOS los valores internos
  -- Ignoramos cualquier cosa que hayan enviado en estos campos:
  new.status := 'pending';
  new.auto_renew := false; -- O true, según tu lógica de negocio default
  new.cancellation_reason := null;
  new.cancelled_at := null;
  
  -- Las fechas se calculan después con tu otro trigger 'set_subscription_dates',
  -- así que aquí nos aseguramos que start_date sea 'now()' si intentaron manipularla.
  new.start_date := now();
  
  return new;
end;
$$;

create trigger trigger_sanitize_insert_subscription
before insert on public.subscriptions
for each row
execute function public.sanitize_new_subscription();

-- B. Trigger para UPDATE (Cancelación)

-- Este trigger verifica que, si es un usuario normal, solo esté modificando los campos de cancelación. Si intenta cambiar el plan_id o status, el cambio será ignorado o rechazado.

create or replace function public.restrict_subscription_updates()
returns trigger
language plpgsql
security definer
as $$
begin
  -- 1. Si es Admin, tiene permiso total
  if public.has_role(auth.uid(), 'admin'::public.app_role) then
    return new;
  end if;

  -- 2. Si es Usuario normal, protegemos los campos críticos
  -- Si intenta cambiar algo que no debe, lo revertimos al valor OLD (original)
  if new.plan_id is distinct from old.plan_id then new.plan_id := old.plan_id; end if;
  if new.user_id is distinct from old.user_id then new.user_id := old.user_id; end if;
  if new.status is distinct from old.status then new.status := old.status; end if;
  if new.start_date is distinct from old.start_date then new.start_date := old.start_date; end if;
  if new.end_date is distinct from old.end_date then new.end_date := old.end_date; end if;
  if new.auto_renew is distinct from old.auto_renew then new.auto_renew := old.auto_renew; end if;

  -- 3. Validación lógica extra:
  -- Solo permitimos que 'cancelled_at' se establezca si también envían una razón
  -- Opcional: Podrías forzar new.cancelled_at := now() para que no mientan con la fecha.
  
  return new;
end;
$$;

create trigger trigger_restrict_update_subscription
before update on public.subscriptions
for each row
execute function public.restrict_subscription_updates();

-- Habilitar RLS
alter table public.subscriptions enable row level security;

-- 1. SELECT: Ver sus propias suscripciones (o Admin ve todas)
create policy "select_subscriptions"
on public.subscriptions for select
using (
  auth.uid() = user_id
  or public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 2. INSERT: Crear suscripción a su nombre
-- El trigger 'sanitize' se encargará de ignorar campos extra
create policy "insert_strict_with_limit"
on public.subscriptions
for insert
with check (
  -- 1. Seguridad de Propiedad
  auth.uid() = user_id
  
  AND
  
  -- 2. VALIDACIÓN DE LÍMITE (QUOTA)
  -- Solo esto es necesario aquí, porque el trigger no puede bloquear la inserción basado en conteos,
  -- pero la RLS sí puede.
  (
    SELECT count(*)
    FROM public.subscriptions
    WHERE user_id = auth.uid()
  ) < 10
);

-- 3. UPDATE: Cancelar su propia suscripción
-- El trigger 'restrict' asegurará que solo toquen cancellation_reason/cancelled_at
create policy "update_subscriptions"
on public.subscriptions for update
using (
  auth.uid() = user_id
  or public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 4. DELETE: Solo Admin (Opcional, normalmente no borras historial financiero)
-- create policy "delete_subscriptions"
-- on public.subscriptions for delete
-- using (
--   public.has_role(auth.uid(), 'admin'::public.app_role)
-- );

--------------------------------------------------------------------------COURSES - ENROLLMENTS

-- 1. Los Cursos (La definición general)
create table public.courses (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  description text null,
  image_url text null,
  category text null, -- Ej: 'Natación', 'Tenis'
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

--{RLS}

alter table public.courses enable row level security;

create policy "Courses are public" on public.courses for select using (true);

-- Solo Admin puede crear/editar/borrar cursos
create policy "Admin manage courses"
on public.courses
for all
using (public.has_role(auth.uid(), 'admin'::public.app_role));

--<><><><><><><><><><><><><><><><><><><><><><><><><><><><>

-- 2. Horarios/Cupos (Las instancias del curso)
create table public.course_slots (
  id uuid not null default gen_random_uuid() primary key,
  course_id uuid not null references public.courses(id) on delete cascade,
  instructor_id uuid references public.profiles(id), -- Instructor asignado
  facility_id uuid references public.facilities(id), -- Lugar donde se dicta
  
  -- Horario (ej: Lunes y Miércoles 17:00 - 18:00)
  schedule_description text not null, 
  
  -- Gestión de Cupos
  max_capacity integer not null default 10,
  current_enrolments integer not null default 0,
  
  -- Precio del curso completo o ciclo
  price numeric(10, 2) not null,
  
  start_date date not null, -- Inicio del ciclo
  end_date date not null,   -- Fin del ciclo
  
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

--{RLS}

alter table public.course_slots enable row level security;

create policy "Slots are public" on public.course_slots for select using (true);

-- Solo Admin puede crear/editar/borrar slots
create policy "Admin manage course slots"
on public.course_slots
for all
using (public.has_role(auth.uid(), 'admin'::public.app_role));

--<><><><><><><><><><><><><><><><><><><><><><><><><><><><>

create table public.enrolments (
  id uuid not null default gen_random_uuid() primary key,
  course_slot_id uuid not null references public.course_slots(id),
  
  -- Quién se inscribe
  profile_id uuid references public.profiles(id), -- Si es el adulto
  child_id uuid references public.family_members(id), -- Si es un hijo

  enrolled_by uuid references public.profiles(id), -- Quién hizo la inscripción (puede ser el mismo profile_id o un admin)
  
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  
  notes text null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Constraint: O es un perfil o es un hijo, no ambos ni ninguno
  constraint enrolment_target_check check (
    (profile_id is null and child_id is not null) or 
    (profile_id is not null and child_id is null)
  )
);

--{RLS}

alter table public.enrolments enable row level security;

create policy "Users can view own enrolments"
on public.enrolments for select
using (auth.uid() = enrolled_by);

create policy "Users can enrol"
on public.enrolments for insert
with check (
  auth.uid() = enrolled_by 
  and status = 'pending'
  -- Validar cupos antes de insertar (opcional pero recomendado)
  and (select current_enrolments < max_capacity from public.course_slots where id = course_slot_id)
);

--------------------------------------------------------------------------PAYMENTS

-- TABLE payments

-- TABLA CENTRAL DE PAGOS (Nuevo)
-- Aquí registras TODO: Pago de membresía, pago de reserva, o pago de curso.
create table public.payments (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references profiles(id),
  amount numeric(10, 2) not null,
  currency text default 'USD',
  status public.payment_status not null default 'pending',
  payment_method text null, -- 'stripe', 'cash', 'transfer'
  proof_url text null, -- Para tus comprobantes manuales
  
  -- Referencias Polimórficas (Saber qué se pagó)
  subscription_id uuid references subscriptions(id),
  plan_id uuid REFERENCES public.membership_plans(id),
  reservation_id uuid references reservations(id),
  enrolment_id uuid references enrolments(id),
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Índice único para evitar pagos duplicados por reserva
-- Solo aplica si reservation_id NO es NULL
CREATE UNIQUE INDEX payments_unique_user_reservation
ON public.payments (user_id, reservation_id)
WHERE reservation_id IS NOT NULL;


-- Función que escucha cambios en la tabla PAYMENTS
create or replace function public.handle_payment_proof()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Caso: El usuario acaba de subir el comprobante (proof_url cambió de null a algo)
  -- O insertó un pago con comprobante directamente.
  if (new.proof_url is not null) and (new.reservation_id is not null) then
      
      -- Actualizamos la reserva para quitarle el tiempo de expiración
      -- Al poner expires_at en NULL, la función get_available_slots la considerará 
      -- válida indefinidamente hasta que el admin la confirme o cancele.
      update public.reservations
      set expires_at = null
      where id = new.reservation_id;
      
  end if;
  return new;
end;
$$;

-- Trigger para INSERT (si crean el pago ya con la url)
create trigger stop_timer_on_payment_insert
after insert on public.payments
for each row
execute function public.handle_payment_proof();

-- Trigger para UPDATE (si crean el pago vacio y luego hacen update con la url)
create trigger stop_timer_on_payment_update
after update on public.payments
for each row
when (old.proof_url is null and new.proof_url is not null)
execute function public.handle_payment_proof();

-- 1. Función de sincronización
create or replace function public.sync_reservation_status_on_payment()
returns trigger
language plpgsql
security invoker -- Importante: Ejecuta con permisos propios, RLS bloqueará lo que no deba
as $$
begin
  -- Solo actuamos si el pago está vinculado a una reserva
  if new.reservation_id is not null then

    -- CASO 1: Pago CONFIRMADO ('paid') -> Confirmar Reserva
    if new.status = 'paid' then
      update public.reservations
      set 
        status = 'confirmed',
        -- Limpiamos la expiración por seguridad, aunque el status 'confirmed' ya la protege
        expires_at = null 
      where id = new.reservation_id;

    -- CASO 2: Pago RECHAZADO/FALLIDO ('failed') -> Cancelar Reserva
    -- (Opcional: puedes agregar 'refunded' aquí también si quisieras)
    elsif new.status = 'failed' then 
      update public.reservations
      set status = 'cancelled'
      where id = new.reservation_id;
    end if;

  end if;

  return new;
end;
$$;

-- 2. Trigger que vigila cambios en la tabla PAYMENTS
create trigger update_reservation_on_payment_change
after update of status on public.payments
for each row
when (old.status is distinct from new.status) -- Solo si el estado cambió realmente
execute function public.sync_reservation_status_on_payment();

-- Función para activar suscripción/membresia al pagar
CREATE OR REPLACE FUNCTION public.handle_subscription_payment_activation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  paid_plan_duration interval;
  target_plan_id uuid;
  current_sub record;
BEGIN
  -- Solo actuamos si el pago:
  -- 1. Tiene una suscripción asociada
  -- 2. Pasó a estado 'paid'
  -- 3. Antes NO estaba 'paid' (evita dispararse doble si editas otra cosa)
  IF NEW.subscription_id IS NOT NULL 
     AND NEW.status = 'paid' 
     AND (OLD.status IS DISTINCT FROM 'paid') THEN

    -- A. Obtenemos datos de la suscripción actual
    SELECT * INTO current_sub 
    FROM public.subscriptions 
    WHERE id = NEW.subscription_id;

    -- B. Determinamos el Plan y su Duración
    -- Prioridad: Usamos el plan_id del pago (si existe), sino el de la suscripción
    target_plan_id := COALESCE(NEW.plan_id, current_sub.plan_id);
    
    SELECT duration INTO paid_plan_duration
    FROM public.membership_plans
    WHERE id = target_plan_id;

    -- C. ACTUALIZACIÓN INTELIGENTE (La Lógica de Negocio)
    UPDATE public.subscriptions
    SET 
      status = 'active',
      plan_id = target_plan_id, -- Actualizamos el plan (por si fue un Upgrade)
      
      -- 1. FECHA DE INICIO (start_date)
      -- Si la suscripción sigue viva (end_date > now), NO tocamos el inicio (mantiene antigüedad).
      -- Si es nueva o ya venció, reseteamos el inicio a HOY.
      start_date = CASE 
          WHEN current_sub.end_date > now() THEN current_sub.start_date 
          ELSE now() 
      END,

      -- 2. FECHA DE FIN (end_date) - Aquí está la magia
      -- Comparamos "Ahora" vs "Fecha Vencimiento Actual".
      -- Tomamos la mayor (GREATEST) y le sumamos la duración pagada.
      end_date = GREATEST(now(), COALESCE(current_sub.end_date, now())) + paid_plan_duration,
      
      updated_at = now()
    WHERE id = NEW.subscription_id;

  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_activate_subscription
AFTER UPDATE OF status ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.handle_subscription_payment_activation();

-- Función para confirmar inscripción al pagar el curso
create or replace function public.handle_enrolment_payment_confirmation()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.enrolment_id is not null and new.status = 'paid' and (old.status is distinct from 'paid') then
    
    -- 1. Confirmar la inscripción
    update public.enrolments
    set status = 'confirmed', updated_at = now()
    where id = new.enrolment_id;

    -- 2. Aumentar el contador de inscritos en el slot
    update public.course_slots
    set current_enrolments = current_enrolments + 1
    where id = (select course_slot_id from public.enrolments where id = new.enrolment_id);

  end if;
  return new;
end;
$$;

create trigger trigger_confirm_enrolment_on_payment
after update of status on public.payments
for each row
execute function public.handle_enrolment_payment_confirmation();

--{RLS}

-- Habilitar RLS
alter table public.payments enable row level security;

-- Admin ve todo
create policy "admin_manage_payments"
on public.payments for all
using ( public.has_role(auth.uid(), 'admin'::public.app_role) );

-- Usuario ve sus propios pagos
create policy "users_view_own_payments"
on public.payments for select
using ( auth.uid() = user_id );

-- Usuario puede crear pagos (pero solo asignados a sí mismo)
create policy "users_create_payments"
on public.payments for insert
with check ( 
   auth.uid() = user_id 
   and status = 'pending' -- No pueden auto-crearse pagos 'paid'
);

-- Usuario puede actualizar su pago (Solo para subir el comprobante si estaba null)
create policy "users_upload_proof"
on public.payments for update
using ( auth.uid() = user_id )
with check (
   auth.uid() = user_id
   and status = 'pending' -- No pueden editar si ya está pagado/reembolsado
   -- Opcional: Impedir que cambien el amount
   -- and amount = old.amount 
);
--------------------------------------------------------------------------FIN


create table public.enrolments (
  id uuid not null default gen_random_uuid (),
  course_id uuid not null,
  profile_id uuid null,
  child_id uuid null,
  enrolled_by uuid not null,
  status text not null default 'pending'::text,
  enrolled_at timestamp with time zone not null default now(),
  confirmed_at timestamp with time zone null,
  cancelled_at timestamp with time zone null,
  completed_at timestamp with time zone null,
  notes text null,
  course_slot_id uuid not null,
  constraint enrolments_pkey primary key (id),
  constraint enrolments_profile_id_fkey foreign KEY (profile_id) references profiles (id),
  constraint enrolments_child_id_fkey foreign KEY (child_id) references profile_children (id),
  constraint enrolments_course_id_fkey foreign KEY (course_id) references courses (id),
  constraint enrolments_course_slot_id_fkey foreign KEY (course_slot_id) references course_slots (id) on update RESTRICT on delete RESTRICT,
  constraint enrolments_enrolled_by_fkey foreign KEY (enrolled_by) references profiles (id),
  constraint enrolments_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'confirmed'::text,
          'cancelled'::text,
          'completed'::text
        ]
      )
    )
  ),
  constraint enrolments_check check (
    (
      (
        (profile_id is null)
        and (child_id is not null)
      )
      or (
        (profile_id is not null)
        and (child_id is null)
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_enrolments_child_id on public.enrolments using btree (child_id) TABLESPACE pg_default;

create index IF not exists idx_enrolments_course_id on public.enrolments using btree (course_id) TABLESPACE pg_default;

create index IF not exists idx_enrolments_profile_id on public.enrolments using btree (profile_id) TABLESPACE pg_default;


create table public.profile_children (
  id uuid not null default gen_random_uuid (),
  parent_id uuid not null,
  first_name text not null,
  last_name text not null,
  medical_notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  age integer not null,
  constraint profile_children_pkey primary key (id),
  constraint profile_children_parent_id_fkey foreign KEY (parent_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.course_slot_times (
  id uuid not null default gen_random_uuid (),
  course_slot_id uuid not null,
  day_of_week integer not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  created_at timestamp with time zone null default now(),
  constraint course_slot_times_pkey primary key (id),
  constraint course_slot_times_course_slot_id_fkey foreign KEY (course_slot_id) references course_slots (id) on update CASCADE on delete CASCADE,
  constraint course_slot_times_day_check check (
    (
      (day_of_week >= 0)
      and (day_of_week <= 6)
    )
  ),
  constraint course_slot_times_time_check check ((end_time > start_time))
) TABLESPACE pg_default;

create index IF not exists idx_course_slot_times_slot_id on public.course_slot_times using btree (course_slot_id) TABLESPACE pg_default;

create table public.course_slots (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  course_id uuid not null,
  name_slot text not null,
  constraint course_slots_pkey primary key (id),
  constraint course_slots_course_id_fkey foreign KEY (course_id) references courses (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_course_slots_course_id on public.course_slots using btree (course_id) TABLESPACE pg_default;

create table public.courses (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  facility_id uuid not null,
  age_min integer null,
  age_max integer null,
  max_participants integer null,
  price numeric(10, 2) null,
  start_date date null,
  end_date date null,
  is_active boolean null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  image_urls jsonb null default '[""]'::jsonb,
  instructor_id uuid null,
  constraint courses_pkey primary key (id),
  constraint courses_facility_id_fkey foreign KEY (facility_id) references facilities (id) on update CASCADE on delete RESTRICT,
  constraint courses_instructor_id_fkey foreign KEY (instructor_id) references instructors (id) on update CASCADE on delete RESTRICT,
  constraint courses_check check ((end_date >= start_date))
) TABLESPACE pg_default;
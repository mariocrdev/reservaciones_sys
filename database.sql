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
              );
              
        end if; -- Fin del check de tiempo futuro
          
      end if;

      -- Avanzar al siguiente slot
      curr_ts := curr_ts + slot_interval;
      
    end loop;
  end loop;
end;
$$;

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

-- TABLE membership_plans

-- Define qué vendes (Ej: "Plan Mensual", "Plan Anual")
create table public.membership_plans (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  description text null,
  price numeric(10, 2) not null,
  currency text default 'USD',
  duration_days integer not null, -- 30 para mensual, 365 para anual
  
  -- Aquí guardas las características visuales:
  -- Ej: ["Acceso a piscina", "10% dto en tienda", "Toalla gratis"]
  features jsonb not null default '[]'::jsonb, 
  
  image_url text null, -- Url de la imagen del plan
  is_active boolean default true,
  created_at timestamp with time zone default now()
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

-- TABLE subscriptions

-- Registra la suscripción real del usuario
create table public.subscriptions (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.membership_plans(id),
  
  status public.subscription_status not null default 'pending',
  
  -- Fechas críticas
  start_date timestamp with time zone not null default now(),
  end_date timestamp with time zone not null, -- Se llenará sola con el trigger
  
  auto_renew boolean default false,
  cancellation_reason text null, -- Útil para saber por qué se van
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create or replace function public.calculate_subscription_end_date()
returns trigger
language plpgsql
security definer
as $$
declare
  plan_duration int;
begin
  -- 1. Buscamos cuántos días dura el plan seleccionado
  select duration_days into plan_duration
  from public.membership_plans
  where id = new.plan_id;

  -- 2. Calculamos la fecha final sumando los días a la fecha de inicio
  -- new.start_date suele ser 'now()', pero si permites fechas futuras, esto lo respeta.
  new.end_date := new.start_date + (plan_duration || ' days')::interval;

  return new;
end;
$$;

-- Disparador: Antes de insertar una suscripción, calcula la fecha
create trigger set_subscription_dates
before insert on public.subscriptions
for each row
execute function public.calculate_subscription_end_date();

--{RLS}

-- Habilitar RLS
alter table public.subscriptions enable row level security;

-- 1. Ver suscripciones: Dueño o Admin
create policy "Ver suscripciones propias o admin"
on public.subscriptions
for select
using (
  auth.uid() = user_id
  or
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 2. Crear suscripción: Usuario para sí mismo (o Admin para otros)
create policy "Crear suscripción"
on public.subscriptions
for insert
with check (
  auth.uid() = user_id
  or
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 3. Actualizar: Admin total, Usuario restringido
-- Nota: Para seguridad real del status, usa la lógica de triggers de pago que vimos antes.
-- Esta política permite al Admin arreglar cualquier cosa.
create policy "Admin actualiza todo"
on public.subscriptions
for update
using (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Opcional: Permitir al usuario cancelar su auto-renovación
-- (Requiere que definas bien qué columnas permites tocar en tu frontend)
-- create policy "Usuario gestiona renovación" ...

--------------------------------------------------------------------------PAYMENTS

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
  --subscription_id uuid references subscriptions(id),
  reservation_id uuid references reservations(id),
  --enrollment_id uuid references enrollments(id),
  
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
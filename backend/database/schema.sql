-- Esquema inicial sin datos. Solo para una base nueva.
CREATE TABLE public.detalle_rutinas (
    id_detalle integer NOT NULL,
    id_rutina integer,
    texto character varying(150) NOT NULL,
    series character varying(50),
    peso character varying(50)
);

CREATE SEQUENCE public.detalle_rutinas_id_detalle_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.detalle_rutinas_id_detalle_seq OWNED BY public.detalle_rutinas.id_detalle;

CREATE TABLE public.ejercicios (
    id_ejercicio integer NOT NULL,
    nombre character varying(100) NOT NULL,
    grupo_muscular character varying(50) NOT NULL,
    descripcion text
);

CREATE SEQUENCE public.ejercicios_id_ejercicio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.ejercicios_id_ejercicio_seq OWNED BY public.ejercicios.id_ejercicio;

CREATE TABLE public.membresias (
    id_membresia integer NOT NULL,
    id_cliente integer,
    id_plan integer,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    estado character varying(20) NOT NULL
);

CREATE SEQUENCE public.membresias_id_membresia_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.membresias_id_membresia_seq OWNED BY public.membresias.id_membresia;

CREATE TABLE public.pagos (
    id_pago integer NOT NULL,
    id_membresia integer,
    id_recepcionista integer,
    monto numeric(10,2) NOT NULL,
    fecha_pago timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    metodo_pago character varying(50),
    num_factura_electronica character varying(100)
);

CREATE SEQUENCE public.pagos_id_pago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.pagos_id_pago_seq OWNED BY public.pagos.id_pago;

CREATE TABLE public.planes (
    id_plan integer NOT NULL,
    nombre_plan character varying(100) NOT NULL,
    precio numeric(10,2) NOT NULL,
    duracion_dias integer NOT NULL
);

CREATE SEQUENCE public.planes_id_plan_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.planes_id_plan_seq OWNED BY public.planes.id_plan;

CREATE TABLE public.roles (
    id_rol integer NOT NULL,
    nombre_rol character varying(50) NOT NULL
);

CREATE SEQUENCE public.roles_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.roles_id_rol_seq OWNED BY public.roles.id_rol;

CREATE TABLE public.rutinas (
    id_rutina integer NOT NULL,
    id_entrenador integer,
    id_cliente integer,
    nombre character varying(100) CONSTRAINT rutinas_nombre_rutina_not_null NOT NULL,
    fecha_asignacion date,
    grupo character varying(50) DEFAULT 'General'::character varying,
    nivel character varying(50) DEFAULT 'Principiante'::character varying,
    duracion integer DEFAULT 45,
    calorias integer DEFAULT 300,
    tipo_media character varying(20) DEFAULT 'imagen'::character varying,
    media_url text
);

CREATE SEQUENCE public.rutinas_id_rutina_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.rutinas_id_rutina_seq OWNED BY public.rutinas.id_rutina;

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    id_rol integer,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    telefono character varying(20),
    estado character varying(20) DEFAULT 'Activo'::character varying,
    debe_cambiar_password boolean DEFAULT true NOT NULL
);

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;

ALTER TABLE ONLY public.detalle_rutinas ALTER COLUMN id_detalle SET DEFAULT nextval('public.detalle_rutinas_id_detalle_seq'::regclass);

ALTER TABLE ONLY public.ejercicios ALTER COLUMN id_ejercicio SET DEFAULT nextval('public.ejercicios_id_ejercicio_seq'::regclass);

ALTER TABLE ONLY public.membresias ALTER COLUMN id_membresia SET DEFAULT nextval('public.membresias_id_membresia_seq'::regclass);

ALTER TABLE ONLY public.pagos ALTER COLUMN id_pago SET DEFAULT nextval('public.pagos_id_pago_seq'::regclass);

ALTER TABLE ONLY public.planes ALTER COLUMN id_plan SET DEFAULT nextval('public.planes_id_plan_seq'::regclass);

ALTER TABLE ONLY public.roles ALTER COLUMN id_rol SET DEFAULT nextval('public.roles_id_rol_seq'::regclass);

ALTER TABLE ONLY public.rutinas ALTER COLUMN id_rutina SET DEFAULT nextval('public.rutinas_id_rutina_seq'::regclass);

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);

ALTER TABLE ONLY public.detalle_rutinas
    ADD CONSTRAINT detalle_rutinas_pkey PRIMARY KEY (id_detalle);

ALTER TABLE ONLY public.ejercicios
    ADD CONSTRAINT ejercicios_pkey PRIMARY KEY (id_ejercicio);

ALTER TABLE ONLY public.membresias
    ADD CONSTRAINT membresias_pkey PRIMARY KEY (id_membresia);

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_num_factura_electronica_key UNIQUE (num_factura_electronica);

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_pkey PRIMARY KEY (id_pago);

ALTER TABLE ONLY public.planes
    ADD CONSTRAINT planes_pkey PRIMARY KEY (id_plan);

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_rol_key UNIQUE (nombre_rol);

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);

ALTER TABLE ONLY public.rutinas
    ADD CONSTRAINT rutinas_pkey PRIMARY KEY (id_rutina);

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);

ALTER TABLE ONLY public.detalle_rutinas
    ADD CONSTRAINT detalle_rutinas_id_rutina_fkey FOREIGN KEY (id_rutina) REFERENCES public.rutinas(id_rutina) ON DELETE CASCADE;

ALTER TABLE ONLY public.membresias
    ADD CONSTRAINT membresias_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.usuarios(id_usuario);

ALTER TABLE ONLY public.membresias
    ADD CONSTRAINT membresias_id_plan_fkey FOREIGN KEY (id_plan) REFERENCES public.planes(id_plan);

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_id_membresia_fkey FOREIGN KEY (id_membresia) REFERENCES public.membresias(id_membresia);

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_id_recepcionista_fkey FOREIGN KEY (id_recepcionista) REFERENCES public.usuarios(id_usuario);

ALTER TABLE ONLY public.rutinas
    ADD CONSTRAINT rutinas_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.usuarios(id_usuario);

ALTER TABLE ONLY public.rutinas
    ADD CONSTRAINT rutinas_id_entrenador_fkey FOREIGN KEY (id_entrenador) REFERENCES public.usuarios(id_usuario);

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol);

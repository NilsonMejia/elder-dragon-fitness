--
-- PostgreSQL database dump
--

\restrict axdGUdHHkJwmUtNwZEb56Gx3VjwF6NhP4S73dcUoVsLmTVJ3S20UCBMQMpP0Qmy

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: elder-dragon-fitness; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE "elder-dragon-fitness" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Mexico.1252';


\unrestrict axdGUdHHkJwmUtNwZEb56Gx3VjwF6NhP4S73dcUoVsLmTVJ3S20UCBMQMpP0Qmy
\encoding SQL_ASCII
\connect -reuse-previous=on "dbname='elder-dragon-fitness'"
\restrict axdGUdHHkJwmUtNwZEb56Gx3VjwF6NhP4S73dcUoVsLmTVJ3S20UCBMQMpP0Qmy

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: configuracion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.configuracion (
    id integer NOT NULL,
    datos jsonb NOT NULL,
    actualizado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT configuracion_id_check CHECK ((id = 1))
);


--
-- Name: detalle_rutinas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.detalle_rutinas (
    id_detalle integer NOT NULL,
    id_rutina integer,
    texto character varying(150) NOT NULL,
    series character varying(50),
    peso character varying(50),
    repeticiones character varying(50) DEFAULT ''::character varying NOT NULL,
    descanso_segundos integer DEFAULT 60 NOT NULL,
    CONSTRAINT detalle_rutinas_descanso_segundos_check CHECK ((descanso_segundos >= 0))
);


--
-- Name: detalle_rutinas_id_detalle_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.detalle_rutinas_id_detalle_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: detalle_rutinas_id_detalle_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.detalle_rutinas_id_detalle_seq OWNED BY public.detalle_rutinas.id_detalle;


--
-- Name: ejercicios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ejercicios (
    id_ejercicio integer NOT NULL,
    nombre character varying(100) NOT NULL,
    grupo_muscular character varying(50) NOT NULL,
    descripcion text
);


--
-- Name: ejercicios_id_ejercicio_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ejercicios_id_ejercicio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ejercicios_id_ejercicio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ejercicios_id_ejercicio_seq OWNED BY public.ejercicios.id_ejercicio;


--
-- Name: membresias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membresias (
    id_membresia integer NOT NULL,
    id_cliente integer,
    id_plan integer,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    estado character varying(20) NOT NULL
);


--
-- Name: membresias_id_membresia_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.membresias_id_membresia_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: membresias_id_membresia_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.membresias_id_membresia_seq OWNED BY public.membresias.id_membresia;


--
-- Name: pagos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pagos (
    id_pago integer NOT NULL,
    id_membresia integer,
    id_recepcionista integer,
    monto numeric(10,2) NOT NULL,
    fecha_pago timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    metodo_pago character varying(50),
    num_factura_electronica character varying(100),
    idempotency_key uuid
);


--
-- Name: pagos_id_pago_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pagos_id_pago_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pagos_id_pago_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pagos_id_pago_seq OWNED BY public.pagos.id_pago;


--
-- Name: planes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.planes (
    id_plan integer NOT NULL,
    nombre_plan character varying(100) NOT NULL,
    precio numeric(10,2) NOT NULL,
    duracion_dias integer NOT NULL
);


--
-- Name: planes_id_plan_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.planes_id_plan_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: planes_id_plan_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.planes_id_plan_seq OWNED BY public.planes.id_plan;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id_rol integer NOT NULL,
    nombre_rol character varying(50) NOT NULL
);


--
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_rol_seq OWNED BY public.roles.id_rol;


--
-- Name: rutina_asignaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rutina_asignaciones (
    id_asignacion integer NOT NULL,
    id_cliente integer NOT NULL,
    id_entrenador integer NOT NULL,
    id_plantilla integer,
    nombre character varying(100) NOT NULL,
    detalles jsonb NOT NULL,
    fecha_asignacion date DEFAULT CURRENT_DATE NOT NULL,
    notas text DEFAULT ''::text NOT NULL,
    activa boolean DEFAULT true NOT NULL,
    CONSTRAINT rutina_asignaciones_detalles_check CHECK ((jsonb_typeof(detalles) = 'array'::text))
);


--
-- Name: rutina_asignaciones_id_asignacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rutina_asignaciones_id_asignacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rutina_asignaciones_id_asignacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rutina_asignaciones_id_asignacion_seq OWNED BY public.rutina_asignaciones.id_asignacion;


--
-- Name: rutina_seguimiento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rutina_seguimiento (
    id_seguimiento integer NOT NULL,
    id_asignacion integer NOT NULL,
    id_autor integer NOT NULL,
    fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    observaciones text NOT NULL,
    completada boolean DEFAULT false NOT NULL
);


--
-- Name: rutina_seguimiento_id_seguimiento_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rutina_seguimiento_id_seguimiento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rutina_seguimiento_id_seguimiento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rutina_seguimiento_id_seguimiento_seq OWNED BY public.rutina_seguimiento.id_seguimiento;


--
-- Name: rutinas; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: rutinas_id_rutina_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rutinas_id_rutina_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rutinas_id_rutina_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rutinas_id_rutina_seq OWNED BY public.rutinas.id_rutina;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    name text NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    id_rol integer,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    telefono character varying(20),
    estado character varying(20) DEFAULT 'Activo'::character varying,
    debe_cambiar_password boolean DEFAULT true NOT NULL,
    fecha_registro timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    token_version integer DEFAULT 0 NOT NULL
);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- Name: detalle_rutinas id_detalle; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_rutinas ALTER COLUMN id_detalle SET DEFAULT nextval('public.detalle_rutinas_id_detalle_seq'::regclass);


--
-- Name: ejercicios id_ejercicio; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ejercicios ALTER COLUMN id_ejercicio SET DEFAULT nextval('public.ejercicios_id_ejercicio_seq'::regclass);


--
-- Name: membresias id_membresia; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membresias ALTER COLUMN id_membresia SET DEFAULT nextval('public.membresias_id_membresia_seq'::regclass);


--
-- Name: pagos id_pago; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos ALTER COLUMN id_pago SET DEFAULT nextval('public.pagos_id_pago_seq'::regclass);


--
-- Name: planes id_plan; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes ALTER COLUMN id_plan SET DEFAULT nextval('public.planes_id_plan_seq'::regclass);


--
-- Name: roles id_rol; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id_rol SET DEFAULT nextval('public.roles_id_rol_seq'::regclass);


--
-- Name: rutina_asignaciones id_asignacion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutina_asignaciones ALTER COLUMN id_asignacion SET DEFAULT nextval('public.rutina_asignaciones_id_asignacion_seq'::regclass);


--
-- Name: rutina_seguimiento id_seguimiento; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutina_seguimiento ALTER COLUMN id_seguimiento SET DEFAULT nextval('public.rutina_seguimiento_id_seguimiento_seq'::regclass);


--
-- Name: rutinas id_rutina; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutinas ALTER COLUMN id_rutina SET DEFAULT nextval('public.rutinas_id_rutina_seq'::regclass);


--
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- Data for Name: configuracion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.configuracion (id, datos, actualizado_en) FROM stdin;
1	{"correo": "", "moneda": "USD", "telefono": "", "diasAviso": 7, "direccion": "", "nombreLegal": "Elder Dragon Fitness", "alertasMorosos": true, "modoMantenimiento": false}	2026-09-19 21:14:42.630597-06
\.


--
-- Data for Name: detalle_rutinas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.detalle_rutinas (id_detalle, id_rutina, texto, series, peso, repeticiones, descanso_segundos) FROM stdin;
1	1	Press banca	4	Libre	10	60
2	1	Press inclinado	4	Libre	12	60
3	1	Extensión tríceps	3	Polea	15	60
4	2	Dominadas	4	Corporal	8	60
5	2	Remo con barra	4	Libre	10	60
6	2	Jalón al pecho	3	Máquina	12	60
7	3	Sentadilla	5	Libre	5	60
8	3	Prensa	4	Máquina	10	60
9	3	Zancadas	3	Mancuernas	12	60
10	4	Press militar	4	Libre	10	60
11	4	Elevaciones laterales	4	Mancuernas	15	60
12	4	Pájaros	3	Mancuernas	15	60
13	5	Curl con barra	4	Libre	10	60
14	5	Curl martillo	3	Mancuernas	12	60
15	5	Curl concentrado	3	Mancuerna	15	60
16	6	Fondos en paralelas	4	Corporal	Fallo	60
17	6	Extensión en polea	4	Polea	12	60
18	6	Press francés	3	Barra Z	10	60
19	7	Plancha isométrica	4	Corporal	60s	60
20	7	Crunches polea	3	Polea	20	60
21	7	Elevación piernas	3	Corporal	15	60
22	8	HIIT en cinta	10	N/A	1min	60
24	8	Salto de cuerda	5	N/A	3min	60
25	9	Peso muerto	3	Libre	8	60
26	9	Crunch abdominal	3	Corporal	20	60
27	9	Plancha	3	Corporal	60s	60
23	8	Remadora	15 min	N/A	Según indicación	60
\.


--
-- Data for Name: ejercicios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ejercicios (id_ejercicio, nombre, grupo_muscular, descripcion) FROM stdin;
1	Press de Banca Plano	Pecho	Con barra, manos a la anchura de los hombros.
2	Press Inclinado con Mancuernas	Pecho	Inclinación de 30-45 grados.
3	Aperturas en Máquina (Peck Deck)	Pecho	Contracción lenta y controlada.
4	Sentadilla Libre con Barra	Piernas	Bajar hasta romper el paralelo.
5	Prensa de Piernas	Piernas	Pies separados a la anchura de los hombros.
6	Extensiones de Cuádriceps	Piernas	Aislar el cuádriceps en máquina.
7	Peso Muerto Convencional	Espalda/Piernas	Mantener espalda recta y core apretado.
8	Jalón al Pecho con Polea	Espalda	Agarre amplio pronado.
9	Remo con Barra	Espalda	Inclinación del torso de 45 grados.
10	Press Militar con Mancuernas	Hombros	Sentado con respaldo a 90 grados.
11	Elevaciones Laterales	Hombros	Subir mancuernas hasta la altura del hombro.
12	Curl de Bíceps con Barra EZ	Brazos	Evitar balanceo del torso.
13	Curl Martillo con Mancuernas	Brazos	Trabaja el braquial y antebrazo.
14	Extensión de Tríceps en Polea	Brazos	Con cuerda, separar al final del movimiento.
15	Press Francés	Brazos	Con barra Z recostado en banco.
16	Crunch Abdominal	Core	Elevación corta concentrando el abdomen.
17	Plancha Isométrica	Core	Mantener postura recta apoyando antebrazos.
18	Zancadas (Lunges)	Piernas	Paso hacia adelante alternando piernas.
19	Hip Thrust (Empuje de Cadera)	Glúteos	Espalda apoyada en banco, empujar con la cadera.
20	Dominadas (Pull-ups)	Espalda	Colgado de la barra, subir hasta pasar la barbilla.
\.


--
-- Data for Name: membresias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.membresias (id_membresia, id_cliente, id_plan, fecha_inicio, fecha_fin, estado) FROM stdin;
1	7	3	2026-09-01	2026-10-01	Activa
2	8	4	2026-08-15	2026-11-15	Activa
3	9	3	2026-07-10	2026-08-10	Morosa
4	10	5	2026-01-10	2027-01-10	Activa
5	11	2	2026-06-01	2026-06-15	Inactiva
6	12	3	2026-09-05	2026-10-05	Activa
7	13	3	2026-09-02	2026-10-02	Activa
8	14	4	2026-07-20	2026-10-20	Activa
9	15	3	2026-08-01	2026-09-01	Morosa
10	16	3	2026-09-08	2026-10-08	Activa
11	17	3	2026-09-07	2026-10-07	Activa
12	18	5	2026-03-01	2027-03-01	Activa
13	19	3	2026-09-03	2026-10-03	Activa
14	20	1	2026-08-25	2026-08-26	Inactiva
15	7	1	2026-08-28	2026-08-29	Inactiva
16	12	3	2026-08-05	2026-09-05	Inactiva
17	14	3	2026-06-20	2026-07-20	Inactiva
18	10	3	2025-12-10	2026-01-10	Inactiva
19	19	3	2026-08-03	2026-09-03	Inactiva
20	17	1	2026-09-06	2026-09-07	Inactiva
\.


--
-- Data for Name: pagos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pagos (id_pago, id_membresia, id_recepcionista, monto, fecha_pago, metodo_pago, num_factura_electronica, idempotency_key) FROM stdin;
1	1	2	25.00	2026-09-01 08:30:00	Tarjeta	FE-EDF-001	\N
2	2	3	65.00	2026-08-15 14:20:00	Transferencia	FE-EDF-002	\N
3	4	2	220.00	2026-01-10 09:15:00	Tarjeta	FE-EDF-003	\N
4	5	3	15.00	2026-06-01 18:45:00	Efectivo	FE-EDF-004	\N
5	6	2	25.00	2026-09-05 07:10:00	Efectivo	FE-EDF-005	\N
6	7	3	25.00	2026-09-02 16:30:00	Tarjeta	FE-EDF-006	\N
7	8	2	65.00	2026-07-20 10:05:00	Transferencia	FE-EDF-007	\N
8	10	3	25.00	2026-09-08 19:20:00	Efectivo	FE-EDF-008	\N
9	11	2	25.00	2026-09-07 06:45:00	Tarjeta	FE-EDF-009	\N
10	12	3	220.00	2026-03-01 11:30:00	Tarjeta	FE-EDF-010	\N
11	13	2	25.00	2026-09-03 17:50:00	Efectivo	FE-EDF-011	\N
12	14	3	3.00	2026-08-25 08:00:00	Efectivo	FE-EDF-012	\N
13	15	2	3.00	2026-08-28 15:40:00	Efectivo	FE-EDF-013	\N
14	16	3	25.00	2026-08-05 18:10:00	Transferencia	FE-EDF-014	\N
15	17	2	25.00	2026-06-20 07:35:00	Tarjeta	FE-EDF-015	\N
16	18	3	25.00	2025-12-10 12:25:00	Tarjeta	FE-EDF-016	\N
17	19	2	25.00	2026-08-03 19:00:00	Efectivo	FE-EDF-017	\N
18	20	3	3.00	2026-09-06 14:15:00	Efectivo	FE-EDF-018	\N
19	9	2	25.00	2026-07-10 09:45:00	Transferencia	FE-EDF-019	\N
20	15	3	25.00	2026-08-01 17:20:00	Tarjeta	FE-EDF-020	\N
\.


--
-- Data for Name: planes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.planes (id_plan, nombre_plan, precio, duracion_dias) FROM stdin;
1	Pase Diario	3.00	1
2	Quincenal	15.00	15
3	Mensual Estándar	25.00	30
4	Trimestral VIP	65.00	90
5	Anual Premium	220.00	365
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id_rol, nombre_rol) FROM stdin;
1	Administrador
2	Recepcionista
3	Entrenador
4	Cliente
\.


--
-- Data for Name: rutina_asignaciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rutina_asignaciones (id_asignacion, id_cliente, id_entrenador, id_plantilla, nombre, detalles, fecha_asignacion, notas, activa) FROM stdin;
\.


--
-- Data for Name: rutina_seguimiento; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rutina_seguimiento (id_seguimiento, id_asignacion, id_autor, fecha, observaciones, completada) FROM stdin;
\.


--
-- Data for Name: rutinas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rutinas (id_rutina, id_entrenador, id_cliente, nombre, fecha_asignacion, grupo, nivel, duracion, calorias, tipo_media, media_url) FROM stdin;
1	\N	\N	Hipertrofia Pecho y Tríceps	\N	Pecho	Intermedio	60	450	imagen	https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80
2	\N	\N	Amplitud de Espalda Total	\N	Espalda	Avanzado	65	480	imagen	https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=800&q=80
3	\N	\N	Fuerza Pierna Completa	\N	Pierna	Avanzado	75	620	imagen	https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80
4	\N	\N	Hombros Rocosos 3D	\N	Hombro	Intermedio	45	320	imagen	https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80
5	\N	\N	Bíceps Picos de Montaña	\N	Bíceps	Principiante	35	200	imagen	https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80
6	\N	\N	Tríceps Herradura de Hierro	\N	Tríceps	Intermedio	35	220	imagen	https://images.unsplash.com/photo-1530822847156-5df684ec5ee1?auto=format&fit=crop&w=800&q=80
7	\N	\N	Core Abdomen Blindado	\N	Core	Principiante	20	150	imagen	https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80
8	\N	\N	Quema de Grasa Extrema	\N	Cardio	Intermedio	40	500	imagen	https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=800&q=80
9	\N	\N	Acondicionamiento Full Body	\N	Full Body	Principiante	45	380	imagen	https://images.unsplash.com/photo-1517836357463-d25dfe09ce1e?auto=format&fit=crop&w=800&q=80
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schema_migrations (name, applied_at) FROM stdin;
001_complete_workflows.sql	2026-09-19 21:14:42.630597-06
002_catalog_repetitions.sql	2026-09-19 21:27:51.002963-06
003_data_checks.sql	2026-09-20 11:58:41.042434-06
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id_usuario, id_rol, nombre, apellido, email, password_hash, telefono, estado, debe_cambiar_password, fecha_registro, token_version) FROM stdin;
7	4	Jorge	López	jorge.lopez@gmail.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7200-0007	Activo	f	\N	0
8	4	María	Fernández	maria.fer@hotmail.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7200-0008	Activo	f	\N	0
9	4	Pedro	Ramírez	pedro.ramirez@yahoo.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7200-0009	Moroso	f	\N	0
10	4	Sofía	Castro	sofia.castro@gmail.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7200-0010	Activo	f	\N	0
12	4	Laura	Jiménez	laura.j@gmail.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7200-0012	Activo	f	\N	0
13	4	Fernando	Vásquez	fer.vasquez@gmail.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7200-0013	Activo	f	\N	0
14	4	Gabriela	Rojas	gaby.rojas@hotmail.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7200-0014	Activo	f	\N	0
15	4	Ricardo	Méndez	ricardo.m@gmail.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7200-0015	Moroso	f	\N	0
1	1	Nilson Nathan	Mejía Ascencio	admin@elderdragon.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7000-0001	Activo	f	\N	0
22	2	Recepcion	Elder Dragon	recepcion@elderdragon.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7000-0002	Activo	f	2026-09-19 21:14:43.566095-06	0
23	3	Entrenador	Elder Dragon	entrenador@elderdragon.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7000-0003	Activo	f	2026-09-19 21:14:43.566095-06	0
24	4	Cliente	Elder Dragon	cliente@elderdragon.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7000-0004	Activo	f	2026-09-19 21:14:43.566095-06	0
2	2	Yasmidali Maricela	Galdamez Tejada	recepcion1@elderdragon.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7000-0002	Activo	f	\N	0
3	2	Marlon Jonathan	Rodríguez Orellana	recepcion2@elderdragon.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7000-0003	Activo	f	\N	0
4	3	Carlos	Pérez	entrenador.carlos@elderdragon.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7100-0004	Activo	f	\N	0
5	3	Ana	Gómez	entrenador.ana@elderdragon.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7100-0005	Activo	f	\N	0
6	3	Luis	Martínez	entrenador.luis@elderdragon.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7100-0006	Activo	f	\N	0
11	4	Diego	Herrera	diego.h@outlook.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7200-0011	Inactivo	f	\N	0
16	4	Daniela	Flores	dani.flores@yahoo.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7200-0016	Activo	f	\N	0
17	4	Hugo	Morales	hugo.morales@gmail.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7200-0017	Activo	f	\N	0
18	4	Elena	Cruz	elena.cruz@outlook.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7200-0018	Activo	f	\N	0
19	4	Andrés	Ortiz	andres.ortiz@gmail.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7200-0019	Activo	f	\N	0
20	4	Patricia	Reyes	patty.reyes@gmail.com	$2b$10$pkSYhmOBkSJiDIc4rJtp6eBZ8ZkGqfvkNuZ2E8A7lORLp/6Jsj7aq	7200-0020	Inactivo	f	\N	0
\.


--
-- Name: detalle_rutinas_id_detalle_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.detalle_rutinas_id_detalle_seq', 27, true);


--
-- Name: ejercicios_id_ejercicio_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ejercicios_id_ejercicio_seq', 20, true);


--
-- Name: membresias_id_membresia_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.membresias_id_membresia_seq', 20, true);


--
-- Name: pagos_id_pago_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pagos_id_pago_seq', 20, true);


--
-- Name: planes_id_plan_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.planes_id_plan_seq', 5, true);


--
-- Name: roles_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_rol_seq', 8, true);


--
-- Name: rutina_asignaciones_id_asignacion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rutina_asignaciones_id_asignacion_seq', 1, false);


--
-- Name: rutina_seguimiento_id_seguimiento_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rutina_seguimiento_id_seguimiento_seq', 1, false);


--
-- Name: rutinas_id_rutina_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rutinas_id_rutina_seq', 9, true);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 24, true);


--
-- Name: configuracion configuracion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.configuracion
    ADD CONSTRAINT configuracion_pkey PRIMARY KEY (id);


--
-- Name: detalle_rutinas detalle_rutinas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_rutinas
    ADD CONSTRAINT detalle_rutinas_pkey PRIMARY KEY (id_detalle);


--
-- Name: ejercicios ejercicios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ejercicios
    ADD CONSTRAINT ejercicios_pkey PRIMARY KEY (id_ejercicio);


--
-- Name: membresias membresias_fechas_validas; Type: CHECK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.membresias
    ADD CONSTRAINT membresias_fechas_validas CHECK ((fecha_fin > fecha_inicio)) NOT VALID;


--
-- Name: membresias membresias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membresias
    ADD CONSTRAINT membresias_pkey PRIMARY KEY (id_membresia);


--
-- Name: pagos pagos_idempotency_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: pagos pagos_monto_positivo; Type: CHECK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.pagos
    ADD CONSTRAINT pagos_monto_positivo CHECK ((monto > (0)::numeric)) NOT VALID;


--
-- Name: pagos pagos_num_factura_electronica_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_num_factura_electronica_key UNIQUE (num_factura_electronica);


--
-- Name: pagos pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_pkey PRIMARY KEY (id_pago);


--
-- Name: planes planes_duracion_positiva; Type: CHECK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.planes
    ADD CONSTRAINT planes_duracion_positiva CHECK ((duracion_dias > 0)) NOT VALID;


--
-- Name: planes planes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.planes
    ADD CONSTRAINT planes_pkey PRIMARY KEY (id_plan);


--
-- Name: planes planes_precio_positivo; Type: CHECK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.planes
    ADD CONSTRAINT planes_precio_positivo CHECK ((precio > (0)::numeric)) NOT VALID;


--
-- Name: roles roles_nombre_rol_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_rol_key UNIQUE (nombre_rol);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- Name: rutina_asignaciones rutina_asignaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutina_asignaciones
    ADD CONSTRAINT rutina_asignaciones_pkey PRIMARY KEY (id_asignacion);


--
-- Name: rutina_seguimiento rutina_seguimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutina_seguimiento
    ADD CONSTRAINT rutina_seguimiento_pkey PRIMARY KEY (id_seguimiento);


--
-- Name: rutinas rutinas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutinas
    ADD CONSTRAINT rutinas_pkey PRIMARY KEY (id_rutina);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (name);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_estado_valido; Type: CHECK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE public.usuarios
    ADD CONSTRAINT usuarios_estado_valido CHECK (((estado)::text = ANY ((ARRAY['Activo'::character varying, 'Inactivo'::character varying, 'Moroso'::character varying])::text[]))) NOT VALID;


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: asignacion_activa_cliente_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX asignacion_activa_cliente_idx ON public.rutina_asignaciones USING btree (id_cliente) WHERE activa;


--
-- Name: membresias_cliente_fin_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX membresias_cliente_fin_idx ON public.membresias USING btree (id_cliente, fecha_fin DESC);


--
-- Name: detalle_rutinas detalle_rutinas_id_rutina_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.detalle_rutinas
    ADD CONSTRAINT detalle_rutinas_id_rutina_fkey FOREIGN KEY (id_rutina) REFERENCES public.rutinas(id_rutina) ON DELETE CASCADE;


--
-- Name: membresias membresias_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membresias
    ADD CONSTRAINT membresias_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.usuarios(id_usuario);


--
-- Name: membresias membresias_id_plan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membresias
    ADD CONSTRAINT membresias_id_plan_fkey FOREIGN KEY (id_plan) REFERENCES public.planes(id_plan);


--
-- Name: pagos pagos_id_membresia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_id_membresia_fkey FOREIGN KEY (id_membresia) REFERENCES public.membresias(id_membresia);


--
-- Name: pagos pagos_id_recepcionista_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_id_recepcionista_fkey FOREIGN KEY (id_recepcionista) REFERENCES public.usuarios(id_usuario);


--
-- Name: rutina_asignaciones rutina_asignaciones_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutina_asignaciones
    ADD CONSTRAINT rutina_asignaciones_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.usuarios(id_usuario);


--
-- Name: rutina_asignaciones rutina_asignaciones_id_entrenador_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutina_asignaciones
    ADD CONSTRAINT rutina_asignaciones_id_entrenador_fkey FOREIGN KEY (id_entrenador) REFERENCES public.usuarios(id_usuario);


--
-- Name: rutina_asignaciones rutina_asignaciones_id_plantilla_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutina_asignaciones
    ADD CONSTRAINT rutina_asignaciones_id_plantilla_fkey FOREIGN KEY (id_plantilla) REFERENCES public.rutinas(id_rutina) ON DELETE SET NULL;


--
-- Name: rutina_seguimiento rutina_seguimiento_id_asignacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutina_seguimiento
    ADD CONSTRAINT rutina_seguimiento_id_asignacion_fkey FOREIGN KEY (id_asignacion) REFERENCES public.rutina_asignaciones(id_asignacion);


--
-- Name: rutina_seguimiento rutina_seguimiento_id_autor_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutina_seguimiento
    ADD CONSTRAINT rutina_seguimiento_id_autor_fkey FOREIGN KEY (id_autor) REFERENCES public.usuarios(id_usuario);


--
-- Name: rutinas rutinas_id_cliente_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutinas
    ADD CONSTRAINT rutinas_id_cliente_fkey FOREIGN KEY (id_cliente) REFERENCES public.usuarios(id_usuario);


--
-- Name: rutinas rutinas_id_entrenador_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutinas
    ADD CONSTRAINT rutinas_id_entrenador_fkey FOREIGN KEY (id_entrenador) REFERENCES public.usuarios(id_usuario);


--
-- Name: usuarios usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol);


--
-- PostgreSQL database dump complete
--

\unrestrict axdGUdHHkJwmUtNwZEb56Gx3VjwF6NhP4S73dcUoVsLmTVJ3S20UCBMQMpP0Qmy


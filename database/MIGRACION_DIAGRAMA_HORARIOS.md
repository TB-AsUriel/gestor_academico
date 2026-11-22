# Migración: `diagrama_con_horarios.dia` (borrador ejecutable parcial)

**Fuente:** `C:\Users\uriel\Downloads\diagrama_con_horarios.dia` (comparado con `ER_NUEVO_CORREGIDO.dia` / esquema canónico `database/001_schema.sql`).
**Extracción detectada:** `database/migration_horarios/diagrama_con_horarios_extract.txt`.

> Estado: **NO aplicado automáticamente**. Requiere completar campos/FK/semántica desde el diagrama original y coordinar backend PHP externo (`api_gestor`) y BD en servidor.

## 1. Delta de entidades (detectado)
| Actual (001_schema / ER_NUEVO_CORREGIDO) | Nuevo (diagrama_con_horarios) | Notas |
|---|---|---|
| `area` | `AREAS` | Nuevas cols detectadas: `poblacion`, `matricula_trabajador` (confirmar PK/FK). |
| `docente` | `DOCENTES` | Cambios tipo/cols detectados (`genero ENUM(H,M)`, `fecha_nacimiento`; revisar contacto/correo). |
| `historial_docente` | `HISTORIAL_DOCENTES` | PK/cols difieren en extracto (confirmar). |
| `carrera` | `CARRERAS` | `plan_estudios` nulable?; tipos distintos. |
| `reticula` | `RETICULAS` | Aparece `clave_reticula` PK simple (vs PK compuesta actual). |
| `alumno` | `ALUMNOS` | `numero_control` INT?, `año_ingreso`, campos distintos; revisar FKs/carrera. |
| `grupo` | `GRUPOS` | `clave_grupo/clave_materia` INT?, sin `id_periodo/turno/semestre` en extracto (confirmar). |
| `historial_alumno` | `HISTORIAL_ALUMNOS` | `id_calificacion_final` PK (confirmar relación con grupo/carga). |
| `kardex` | `KARDEXS` | `periodo ENUM(VER,EN-JU,AG-DIC)` vs `clave_periodo` FK actual (confirmar). |
| `materia` | `MATERIAS` | Nuevas cols: `horas_teoricas/practicas`, `semestre_recomendado`. |
| `usuario` | `USUARIOS` | `usuario`, `contrasena_hash`, `rol ENUM(Admin,Docente,Alumno)`. |
| `carga_academica` | **`HORARIOS` (nombre)** | **CRÍTICO/ambiguo**: en diagrama `HORARIOS` tiene `id_horario,dia_semana(LUN..SAB),hora_inicio,hora_fin,salon(VARCHAR),matricula_trabajador,numero_control` (sin `clave_grupo/id_salon/id_dia` numérico). No equivale 1:1 a `horario` (bloques por grupo/salón) ni a `carga_academica` (inscripción). Definir mapeo antes de migrar. |
| `edificio` | `EDIFICIOS` | Nombre pluralizado (estructura similar en extracto). |
| `horario` (bloques) | ¿`HORARIOS`? / redefinir | Requiere decisión de modelo: horario por grupo vs por alumno/docente. |
| `periodo`, `salon` | ¿ausentes/renombrados? | No detectados como tabla separada en extracto parcial; confirmar (impacta FKs de grupo/horario). |

## 2. Pasos de ejecución (orden obligatorio)
1. **Confirmar diagrama**: exportar a SQL/imagen o completar `diagrama_con_horarios_extract.txt` con TODAS las columnas, PK, FK, UNIQUE, CHECK e índices (especialmente `HORARIOS`, `GRUPOS`, `RETICULAS`, `KARDEXS`, `PERIODO/SALON` si existen).
2. **Backup BD**: `mysqldump --routines --triggers gestor_academico > backup_pre_horarios.sql`.
3. **BD (staging)**: adaptar y ejecutar `database/005_migration_horarios.sql` (borrador) sobre copia; validar conteos, FKs, triggers y vistas.
4. **BD (canónico)**: actualizar `database/001_schema.sql`, `002_views.sql`, `003_triggers.sql`, `004_seed_demo.sql` al modelo final confirmado.
5. **Backend PHP (externo, `api_gestor`)**: alinear consultas/JSON de endpoints admin/alumno/docente al nuevo esquema y contratos.
6. **Frontend (este repo)**: actualizar contratos y UI:
   - `src/app/shared/interfaces/index.ts`
   - `src/app/core/api.service.ts`
   - `src/app/admin/catalogo/catalogo.config.ts`, `src/app/admin/catalogo/catalogo.page.ts`
   - `src/app/admin/reticula/*`, `src/app/admin/calificaciones/*`, `src/app/admin/usuarios/*`, `src/app/admin/historial-docente/*`
   - `src/app/shared/utils/horario.ts`, `src/app/shared/components/horario-grid/*`
   - `src/app/alumno/horario/*`, `src/app/alumno/carga/*`, `src/app/docente/horario/*`, `src/app/docente/mis-grupos/*`, `src/app/docente/grupo/*`
7. **Verificación**: pruebas API + `npm run build`/`npm run lint` + flujos por rol (catálogos, horarios, carga, calificaciones, kardex). 
8. **Despliegue coordinado**: BD → backend → frontend; rollback = restore backup + redeploy previo.

## 3. Bloqueantes para ejecución completa
- Columnas/PK/FK completas y semántica de `HORARIOS`/`carga_academica`/`horario` no confirmadas desde `.dia`.
- Acceso a BD MySQL/MariaDB en vivo y al código del backend `api_gestor` (fuera de este repositorio).
- Existen cambios locales no relacionados en el working tree; evitar mezclar con la migración.

## 4. Artefactos generados en esta ejecución
- `database/migration_horarios/diagrama_con_horarios_extract.txt` — extracción parcial (tablas/columnas detectadas).
- `database/005_migration_horarios.sql` — borrador de migración/estructura objetivo (requiere revisión).
- `database/MIGRACION_DIAGRAMA_HORARIOS.md` — este plan operativo.

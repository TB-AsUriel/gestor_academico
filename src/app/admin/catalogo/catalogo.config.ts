export type CampoCatalogoTipo =
  | 'text'
  | 'number'
  | 'email'
  | 'tel'
  | 'date'
  | 'time'
  | 'select'
  | 'textarea';

export type OpcionValor = string | number | boolean;

export interface OpcionCatalogo {
  value: OpcionValor;
  label: string;
}

export interface CampoCatalogo {
  key: string;
  label: string;
  type: CampoCatalogoTipo;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: OpcionCatalogo[];
  optionsFrom?: string;
  optionValue?: string;
  optionLabel?: string | ((fila: Record<string, any>) => string);
  hideOnCreate?: boolean;
  hideOnEdit?: boolean;
  defaultValue?: unknown;
}

export interface ColumnaCatalogo {
  key: string;
  label: string;
  format?: (fila: Record<string, any>) => string;
}

export interface CatalogoConfig {
  titulo: string;
  descripcion: string;
  endpoint: string;
  pk: string;
  auto: boolean;
  columnas: ColumnaCatalogo[];
  campos: CampoCatalogo[];
  singular: string;
}

const SI_NO: OpcionCatalogo[] = [
  { value: 'SI', label: 'Sí' },
  { value: 'NO', label: 'No' }
];

const DIAS: OpcionCatalogo[] = [
  { value: 'LUN', label: 'Lunes' },
  { value: 'MAR', label: 'Martes' },
  { value: 'MIE', label: 'Miércoles' },
  { value: 'JUE', label: 'Jueves' },
  { value: 'VIE', label: 'Viernes' },
  { value: 'SAB', label: 'Sábado' }
];

const nombreCompleto = (fila: Record<string, any>): string => {
  return [fila['nombre'], fila['snombre'], fila['apellido_paterno'], fila['apellido_materno']]
    .filter(Boolean)
    .join(' ');
};

const texto = (fila: Record<string, any>, key: string): string => {
  const valor = fila[key];
  return valor === null || valor === undefined ? '' : String(valor);
};

export const CATALOGOS: Record<string, CatalogoConfig> = {
  areas: {
    titulo: 'Áreas',
    descripcion: 'Áreas/roles para historial docente.',
    endpoint: 'areas',
    pk: 'id_area_rol',
    auto: true,
    singular: 'área',
    columnas: [
      { key: 'id_area_rol', label: 'ID' },
      { key: 'nombre_area', label: 'Nombre del área' },
      { key: 'poblacion', label: 'Docentes', format: (f) => texto(f, 'poblacion') || '0' }
    ],
    campos: [
      { key: 'id_area_rol', label: 'ID', type: 'number', hideOnCreate: true, hideOnEdit: true },
      { key: 'nombre_area', label: 'Nombre del área', type: 'text', required: true }
    ]
  },
  carreras: {
    titulo: 'Carreras',
    descripcion: 'Oferta educativa y planes de estudio.',
    endpoint: 'carreras',
    pk: 'clave_carrera',
    auto: false,
    singular: 'carrera',
    columnas: [
      { key: 'clave_carrera', label: 'Clave' },
      { key: 'nombre_carrera', label: 'Carrera' },
      { key: 'plan_estudios', label: 'Plan' },
      { key: 'total_creditos', label: 'Créditos' }
    ],
    campos: [
      { key: 'clave_carrera', label: 'Clave', type: 'text', required: true, hideOnEdit: true },
      { key: 'nombre_carrera', label: 'Nombre de la carrera', type: 'text', required: true },
      { key: 'plan_estudios', label: 'Plan de estudios', type: 'text', required: true },
      { key: 'total_creditos', label: 'Total de créditos', type: 'number', required: true, min: 1 }
    ]
  },
  materias: {
    titulo: 'Materias',
    descripcion: 'Catálogo de asignaturas y créditos.',
    endpoint: 'materias',
    pk: 'clave_materia',
    auto: true,
    singular: 'materia',
    columnas: [
      { key: 'clave_materia', label: 'Clave' },
      { key: 'nombre_materia', label: 'Materia' },
      { key: 'creditos', label: 'Créditos' },
      { key: 'semestre_recomendado', label: 'Semestre', format: (f) => texto(f, 'semestre_recomendado') || '—' },
      { key: 'tipo_materia', label: 'Tipo' },
      { key: 'clave_materia_recur', label: 'Seriación', format: (f) => texto(f, 'clave_materia_recur') || '—' }
    ],
    campos: [
      { key: 'clave_materia', label: 'Clave', type: 'number', hideOnCreate: true, hideOnEdit: true },
      { key: 'nombre_materia', label: 'Nombre de la materia', type: 'text', required: true },
      { key: 'creditos', label: 'Créditos', type: 'number', required: true, min: 1 },
      { key: 'horas_teoricas', label: 'Horas teóricas', type: 'number', min: 0 },
      { key: 'horas_practicas', label: 'Horas prácticas', type: 'number', min: 0 },
      { key: 'semestre_recomendado', label: 'Semestre recomendado', type: 'number', min: 1 },
      {
        key: 'tipo_materia',
        label: 'Tipo',
        type: 'select',
        required: true,
        defaultValue: 'Cientifica Basica',
        options: [
          { value: 'Cientifica Basica', label: 'Científica básica' },
          { value: 'Social Humanistica', label: 'Social humanística' },
          { value: 'Integradora', label: 'Integradora' }
        ]
      },
      { key: 'clave_materia_recur', label: 'Clave materia antecedente', type: 'number' }
    ]
  },
  alumnos: {
    titulo: 'Alumnos',
    descripcion: 'Expedientes escolares y datos de contacto.',
    endpoint: 'alumnos',
    pk: 'numero_control',
    auto: false,
    singular: 'alumno',
    columnas: [
      { key: 'numero_control', label: 'No. control' },
      { key: 'nombre', label: 'Nombre', format: nombreCompleto },
      { key: 'nombre_carrera', label: 'Carrera' },
      { key: 'semestre_actual', label: 'Semestre' },
      { key: 'creditos_acumulados', label: 'Créditos' },
      { key: 'anio_ingreso', label: 'Ingreso' },
      { key: 'estatus', label: 'Estatus' }
    ],
    campos: [
      { key: 'numero_control', label: 'Número de control', type: 'number', required: true, hideOnEdit: true },
      { key: 'nombre', label: 'Nombre(s)', type: 'text', required: true },
      { key: 'snombre', label: 'Segundo nombre', type: 'text' },
      { key: 'apellido_paterno', label: 'Apellido paterno', type: 'text', required: true },
      { key: 'apellido_materno', label: 'Apellido materno', type: 'text' },
      { key: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date', required: true },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        required: true,
        options: [
          { value: 'H', label: 'Hombre' },
          { value: 'M', label: 'Mujer' }
        ]
      },
            { key: 'correo_institucional', label: 'Correo institucional', type: 'email', required: true },
      { key: 'telefono', label: 'Telefono', type: 'tel', required: true },
      { key: 'calle', label: 'Calle', type: 'text', required: true },
      { key: 'colonia', label: 'Colonia', type: 'text', required: true },
      { key: 'no_exterior', label: 'No. exterior', type: 'text' },
      { key: 'no_interior', label: 'No. interior', type: 'text' },
      { key: 'codigo_postal', label: 'Codigo postal', type: 'text', required: true },
      { key: 'municipio', label: 'Municipio', type: 'text', required: true },
      { key: 'estado', label: 'Estado', type: 'text', required: true },
      {
        key: 'fk_clave_carrera',
        label: 'Carrera',
        type: 'select',
        required: true,
        optionsFrom: 'carreras',
        optionValue: 'clave_carrera',
        optionLabel: (f) => `${f['clave_carrera']} - ${f['nombre_carrera']}`
      },
      { key: 'semestre_actual', label: 'Semestre actual', type: 'number', required: true, min: 1, defaultValue: 1 },
      { key: 'anio_ingreso', label: 'Año de ingreso', type: 'number', required: true, min: 1900, max: 2200, defaultValue: new Date().getFullYear() },
      {
        key: 'estatus',
        label: 'Estatus',
        type: 'select',
        required: true,
        defaultValue: 'ACTIVO',
        options: [
          { value: 'ACTIVO', label: 'Activo' },
          { value: 'BAJA', label: 'Baja' },
          { value: 'BAJA_EXTRA', label: 'Baja extra' }
        ]
      }
    ]
  },
  docentes: {
    titulo: 'Docentes',
    descripcion: 'Plantilla docente y datos institucionales.',
    endpoint: 'docentes',
    pk: 'matricula_trabajador',
    auto: false,
    singular: 'docente',
    columnas: [
      { key: 'matricula_trabajador', label: 'Matrícula' },
      { key: 'nombre', label: 'Nombre', format: nombreCompleto },
      { key: 'correo_institucional', label: 'Correo' },
      { key: 'telefono', label: 'Teléfono' }
    ],
    campos: [
      { key: 'matricula_trabajador', label: 'Matrícula', type: 'number', required: true, hideOnEdit: true },
      { key: 'nombre', label: 'Nombre(s)', type: 'text', required: true },
      { key: 'snombre', label: 'Segundo nombre', type: 'text' },
      { key: 'apellido_paterno', label: 'Apellido paterno', type: 'text', required: true },
      { key: 'apellido_materno', label: 'Apellido materno', type: 'text', required: true },
      {
        key: 'genero',
        label: 'Género',
        type: 'select',
        required: true,
        options: [
          { value: 'H', label: 'Hombre' },
          { value: 'M', label: 'Mujer' }
        ]
      },
      { key: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date', required: true },
            { key: 'correo_institucional', label: 'Correo institucional', type: 'email', required: true },
      { key: 'telefono', label: 'Telefono', type: 'tel', required: true },
      { key: 'calle', label: 'Calle', type: 'text', required: true },
      { key: 'colonia', label: 'Colonia', type: 'text', required: true },
      { key: 'no_exterior', label: 'No. exterior', type: 'text' },
      { key: 'no_interior', label: 'No. interior', type: 'text' },
      { key: 'codigo_postal', label: 'Codigo postal', type: 'text', required: true },
      { key: 'municipio', label: 'Municipio', type: 'text', required: true },
      { key: 'estado', label: 'Estado', type: 'text', required: true }
    ]
  },
  edificios: {
    titulo: 'Edificios',
    descripcion: 'Infraestructura y capacidad.',
    endpoint: 'edificios',
    pk: 'no_edificio',
    auto: true,
    singular: 'edificio',
    columnas: [
      { key: 'no_edificio', label: 'No.' },
      { key: 'nombre_edificio', label: 'Edificio' },
      { key: 'laboratorio', label: 'Laboratorio' },
      { key: 'salon', label: 'Salones' },
      { key: 'auditorio', label: 'Auditorio' },
      { key: 'capacidad', label: 'Capacidad' }
    ],
    campos: [
      { key: 'no_edificio', label: 'Número de edificio', type: 'number', hideOnCreate: true, hideOnEdit: true, min: 1 },
      { key: 'nombre_edificio', label: 'Nombre', type: 'text', required: true },
      { key: 'laboratorio', label: '¿Tiene laboratorio?', type: 'select', required: true, defaultValue: 'NO', options: SI_NO },
      { key: 'salon', label: '¿Tiene salones?', type: 'select', required: true, defaultValue: 'SI', options: SI_NO },
      { key: 'auditorio', label: '¿Tiene auditorio?', type: 'select', required: true, defaultValue: 'NO', options: SI_NO },
      { key: 'capacidad', label: 'Capacidad total', type: 'number', required: true, min: 1 }
    ]
  },
  grupos: {
    titulo: 'Grupos',
    descripcion: 'Grupos por materia, docente, edificio y cupo.',
    endpoint: 'grupos',
    pk: 'clave_grupo',
    auto: true,
    singular: 'grupo',
    columnas: [
      { key: 'clave_grupo', label: 'Grupo' },
      { key: 'nombre_materia', label: 'Materia' },
      { key: 'nombre_docente', label: 'Docente', format: (f) => texto(f, 'nombre_docente') || '—' },
      { key: 'nombre_edificio', label: 'Edificio', format: (f) => texto(f, 'nombre_edificio') || '—' },
      { key: 'cupo', label: 'Cupo' },
      { key: 'inscritos', label: 'Inscritos', format: (f) => texto(f, 'inscritos') || '0' }
    ],
    campos: [
      { key: 'clave_grupo', label: 'Clave del grupo', type: 'number', hideOnCreate: true, hideOnEdit: true },
      {
        key: 'clave_materia',
        label: 'Materia',
        type: 'select',
        required: true,
        optionsFrom: 'materias',
        optionValue: 'clave_materia',
        optionLabel: (f) => `${f['clave_materia']} - ${f['nombre_materia']}`
      },
      {
        key: 'matricula_trabajador',
        label: 'Docente',
        type: 'select',
        required: true,
        optionsFrom: 'docentes',
        optionValue: 'matricula_trabajador',
        optionLabel: nombreCompleto
      },
      {
        key: 'no_edificio',
        label: 'Edificio',
        type: 'select',
        required: true,
        optionsFrom: 'edificios',
        optionValue: 'no_edificio',
        optionLabel: (f) => `${f['no_edificio']} - ${f['nombre_edificio']}`
      },
      { key: 'cupo', label: 'Cupo', type: 'number', required: true, min: 1, defaultValue: 30 }
    ]
  },
  horarios: {
    titulo: 'Horarios',
    descripcion: 'Bloques de horario (docente/alumno/materia/edificio).',
    endpoint: 'horarios',
    pk: 'id_horario',
    auto: true,
    singular: 'horario',
    columnas: [
      { key: 'id_horario', label: 'ID' },
      { key: 'nombre_dia', label: 'Día' },
      { key: 'hora_inicio', label: 'Inicio' },
      { key: 'hora_fin', label: 'Fin' },
      { key: 'nombre_materia', label: 'Materia' },
      { key: 'nombre_docente', label: 'Docente', format: (f) => texto(f, 'nombre_docente') || '—' },
      { key: 'salon', label: 'Salón' },
      { key: 'nombre_edificio', label: 'Edificio' }
    ],
    campos: [
      { key: 'id_horario', label: 'ID', type: 'number', hideOnCreate: true, hideOnEdit: true },
      {
        key: 'clave_materia',
        label: 'Materia',
        type: 'select',
        required: true,
        optionsFrom: 'materias',
        optionValue: 'clave_materia',
        optionLabel: (f) => `${f['clave_materia']} - ${f['nombre_materia']}`
      },
      {
        key: 'matricula_trabajador',
        label: 'Docente',
        type: 'select',
        required: true,
        optionsFrom: 'docentes',
        optionValue: 'matricula_trabajador',
        optionLabel: nombreCompleto
      },
      {
        key: 'numero_control',
        label: 'Alumno',
        type: 'select',
        required: true,
        optionsFrom: 'alumnos',
        optionValue: 'numero_control',
        optionLabel: (f) => `${f['numero_control']} - ${nombreCompleto(f)}`
      },
      {
        key: 'no_edificio',
        label: 'Edificio',
        type: 'select',
        required: true,
        optionsFrom: 'edificios',
        optionValue: 'no_edificio',
        optionLabel: (f) => `${f['no_edificio']} - ${f['nombre_edificio']}`
      },
      { key: 'salon', label: 'Salón', type: 'text', required: true },
      { key: 'dia_semana', label: 'Día', type: 'select', required: true, defaultValue: 'LUN', options: DIAS },
      { key: 'hora_inicio', label: 'Hora de inicio', type: 'time', required: true },
      { key: 'hora_fin', label: 'Hora de fin', type: 'time', required: true }
    ]
  }
};

export const CATALOGOS_OPCIONES = ['carreras', 'materias', 'alumnos', 'docentes', 'edificios', 'grupos', 'areas'];

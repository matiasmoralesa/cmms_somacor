# Ejemplos de Uso de la API - Sistema CMMS Somacor

## 🔐 Autenticación

Primero, obtén un token de autenticación:

```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Respuesta:
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "username": "admin",
    "first_name": "",
    "last_name": "",
    "email": "admin@somacor.com"
  }
}
```

Usa el token en todas las siguientes peticiones:
```bash
-H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
```

## 📋 Módulo de Checklist

### 1. Obtener plantillas de checklist para un equipo

```bash
curl -X GET http://localhost:8000/api/checklist-workflow/templates-por-equipo/1/ \
  -H "Authorization: Token YOUR_TOKEN"
```

### 2. Completar un checklist

```bash
curl -X POST http://localhost:8000/api/checklist-workflow/completar-checklist/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "template": 1,
    "equipo": 1,
    "operador": 1,
    "fecha_inspeccion": "2025-06-23",
    "horometro_inspeccion": 1275,
    "lugar_inspeccion": "Faena Norte",
    "observaciones_generales": "Inspección rutinaria diaria",
    "answers": [
      {"item": 1, "estado": "bueno", "observacion_item": ""},
      {"item": 2, "estado": "malo", "observacion_item": "Nivel bajo, requiere rellenado"},
      {"item": 3, "estado": "bueno", "observacion_item": ""}
    ]
  }'
```

### 3. Ver historial de checklist de un equipo

```bash
curl -X GET "http://localhost:8000/api/checklist-workflow/historial-equipo/1/?fecha_inicio=2025-06-01&fecha_fin=2025-06-23" \
  -H "Authorization: Token YOUR_TOKEN"
```

### 4. Reporte de conformidad

```bash
curl -X GET "http://localhost:8000/api/checklist-workflow/reportes/conformidad/?fecha_inicio=2025-06-01&fecha_fin=2025-06-23" \
  -H "Authorization: Token YOUR_TOKEN"
```

## 🔧 Módulo de Mantenimiento Preventivo

### 1. Listar planes de mantenimiento

```bash
curl -X GET http://localhost:8000/api/planes-mantenimiento/ \
  -H "Authorization: Token YOUR_TOKEN"
```

### 2. Generar agenda desde un plan

```bash
curl -X POST http://localhost:8000/api/planes-mantenimiento/1/generar-agenda/ \
  -H "Authorization: Token YOUR_TOKEN"
```

### 3. Ver calendario de mantenimientos

```bash
curl -X GET "http://localhost:8000/api/agendas/calendario/?start=2025-06-01&end=2025-07-01" \
  -H "Authorization: Token YOUR_TOKEN"
```

### 4. Crear plan de mantenimiento

```bash
curl -X POST http://localhost:8000/api/planes-mantenimiento/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreplan": "Plan Mantenimiento Camionetas",
    "descripcionplan": "Plan preventivo para camionetas de la flota",
    "idtipoequipo": 4,
    "activo": true
  }'
```

## 🛠️ Módulo de Registro de Mantenimientos

### 1. Dashboard de mantenimiento

```bash
curl -X GET http://localhost:8000/api/mantenimiento-workflow/dashboard/ \
  -H "Authorization: Token YOUR_TOKEN"
```

### 2. Crear orden de trabajo desde plan

```bash
curl -X POST http://localhost:8000/api/ordenes-trabajo/crear-desde-plan/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idequipo": 1,
    "idplanorigen": 1,
    "horometro": 1250,
    "idtecnicoasignado": 1,
    "idsolicitante": 1,
    "fechaejecucion": "2025-06-24"
  }'
```

### 3. Reportar falla

```bash
curl -X POST http://localhost:8000/api/ordenes-trabajo/reportar-falla/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idequipo": 1,
    "idsolicitante": 1,
    "descripcionproblemareportado": "Motor presenta ruidos extraños y pérdida de potencia",
    "prioridad": "Alta"
  }'
```

### 4. Completar actividad

```bash
curl -X POST http://localhost:8000/api/mantenimiento-workflow/completar-actividad/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actividad_id": 1,
    "observaciones": "Cambio de aceite realizado correctamente",
    "tiempo_real_minutos": 45,
    "resultado_inspeccion": "Satisfactorio"
  }'
```

### 5. Actualizar horómetro

```bash
curl -X POST http://localhost:8000/api/mantenimiento-workflow/actualizar-horometro/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "equipo_id": 1,
    "horometro": 1280,
    "observaciones": "Actualización después de jornada de trabajo"
  }'
```

## 📊 Reportes y Estadísticas

### 1. Equipos críticos

```bash
curl -X GET http://localhost:8000/api/mantenimiento-workflow/equipos-criticos/ \
  -H "Authorization: Token YOUR_TOKEN"
```

### 2. Reporte de eficiencia

```bash
curl -X GET "http://localhost:8000/api/mantenimiento-workflow/reportes/eficiencia/?fecha_inicio=2025-06-01&fecha_fin=2025-06-23" \
  -H "Authorization: Token YOUR_TOKEN"
```

### 3. Elementos más fallidos en checklist

```bash
curl -X GET "http://localhost:8000/api/checklist-workflow/elementos-mas-fallidos/?fecha_inicio=2025-06-01&fecha_fin=2025-06-23" \
  -H "Authorization: Token YOUR_TOKEN"
```

## 🏗️ Gestión de Catálogos

### 1. Listar equipos

```bash
curl -X GET http://localhost:8000/api/equipos/ \
  -H "Authorization: Token YOUR_TOKEN"
```

### 2. Crear nuevo equipo

```bash
curl -X POST http://localhost:8000/api/equipos/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "codigointerno": "CAT-003",
    "nombreequipo": "Minicargador CAT 259D",
    "marca": "Caterpillar",
    "modelo": "259D",
    "anio": 2022,
    "patente": "MC-003",
    "idtipoequipo": 1,
    "idfaenaactual": 1,
    "idestadoactual": 1,
    "horometroactual": 0,
    "activo": true
  }'
```

### 3. Listar tipos de equipo

```bash
curl -X GET http://localhost:8000/api/tipos-equipo/ \
  -H "Authorization: Token YOUR_TOKEN"
```

### 4. Listar tareas estándar

```bash
curl -X GET http://localhost:8000/api/tareas-estandar/ \
  -H "Authorization: Token YOUR_TOKEN"
```

## 🔄 Comandos de Gestión (Ejecutar en el servidor)

### 1. Generar agenda preventiva

```bash
# Generar agenda para los próximos 30 días
python manage.py generar_agenda_preventiva --dias-adelante 30

# Generar agenda solo para minicargadores
python manage.py generar_agenda_preventiva --tipo-equipo 1 --dias-adelante 15
```

### 2. Procesar mantenimientos

```bash
# Solo mostrar mantenimientos próximos
python manage.py procesar_mantenimientos

# Crear automáticamente OTs para mantenimientos próximos
python manage.py procesar_mantenimientos --auto-crear-ot --dias-anticipacion 5
```

### 3. Crear plantillas de checklist

```bash
# Crear todas las plantillas
python manage.py crear_plantillas_checklist

# Crear solo para un tipo específico
python manage.py crear_plantillas_checklist --tipo-equipo "Cargador Frontal"
```

## 📱 Ejemplos de Respuestas

### Respuesta de Dashboard

```json
{
  "estadisticas_generales": {
    "total_equipos": 4,
    "equipos_operativos": 4,
    "ots_abiertas": 2,
    "ots_vencidas": 0,
    "mantenimientos_proximos": 5
  },
  "equipos_por_estado": [
    {"nombreestado": "Operativo", "cantidad": 4},
    {"nombreestado": "En Mantenimiento", "cantidad": 0}
  ],
  "ots_por_tipo": [
    {"nombretipomantenimientoot": "Preventivo", "cantidad": 1},
    {"nombretipomantenimientoot": "Correctivo", "cantidad": 1}
  ]
}
```

### Respuesta de Checklist Completado

```json
{
  "checklist": {
    "id_instance": 1,
    "template_nombre": "Check List Minicargador (Diario)",
    "equipo_nombre": "Minicargador CAT 236D",
    "operador_nombre": "Admin User",
    "fecha_inspeccion": "2025-06-23",
    "horometro_inspeccion": 1275
  },
  "alertas": {
    "elementos_criticos_malos": [
      {
        "item": "Nivel de Aceite",
        "categoria": "MOTOR",
        "observacion": "Nivel bajo, requiere rellenado"
      }
    ],
    "requiere_atencion_inmediata": true,
    "ot_creada": {
      "numero_ot": "OT-CHK-CAT-001-202506231200",
      "mensaje": "OT correctiva creada automáticamente"
    }
  }
}
```

## 🚀 Consejos de Uso

1. **Autenticación**: Siempre incluye el token en el header Authorization
2. **Fechas**: Usa formato ISO (YYYY-MM-DD) para fechas
3. **Paginación**: La API usa paginación automática, revisa los campos `next` y `previous`
4. **Filtros**: Muchos endpoints soportan filtros por fecha, tipo, estado, etc.
5. **Validación**: La API valida todos los datos de entrada y retorna errores descriptivos

## 🔍 Debugging

Para ver logs detallados, revisa el archivo `logs/django.log` en el servidor.

Para probar la API de forma interactiva, visita: http://localhost:8000/api/ en tu navegador.


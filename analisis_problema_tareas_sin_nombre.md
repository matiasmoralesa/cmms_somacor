# Análisis del Problema: "Tarea sin nombre"

## 🔍 **Problema Identificado**

Cuando se agregan tareas a los intervalos de mantenimiento en la vista de programas, aparecen como "Tarea sin nombre" en lugar del nombre real de la tarea.

## 🏗️ **Arquitectura Actual**

### Frontend (PlanesMantenimientoView.tsx)
- **Línea 175**: `{detalle.tarea_estandar?.nombretarea || 'Tarea sin nombre'}`
- **Problema**: `detalle.tarea_estandar` es `null` o `undefined`
- **Causa**: El backend no está enviando la información de la relación

### Backend (views.py)

#### DetallesPlanMantenimientoViewSet (Línea 201-203)
```python
class DetallesPlanMantenimientoViewSet(viewsets.ModelViewSet):
    queryset = DetallesPlanMantenimiento.objects.all()  # ❌ Sin relaciones
    serializer_class = DetallesPlanMantenimientoSerializer
    permission_classes = [permissions.AllowAny]
```

#### PlanMantenimientoViewSet - Método generar_agenda (Línea 167)
```python
detalles = DetallesPlanMantenimiento.objects.filter(
    idplanmantenimiento=plan, 
    activo=True
).order_by('intervalohorasoperacion')  # ❌ Sin relaciones
```

## 🎯 **Causa Raíz**

Los querysets en el backend **NO** incluyen las relaciones necesarias:
- Falta `select_related('idtareaestandar')` 
- Falta `prefetch_related('tarea_estandar')`

## 📊 **Flujo de Datos Problemático**

1. **Frontend** solicita detalles del plan
2. **Backend** devuelve `DetallesPlanMantenimiento` sin relaciones
3. **Frontend** recibe `detalle.tarea_estandar = null`
4. **Resultado**: Se muestra "Tarea sin nombre"

## ✅ **Solución Requerida**

### 1. Corregir Querysets en Backend
- Agregar `select_related('idtareaestandar')` a los querysets
- Asegurar que el serializer incluya la información de la tarea

### 2. Verificar Serializers
- Confirmar que `DetallesPlanMantenimientoSerializer` incluye `tarea_estandar`
- Verificar que las relaciones están correctamente definidas

### 3. Testing
- Probar que las tareas se muestran con su nombre correcto
- Verificar que no hay regresiones en otras funcionalidades

## 🔧 **Archivos a Modificar**

1. `/backend/cmms_api/views.py` - Líneas 202 y 167
2. `/backend/cmms_api/serializers.py` - Verificar DetallesPlanMantenimientoSerializer
3. Testing en frontend para confirmar corrección

## 📈 **Impacto**

- **Crítico**: Los usuarios no pueden identificar qué tareas están asignadas
- **UX**: Experiencia de usuario muy pobre
- **Funcionalidad**: El sistema es prácticamente inutilizable para gestión de planes


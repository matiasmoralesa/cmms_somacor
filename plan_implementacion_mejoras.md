# Plan de Implementación de Mejoras - CMMS Somacor

## Resumen de Análisis

### Estado Actual
- El sistema tiene un modelo de checklist básico implementado
- Solo existe template para minicargador
- El sistema de reportes de fallas está implementado pero sin soporte para múltiples imágenes
- Los modelos del backend están bien estructurados pero necesitan extensión

### Mejoras Requeridas

#### 1. Checklists para Diferentes Tipos de Equipos
**Problema:** Solo existe checklist para minicargador, pero se necesitan para:
- Cargador Frontal
- Retroexcavadora  
- Camionetas

**Solución:**
- Crear templates de checklist para cada tipo de equipo
- Poblar la base de datos con las categorías e ítems específicos de cada tipo
- Modificar el frontend para manejar dinámicamente diferentes tipos de checklist

#### 2. Soporte para Múltiples Imágenes en Checklists
**Problema:** Actualmente solo se puede subir una imagen por checklist

**Solución:**
- Crear modelo `ChecklistImage` para múltiples imágenes por checklist
- Modificar el frontend para permitir subir múltiples imágenes
- Actualizar la API para manejar múltiples imágenes

#### 3. Mejora del Formulario de Reportes de Fallas
**Problema:** El formulario actual no coincide completamente con el backend y no permite múltiples imágenes

**Solución:**
- Revisar y ajustar el formulario para que coincida con el modelo `OrdenesTrabajo`
- Agregar soporte para múltiples imágenes usando el modelo `EvidenciaOT`
- Mejorar la validación y experiencia de usuario

## Plan de Implementación

### Fase 1: Extensión de Modelos y Datos Base

1. **Crear modelo para múltiples imágenes en checklists**
   - Nuevo modelo `ChecklistImage`
   - Migración de base de datos

2. **Poblar templates de checklist**
   - Script para crear templates de cargador frontal, retroexcavadora y camionetas
   - Categorías e ítems específicos para cada tipo

### Fase 2: Mejoras en Backend

1. **Actualizar API de checklists**
   - Endpoint para manejar múltiples imágenes
   - Validaciones mejoradas

2. **Mejorar API de reportes de fallas**
   - Asegurar compatibilidad con frontend
   - Soporte para múltiples imágenes

### Fase 3: Mejoras en Frontend

1. **Mejorar ChecklistView**
   - Soporte para múltiples imágenes
   - Interfaz mejorada para subir/eliminar imágenes

2. **Mejorar UnplannedMaintenanceView**
   - Formulario actualizado para coincidir con backend
   - Soporte para múltiples imágenes
   - Mejor validación y UX

### Fase 4: Testing y Validación

1. **Pruebas de funcionalidad**
2. **Validación de datos**
3. **Pruebas de interfaz de usuario**

## Archivos a Modificar/Crear

### Backend
- `models.py` - Agregar modelo ChecklistImage
- `serializers.py` - Actualizar serializers
- `views.py` - Actualizar vistas para múltiples imágenes
- `management/commands/` - Scripts para poblar datos

### Frontend
- `ChecklistView.tsx` - Soporte para múltiples imágenes
- `UnplannedMaintenanceView.tsx` - Mejoras en formulario
- Componentes nuevos para manejo de múltiples imágenes

### Base de Datos
- Migraciones para nuevos modelos
- Scripts de datos iniciales para templates


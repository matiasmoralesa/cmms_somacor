# Instrucciones de Implementación - Mejoras CMMS Somacor

## Resumen de Mejoras Implementadas

### 1. Checklists para Diferentes Tipos de Equipos
- ✅ Templates para Minicargador, Cargador Frontal, Retroexcavadora y Camionetas
- ✅ Comando de management para poblar datos base
- ✅ Elementos críticos específicos por tipo de equipo

### 2. Soporte para Múltiples Imágenes
- ✅ Nuevo modelo `ChecklistImage` para checklists
- ✅ Componente React `MultipleImageUpload` reutilizable
- ✅ Actualización de serializers para manejar múltiples imágenes
- ✅ Compatibilidad con sistema existente de `EvidenciaOT`

### 3. Mejoras en Formularios
- ✅ ChecklistView mejorado con múltiples imágenes
- ✅ UnplannedMaintenanceView mejorado con mejor UX y múltiples imágenes
- ✅ Validaciones mejoradas y mejor manejo de errores

## Pasos de Implementación

### Paso 1: Actualizar Backend

#### 1.1 Actualizar models.py
```bash
# Copiar el modelo ChecklistImage agregado al final de models.py
# El modelo ya está definido en el archivo modificado
```

#### 1.2 Actualizar serializers.py
```bash
# Reemplazar el contenido con las mejoras implementadas
# Incluye ChecklistImageSerializer y ChecklistInstanceSerializer actualizado
```

#### 1.3 Crear migraciones
```bash
cd somacor_cmms/backend
python manage.py makemigrations
python manage.py migrate
```

#### 1.4 Poblar templates de checklist
```bash
# Copiar el comando de management
cp poblar_checklist_templates.py somacor_cmms/backend/cmms_api/management/commands/

# Ejecutar el comando
python manage.py poblar_checklist_templates
```

### Paso 2: Actualizar Frontend

#### 2.1 Agregar componente MultipleImageUpload
```bash
# Copiar el componente a la carpeta de componentes
cp MultipleImageUpload.tsx somacor_cmms/frontend/src/components/
```

#### 2.2 Actualizar ChecklistView
```bash
# Reemplazar el archivo existente con la versión mejorada
cp ChecklistView_mejorado.tsx somacor_cmms/frontend/src/pages/ChecklistView.tsx
```

#### 2.3 Actualizar UnplannedMaintenanceView
```bash
# Reemplazar el archivo existente con la versión mejorada
cp UnplannedMaintenanceView_mejorado.tsx somacor_cmms/frontend/src/pages/UnplannedMaintenanceView.tsx
```

### Paso 3: Configurar Base de Datos (Opcional)

#### 3.1 Ejecutar script de migración adicional
```bash
# Si se necesita migrar datos existentes o crear índices adicionales
psql -d nombre_base_datos -f migracion_checklist_images.sql
```

### Paso 4: Testing y Validación

#### 4.1 Verificar Backend
- [ ] Verificar que las migraciones se aplicaron correctamente
- [ ] Probar endpoints de checklist con múltiples imágenes
- [ ] Verificar que los templates se crearon correctamente
- [ ] Probar creación de reportes de fallas con imágenes

#### 4.2 Verificar Frontend
- [ ] Probar carga de diferentes tipos de equipos
- [ ] Verificar que aparecen los checklists específicos por tipo
- [ ] Probar subida de múltiples imágenes en checklists
- [ ] Probar subida de múltiples imágenes en reportes de fallas
- [ ] Verificar validaciones de elementos críticos

#### 4.3 Pruebas de Integración
- [ ] Crear checklist completo con imágenes
- [ ] Crear reporte de falla con imágenes
- [ ] Verificar que las imágenes se almacenan correctamente
- [ ] Probar visualización de imágenes en modal

## Archivos Modificados/Creados

### Backend
- `models.py` - Agregado modelo ChecklistImage
- `serializers.py` - Actualizado para múltiples imágenes
- `management/commands/poblar_checklist_templates.py` - Nuevo comando

### Frontend
- `components/MultipleImageUpload.tsx` - Nuevo componente
- `pages/ChecklistView.tsx` - Actualizado con mejoras
- `pages/UnplannedMaintenanceView.tsx` - Actualizado con mejoras

### Base de Datos
- `migracion_checklist_images.sql` - Script de migración opcional

## Características Nuevas

### MultipleImageUpload Component
- Soporte para arrastrar y soltar archivos
- Preview de imágenes con modal de vista completa
- Validación de tipo y tamaño de archivo
- Descripción opcional por imagen
- Límite configurable de imágenes
- Interfaz responsive y accesible

### ChecklistView Mejorado
- Soporte para múltiples tipos de equipos
- Múltiples imágenes por checklist
- Validación de elementos críticos
- Mejor UX y mensajes de error
- Compatibilidad con sistema existente

### UnplannedMaintenanceView Mejorado
- Formulario más completo y detallado
- Múltiples imágenes de evidencia
- Mejor validación y manejo de errores
- Información contextual del equipo
- Interfaz más profesional

## Configuración Recomendada

### Límites de Archivos
- Checklists: Máximo 5 imágenes, 2MB cada una
- Reportes de fallas: Máximo 10 imágenes, 3MB cada una
- Tipos permitidos: JPEG, PNG, WebP

### Validaciones
- Elementos críticos impiden envío de checklist si están en mal estado
- Campos obligatorios claramente marcados
- Mensajes de error descriptivos

## Notas de Compatibilidad

- El campo `imagen_evidencia` se mantiene por compatibilidad
- Los checklists existentes siguen funcionando
- Las nuevas funcionalidades son opcionales
- No se requieren cambios en la API existente

## Soporte y Mantenimiento

- Todos los componentes están documentados
- Código modular y reutilizable
- Manejo de errores robusto
- Interfaz responsive y accesible


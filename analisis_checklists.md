# Análisis de Checklists por Tipo de Equipo

## Estructura General Común

Todos los checklists comparten una estructura base similar:

### Información General
- Lugar de inspección
- Fecha
- Nombre del operador
- Tipo y vigencia de licencia municipal
- Tipo y vigencia de licencia interna
- Marca/modelo/año del vehículo
- Empresa
- Número de patente/interno
- Kilometraje/horómetro inicial

### Secciones Principales

#### 1. Motor
Común en todos los equipos:
- Nivel de agua
- Nivel de aceite
- Batería
- Correas
- Filtraciones
- Alternador
- Partida en frío
- Radiador/anticongelante
- Motor arranque

**Diferencias:**
- Minicargador: Incluye nivel de líquido de freno y combustible
- Cargador Frontal: No incluye combustible ni líquido de freno
- Retroexcavadora: Incluye nivel hidráulico en lugar de líquido de freno
- Camionetas: No tiene sección de motor detallada

#### 2. Luces
Común en todos:
- Luces altas/bajas
- Luces intermitentes
- Luz marcha atrás
- Luz tablero
- Luz baliza
- Luz pértiga
- Luces de freno
- Estado de micas

**Diferencias:**
- Minicargador: Incluye focos faeneros y luz patente
- Cargador Frontal: Incluye luz interior y luz patente
- Retroexcavadora: Incluye focos faeneros, luz interior y luz patente
- Camionetas: Simplificado a luces generales

#### 3. Documentos
Común en todos:
- Permiso de circulación
- Revisión técnica
- Seguro obligatorio

**Diferencias:**
- Retroexcavadora: Marca "si aplicase" para cada documento
- Camionetas: Sección separada para documentación del operador

#### 4. Accesorios
**Minicargador (más completo):**
- Botiquín, extintor, llave de rueda, triángulos/conos
- Cinturón de seguridad, marcadores
- Señaléticas en español, manual de operación
- Sistema corta corriente, revisión tres puntos de apoyo
- Protección contra volcamiento, asiento certificado
- Estado de neumáticos, seguros en tuercas
- Dirección, tubo de escape, parada de emergencia

**Cargador Frontal:**
- Similar al minicargador pero sin botiquín ni llave de rueda
- Incluye escaleras de acceso y pasamanos

**Retroexcavadora:**
- Más básico: extintor, llave de rueda, conos, cinturón
- Incluye campo "Otros" personalizable

**Camionetas:**
- Estructura diferente con auto-evaluación del operador
- Requisitos básicos y complementarios separados

#### 5. Frenos
Común en equipos pesados:
- Freno de servicio
- Freno de parqueo/mano

#### 6. Sección Específica del Equipo

**Minicargador - Cargador:**
- Balde, cuchillo de balde, porte cuchilla
- Seguros manuales, conexión inferior
- Sistema hidráulico, mangueras, conexiones
- Sistema corta corriente, desgaste dientes
- Estado de mandos del balde

**Cargador Frontal - Cargador Frontal:**
- Grietas, indicador de ángulo, calzas, seguros
- Balde, sistema hidráulico, mangueras, conexiones
- Sistema corta corriente, desgaste dientes
- Mandos operacionales, sistema de levante, sistema engrase

**Retroexcavadora - Elementos Retroexcavadora:**
- Juego pasador balde, juego bujes
- Desgaste cuchillos, desgaste dientes, desgaste cadena
- Sistema hidráulico, mangueras, conexiones
- Sistema corta corriente, estado de aguilón
- Martillo hidráulico, mandos operacionales

## Elementos Críticos por Tipo

### Minicargador
Críticos: 1.2, 1.3, 2.1, 2.2, 4.5, 4.6, 4.10, 4.19, 4.26, 4.28, 4.31, 5.1, 5.2, 6.1, 6.2, 7.11

### Cargador Frontal
Críticos: 2.1, 2.2, 4.1, 4.13, 4.19, 5.1, 5.2, 6.9, 6.11

### Retroexcavadora
Críticos: 1.6, 2.1, 4.19, 4.21, 5.1, 5.2, 6.9

### Camionetas
No especifica elementos críticos explícitamente, pero menciona que items críticos en mal estado deben sacar el vehículo de servicio.

## Recomendaciones para Implementación

1. **Estructura Base Común**: Crear una estructura base que incluya las secciones comunes (información general, motor, luces, documentos, frenos)

2. **Secciones Específicas**: Implementar secciones específicas por tipo de equipo que se agreguen dinámicamente según el tipo

3. **Elementos Críticos**: Marcar elementos críticos por tipo de equipo para validaciones especiales

4. **Campos Personalizables**: Permitir campos "Otros" para elementos adicionales específicos

5. **Validaciones**: Implementar validaciones que impidan el uso del equipo si hay elementos críticos en mal estado

6. **Observaciones**: Incluir sección de observaciones obligatoria para elementos no críticos en mal estado


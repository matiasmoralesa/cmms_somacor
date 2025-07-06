-- Migración para agregar soporte de múltiples imágenes en checklists
-- Ejecutar después de aplicar las migraciones de Django

-- Crear tabla para múltiples imágenes en checklists
CREATE TABLE IF NOT EXISTS checklistimage (
    id_imagen SERIAL PRIMARY KEY,
    instance_id INTEGER NOT NULL,
    descripcion VARCHAR(255),
    imagen_base64 TEXT NOT NULL,
    fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_subida_id INTEGER NOT NULL,
    FOREIGN KEY (instance_id) REFERENCES cmms_api_checklistinstance(id_instance) ON DELETE CASCADE,
    FOREIGN KEY (usuario_subida_id) REFERENCES auth_user(id) ON DELETE PROTECT
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_checklistimage_instance ON checklistimage(instance_id);
CREATE INDEX IF NOT EXISTS idx_checklistimage_fecha ON checklistimage(fecha_subida);
CREATE INDEX IF NOT EXISTS idx_checklistimage_usuario ON checklistimage(usuario_subida_id);

-- Migrar datos existentes de imagen_evidencia a la nueva tabla (opcional)
-- Solo si hay datos existentes que se quieran preservar
INSERT INTO checklistimage (instance_id, descripcion, imagen_base64, fecha_subida, usuario_subida_id)
SELECT 
    id_instance,
    'Imagen migrada desde campo legacy' as descripcion,
    imagen_evidencia,
    fecha_creacion,
    operador_id
FROM cmms_api_checklistinstance 
WHERE imagen_evidencia IS NOT NULL AND imagen_evidencia != '';

-- Comentar la línea siguiente si se quiere mantener el campo legacy por compatibilidad
-- ALTER TABLE cmms_api_checklistinstance DROP COLUMN imagen_evidencia;


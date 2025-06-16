from django.contrib import admin
from .models import (
    Roles, Especialidades, Faenas, TiposEquipo, EstadosEquipo, TiposTarea,
    TiposMantenimientoOT, EstadosOrdenTrabajo, Repuestos, Usuarios, Equipos,
    TareasEstandar, PlanesMantenimiento, DetallesPlanMantenimiento,
    OrdenesTrabajo, ActividadesOrdenTrabajo, UsoRepuestosActividadOT,
    HistorialHorometros, HistorialEstadosEquipo, Agendas, DocumentosAdjuntos,
    Notificaciones
)

# --- Clases de Administración para Modelos de Catálogo ---
# Estas clases personalizan cómo se ven y se comportan los modelos en el sitio de administración.

@admin.register(Roles)
class RolesAdmin(admin.ModelAdmin):
    list_display = ('idrol', 'nombrerol', 'descripcionrol')
    search_fields = ('nombrerol',)

@admin.register(Especialidades)
class EspecialidadesAdmin(admin.ModelAdmin):
    list_display = ('idespecialidad', 'nombreespecialidad', 'descripcion')
    search_fields = ('nombreespecialidad',)

@admin.register(Faenas)
class FaenasAdmin(admin.ModelAdmin):
    # CORRECCIÓN: Se usan los campos correctos del modelo: 'nombrefaena', 'ubicacion'.
    # Los campos 'contacto' y 'activo' del error no existen en el modelo actual.
    list_display = ('idfaena', 'nombrefaena', 'ubicacion')
    search_fields = ('nombrefaena', 'ubicacion')

@admin.register(TiposEquipo)
class TiposEquipoAdmin(admin.ModelAdmin):
    list_display = ('idtipoequipo', 'nombretipo', 'descripcion')
    search_fields = ('nombretipo',)

@admin.register(EstadosEquipo)
class EstadosEquipoAdmin(admin.ModelAdmin):
    list_display = ('idestatus', 'nombreestado', 'descripcion')
    search_fields = ('nombreestado',)

@admin.register(TiposTarea)
class TiposTareaAdmin(admin.ModelAdmin):
    list_display = ('idtipotarea', 'nombretipotarea')
    search_fields = ('nombretipotarea',)

@admin.register(TiposMantenimientoOT)
class TiposMantenimientoOTAdmin(admin.ModelAdmin):
    list_display = ('idtipomantenimientoot', 'nombretipomantenimiento')
    search_fields = ('nombretipomantenimiento',)

@admin.register(EstadosOrdenTrabajo)
class EstadosOrdenTrabajoAdmin(admin.ModelAdmin):
    list_display = ('idestado', 'nombreestado', 'descripcion')
    search_fields = ('nombreestado',)

@admin.register(Repuestos)
class RepuestosAdmin(admin.ModelAdmin):
    # CORRECCIÓN: Se usan los campos correctos del modelo como 'numeroparte' y 'descripcion'.
    list_display = ('idrepuesto', 'numeroparte', 'descripcion', 'stockactual', 'stockminimo', 'unidadmedida')
    search_fields = ('numeroparte', 'descripcion')
    list_filter = ('unidadmedida',)

# --- Clases de Administración para Modelos Principales ---

@admin.register(Usuarios)
class UsuariosAdmin(admin.ModelAdmin):
    # MEJORA: Se usan funciones para mostrar información de modelos relacionados de forma legible.
    list_display = ('get_username', 'get_email', 'get_rol', 'get_especialidad')
    search_fields = ('idusuario__username', 'idusuario__email')
    list_filter = ('idrol', 'idespecialidad')

    @admin.display(description='Usuario', ordering='idusuario__username')
    def get_username(self, obj):
        return obj.idusuario.username

    @admin.display(description='Email', ordering='idusuario__email')
    def get_email(self, obj):
        return obj.idusuario.email

    @admin.display(description='Rol', ordering='idrol__nombrerol')
    def get_rol(self, obj):
        return obj.idrol.nombrerol

    @admin.display(description='Especialidad', ordering='idespecialidad__nombreespecialidad')
    def get_especialidad(self, obj):
        return obj.idespecialidad.nombreespecialidad if obj.idespecialidad else '-'

@admin.register(Equipos)
class EquiposAdmin(admin.ModelAdmin):
    # CORRECCIÓN: Se usan los campos correctos del modelo como 'codigoequipo' y 'descripcion'.
    # Los campos 'nombreequipo' y 'codigoeterno' del error no existen.
    list_display = ('idequipo', 'codigoequipo', 'descripcion', 'idfaena', 'idtipoequipo', 'idestatus', 'horometroactual')
    search_fields = ('codigoequipo', 'descripcion')
    list_filter = ('idfaena', 'idtipoequipo', 'idestatus')

@admin.register(TareasEstandar)
class TareasEstandarAdmin(admin.ModelAdmin):
    list_display = ('idtareaestandar', 'codigotarea', 'descripcion', 'idtipotarea', 'idespecialidadrequerida', 'duracionestimadahoras')
    search_fields = ('codigotarea', 'descripcion')
    list_filter = ('idtipotarea', 'idespecialidadrequerida')

@admin.register(PlanesMantenimiento)
class PlanesMantenimientoAdmin(admin.ModelAdmin):
    # CORRECCIÓN: Se usan los campos correctos del modelo.
    list_display = ('idplanmantenimiento', 'nombreplan', 'idtipoequipo', 'descripcion')
    search_fields = ('nombreplan', 'descripcion')
    list_filter = ('idtipoequipo',)

@admin.register(DetallesPlanMantenimiento)
class DetallesPlanMantenimientoAdmin(admin.ModelAdmin):
    list_display = ('iddetalleplan', 'idplanmantenimiento', 'idtareaestandar', 'intervalohorasoperacion', 'intervalodiascalendario')
    list_filter = ('idplanmantenimiento__nombreplan',)
    raw_id_fields = ('idplanmantenimiento', 'idtareaestandar') # Mejora la selección en admin

@admin.register(OrdenesTrabajo)
class OrdenesTrabajoAdmin(admin.ModelAdmin):
    # CORRECCIÓN: Se usan los campos correctos. Se usan funciones para mostrar campos de relaciones.
    list_display = ('idordentrabajo', 'descripcionot', 'get_equipo_codigo', 'idestado', 'fechacreacion', 'fechainicioprogramado')
    search_fields = ('descripcionot', 'idequipo__codigoequipo')
    list_filter = ('idestado', 'idfaena', 'idtipomantenimiento', 'fechacreacion')
    date_hierarchy = 'fechacreacion'
    raw_id_fields = ('idequipo', 'idfaena', 'idtipomantenimiento', 'idestado', 'idusuariocreador', 'idusuariosupervisor')

    @admin.display(ordering='idequipo__codigoequipo', description='Equipo')
    def get_equipo_codigo(self, obj):
        return obj.idequipo.codigoequipo

# --- Registro del resto de modelos con la configuración por defecto ---
# Para modelos que no necesitan una personalización tan detallada, los registramos de forma simple.
admin.site.register(ActividadesOrdenTrabajo)
admin.site.register(UsoRepuestosActividadOT)
admin.site.register(HistorialHorometros)
admin.site.register(HistorialEstadosEquipo)
admin.site.register(Agendas)
admin.site.register(DocumentosAdjuntos)
admin.site.register(Notificaciones)

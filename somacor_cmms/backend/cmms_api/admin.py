# cmms_api/admin.py
# ARCHIVO CORREGIDO: Se eliminan las referencias a modelos que ya no existen.

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
# Se actualiza la lista de importación para que coincida con el models.py actual.
from .models import (
    Roles, Especialidades, Faenas, TiposEquipo, EstadosEquipo, TiposTarea,
    TiposMantenimientoOT, EstadosOrdenTrabajo, Usuarios, Equipos,
    TareasEstandar, PlanesMantenimiento, DetallesPlanMantenimiento,
    OrdenesTrabajo, ActividadesOrdenTrabajo, Agendas
)

# --- Personalización del Panel de Administración ---

class UsuariosInline(admin.StackedInline):
    model = Usuarios
    can_delete = False
    verbose_name_plural = 'Perfil de Usuario CMMS'
    # Se añaden los nuevos campos para que sean visibles en el admin.
    fields = ('idrol', 'idespecialidad', 'telefono', 'cargo', 'departamento')

class UserAdmin(BaseUserAdmin):
    inlines = (UsuariosInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_rol')

    @admin.display(description='Rol')
    def get_rol(self, obj):
        try:
            return obj.usuarios.idrol.nombrerol
        except Usuarios.DoesNotExist:
            return 'No asignado'

admin.site.unregister(User)
admin.site.register(User, UserAdmin)


# --- Paneles de Administración Personalizados ---

@admin.register(Equipos)
class EquiposAdmin(admin.ModelAdmin):
    list_display = ('nombreequipo', 'codigointerno', 'idtipoequipo', 'idfaenaactual', 'idestadoactual', 'activo')
    list_filter = ('idtipoequipo', 'idfaenaactual', 'idestadoactual', 'activo')
    search_fields = ('nombreequipo', 'codigointerno', 'marca', 'modelo')

@admin.register(OrdenesTrabajo)
class OrdenesTrabajoAdmin(admin.ModelAdmin):
    list_display = ('numeroot', 'idequipo', 'idtipomantenimientoot', 'idestadoot', 'fechacreacionot')
    list_filter = ('idestadoot', 'idtipomantenimientoot', 'fechacreacionot')
    search_fields = ('numeroot', 'idequipo__nombreequipo')
    date_hierarchy = 'fechacreacionot'

@admin.register(PlanesMantenimiento)
class PlanesMantenimientoAdmin(admin.ModelAdmin):
    list_display = ('nombreplan', 'idtipoequipo', 'activo')
    list_filter = ('activo', 'idtipoequipo__nombretipo')
    search_fields = ('nombreplan', 'idtipoequipo__nombretipo')

# --- Registros Simples para los Demás Modelos ---
# Se eliminaron los registros de los modelos que ya no existen.
admin.site.register(Roles)
admin.site.register(Especialidades)
admin.site.register(Faenas)
admin.site.register(TiposEquipo)
admin.site.register(EstadosEquipo)
admin.site.register(TiposTarea)
admin.site.register(TiposMantenimientoOT)
admin.site.register(EstadosOrdenTrabajo)
admin.site.register(TareasEstandar)
admin.site.register(DetallesPlanMantenimiento)
admin.site.register(ActividadesOrdenTrabajo)
admin.site.register(Agendas)

# El modelo 'Usuarios' no se registra aquí porque se maneja 'inline' con el 'UserAdmin'.

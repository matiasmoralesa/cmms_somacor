from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# --- Router de Django REST Framework ---
# El router se encarga de generar automáticamente las URLs para cada ViewSet.
# Esto simplifica enormemente la configuración de las rutas CRUD estándar.
router = DefaultRouter()

# --- Registro de rutas para catálogos y modelos principales ---
# Cada ViewSet se registra con un prefijo de URL (ej. 'roles') y la clase de la vista.
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'roles', views.RolViewSet)
router.register(r'especialidades', views.EspecialidadViewSet)
router.register(r'faenas', views.FaenaViewSet)
router.register(r'tipos-equipo', views.TipoEquipoViewSet)
router.register(r'estados-equipo', views.EstadoEquipoViewSet)
router.register(r'tipos-tarea', views.TipoTareaViewSet)
router.register(r'tipos-mantenimiento-ot', views.TipoMantenimientoOTViewSet)
router.register(r'estados-orden-trabajo', views.EstadoOrdenTrabajoViewSet)
router.register(r'repuestos', views.RepuestoViewSet)
router.register(r'equipos', views.EquipoViewSet)
router.register(r'tareas-estandar', views.TareaEstandarViewSet)
router.register(r'planes-mantenimiento', views.PlanMantenimientoViewSet)
router.register(r'detalles-plan-mantenimiento', views.DetallePlanMantenimientoViewSet)
router.register(r'ordenes-trabajo', views.OrdenTrabajoViewSet)
router.register(r'actividades-ot', views.ActividadOrdenTrabajoViewSet)
router.register(r'agendas', views.AgendaViewSet)
router.register(r'historial-horometros', views.HistorialHorometrosViewSet)
router.register(r'historial-estados-equipo', views.HistorialEstadosEquipoViewSet)
router.register(r'documentos', views.DocumentoAdjuntoViewSet)
router.register(r'notificaciones', views.NotificacionViewSet)


# --- URLs de la API ---
# Se combinan las URLs generadas por el router con las rutas personalizadas
# para autenticación.

urlpatterns = [
    # Incluye todas las URLs generadas por el router bajo el prefijo 'api/'.
    # Ejemplo: /api/roles/, /api/equipos/, etc.
    path('', include(router.urls)),

    # MEJORA: Se añaden rutas específicas para login, logout y registro.
    # Estas rutas apuntan a las vistas que creamos para manejar la autenticación.
    path('auth/login/', views.CustomAuthToken.as_view(), name='auth-login'),
    path('auth/logout/', views.LogoutView.as_view(), name='auth-logout'),
    path('auth/register/', views.RegisterView.as_view(), name='auth-register'),
    path('users/me/', views.CurrentUserView.as_view(), name='current-user'),
]

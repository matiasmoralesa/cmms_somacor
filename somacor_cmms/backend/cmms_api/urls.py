# cmms_api/urls.py
# ARCHIVO CORREGIDO: Se asegura que el nombre del ViewSet coincida con el definido en views.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# Registros de la API
router.register(r'users', views.UserViewSet)
router.register(r'roles', views.RolViewSet)
router.register(r'especialidades', views.EspecialidadViewSet)
router.register(r'faenas', views.FaenaViewSet)
router.register(r'tipos-equipo', views.TipoEquipoViewSet)
router.register(r'estados-equipo', views.EstadoEquipoViewSet)
router.register(r'tipos-tarea', views.TipoTareaViewSet)
# CORRECCIÓN: Se usa el nombre correcto 'TiposMantenimientoOTViewSet' (plural)
router.register(r'tipos-mantenimiento-ot', views.TiposMantenimientoOTViewSet)
router.register(r'estados-orden-trabajo', views.EstadosOrdenTrabajoViewSet)
router.register(r'equipos', views.EquipoViewSet)
router.register(r'agendas', views.AgendaViewSet)
router.register(r'tareas-estandar', views.TareaEstandarViewSet)
router.register(r'planes-mantenimiento', views.PlanMantenimientoViewSet)
router.register(r'detalles-plan-mantenimiento', views.DetallesPlanMantenimientoViewSet)
router.register(r'ordenes-trabajo', views.OrdenTrabajoViewSet)
router.register(r'actividades-ot', views.ActividadOrdenTrabajoViewSet)


# URLs de la API
urlpatterns = [
    path('', include(router.urls)),
    # Rutas de autenticación
    path('login/', views.CustomAuthToken.as_view(), name='auth_token'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
]

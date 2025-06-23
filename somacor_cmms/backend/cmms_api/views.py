# cmms_api/views.py
# ARCHIVO CORREGIDO: Se aplica el patrón try/except a ambas acciones de creación de OTs.

from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import models, transaction
from .models import *
from .serializers import *

# --- Vistas de Autenticación y Viewsets de Catálogos (sin cambios) ---
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        user_data = UserSerializer(user, context={'request': request}).data
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': user_data})

class LogoutView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        if request.user and request.user.is_authenticated:
            request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

# --- Vistas de Catálogos (sin cambios) ---
class RolViewSet(viewsets.ModelViewSet):
    queryset = Roles.objects.all(); serializer_class = RolSerializer; permission_classes = [permissions.AllowAny]
class EspecialidadViewSet(viewsets.ModelViewSet):
    queryset = Especialidades.objects.all(); serializer_class = EspecialidadSerializer; permission_classes = [permissions.AllowAny]
class FaenaViewSet(viewsets.ModelViewSet):
    queryset = Faenas.objects.all(); serializer_class = FaenaSerializer; permission_classes = [permissions.AllowAny]
class TipoEquipoViewSet(viewsets.ModelViewSet):
    queryset = TiposEquipo.objects.all(); serializer_class = TipoEquipoSerializer; permission_classes = [permissions.AllowAny]
class EstadoEquipoViewSet(viewsets.ModelViewSet):
    queryset = EstadosEquipo.objects.all(); serializer_class = EstadoEquipoSerializer; permission_classes = [permissions.AllowAny]
class TiposMantenimientoOTViewSet(viewsets.ModelViewSet):
    queryset = TiposMantenimientoOT.objects.all(); serializer_class = TipoMantenimientoOTSerializer; permission_classes = [permissions.AllowAny]
class EstadosOrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = EstadosOrdenTrabajo.objects.all(); serializer_class = EstadoOrdenTrabajoSerializer; permission_classes = [permissions.AllowAny]
class EquipoViewSet(viewsets.ModelViewSet):
    queryset = Equipos.objects.all(); serializer_class = EquipoSerializer; permission_classes = [permissions.AllowAny]
class AgendaViewSet(viewsets.ModelViewSet):
    queryset = Agendas.objects.all(); serializer_class = AgendaSerializer; permission_classes = [permissions.AllowAny]
class TipoTareaViewSet(viewsets.ModelViewSet):
    queryset = TiposTarea.objects.all(); serializer_class = TipoTareaSerializer; permission_classes = [permissions.AllowAny]
class TareaEstandarViewSet(viewsets.ModelViewSet):
    queryset = TareasEstandar.objects.all(); serializer_class = TareaEstandarSerializer; permission_classes = [permissions.AllowAny]
class PlanMantenimientoViewSet(viewsets.ModelViewSet):
    queryset = PlanesMantenimiento.objects.all(); serializer_class = PlanMantenimientoSerializer; permission_classes = [permissions.AllowAny]
class DetallesPlanMantenimientoViewSet(viewsets.ModelViewSet):
    queryset = DetallesPlanMantenimiento.objects.all(); serializer_class = DetallesPlanMantenimientoSerializer; permission_classes = [permissions.AllowAny]
class ActividadOrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = ActividadesOrdenTrabajo.objects.all(); serializer_class = ActividadOrdenTrabajoSerializer; permission_classes = [permissions.AllowAny]

# --- ViewSet de Órdenes de Trabajo con Lógica Personalizada ---
class OrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = OrdenesTrabajo.objects.all().order_by('-fechacreacionot')
    serializer_class = OrdenTrabajoSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'], url_path='crear-desde-plan')
    def crear_desde_plan(self, request):
        id_equipo = request.data.get('idequipo')
        id_plan = request.data.get('idplanorigen')
        horometro_disparo = request.data.get('horometro')
        id_tecnico = request.data.get('idtecnicoasignado')
        id_solicitante = request.data.get('idsolicitante')
        
        if not all([id_equipo, id_plan, horometro_disparo, id_tecnico, id_solicitante]):
            return Response({'error': 'Faltan datos requeridos.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            equipo = Equipos.objects.get(pk=id_equipo)
            plan = PlanesMantenimiento.objects.get(pk=id_plan)
            tecnico = User.objects.get(pk=id_tecnico)
            solicitante = User.objects.get(pk=id_solicitante)
            
            # Lógica robusta para obtener o crear registros necesarios
            try:
                estado_inicial = EstadosOrdenTrabajo.objects.get(nombreestadoot='Abierta')
            except EstadosOrdenTrabajo.DoesNotExist:
                estado_inicial = EstadosOrdenTrabajo.objects.create(nombreestadoot='Abierta', descripcion='OT recién creada.')
            
            try:
                tipo_ot = TiposMantenimientoOT.objects.get(nombretipomantenimientoot='Preventivo')
            except TiposMantenimientoOT.DoesNotExist:
                tipo_ot = TiposMantenimientoOT.objects.create(nombretipomantenimientoot='Preventivo', descripcion='Mantenimiento planificado.')
            
            detalles_aplicables = DetallesPlanMantenimiento.objects.filter(
                idplanmantenimiento=plan,
                intervalohorasoperacion__lte=int(horometro_disparo),
                intervalohorasoperacion__gt=0
            ).annotate(residuo=models.Value(int(horometro_disparo)) % models.F('intervalohorasoperacion')).filter(residuo=0)
            
            if not detalles_aplicables.exists():
                return Response({'error': 'No se encontraron tareas aplicables para el intervalo.'}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                nueva_ot = OrdenesTrabajo.objects.create(
                    numeroot=f"OT-{equipo.codigointerno}-{timezone.now().strftime('%Y%m%d%H%M')}",
                    idequipo=equipo, idplanorigen=plan, idtipomantenimientoot=tipo_ot, idestadoot=estado_inicial,
                    horometro=horometro_disparo, idsolicitante=solicitante, idtecnicoasignado=tecnico,
                    fechaemision=timezone.now().date(), fechaejecucion=request.data.get('fechaejecucion')
                )
                for detalle in detalles_aplicables:
                    ActividadesOrdenTrabajo.objects.create(idordentrabajo=nueva_ot, idtareaestandar=detalle.idtareaestandar)
            
            serializer = self.get_serializer(nueva_ot)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Ocurrió un error inesperado: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], url_path='reportar-falla')
    def reportar_falla(self, request):
        id_equipo = request.data.get('idequipo')
        id_solicitante = request.data.get('idsolicitante')
        descripcion = request.data.get('descripcionproblemareportado')

        if not all([id_equipo, id_solicitante, descripcion]):
            return Response({'error': 'Faltan datos requeridos.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            equipo = Equipos.objects.get(pk=id_equipo)
            solicitante = User.objects.get(pk=id_solicitante)

            # Lógica robusta para obtener o crear el estado y tipo de OT
            try:
                estado_inicial = EstadosOrdenTrabajo.objects.get(nombreestadoot='Abierta')
            except EstadosOrdenTrabajo.DoesNotExist:
                estado_inicial = EstadosOrdenTrabajo.objects.create(nombreestadoot='Abierta', descripcion='OT recién creada.')
            
            try:
                tipo_ot = TiposMantenimientoOT.objects.get(nombretipomantenimientoot='Correctivo')
            except TiposMantenimientoOT.DoesNotExist:
                tipo_ot = TiposMantenimientoOT.objects.create(nombretipomantenimientoot='Correctivo', descripcion='Mantenimiento por falla no planificada.')

            with transaction.atomic():
                nueva_ot = OrdenesTrabajo.objects.create(
                    numeroot=f"OT-CORR-{equipo.codigointerno}-{timezone.now().strftime('%Y%m%d%H%M')}",
                    idequipo=equipo, idtipomantenimientoot=tipo_ot, idestadoot=estado_inicial,
                    descripcionproblemareportado=descripcion, fechareportefalla=timezone.now(),
                    idsolicitante=solicitante, idtecnicoasignado=solicitante, 
                    prioridad=request.data.get('prioridad', 'Alta')
                )
            
            serializer = self.get_serializer(nueva_ot)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Ocurrió un error inesperado: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

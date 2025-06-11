from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from .models import (
    Roles, Especialidades, Faenas, TiposEquipo, EstadosEquipo, TiposTarea,
    TiposMantenimientoOT, EstadosOrdenTrabajo, Repuestos, Usuarios, Equipos,
    TareasEstandar, PlanesMantenimiento, DetallesPlanMantenimiento,
    OrdenesTrabajo, ActividadesOrdenTrabajo, UsoRepuestosActividadOT,
    HistorialHorometros, HistorialEstadosEquipo, Agendas, DocumentosAdjuntos,
    Notificaciones
)

# --- Serializers de Autenticación y Usuarios ---

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    rol = RolSerializer(source='usuarios.idrol', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'rol']

class UserCreateSerializer(serializers.ModelSerializer):
    rol_id = serializers.IntegerField(write_only=True)
    nombre_completo = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'nombre_completo', 'rol_id')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_rol_id(self, value):
        if not Roles.objects.filter(pk=value).exists():
            raise serializers.ValidationError("El rol especificado no existe.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        rol_id = validated_data.pop('rol_id')
        nombre_completo = validated_data.pop('nombre_completo')
        rol = Roles.objects.get(pk=rol_id)
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', '')
        )
        user.first_name = nombre_completo
        if rol.nombrerol == 'Administrador':
            user.is_staff = True
            user.is_superuser = True
        user.save()
        Usuarios.objects.create(user=user, idrol=rol, activo=True)
        return user

# --- Serializers para todos los demás modelos ---

class EspecialidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especialidades
        fields = '__all__'

class FaenaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faenas
        fields = '__all__'

class TipoEquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposEquipo
        fields = '__all__'

class EstadoEquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadosEquipo
        fields = '__all__'
        
class TipoTareaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposTarea
        fields = '__all__'

class TipoMantenimientoOTSerializer(serializers.ModelSerializer):
    class Meta:
        model = TiposMantenimientoOT
        fields = '__all__'

class EstadoOrdenTrabajoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadosOrdenTrabajo
        fields = '__all__'

class RepuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repuestos
        fields = '__all__'
        
class TareaEstandarSerializer(serializers.ModelSerializer):
    class Meta:
        model = TareasEstandar
        fields = '__all__'

class EquipoSerializer(serializers.ModelSerializer):
    # Serializers anidados para mostrar nombres en lugar de IDs
    idtipoequipo = TipoEquipoSerializer(read_only=True)
    idfaenaactual = FaenaSerializer(read_only=True)
    idestadoactual = EstadoEquipoSerializer(read_only=True)

    class Meta:
        model = Equipos
        fields = '__all__'

class ActividadOTSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActividadesOrdenTrabajo
        fields = '__all__'

class OrdenTrabajoSerializer(serializers.ModelSerializer):
    actividades = ActividadOTSerializer(many=True, read_only=True, source='actividadesordentrabajo_set')
    
    class Meta:
        model = OrdenesTrabajo
        fields = '__all__'

class DetallePlanMantenimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallesPlanMantenimiento
        fields = '__all__'

class PlanMantenimientoSerializer(serializers.ModelSerializer):
    detalles = DetallePlanMantenimientoSerializer(many=True, read_only=True, source='detallesplanmantenimiento_set')

    class Meta:
        model = PlanesMantenimiento
        fields = '__all__'

class AgendaSerializer(serializers.ModelSerializer):
    # Mapeo para compatibilidad con react-big-calendar
    id = serializers.IntegerField(source='idagenda', read_only=True)
    title = serializers.CharField(source='tituloevento')
    start = serializers.DateTimeField(source='fechahorainicio')
    end = serializers.DateTimeField(source='fechahorafin')
    type = serializers.CharField(source='tipoevento', allow_blank=True, required=False)
    notes = serializers.CharField(source='descripcionevento', allow_blank=True, required=False)

    class Meta:
        model = Agendas
        fields = ('id', 'title', 'start', 'end', 'type', 'notes', 'idequipo', 'idordentrabajo', 'idusuarioasignado')

# ... (y así para el resto de modelos)
class HistorialHorometrosSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialHorometros
        fields = '__all__'

class HistorialEstadosEquipoSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialEstadosEquipo
        fields = '__all__'

class DocumentoAdjuntoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentosAdjuntos
        fields = '__all__'
        
class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificaciones
        fields = '__all__'
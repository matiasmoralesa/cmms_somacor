from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated
from .models import (
    Roles, Especialidades, Faenas, TiposEquipo, EstadosEquipo, TiposTarea,
    TiposMantenimientoOT, EstadosOrdenTrabajo, Repuestos, Usuarios, Equipos,
    TareasEstandar, PlanesMantenimiento, DetallesPlanMantenimiento,
    OrdenesTrabajo, ActividadesOrdenTrabajo, UsoRepuestosActividadOT,
    HistorialHorometros, HistorialEstadosEquipo, Agendas, DocumentosAdjuntos,
    Notificaciones
)


# --- Serializers de Catálogos (Simples) ---
# Estos serializers se usan para los "mantenedores".


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = '__all__'

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


# --- Serializers de Autenticación y Perfil de Usuario ---

class UsuarioSerializer(serializers.ModelSerializer):
    """
    MEJORA: Serializer para el perfil de usuario. Incluye los datos del rol y 
    la especialidad de forma anidada, para no tener que hacer consultas extra.
    """
    idrol = RolSerializer(read_only=True)
    idespecialidad = EspecialidadSerializer(read_only=True)
    
    class Meta:
        model = Usuarios
        fields = ['idusuario', 'idrol', 'idespecialidad']

class UserSerializer(serializers.ModelSerializer):
    """
    MEJORA: Serializer principal para el modelo User de Django. Incluye el perfil
    completo (modelo Usuarios) anidado.
    """
    perfil = UsuarioSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'perfil']


class RegisterSerializer(serializers.ModelSerializer):
    """
    MEJORA: Serializer para registrar nuevos usuarios. Maneja la creación del
    User y su perfil `Usuarios` asociado en una única transacción.
    """
    rol = serializers.PrimaryKeyRelatedField(queryset=Roles.objects.all(), write_only=True)
    especialidad = serializers.PrimaryKeyRelatedField(queryset=Especialidades.objects.all(), write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'rol', 'especialidad')
        extra_kwargs = {'password': {'write_only': True}}

    @transaction.atomic
    def create(self, validated_data):
        rol = validated_data.pop('rol')
        especialidad = validated_data.pop('especialidad', None)
        
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        Usuarios.objects.create(
            idusuario=user,
            idrol=rol,
            idespecialidad=especialidad
        )
        return user


# --- Serializers para Modelos Principales (Operacionales) ---

class RepuestoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repuestos
        fields = '__all__'


class EquipoSerializer(serializers.ModelSerializer):
    """
    MEJORA: Se añaden campos de solo lectura para obtener los nombres
    de las relaciones directamente, facilitando su visualización en el frontend.
    """
    nombrefaena = serializers.CharField(source='idfaena.nombrefaena', read_only=True)
    nombretipoequipo = serializers.CharField(source='idtipoequipo.nombretipo', read_only=True)
    nombreestado = serializers.CharField(source='idestatus.nombreestado', read_only=True)

    class Meta:
        model = Equipos
        fields = [
            'idequipo', 'codigoequipo', 'descripcion', 'horometroactual',
            'idfaena', 'nombrefaena', 
            'idtipoequipo', 'nombretipoequipo', 
            'idestatus', 'nombreestado'
        ]

class TareaEstandarSerializer(serializers.ModelSerializer):
    nombretipotarea = serializers.CharField(source='idtipotarea.nombretipotarea', read_only=True)
    nombreespecialidad = serializers.CharField(source='idespecialidadrequerida.nombreespecialidad', read_only=True)
    
    class Meta:
        model = TareasEstandar
        fields = '__all__'
        extra_fields = ['nombretipotarea', 'nombreespecialidad']

class PlanMantenimientoSerializer(serializers.ModelSerializer):
    nombretipoequipo = serializers.CharField(source='idtipoequipo.nombretipo', read_only=True)

    class Meta:
        model = PlanesMantenimiento
        fields = '__all__'
        extra_fields = ['nombretipoequipo']

class DetallePlanMantenimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetallesPlanMantenimiento
        fields = '__all__'

class OrdenTrabajoSerializer(serializers.ModelSerializer):
    """
    MEJORA: Similar a Equipos, se añaden representaciones de texto para las claves foráneas.
    """
    codigoequipo = serializers.CharField(source='idequipo.codigoequipo', read_only=True)
    nombrefaena = serializers.CharField(source='idfaena.nombrefaena', read_only=True)
    nombretipomantenimiento = serializers.CharField(source='idtipomantenimiento.nombretipomantenimiento', read_only=True)
    nombreestado = serializers.CharField(source='idestado.nombreestado', read_only=True)
    creador = serializers.CharField(source='idusuariocreador.idusuario.username', read_only=True, allow_null=True)

    class Meta:
        model = OrdenesTrabajo
        fields = [
            'idordentrabajo', 'descripcionot', 'fechacreacion', 'fechainicioprogramado',
            'fechafinprogramado', 'fechainicioreal', 'fechafinreal',
            'idequipo', 'codigoequipo',
            'idfaena', 'nombrefaena',
            'idtipomantenimiento', 'nombretipomantenimiento',
            'idestado', 'nombreestado',
            'idusuariocreador', 'creador',
            'idusuariosupervisor'
        ]

class ActividadOTSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActividadesOrdenTrabajo
        fields = '__all__'

class AgendaSerializer(serializers.ModelSerializer):
    """
    Este serializer ya estaba personalizado para el calendario. Se mantiene
    su estructura para compatibilidad con el componente de calendario.
    """
    id = serializers.IntegerField(source='idagenda', read_only=True)
    title = serializers.CharField(source='tituloevento')
    start = serializers.DateTimeField(source='fechahorainicio')
    end = serializers.DateTimeField(source='fechahorafin')
    type = serializers.CharField(source='tipoevento', allow_blank=True, required=False)
    notes = serializers.CharField(source='descripcionevento', allow_blank=True, required=False)

    class Meta:
        model = Agendas
        fields = ('id', 'title', 'start', 'end', 'type', 'notes', 'idequipo', 'idordentrabajo', 'idusuarioasignado')

# --- Serializers para Historial y Otros ---

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

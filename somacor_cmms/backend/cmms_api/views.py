from rest_framework import viewsets, permissions, status, serializers, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from .models import *
from .serializers import *

# --- Clases de Permisos Personalizados ---

class IsAdminUser(permissions.BasePermission):
    """
    Permiso personalizado que solo permite el acceso a usuarios con el rol 'Administrador'.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            # Se usa select_related para optimizar la consulta a la base de datos
            perfil = Usuarios.objects.select_related('idrol').get(idusuario=request.user)
            return perfil.idrol.nombrerol == 'Administrador'
        except Usuarios.DoesNotExist:
            return False

# --- Serializers de Autenticación ---

class CustomAuthTokenSerializer(serializers.Serializer):
    """
    Serializer para validar las credenciales del usuario (username y password).
    """
    username = serializers.CharField(label="Username", write_only=True)
    password = serializers.CharField(
        label="Password",
        style={'input_type': 'password'},
        trim_whitespace=False,
        write_only=True
    )
    token = serializers.CharField(label="Token", read_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(request=self.context.get('request'),
                                username=username, password=password)

            if not user:
                msg = 'No es posible iniciar sesión con las credenciales proporcionadas.'
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = 'Debe incluir "username" y "password".'
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs

# CORRECCIÓN: Se añade el serializer para el registro de usuarios.
class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer para crear un nuevo usuario y su perfil asociado.
    """
    rol = serializers.PrimaryKeyRelatedField(
        queryset=Roles.objects.all(), source='idrol', write_only=True
    )
    especialidad = serializers.PrimaryKeyRelatedField(
        queryset=Especialidades.objects.all(), source='idespecialidad', write_only=True
    )
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'rol', 'especialidad')
        extra_kwargs = {'password': {'write_only': True}}

    @transaction.atomic
    def create(self, validated_data):
        # Se extraen los datos del perfil de usuario del diccionario validado
        rol_data = validated_data.pop('idrol')
        especialidad_data = validated_data.pop('idespecialidad')

        # Se crea el objeto User de Django
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        # Se crea el perfil de usuario (modelo Usuarios) asociado al User recién creado
        Usuarios.objects.create(
            idusuario=user,
            idrol=rol_data,
            idespecialidad=especialidad_data
        )
        return user


# --- Vistas de Autenticación ---

class CustomAuthToken(ObtainAuthToken):
    """
    Vista de login personalizada que devuelve el token de autenticación
    junto con los datos del perfil del usuario.
    """
    serializer_class = CustomAuthTokenSerializer
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        try:
            usuario_profile = user.usuarios
            user_data = UsuarioSerializer(usuario_profile).data
        except Usuarios.DoesNotExist:
            user_data = None

        return Response({
            'token': token.key,
            'user': user_data
        })

class LogoutView(APIView):
    """
    Vista para cerrar la sesión del usuario (logout).
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
        except (AttributeError, Token.DoesNotExist):
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)

# CORRECCIÓN: Se añade la vista RegisterView que faltaba.
class RegisterView(generics.CreateAPIView):
    """
    Vista para registrar un nuevo usuario en el sistema.
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


# --- ViewSets ---

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para obtener información del usuario autenticado ('/api/users/me/').
    """
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        try:
            profile = request.user.usuarios
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except Usuarios.DoesNotExist:
            return Response(
                {'error': 'No se encontró un perfil de usuario asociado.'}, 
                status=status.HTTP_404_NOT_FOUND
            )

# --- ViewSets para Catálogos (Mantenedores) ---

class RolViewSet(viewsets.ModelViewSet):
    queryset = Roles.objects.all()
    serializer_class = RolSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

class EspecialidadViewSet(viewsets.ModelViewSet):
    queryset = Especialidades.objects.all()
    serializer_class = EspecialidadSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

class FaenaViewSet(viewsets.ModelViewSet):
    queryset = Faenas.objects.all()
    serializer_class = FaenaSerializer
    permission_classes = [permissions.IsAuthenticated]

class TipoEquipoViewSet(viewsets.ModelViewSet):
    queryset = TiposEquipo.objects.all()
    serializer_class = TipoEquipoSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

class EstadoEquipoViewSet(viewsets.ModelViewSet):
    queryset = EstadosEquipo.objects.all()
    serializer_class = EstadoEquipoSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

class TipoTareaViewSet(viewsets.ModelViewSet):
    queryset = TiposTarea.objects.all()
    serializer_class = TipoTareaSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

class TipoMantenimientoOTViewSet(viewsets.ModelViewSet):
    queryset = TiposMantenimientoOT.objects.all()
    serializer_class = TipoMantenimientoOTSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

class EstadoOrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = EstadosOrdenTrabajo.objects.all()
    serializer_class = EstadoOrdenTrabajoSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

class RepuestoViewSet(viewsets.ModelViewSet):
    queryset = Repuestos.objects.all()
    serializer_class = RepuestoSerializer
    permission_classes = [permissions.IsAuthenticated]

# --- ViewSets para Modelos Principales ---

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuarios.objects.all().select_related('idusuario', 'idrol', 'idespecialidad')
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

class EquipoViewSet(viewsets.ModelViewSet):
    queryset = Equipos.objects.all()
    serializer_class = EquipoSerializer
    permission_classes = [permissions.IsAuthenticated]

class TareaEstandarViewSet(viewsets.ModelViewSet):
    queryset = TareasEstandar.objects.all()
    serializer_class = TareaEstandarSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

class PlanMantenimientoViewSet(viewsets.ModelViewSet):
    queryset = PlanesMantenimiento.objects.all()
    serializer_class = PlanMantenimientoSerializer
    permission_classes = [permissions.IsAuthenticated]

class DetallePlanMantenimientoViewSet(viewsets.ModelViewSet):
    queryset = DetallesPlanMantenimiento.objects.all()
    serializer_class = DetallePlanMantenimientoSerializer
    permission_classes = [permissions.IsAuthenticated]

class OrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = OrdenesTrabajo.objects.all()
    serializer_class = OrdenTrabajoSerializer
    permission_classes = [permissions.IsAuthenticated]

class ActividadOrdenTrabajoViewSet(viewsets.ModelViewSet):
    queryset = ActividadesOrdenTrabajo.objects.all()
    serializer_class = ActividadOTSerializer
    permission_classes = [permissions.IsAuthenticated]

class AgendaViewSet(viewsets.ModelViewSet):
    queryset = Agendas.objects.all()
    serializer_class = AgendaSerializer
    permission_classes = [permissions.IsAuthenticated]

class HistorialHorometrosViewSet(viewsets.ModelViewSet):
    queryset = HistorialHorometros.objects.all()
    serializer_class = HistorialHorometrosSerializer
    permission_classes = [permissions.IsAuthenticated]

class HistorialEstadosEquipoViewSet(viewsets.ModelViewSet):
    queryset = HistorialEstadosEquipo.objects.all()
    serializer_class = HistorialEstadosEquipoSerializer
    permission_classes = [permissions.IsAuthenticated]

class DocumentoAdjuntoViewSet(viewsets.ModelViewSet):
    queryset = DocumentosAdjuntos.objects.all()
    serializer_class = DocumentoAdjuntoSerializer
    permission_classes = [permissions.IsAuthenticated]

class NotificacionViewSet(viewsets.ModelViewSet):
    queryset = Notificaciones.objects.all()
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notificaciones.objects.filter(idusuariodestino__idusuario=self.request.user)

# cmms_api/models.py
# ARCHIVO ACTUALIZADO: Se añaden los nuevos modelos para el módulo de Checklist.

from django.db import models
from django.contrib.auth.models import User

# --- Modelos Anteriores (revisados y mantenidos para consistencia) ---
class Roles(models.Model):
    idrol = models.AutoField(db_column='IDRol', primary_key=True)
    nombrerol = models.CharField(db_column='NombreRol', unique=True, max_length=50)
    def __str__(self): return self.nombrerol
    class Meta: db_table = 'roles'

class Usuarios(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, db_column='IDUsuario')
    idrol = models.ForeignKey(Roles, on_delete=models.PROTECT, db_column='IDRol')
    departamento = models.CharField(db_column='Departamento', max_length=100, blank=True, null=True)
    def __str__(self): return self.user.username
    class Meta: db_table = 'usuarios'

class TiposEquipo(models.Model):
    idtipoequipo = models.AutoField(db_column='IDTipoEquipo', primary_key=True)
    nombretipo = models.CharField(db_column='NombreTipo', unique=True, max_length=100)
    def __str__(self): return self.nombretipo
    class Meta: db_table = 'tiposequipo'

class Faenas(models.Model):
    idfaena = models.AutoField(db_column='IDFaena', primary_key=True)
    nombrefaena = models.CharField(db_column='NombreFaena', unique=True, max_length=100)
    ubicacion = models.CharField(db_column='Ubicacion', max_length=255, blank=True, null=True)
    activa = models.BooleanField(db_column='Activa', default=True)
    def __str__(self): return self.nombrefaena
    class Meta: db_table = 'faenas'

class EstadosEquipo(models.Model):
    idestadoequipo = models.AutoField(db_column='IDEstadoEquipo', primary_key=True)
    nombreestado = models.CharField(db_column='NombreEstado', unique=True, max_length=50)
    def __str__(self): return self.nombreestado
    class Meta: db_table = 'estadosequipo'
    
class Equipos(models.Model):
    idequipo = models.AutoField(db_column='IDEquipo', primary_key=True)
    codigointerno = models.CharField(db_column='CodigoInterno', unique=True, max_length=50, blank=True, null=True)
    nombreequipo = models.CharField(db_column='NombreEquipo', max_length=150)
    marca = models.CharField(db_column='Marca', max_length=100, blank=True, null=True)
    modelo = models.CharField(db_column='Modelo', max_length=100, blank=True, null=True)
    anio = models.IntegerField(db_column='Anio', blank=True, null=True)
    patente = models.CharField(db_column='Patente', max_length=20, blank=True, null=True)
    idtipoequipo = models.ForeignKey(TiposEquipo, on_delete=models.PROTECT, db_column='IDTipoEquipo')
    idfaenaactual = models.ForeignKey(Faenas, on_delete=models.SET_NULL, db_column='IDFaenaActual', blank=True, null=True)
    idestadoactual = models.ForeignKey(EstadosEquipo, on_delete=models.PROTECT, db_column='IDEstadoActual')
    horometroactual = models.IntegerField(db_column='HorometroActual', default=0)
    activo = models.BooleanField(db_column='Activo', default=True)
    def __str__(self): return f"{self.nombreequipo} ({self.patente or self.codigointerno})"
    class Meta: db_table = 'equipos'

# --- NUEVOS MODELOS PARA EL MÓDULO DE CHECKLISTS ---

class ChecklistTemplate(models.Model):
    """
    Representa la plantilla maestra de un checklist.
    Ej: "Check List Minicargador", "Check List Camionetas".
    """
    id_template = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=200, unique=True)
    tipo_equipo = models.ForeignKey(TiposEquipo, on_delete=models.CASCADE, help_text="Tipo de equipo al que aplica este checklist.")
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

class ChecklistCategory(models.Model):
    """
    Representa una categoría dentro de un checklist.
    Ej: "1. MOTOR", "2. LUCES", "3. DOCUMENTOS".
    """
    id_category = models.AutoField(primary_key=True)
    template = models.ForeignKey(ChecklistTemplate, on_delete=models.CASCADE, related_name='categories')
    nombre = models.CharField(max_length=100)
    orden = models.IntegerField(default=1) # Para ordenar las categorías en el formulario.

    class Meta:
        ordering = ['orden']
    def __str__(self):
        return f"{self.orden}. {self.nombre}"

class ChecklistItem(models.Model):
    """
    Representa un ítem individual a ser chequeado.
    Ej: "1.1 Nivel de Agua", "2.1 Luces Altas".
    """
    id_item = models.AutoField(primary_key=True)
    category = models.ForeignKey(ChecklistCategory, on_delete=models.CASCADE, related_name='items')
    texto = models.CharField(max_length=255)
    es_critico = models.BooleanField(default=False, help_text="Marcar si una falla en este ítem impide la operación del equipo.")
    orden = models.IntegerField(default=1)

    class Meta:
        ordering = ['orden']
    def __str__(self):
        return self.texto

class ChecklistInstance(models.Model):
    """
    Representa un checklist que ha sido completado por un operador.
    Contiene la información del encabezado del informe.
    """
    id_instance = models.AutoField(primary_key=True)
    template = models.ForeignKey(ChecklistTemplate, on_delete=models.PROTECT)
    equipo = models.ForeignKey(Equipos, on_delete=models.PROTECT)
    operador = models.ForeignKey(User, on_delete=models.PROTECT)
    fecha_inspeccion = models.DateField()
    horometro_inspeccion = models.IntegerField()
    lugar_inspeccion = models.CharField(max_length=200, blank=True, null=True)
    observaciones_generales = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Checklist para {self.equipo.nombreequipo} - {self.fecha_inspeccion}"

class ChecklistAnswer(models.Model):
    """
    Almacena la respuesta (Bueno, Malo, N/A) para un ítem específico
    de un checklist completado.
    """
    ESTADO_CHOICES = [
        ('bueno', 'Bueno'),
        ('malo', 'Malo'),
        ('na', 'No Aplica'),
    ]
    id_answer = models.AutoField(primary_key=True)
    instance = models.ForeignKey(ChecklistInstance, on_delete=models.CASCADE, related_name='answers')
    item = models.ForeignKey(ChecklistItem, on_delete=models.PROTECT)
    estado = models.CharField(max_length=10, choices=ESTADO_CHOICES)
    observacion_item = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        unique_together = ('instance', 'item')

from django.db import models
from django.contrib.auth.models import User


# --- Modelos de Catálogos ---
# Estos modelos representan las opciones en listas desplegables y no suelen cambiar.

class Roles(models.Model):
    idrol = models.AutoField(db_column='IDRol', primary_key=True)
    nombrerol = models.CharField(db_column='NombreRol', unique=True, max_length=50)
    descripcionrol = models.CharField(db_column='DescripcionRol', max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombrerol

    class Meta:
        db_table = 'roles'
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'


class Especialidades(models.Model):
    idespecialidad = models.AutoField(db_column='IDEspecialidad', primary_key=True)
    nombreespecialidad = models.CharField(db_column='NombreEspecialidad', unique=True, max_length=100)
    descripcion = models.CharField(db_column='Descripcion', max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombreespecialidad

    class Meta:
        db_table = 'especialidades'
        verbose_name = 'Especialidad'
        verbose_name_plural = 'Especialidades'


class Faenas(models.Model):
    idfaena = models.AutoField(db_column='IDFaena', primary_key=True)
    nombrefaena = models.CharField(db_column='NombreFaena', unique=True, max_length=100)
    ubicacion = models.CharField(db_column='Ubicacion', max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombrefaena

    class Meta:
        db_table = 'faenas'
        verbose_name = 'Faena'
        verbose_name_plural = 'Faenas'


class TiposEquipo(models.Model):
    idtipoequipo = models.AutoField(db_column='IDTipoEquipo', primary_key=True)
    nombretipo = models.CharField(db_column='NombreTipo', max_length=100)
    descripcion = models.CharField(db_column='Descripcion', max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombretipo

    class Meta:
        db_table = 'tiposequipo'
        verbose_name = 'Tipo de Equipo'
        verbose_name_plural = 'Tipos de Equipo'


class EstadosEquipo(models.Model):
    idestatus = models.AutoField(db_column='IDEstado', primary_key=True)
    nombreestado = models.CharField(db_column='NombreEstado', unique=True, max_length=50)
    descripcion = models.CharField(db_column='Descripcion', max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombreestado

    class Meta:
        db_table = 'estadosequipo'
        verbose_name = 'Estado de Equipo'
        verbose_name_plural = 'Estados de Equipo'


class TiposTarea(models.Model):
    idtipotarea = models.AutoField(db_column='IDTipoTarea', primary_key=True)
    nombretipotarea = models.CharField(db_column='NombreTipoTarea', unique=True, max_length=50)

    def __str__(self):
        return self.nombretipotarea

    class Meta:
        db_table = 'tipostarea'
        verbose_name = 'Tipo de Tarea'
        verbose_name_plural = 'Tipos de Tarea'


class TiposMantenimientoOT(models.Model):
    idtipomantenimientoot = models.AutoField(db_column='IDTipoMantenimientoOT', primary_key=True)
    nombretipomantenimiento = models.CharField(db_column='NombreTipoMantenimiento', max_length=100)

    def __str__(self):
        return self.nombretipomantenimiento

    class Meta:
        db_table = 'tiposmantenimientoot'
        verbose_name = 'Tipo de Mantenimiento para OT'
        verbose_name_plural = 'Tipos de Mantenimiento para OT'


class EstadosOrdenTrabajo(models.Model):
    idestado = models.AutoField(db_column='IDEstado', primary_key=True)
    nombreestado = models.CharField(db_column='NombreEstado', max_length=50, unique=True)
    descripcion = models.CharField(db_column='Descripcion', max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombreestado

    class Meta:
        db_table = 'estadosordentrabajo'
        verbose_name = 'Estado de Orden de Trabajo'
        verbose_name_plural = 'Estados de Orden de Trabajo'


class Repuestos(models.Model):
    idrepuesto = models.AutoField(db_column='IDRepuesto', primary_key=True)
    numeroparte = models.CharField(db_column='NumeroParte', unique=True, max_length=50)
    descripcion = models.CharField(db_column='Descripcion', max_length=255)
    stockactual = models.IntegerField(db_column='StockActual')
    stockminimo = models.IntegerField(db_column='StockMinimo', blank=True, null=True)
    unidadmedida = models.CharField(db_column='UnidadMedida', max_length=20)

    def __str__(self):
        return f"{self.numeroparte} - {self.descripcion}"

    class Meta:
        db_table = 'repuestos'
        verbose_name = 'Repuesto'
        verbose_name_plural = 'Repuestos'


# --- Modelos Principales ---

class Usuarios(models.Model):
    idusuario = models.OneToOneField(User, on_delete=models.CASCADE, db_column='IDUsuario', primary_key=True, related_name='perfil')
    # MEJORA: Cambiado a models.PROTECT para evitar que se pueda borrar un rol si hay usuarios asignados a él.
    idrol = models.ForeignKey(Roles, on_delete=models.PROTECT, db_column='IDRol')
    # MEJORA: Cambiado a models.SET_NULL. Si se borra una especialidad, el usuario no se borra, solo queda sin especialidad.
    idespecialidad = models.ForeignKey(Especialidades, on_delete=models.SET_NULL, db_column='IDEspecialidad', blank=True, null=True)

    def __str__(self):
        return self.idusuario.username

    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'


class Equipos(models.Model):
    idequipo = models.AutoField(db_column='IDEquipo', primary_key=True)
    codigoequipo = models.CharField(db_column='CodigoEquipo', unique=True, max_length=50)
    descripcion = models.CharField(db_column='Descripcion', max_length=255)
    # MEJORA: Cambiado a models.PROTECT para evitar borrar una faena si tiene equipos asociados.
    idfaena = models.ForeignKey(Faenas, on_delete=models.PROTECT, db_column='IDFaena')
    # MEJORA: Cambiado a models.PROTECT para evitar borrar un tipo de equipo si hay equipos de ese tipo.
    idtipoequipo = models.ForeignKey(TiposEquipo, on_delete=models.PROTECT, db_column='IDTipoEquipo')
    # MEJORA: Cambiado a models.PROTECT. Un estado no se debería poder borrar si está en uso por un equipo.
    idestatus = models.ForeignKey(EstadosEquipo, on_delete=models.PROTECT, db_column='IDEstado')
    horometroactual = models.IntegerField(db_column='HorometroActual', blank=True, null=True)

    def __str__(self):
        return self.codigoequipo

    class Meta:
        db_table = 'equipos'
        verbose_name = 'Equipo'
        verbose_name_plural = 'Equipos'


class TareasEstandar(models.Model):
    idtareaestandar = models.AutoField(db_column='IDTareaEstandar', primary_key=True)
    codigotarea = models.CharField(db_column='CodigoTarea', unique=True, max_length=20)
    descripcion = models.CharField(db_column='Descripcion', max_length=255)
    # MEJORA: Cambiado a models.PROTECT. No se debe borrar un tipo de tarea si está asociado a una tarea estándar.
    idtipotarea = models.ForeignKey(TiposTarea, on_delete=models.PROTECT, db_column='IDTipoTarea')
    # MEJORA: Cambiado a models.SET_NULL. La tarea puede existir sin especialidad requerida.
    idespecialidadrequerida = models.ForeignKey(Especialidades, on_delete=models.SET_NULL, db_column='IDEspecialidadRequerida', blank=True, null=True)
    duracionestimadahoras = models.DecimalField(db_column='DuracionEstimadaHoras', max_digits=5, decimal_places=2)

    def __str__(self):
        return self.codigotarea

    class Meta:
        db_table = 'tareasestandar'
        verbose_name = 'Tarea Estándar'
        verbose_name_plural = 'Tareas Estándar'


class PlanesMantenimiento(models.Model):
    idplanmantenimiento = models.AutoField(db_column='IDPlanMantenimiento', primary_key=True)
    nombreplan = models.CharField(db_column='NombrePlan', max_length=100)
    # MEJORA: Cambiado a models.PROTECT. Un plan de mantenimiento está intrínsecamente ligado a un tipo de equipo.
    idtipoequipo = models.ForeignKey(TiposEquipo, on_delete=models.PROTECT, db_column='IDTipoEquipo')
    descripcion = models.CharField(db_column='Descripcion', max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombreplan

    class Meta:
        db_table = 'planesmantenimiento'
        verbose_name = 'Plan de Mantenimiento'
        verbose_name_plural = 'Planes de Mantenimiento'


class DetallesPlanMantenimiento(models.Model):
    iddetalleplan = models.AutoField(db_column='IDDetallePlan', primary_key=True)
    # MEJORA: Cambiado a models.CASCADE. Si se borra el plan de mantenimiento, sus detalles no tienen sentido por sí solos.
    idplanmantenimiento = models.ForeignKey(PlanesMantenimiento, on_delete=models.CASCADE, db_column='IDPlanMantenimiento')
    # MEJORA: Cambiado a models.PROTECT. No se puede borrar una tarea estándar si está en un plan.
    idtareaestandar = models.ForeignKey(TareasEstandar, on_delete=models.PROTECT, db_column='IDTareaEstandar')
    puntomantenimiento = models.CharField(db_column='PuntoMantenimiento', max_length=20, blank=True, null=True)
    intervalohorasoperacion = models.IntegerField(db_column='IntervaloHorasOperacion', blank=True, null=True)
    intervalodiascalendario = models.IntegerField(db_column='IntervaloDiasCalendario', blank=True, null=True)
    tipointervalopredominante = models.CharField(db_column='TipoIntervaloPredominante', max_length=5, blank=True, null=True)
    toleranciahoras = models.IntegerField(db_column='ToleranciaHoras', blank=True, null=True)
    toleranciadiana = models.IntegerField(db_column='ToleranciaDias', blank=True, null=True)

    class Meta:
        db_table = 'detallesplanmantenimiento'
        # MEJORA: unique_together previene duplicados de la misma tarea en el mismo plan.
        unique_together = (('idplanmantenimiento', 'idtareaestandar'),)
        verbose_name = 'Detalle de Plan de Mantenimiento'
        verbose_name_plural = 'Detalles de Planes de Mantenimiento'


class OrdenesTrabajo(models.Model):
    idordentrabajo = models.AutoField(db_column='IDOrdenTrabajo', primary_key=True)
    descripcionot = models.CharField(db_column='DescripcionOT', max_length=255)
    # MEJORA: Cambiado a models.PROTECT. No se debe borrar un equipo si tiene órdenes de trabajo asociadas.
    idequipo = models.ForeignKey(Equipos, on_delete=models.PROTECT, db_column='IDEquipo')
    # MEJORA: Cambiado a models.PROTECT por consistencia.
    idfaena = models.ForeignKey(Faenas, on_delete=models.PROTECT, db_column='IDFaena')
    # MEJORA: Cambiado a models.PROTECT.
    idtipomantenimiento = models.ForeignKey(TiposMantenimientoOT, on_delete=models.PROTECT, db_column='IDTipoMantenimientoOT')
    # MEJORA: Cambiado a models.PROTECT.
    idestado = models.ForeignKey(EstadosOrdenTrabajo, on_delete=models.PROTECT, db_column='IDEstado')
    # MEJORA: Cambiado a models.SET_NULL para preservar el historial si se borra un usuario.
    idusuariocreador = models.ForeignKey(Usuarios, related_name='ots_creadas', on_delete=models.SET_NULL, db_column='IDUsuarioCreador', blank=True, null=True)
    idusuariosupervisor = models.ForeignKey(Usuarios, related_name='ots_supervisadas', on_delete=models.SET_NULL, db_column='IDUsuarioSupervisor', blank=True, null=True)
    fechacreacion = models.DateTimeField(db_column='FechaCreacion', auto_now_add=True)
    fechainicioprogramado = models.DateTimeField(db_column='FechaInicioProgramado', blank=True, null=True)
    fechafinprogramado = models.DateTimeField(db_column='FechaFinProgramado', blank=True, null=True)
    fechainicioreal = models.DateTimeField(db_column='FechaInicioReal', blank=True, null=True)
    fechafinreal = models.DateTimeField(db_column='FechaFinReal', blank=True, null=True)

    def __str__(self):
        return f"OT-{self.idordentrabajo}: {self.descripcionot}"

    class Meta:
        db_table = 'ordenestrabajo'
        verbose_name = 'Orden de Trabajo'
        verbose_name_plural = 'Ordenes de Trabajo'


class ActividadesOrdenTrabajo(models.Model):
    idactividadot = models.AutoField(db_column='IDActividadOT', primary_key=True)
    # MEJORA: Cambiado a models.CASCADE. Si se borra la OT, sus actividades deben borrarse con ella.
    idordentrabajo = models.ForeignKey(OrdenesTrabajo, on_delete=models.CASCADE, db_column='IDOrdenTrabajo')
    # MEJORA: Cambiado a models.PROTECT. Proteger la tarea estándar.
    idtareaestandar = models.ForeignKey(TareasEstandar, on_delete=models.PROTECT, db_column='IDTareaEstandar')
    # MEJORA: Cambiado a models.SET_NULL. La actividad puede quedar sin técnico asignado si este se elimina.
    idtecnicoejecutor = models.ForeignKey(Usuarios, on_delete=models.SET_NULL, db_column='IDTecnicoEjecutor', blank=True, null=True)
    observaciones = models.TextField(db_column='Observaciones', blank=True, null=True)
    completada = models.BooleanField(db_column='Completada', default=False)
    fechacompletada = models.DateTimeField(db_column='FechaCompletada', blank=True, null=True)

    class Meta:
        db_table = 'actividadesordentrabajo'
        verbose_name = 'Actividad de Orden de Trabajo'
        verbose_name_plural = 'Actividades de Ordenes de Trabajo'


class UsoRepuestosActividadOT(models.Model):
    idusorepuesto = models.AutoField(db_column='IDUsoRepuesto', primary_key=True)
    # MEJORA: CASCADE es correcto aquí. Si se borra la actividad, el registro de uso de repuesto no tiene sentido.
    idactividadot = models.ForeignKey(ActividadesOrdenTrabajo, on_delete=models.CASCADE, db_column='IDActividadOT')
    # MEJORA: PROTECT es crucial. No se debe poder borrar un repuesto si hay registros de su uso.
    idrepuesto = models.ForeignKey(Repuestos, on_delete=models.PROTECT, db_column='IDRepuesto')
    cantidadutilizada = models.IntegerField(db_column='CantidadUtilizada')

    class Meta:
        db_table = 'usorepuestosactividadot'
        verbose_name = 'Uso de Repuesto en Actividad'
        verbose_name_plural = 'Uso de Repuestos en Actividades'


class HistorialHorometros(models.Model):
    idhistorialhorometro = models.AutoField(db_column='IDHistorialHorometro', primary_key=True)
    # MEJORA: CASCADE tiene sentido. Si se elimina el equipo, su historial de horómetros también debe eliminarse.
    idequipo = models.ForeignKey(Equipos, on_delete=models.CASCADE, db_column='IDEquipo')
    fecha = models.DateTimeField(db_column='Fecha')
    valorhorometro = models.IntegerField(db_column='ValorHorometro')

    class Meta:
        db_table = 'historialhorometros'
        verbose_name = 'Historial de Horómetro'
        verbose_name_plural = 'Historial de Horómetros'


class HistorialEstadosEquipo(models.Model):
    idhistorialestado = models.AutoField(db_column='IDHistorialEstado', primary_key=True)
    # MEJORA: CASCADE, al igual que con el horómetro, es apropiado.
    idequipo = models.ForeignKey(Equipos, on_delete=models.CASCADE, db_column='IDEquipo')
    # MEJORA: PROTECT es vital. No borrar un estado si está en el historial de un equipo.
    idestado = models.ForeignKey(EstadosEquipo, on_delete=models.PROTECT, db_column='IDEstado')
    fechainicio = models.DateTimeField(db_column='FechaInicio')
    fechafin = models.DateTimeField(db_column='FechaFin', blank=True, null=True)

    class Meta:
        db_table = 'historialestadosequipo'
        verbose_name = 'Historial de Estado de Equipo'
        verbose_name_plural = 'Historial de Estados de Equipo'


class Agendas(models.Model):
    idagenda = models.AutoField(db_column='IDAgenda', primary_key=True)
    # MEJORA: SET_NULL. Si se borra la OT, el evento de la agenda puede permanecer como un registro.
    idordentrabajo = models.ForeignKey('OrdenesTrabajo', on_delete=models.SET_NULL, db_column='IDOrdenTrabajo', blank=True, null=True)
    # MEJORA: SET_NULL.
    idequipo = models.ForeignKey('Equipos', on_delete=models.SET_NULL, db_column='IDEquipo', blank=True, null=True)
    # MEJORA: SET_NULL.
    idusuarioasignado = models.ForeignKey('Usuarios', related_name='eventos_asignados', on_delete=models.SET_NULL, db_column='IDUsuarioAsignado', blank=True, null=True)
    idusuariocreador = models.ForeignKey('Usuarios', related_name='eventos_creados', on_delete=models.SET_NULL, db_column='IDUsuarioCreador', blank=True, null=True)
    tituloevento = models.CharField(db_column='TituloEvento', max_length=255)
    descripcionevento = models.TextField(db_column='DescripcionEvento', blank=True, null=True)
    fechahorainicio = models.DateTimeField(db_column='FechaHoraInicio')
    fechahorafin = models.DateTimeField(db_column='FechaHoraFin')
    tipoevento = models.CharField(db_column='TipoEvento', max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'agendas'


class DocumentosAdjuntos(models.Model):
    iddocumentoadjunto = models.AutoField(db_column='IDDocumentoAdjunto', primary_key=True)
    nombredocumento = models.CharField(db_column='NombreDocumento', max_length=255)
    archivodocumento = models.FileField(db_column='ArchivoDocumento', upload_to='documentos/%Y/%m/%d/')
    fechacarga = models.DateTimeField(db_column='FechaCarga', auto_now_add=True)
    descripcion = models.CharField(db_column='Descripcion', max_length=255, blank=True, null=True)
    entidadasociada = models.CharField(db_column='EntidadAsociada', max_length=50) # p. ej. 'OrdenTrabajo', 'Equipo'
    identidadasociada = models.IntegerField(db_column='IDEntidadAsociada')

    class Meta:
        db_table = 'documentosadjuntos'


class Notificaciones(models.Model):
    PRIORIDAD_CHOICES = [('Baja', 'Baja'), ('Media', 'Media'), ('Alta', 'Alta')]

    idnotificacion = models.AutoField(db_column='IDNotificacion', primary_key=True)
    # MEJORA: CASCADE es correcto. Si el usuario se elimina, sus notificaciones no tienen destinatario.
    idusuariodestino = models.ForeignKey(Usuarios, on_delete=models.CASCADE, db_column='IDUsuarioDestino')
    mensaje = models.TextField(db_column='Mensaje')
    tiponotificacion = models.CharField(db_column='TipoNotificacion', max_length=50, blank=True, null=True)
    fechacreacion = models.DateTimeField(db_column='FechaCreacion', auto_now_add=True)
    fechalectura = models.DateTimeField(db_column='FechaLectura', blank=True, null=True)
    leida = models.BooleanField(db_column='Leida', default=False)
    prioridad = models.CharField(db_column='Prioridad', max_length=5, choices=PRIORIDAD_CHOICES, default='Media')
    urlrelacionada = models.CharField(db_column='URLRelacionada', max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'notificaciones'
# cmms_api/serializers.py
# ARCHIVO ACTUALIZADO: Se añaden serializers para el nuevo módulo de Checklist.

from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
# Se importan los nuevos modelos
from .models import (
    Roles, Usuarios, TiposEquipo, Faenas, EstadosEquipo, Equipos,
    ChecklistTemplate, ChecklistCategory, ChecklistItem,
    ChecklistInstance, ChecklistAnswer
)

# --- Serializers Anteriores (solo se muestran los necesarios para el contexto) ---
class UsuariosSerializer(serializers.ModelSerializer):
    nombrerol = serializers.CharField(source='idrol.nombrerol', read_only=True)
    class Meta:
        model = Usuarios
        fields = ('idrol', 'nombrerol', 'departamento')
        
class UserSerializer(serializers.ModelSerializer):
    usuarios = UsuariosSerializer(read_only=True)
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email', 'usuarios')

class TipoEquipoSerializer(serializers.ModelSerializer):
    class Meta: model = TiposEquipo; fields = '__all__'

# --- NUEVOS SERIALIZERS PARA EL MÓDULO DE CHECKLISTS ---

class ChecklistItemSerializer(serializers.ModelSerializer):
    """ Serializer para un ítem individual del checklist. """
    class Meta:
        model = ChecklistItem
        fields = ['id_item', 'texto', 'es_critico', 'orden']

class ChecklistCategorySerializer(serializers.ModelSerializer):
    """ Serializer para una categoría, incluyendo sus ítems anidados. """
    items = ChecklistItemSerializer(many=True, read_only=True)
    class Meta:
        model = ChecklistCategory
        fields = ['id_category', 'nombre', 'orden', 'items']

class ChecklistTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer para la plantilla de checklist. Se usa para leer la plantilla
    completa con todas sus categorías e ítems.
    """
    categories = ChecklistCategorySerializer(many=True, read_only=True)
    tipo_equipo_nombre = serializers.CharField(source='tipo_equipo.nombretipo', read_only=True)
    class Meta:
        model = ChecklistTemplate
        fields = ['id_template', 'nombre', 'tipo_equipo', 'tipo_equipo_nombre', 'activo', 'categories']


# --- Serializers para la creación y visualización de un checklist completado ---

class ChecklistAnswerSerializer(serializers.ModelSerializer):
    """ Serializer para enviar las respuestas de un checklist. """
    item = serializers.IntegerField(source='item.id_item')
    class Meta:
        model = ChecklistAnswer
        fields = ['item', 'estado', 'observacion_item']

class ChecklistInstanceSerializer(serializers.ModelSerializer):
    """
    Serializer principal para crear y leer un checklist completado.
    Maneja la creación anidada de las respuestas.
    """
    answers = ChecklistAnswerSerializer(many=True)
    
    # Campos de solo lectura para visualizar la información relacionada
    operador_nombre = serializers.CharField(source='operador.get_full_name', read_only=True)
    equipo_nombre = serializers.CharField(source='equipo.nombreequipo', read_only=True)
    template_nombre = serializers.CharField(source='template.nombre', read_only=True)
    # También incluimos las respuestas leídas para ver un checklist ya completado
    answers_read = ChecklistAnswerSerializer(source='answers', many=True, read_only=True)

    class Meta:
        model = ChecklistInstance
        fields = [
            'id_instance', 'template', 'equipo', 'operador', 'fecha_inspeccion', 
            'horometro_inspeccion', 'lugar_inspeccion', 'observaciones_generales', 
            'fecha_creacion', 'answers', 'answers_read', 'operador_nombre', 'equipo_nombre', 'template_nombre'
        ]
        extra_kwargs = {
            'answers': {'write_only': True}
        }

    def create(self, validated_data):
        """
        Sobrescribe el método de creación para manejar la creación anidada de
        la instancia del checklist y todas sus respuestas en una sola transacción.
        """
        answers_data = validated_data.pop('answers')
        with transaction.atomic():
            instance = ChecklistInstance.objects.create(**validated_data)
            for answer_data in answers_data:
                item_id = answer_data.pop('item')['id_item']
                item = ChecklistItem.objects.get(id_item=item_id)
                ChecklistAnswer.objects.create(instance=instance, item=item, **answer_data)
        return instance

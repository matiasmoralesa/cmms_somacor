# cmms_api/permissions.py

from rest_framework import permissions
from .models import Usuarios

class IsAdminRole(permissions.BasePermission):
    """
    Permiso personalizado para permitir acceso solo a usuarios con rol de Admin.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            usuario = Usuarios.objects.get(user=request.user)
            return usuario.idrol.nombrerol == 'Admin'
        except Usuarios.DoesNotExist:
            return False

class IsSupervisorRole(permissions.BasePermission):
    """
    Permiso personalizado para permitir acceso solo a usuarios con rol de Supervisor.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            usuario = Usuarios.objects.get(user=request.user)
            return usuario.idrol.nombrerol == 'Supervisor'
        except Usuarios.DoesNotExist:
            return False

class IsOperadorRole(permissions.BasePermission):
    """
    Permiso personalizado para permitir acceso solo a usuarios con rol de Operador.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            usuario = Usuarios.objects.get(user=request.user)
            return usuario.idrol.nombrerol == 'Operador'
        except Usuarios.DoesNotExist:
            return False

class IsAdminOrSupervisorRole(permissions.BasePermission):
    """
    Permiso personalizado para permitir acceso a usuarios con rol de Admin o Supervisor.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            usuario = Usuarios.objects.get(user=request.user)
            return usuario.idrol.nombrerol in ['Admin', 'Supervisor']
        except Usuarios.DoesNotExist:
            return False

class IsAnyRole(permissions.BasePermission):
    """
    Permiso personalizado para permitir acceso a cualquier usuario autenticado con rol asignado.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        try:
            usuario = Usuarios.objects.get(user=request.user)
            return usuario.idrol.nombrerol in ['Admin', 'Supervisor', 'Operador']
        except Usuarios.DoesNotExist:
            return False


"""
serializers.py
──────────────
Django REST Framework serializers for all DreamDecorators models.
"""

from rest_framework import serializers
from window_app.models import (
    ProfileType, Typology, CuttingRule, HardwareItem, HardwareRule,
    GlassType, FinishType, Project, WindowDoorItem
)


class ProfileTypeSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = ProfileType
        fields = '__all__'


class TypologySerializer(serializers.ModelSerializer):
    class Meta:
        model = Typology
        fields = '__all__'


class CuttingRuleSerializer(serializers.ModelSerializer):
    profile_name = serializers.CharField(source='profile.name', read_only=True)
    typology_name = serializers.CharField(source='typology.display_name', read_only=True)

    class Meta:
        model = CuttingRule
        fields = '__all__'


class HardwareItemSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = HardwareItem
        fields = '__all__'


class HardwareRuleSerializer(serializers.ModelSerializer):
    hardware_name = serializers.CharField(source='hardware.name', read_only=True)

    class Meta:
        model = HardwareRule
        fields = '__all__'


class GlassTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlassType
        fields = '__all__'


class FinishTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinishType
        fields = '__all__'


class WindowDoorItemSerializer(serializers.ModelSerializer):
    typology_name = serializers.CharField(source='typology.display_name', read_only=True)
    glass_type_name = serializers.CharField(source='glass_type.name', read_only=True)
    finish_name = serializers.CharField(source='finish.name', read_only=True)
    glass_area_sqft = serializers.FloatField(source='get_glass_area_sqft', read_only=True)

    class Meta:
        model = WindowDoorItem
        fields = '__all__'


class WindowDoorItemWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = WindowDoorItem
        fields = ['code', 'width', 'height', 'typology', 'glass_type',
                  'finish', 'has_mesh', 'quantity', 'notes', 'order']


class ProjectListSerializer(serializers.ModelSerializer):
    total_items = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'project_name', 'customer_name', 'customer_phone',
                  'customer_email', 'project_date', 'status', 'status_display',
                  'discount_percent', 'gst_percent', 'created_at', 'updated_at',
                  'total_items', 'items_count']

    def get_total_items(self, obj):
        return obj.get_total_items()

    def get_items_count(self, obj):
        return obj.items.count()


class ProjectDetailSerializer(serializers.ModelSerializer):
    items = WindowDoorItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = '__all__'

    def get_total_items(self, obj):
        return obj.get_total_items()


class ProjectWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['project_name', 'customer_name', 'customer_address',
                  'customer_phone', 'customer_email', 'site_address',
                  'status', 'notes', 'discount_percent', 'gst_percent']

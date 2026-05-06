from django.contrib import admin
from window_app.models import (
    ProfileType, Typology, CuttingRule, HardwareItem, HardwareRule,
    GlassType, FinishType, Project, WindowDoorItem
)

admin.site.site_header = "DreamDecorators Admin"
admin.site.site_title = "DreamDecorators"
admin.site.index_title = "Window & Door Fabrication"

@admin.register(ProfileType)
class ProfileTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'bar_length', 'unit_price', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['name']

@admin.register(Typology)
class TypologyAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'code', 'is_door', 'has_mesh_option']

@admin.register(CuttingRule)
class CuttingRuleAdmin(admin.ModelAdmin):
    list_display = ['typology', 'profile', 'direction', 'formula', 'quantity']
    list_filter = ['typology', 'direction']

@admin.register(HardwareItem)
class HardwareItemAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'unit_price', 'is_active']
    list_filter = ['category', 'is_active']

@admin.register(GlassType)
class GlassTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'thickness', 'unit_price', 'is_active']

@admin.register(FinishType)
class FinishTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'price_multiplier', 'is_active']

class WindowDoorItemInline(admin.TabularInline):
    model = WindowDoorItem
    extra = 0

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['project_name', 'customer_name', 'status', 'project_date', 'created_at']
    list_filter = ['status']
    search_fields = ['project_name', 'customer_name']
    inlines = [WindowDoorItemInline]

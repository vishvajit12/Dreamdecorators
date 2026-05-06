"""
api_urls.py
───────────
REST API URL patterns for DreamDecorators.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from window_app.api_views import (
    ProfileTypeViewSet, TypologyViewSet, GlassTypeViewSet,
    FinishTypeViewSet, HardwareItemViewSet,
    ProjectViewSet, WindowDoorItemViewSet, DashboardStatsView
)

router = DefaultRouter()
router.register(r'profiles', ProfileTypeViewSet, basename='profile')
router.register(r'typologies', TypologyViewSet, basename='typology')
router.register(r'glass-types', GlassTypeViewSet, basename='glass-type')
router.register(r'finish-types', FinishTypeViewSet, basename='finish-type')
router.register(r'hardware', HardwareItemViewSet, basename='hardware')
router.register(r'projects', ProjectViewSet, basename='project')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),

    # Nested: items under a project
    path(
        'projects/<int:project_pk>/items/',
        WindowDoorItemViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='project-items-list'
    ),
    path(
        'projects/<int:project_pk>/items/<int:pk>/',
        WindowDoorItemViewSet.as_view({
            'get': 'retrieve', 'put': 'update',
            'patch': 'partial_update', 'delete': 'destroy'
        }),
        name='project-items-detail'
    ),
]

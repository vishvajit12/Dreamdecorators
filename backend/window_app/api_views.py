"""
api_views.py
────────────
Django REST Framework API views for DreamDecorators.
Provides full CRUD + report download endpoints consumed by React frontend.
"""

from django.http import HttpResponse
from django.db.models import Sum, Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from window_app.models import (
    ProfileType, Typology, GlassType, FinishType,
    Project, WindowDoorItem, HardwareItem
)
from window_app.serializers import (
    ProfileTypeSerializer, TypologySerializer, GlassTypeSerializer,
    FinishTypeSerializer, ProjectListSerializer, ProjectDetailSerializer,
    ProjectWriteSerializer, WindowDoorItemSerializer, WindowDoorItemWriteSerializer,
    HardwareItemSerializer
)
from window_app.calculation_engine import generate_boq, optimise_bars, build_quotation_summary
from window_app.report_generators import (
    generate_quotation_pdf, generate_boq_pdf, generate_bar_optimisation_pdf,
    generate_boq_excel, generate_bar_optimisation_excel
)


# ─── Reference Data ViewSets ─────────────────────────────────────────────────

class ProfileTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProfileType.objects.filter(is_active=True).order_by('category', 'name')
    serializer_class = ProfileTypeSerializer


class TypologyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Typology.objects.all().order_by('display_name')
    serializer_class = TypologySerializer


class GlassTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GlassType.objects.filter(is_active=True).order_by('thickness', 'name')
    serializer_class = GlassTypeSerializer


class FinishTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FinishType.objects.filter(is_active=True).order_by('name')
    serializer_class = FinishTypeSerializer


class HardwareItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HardwareItem.objects.filter(is_active=True).order_by('category', 'name')
    serializer_class = HardwareItemSerializer


# ─── Project ViewSet ─────────────────────────────────────────────────────────

class ProjectViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for projects plus report download actions.
    """
    queryset = Project.objects.prefetch_related('items').order_by('-created_at')

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return ProjectWriteSerializer
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search', '')
        status_filter = self.request.query_params.get('status', '')
        if search:
            qs = qs.filter(
                Q(project_name__icontains=search) | Q(customer_name__icontains=search)
            )
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        project = self.get_object()
        new_status = request.data.get('status')
        valid = [s[0] for s in Project.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        project.status = new_status
        project.save()
        return Response({'status': project.status, 'status_display': project.get_status_display()})

    @action(detail=True, methods=['get'], url_path='boq-preview')
    def boq_preview(self, request, pk=None):
        """Live BOQ preview — JSON for React frontend."""
        project = self.get_object()
        try:
            profile_lines, hardware_lines, glass_lines = generate_boq(project)
            bar_results = optimise_bars(project)
            summary = build_quotation_summary(project)

            return Response({
                'profiles': [
                    {
                        'item': l.item_code, 'description': l.description,
                        'cut_length': l.cut_length_mm, 'qty': l.quantity,
                        'total_length': l.total_length_mm, 'amount': l.total_price
                    }
                    for l in profile_lines
                ],
                'hardware': [
                    {
                        'item': l.item_code, 'description': l.description,
                        'qty': l.quantity, 'amount': l.total_price
                    }
                    for l in hardware_lines
                ],
                'glass': [
                    {
                        'item': l.item_code, 'description': l.description,
                        'qty': l.quantity, 'area_sqft': round(l.total_length_mm, 3),
                        'amount': l.total_price
                    }
                    for l in glass_lines
                ],
                'bar_summary': [
                    {
                        'profile': r.profile_name, 'bars': r.total_bars,
                        'efficiency': r.efficiency_percent, 'waste_mm': r.total_waste_mm
                    }
                    for r in bar_results
                ],
                'summary': {
                    'profiles': summary.subtotal_profiles,
                    'hardware': summary.subtotal_hardware,
                    'glass': summary.subtotal_glass,
                    'labour': summary.subtotal_labour,
                    'grand_total': summary.grand_total,
                    'gst': summary.gst_amount,
                    'discount': summary.discount_amount,
                }
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], url_path='reports/quotation.pdf')
    def quotation_pdf(self, request, pk=None):
        project = self.get_object()
        pdf = generate_quotation_pdf(project)
        resp = HttpResponse(pdf, content_type='application/pdf')
        resp['Content-Disposition'] = f'attachment; filename="Quotation_{project.pk}_{project.customer_name}.pdf"'
        return resp

    @action(detail=True, methods=['get'], url_path='reports/boq.pdf')
    def boq_pdf(self, request, pk=None):
        project = self.get_object()
        pdf = generate_boq_pdf(project)
        resp = HttpResponse(pdf, content_type='application/pdf')
        resp['Content-Disposition'] = f'attachment; filename="BOQ_{project.pk}.pdf"'
        return resp

    @action(detail=True, methods=['get'], url_path='reports/bar-optimisation.pdf')
    def bar_pdf(self, request, pk=None):
        project = self.get_object()
        pdf = generate_bar_optimisation_pdf(project)
        resp = HttpResponse(pdf, content_type='application/pdf')
        resp['Content-Disposition'] = f'attachment; filename="BarOpt_{project.pk}.pdf"'
        return resp

    @action(detail=True, methods=['get'], url_path='reports/boq.xlsx')
    def boq_excel(self, request, pk=None):
        project = self.get_object()
        xl = generate_boq_excel(project)
        resp = HttpResponse(xl, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        resp['Content-Disposition'] = f'attachment; filename="BOQ_{project.pk}.xlsx"'
        return resp

    @action(detail=True, methods=['get'], url_path='reports/bar-optimisation.xlsx')
    def bar_excel(self, request, pk=None):
        project = self.get_object()
        xl = generate_bar_optimisation_excel(project)
        resp = HttpResponse(xl, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        resp['Content-Disposition'] = f'attachment; filename="BarOpt_{project.pk}.xlsx"'
        return resp


# ─── Window/Door Item ViewSet ─────────────────────────────────────────────────

class WindowDoorItemViewSet(viewsets.ModelViewSet):
    queryset = WindowDoorItem.objects.select_related('typology', 'glass_type', 'finish')

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return WindowDoorItemWriteSerializer
        return WindowDoorItemSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        project_pk = self.kwargs.get('project_pk')
        if project_pk:
            qs = qs.filter(project_id=project_pk)
        return qs

    def perform_create(self, serializer):
        project_pk = self.kwargs.get('project_pk')
        project = Project.objects.get(pk=project_pk)
        order = project.items.count()
        serializer.save(project=project, order=order)


# ─── Dashboard Stats API ─────────────────────────────────────────────────────

class DashboardStatsView(APIView):
    def get(self, request):
        projects = Project.objects.all()
        stats = {
            'total_projects': projects.count(),
            'draft_projects': projects.filter(status='draft').count(),
            'quoted_projects': projects.filter(status='quoted').count(),
            'confirmed_projects': projects.filter(status='confirmed').count(),
            'in_production': projects.filter(status='in_production').count(),
            'completed_projects': projects.filter(status='completed').count(),
            'total_items': WindowDoorItem.objects.aggregate(
                total=Sum('quantity')
            )['total'] or 0,
        }
        recent_projects = ProjectListSerializer(
            projects.order_by('-created_at')[:5], many=True
        ).data
        return Response({'stats': stats, 'recent_projects': recent_projects})

"""
Management command to populate the database with sample profiles,
typologies, hardware, glass types, and a demo project.

Usage: python manage.py seed_data
"""

from django.core.management.base import BaseCommand
from window_app.models import (
    ProfileType, Typology, CuttingRule, HardwareItem,
    HardwareRule, GlassType, FinishType, Project, WindowDoorItem
)


class Command(BaseCommand):
    """Seed the database with demo profiles, typologies, hardware and a sample project."""

    help = 'Seed database with demo data for D Sign Design window/door software'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # ── 1. Profiles ───────────────────────────────────────────────────────
        profiles_data = [
            # Sliding window system
            ('SW-Frame-H',   'Sliding Window Frame Horizontal', 'frame',    6000, 1.2, 180.0),
            ('SW-Frame-V',   'Sliding Window Frame Vertical',   'frame',    6000, 1.2, 180.0),
            ('SW-Sash-H',    'Sliding Window Sash Horizontal',  'sash',     6000, 0.9, 160.0),
            ('SW-Sash-V',    'Sliding Window Sash Vertical',    'sash',     6000, 0.9, 160.0),
            ('SW-Interlock', 'Sliding Window Interlock',        'mullion',  6000, 0.8, 150.0),
            ('SW-Track',     'Sliding Window Track',            'track',    6000, 0.7, 130.0),
            # Casement window system
            ('CW-Frame-H',   'Casement Window Frame Horizontal','frame',    6000, 1.3, 190.0),
            ('CW-Frame-V',   'Casement Window Frame Vertical',  'frame',    6000, 1.3, 190.0),
            ('CW-Sash-H',    'Casement Window Sash Horizontal', 'sash',     6000, 1.0, 170.0),
            ('CW-Sash-V',    'Casement Window Sash Vertical',   'sash',     6000, 1.0, 170.0),
            ('CW-Bead',      'Casement Glass Bead',             'bead',     6000, 0.3,  60.0),
            # Fixed window
            ('FW-Frame-H',   'Fixed Window Frame Horizontal',   'frame',    6000, 1.1, 170.0),
            ('FW-Frame-V',   'Fixed Window Frame Vertical',     'frame',    6000, 1.1, 170.0),
            ('FW-Bead',      'Fixed Window Glass Bead',         'bead',     6000, 0.3,  55.0),
            # Sliding door system
            ('SD-Frame-H',   'Sliding Door Frame Horizontal',   'frame',    6000, 1.8, 250.0),
            ('SD-Frame-V',   'Sliding Door Frame Vertical',     'frame',    6000, 1.8, 250.0),
            ('SD-Sash-H',    'Sliding Door Sash Horizontal',    'sash',     6000, 1.4, 220.0),
            ('SD-Sash-V',    'Sliding Door Sash Vertical',      'sash',     6000, 1.4, 220.0),
            ('SD-Track',     'Sliding Door Bottom Track',       'track',    6000, 1.0, 180.0),
            ('SD-Track-T',   'Sliding Door Top Track',          'track',    6000, 0.8, 160.0),
        ]

        profiles = {}
        for name, desc, cat, bar_len, wt, price in profiles_data:
            obj, _ = ProfileType.objects.get_or_create(
                name=name,
                defaults=dict(description=desc, category=cat, bar_length=bar_len,
                              weight_per_meter=wt, unit_price=price)
            )
            profiles[name] = obj
        self.stdout.write(f'  Created {len(profiles)} profiles')

        # ── 2. Glass Types ────────────────────────────────────────────────────
        glass_data = [
            ('5mm Clear Float', 5, 45.0),
            ('6mm Clear Float', 6, 55.0),
            ('5mm Tinted Bronze', 5, 60.0),
            ('5mm Tinted Grey', 5, 60.0),
            ('6mm Tinted Blue', 6, 65.0),
            ('5+5 Laminated Clear', 10, 130.0),
            ('6+6 Laminated Clear', 12, 155.0),
            ('5mm Reflective Silver', 5, 85.0),
            ('8mm Tempered Clear', 8, 120.0),
        ]
        for name, thick, price in glass_data:
            GlassType.objects.get_or_create(name=name, defaults={'thickness': thick, 'unit_price': price})
        self.stdout.write('  Created glass types')

        # ── 3. Finishes ───────────────────────────────────────────────────────
        finish_data = [
            ('Powder Coat White', 1.0),
            ('Powder Coat Black', 1.0),
            ('Powder Coat Ivory', 1.0),
            ('Anodised Silver', 1.15),
            ('Anodised Champagne', 1.15),
            ('Wood Finish Oak', 1.3),
            ('Wood Finish Walnut', 1.3),
            ('Mill Finish', 0.9),
        ]
        for name, mult in finish_data:
            FinishType.objects.get_or_create(name=name, defaults={'price_multiplier': mult})
        self.stdout.write('  Created finishes')

        # ── 4. Hardware ───────────────────────────────────────────────────────
        hardware_data = [
            ('HW-001', 'Sliding Window Handle (pair)', 'handle', 'set', 280.0),
            ('HW-002', 'Casement Window Handle', 'handle', 'nos', 180.0),
            ('HW-003', 'Casement Friction Stay Hinge', 'hinge', 'set', 450.0),
            ('HW-004', 'Sliding Window Roller (pair)', 'roller', 'set', 120.0),
            ('HW-005', 'Sliding Door Roller (pair)', 'roller', 'set', 350.0),
            ('HW-006', 'Sliding Door Handle (pair)', 'handle', 'set', 650.0),
            ('HW-007', 'Sliding Door Floor Guide', 'other', 'nos', 80.0),
            ('HW-008', 'Pile Weather Seal (per meter)', 'weatherseal', 'mtr', 15.0),
            ('HW-009', 'EPDM Rubber Seal (per meter)', 'weatherseal', 'mtr', 18.0),
            ('HW-010', 'Window Lock Cockspur', 'lock', 'nos', 95.0),
            ('HW-011', 'Sliding Door Lock', 'lock', 'nos', 350.0),
            ('HW-012', 'Mesh / Flyscreen Frame (per m2)', 'mesh_frame', 'sqm', 180.0),
            ('HW-013', 'Self-Tapping Screw Set', 'fastener', 'set', 25.0),
            ('HW-014', 'Casement Espagnolette Lock', 'lock', 'nos', 520.0),
        ]
        hardware = {}
        for code, name, cat, unit, price in hardware_data:
            obj, _ = HardwareItem.objects.get_or_create(
                code=code,
                defaults=dict(name=name, category=cat, unit=unit, unit_price=price)
            )
            hardware[code] = obj
        self.stdout.write(f'  Created {len(hardware)} hardware items')

        # ── 5. Typologies & Cutting Rules ─────────────────────────────────────

        # --- Fixed Window ---
        fixed, _ = Typology.objects.get_or_create(
            code='fixed',
            defaults={'display_name': 'Fixed Window', 'has_mesh_option': False, 'is_door': False}
        )
        rules_fixed = [
            # profile, direction, formula, qty, basis
            ('FW-Frame-H', 'horizontal', 'W',      2, 'fixed'),   # top + bottom
            ('FW-Frame-V', 'vertical',   'H',      2, 'fixed'),   # left + right
            ('FW-Bead',    'horizontal', 'W - 10', 2, 'fixed'),
            ('FW-Bead',    'vertical',   'H - 10', 2, 'fixed'),
        ]
        for pname, direction, formula, qty, basis in rules_fixed:
            CuttingRule.objects.get_or_create(
                typology=fixed, profile=profiles[pname], direction=direction, formula=formula,
                defaults={'quantity': qty, 'quantity_basis': basis}
            )

        # --- Sliding 2-track Window ---
        sliding2, _ = Typology.objects.get_or_create(
            code='sliding_2t',
            defaults={'display_name': 'Sliding Window (2-Track)', 'has_mesh_option': True, 'is_door': False}
        )
        rules_sliding2 = [
            ('SW-Frame-H',   'horizontal', 'W',          2, 'fixed'),
            ('SW-Frame-V',   'vertical',   'H',          2, 'fixed'),
            ('SW-Track',     'horizontal', 'W - 6',      2, 'fixed'),
            ('SW-Sash-H',    'horizontal', 'W / 2 - 15', 2, 'fixed'),
            ('SW-Sash-V',    'vertical',   'H - 84',     2, 'fixed'),
            ('SW-Interlock', 'vertical',   'H - 84',     2, 'fixed'),
        ]
        for pname, direction, formula, qty, basis in rules_sliding2:
            CuttingRule.objects.get_or_create(
                typology=sliding2, profile=profiles[pname], direction=direction, formula=formula,
                defaults={'quantity': qty, 'quantity_basis': basis}
            )

        # --- Casement Single Leaf Window ---
        casement1, _ = Typology.objects.get_or_create(
            code='casement_1l',
            defaults={'display_name': 'Casement Window (Single Leaf)', 'has_mesh_option': True, 'is_door': False}
        )
        rules_cas1 = [
            ('CW-Frame-H', 'horizontal', 'W',          2, 'fixed'),
            ('CW-Frame-V', 'vertical',   'H',          2, 'fixed'),
            ('CW-Sash-H',  'horizontal', 'W - 56',     2, 'fixed'),
            ('CW-Sash-V',  'vertical',   'H - 56',     2, 'fixed'),
            ('CW-Bead',    'horizontal', 'W - 90',     2, 'fixed'),
            ('CW-Bead',    'vertical',   'H - 90',     2, 'fixed'),
        ]
        for pname, direction, formula, qty, basis in rules_cas1:
            CuttingRule.objects.get_or_create(
                typology=casement1, profile=profiles[pname], direction=direction, formula=formula,
                defaults={'quantity': qty, 'quantity_basis': basis}
            )

        # --- Sliding Door 2-Track ---
        sd2, _ = Typology.objects.get_or_create(
            code='sliding_door_2t',
            defaults={'display_name': 'Sliding Door (2-Track)', 'has_mesh_option': True, 'is_door': True}
        )
        rules_sd2 = [
            ('SD-Frame-H',  'horizontal', 'W',          2, 'fixed'),
            ('SD-Frame-V',  'vertical',   'H',          2, 'fixed'),
            ('SD-Track',    'horizontal', 'W - 10',     1, 'fixed'),
            ('SD-Track-T',  'horizontal', 'W - 10',     1, 'fixed'),
            ('SD-Sash-H',   'horizontal', 'W / 2 - 20', 2, 'fixed'),
            ('SD-Sash-V',   'vertical',   'H - 110',    2, 'fixed'),
        ]
        for pname, direction, formula, qty, basis in rules_sd2:
            CuttingRule.objects.get_or_create(
                typology=sd2, profile=profiles[pname], direction=direction, formula=formula,
                defaults={'quantity': qty, 'quantity_basis': basis}
            )

        self.stdout.write('  Created typologies & cutting rules')

        # ── 6. Hardware Rules ─────────────────────────────────────────────────
        hw_rules = [
            # (typology, hw_code, qty_formula, mesh_only)
            (fixed,     'HW-009', '2*W/1000 + 2*H/1000', False),
            (fixed,     'HW-013', '1',                   False),
            (sliding2,  'HW-001', '1',                   False),
            (sliding2,  'HW-004', '2',                   False),
            (sliding2,  'HW-008', '2*W/1000 + 2*H/1000', False),
            (sliding2,  'HW-010', '1',                   False),
            (sliding2,  'HW-012', 'W/1000 * H/1000',     True),
            (sliding2,  'HW-013', '1',                   False),
            (casement1, 'HW-002', '1',                   False),
            (casement1, 'HW-003', '2',                   False),
            (casement1, 'HW-009', '2*W/1000 + 2*H/1000', False),
            (casement1, 'HW-014', '1',                   False),
            (casement1, 'HW-013', '1',                   False),
            (sd2,       'HW-005', '2',                   False),
            (sd2,       'HW-006', '1',                   False),
            (sd2,       'HW-007', '2',                   False),
            (sd2,       'HW-008', '2*W/1000 + 2*H/1000', False),
            (sd2,       'HW-011', '1',                   False),
            (sd2,       'HW-012', 'W/1000 * H/1000',     True),
            (sd2,       'HW-013', '1',                   False),
        ]

        for typology, hw_code, formula, mesh_only in hw_rules:
            HardwareRule.objects.get_or_create(
                typology=typology,
                hardware=hardware[hw_code],
                defaults={'quantity_formula': formula, 'mesh_only': mesh_only}
            )
        self.stdout.write('  Created hardware rules')

        # ── 7. Demo Project ───────────────────────────────────────────────────
        if not Project.objects.filter(project_name='Demo - Sharma Residence').exists():
            project = Project.objects.create(
                project_name='Demo - Sharma Residence',
                customer_name='Mr. Rajesh Sharma',
                customer_address='A-12, Green Park, New Delhi - 110016',
                customer_phone='+91 98765 43210',
                customer_email='rajesh.sharma@email.com',
                site_address='A-12, Green Park, New Delhi',
                discount_percent=5.0,
                gst_percent=18.0,
                notes='Demo project. Sliding windows + sliding door.',
            )

            glass = GlassType.objects.get(name='5mm Clear Float')
            finish = FinishType.objects.get(name='Powder Coat White')

            items = [
                ('W1', 1200, 1050, sliding2,  glass, finish, True,  2, 'Living Room'),
                ('W2', 900,  1050, sliding2,  glass, finish, True,  3, 'Bedrooms'),
                ('W3', 600,  900,  fixed,     glass, finish, False, 2, 'Bathroom'),
                ('D1', 1800, 2100, sd2,       glass, finish, False, 1, 'Balcony Sliding Door'),
                ('D2', 2400, 2100, sd2,       glass, finish, True,  1, 'Living Room Sliding Door'),
            ]

            for code, w, h, typ, gl, fin, mesh, qty, notes in items:
                WindowDoorItem.objects.create(
                    project=project, code=code, width=w, height=h,
                    typology=typ, glass_type=gl, finish=fin,
                    has_mesh=mesh, quantity=qty, notes=notes
                )

            self.stdout.write(f'  Created demo project "{project.project_name}" with {len(items)} items')

        self.stdout.write(self.style.SUCCESS('\n✓ Database seeded successfully!'))
        self.stdout.write('  → Run: python manage.py runserver')
        self.stdout.write('  → Visit: http://127.0.0.1:8000')
        self.stdout.write('  → Admin: http://127.0.0.1:8000/admin  (use superuser)')

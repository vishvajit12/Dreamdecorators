"""
Models for Window & Door Fabrication Software.

Defines database tables for:
- Profile types and cutting rules
- Hardware components
- Glass types and finishes
- Window/Door projects and items
- Quotation data
"""

from django.db import models
from django.contrib.auth.models import User


class ProfileType(models.Model):
    """
    Represents an aluminium/UPVC profile section used in window/door fabrication.
    Each profile has a standard bar length and weight per meter.
    """
    PROFILE_CATEGORY_CHOICES = [
        ('frame', 'Frame'),
        ('sash', 'Sash'),
        ('bead', 'Bead'),
        ('transom', 'Transom'),
        ('mullion', 'Mullion'),
        ('track', 'Track'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=100, unique=True, help_text="Profile name/code e.g. A001-Frame")
    description = models.TextField(blank=True, help_text="Detailed description of the profile")
    category = models.CharField(max_length=20, choices=PROFILE_CATEGORY_CHOICES, default='frame')
    bar_length = models.FloatField(default=6000.0, help_text="Standard bar length in mm")
    weight_per_meter = models.FloatField(default=1.0, help_text="Weight in kg per meter")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0,
                                     help_text="Price per meter in INR")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class Typology(models.Model):
    """
    Defines the window/door typology (configuration type).
    e.g. Fixed, Sliding 2-track, Casement, Tilt-Turn, etc.
    Each typology has cutting rules that dictate how profiles are cut.
    """
    TYPOLOGY_CHOICES = [
        ('fixed', 'Fixed Window'),
        ('sliding_2t', 'Sliding 2-Track'),
        ('sliding_3t', 'Sliding 3-Track'),
        ('casement_1l', 'Casement Single Leaf'),
        ('casement_2l', 'Casement Double Leaf'),
        ('tilt_turn', 'Tilt & Turn'),
        ('sliding_door_2t', 'Sliding Door 2-Track'),
        ('sliding_door_3t', 'Sliding Door 3-Track'),
        ('french_door', 'French Door'),
        ('folding_door', 'Folding Door'),
    ]

    code = models.CharField(max_length=30, unique=True, choices=TYPOLOGY_CHOICES)
    display_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    has_mesh_option = models.BooleanField(default=True, help_text="Whether mesh/flyscreen is applicable")
    is_door = models.BooleanField(default=False)
    image = models.ImageField(upload_to='typologies/', blank=True, null=True)

    class Meta:
        ordering = ['display_name']
        verbose_name_plural = "Typologies"

    def __str__(self):
        return self.display_name


class CuttingRule(models.Model):
    """
    Defines cutting rules for each profile within a specific typology.
    The formula fields describe how to calculate cut length from width (W) and height (H).
    
    Formula syntax: Python expression using W and H variables.
    Example: "W - 10" means cut length = width minus 10mm
    Example: "H - 84" means cut length = height minus 84mm
    """
    DIRECTION_CHOICES = [
        ('horizontal', 'Horizontal (Width-based)'),
        ('vertical', 'Vertical (Height-based)'),
    ]
    QUANTITY_BASIS_CHOICES = [
        ('fixed', 'Fixed count'),
        ('per_leaf', 'Per Leaf'),
        ('per_track', 'Per Track'),
    ]

    typology = models.ForeignKey(Typology, on_delete=models.CASCADE, related_name='cutting_rules')
    profile = models.ForeignKey(ProfileType, on_delete=models.CASCADE)
    direction = models.CharField(max_length=20, choices=DIRECTION_CHOICES)
    formula = models.CharField(max_length=200,
                               help_text="Python expression: use W for width, H for height. E.g. 'W - 10'")
    quantity = models.IntegerField(default=1, help_text="Number of pieces to cut")
    quantity_basis = models.CharField(max_length=20, choices=QUANTITY_BASIS_CHOICES, default='fixed')
    notes = models.CharField(max_length=200, blank=True, help_text="Notes for this cutting rule")

    class Meta:
        ordering = ['typology', 'profile', 'direction']

    def __str__(self):
        return f"{self.typology} | {self.profile.name} | {self.direction} | {self.formula} x{self.quantity}"

    def calculate_length(self, width_mm: float, height_mm: float, num_leaves: int = 1,
                         num_tracks: int = 2) -> float:
        """
        Evaluate the formula string to get the cut length in mm.
        
        Args:
            width_mm: Overall width of the window/door in mm
            height_mm: Overall height of the window/door in mm
            num_leaves: Number of sash/leaf panels
            num_tracks: Number of sliding tracks

        Returns:
            float: Calculated cut length in mm
        """
        W = width_mm   # noqa: N806 – intentional single-letter vars for formula eval
        H = height_mm  # noqa: N806
        try:
            return float(eval(self.formula, {"__builtins__": {}}, {"W": W, "H": H}))
        except Exception:
            return 0.0

    def get_quantity(self, num_leaves: int = 1, num_tracks: int = 2) -> int:
        """Return actual quantity considering leaves and tracks."""
        if self.quantity_basis == 'per_leaf':
            return self.quantity * num_leaves
        if self.quantity_basis == 'per_track':
            return self.quantity * num_tracks
        return self.quantity


class HardwareItem(models.Model):
    """
    Hardware component used in window/door fabrication.
    e.g. handles, locks, hinges, rollers, weather seals, etc.
    """
    HARDWARE_CATEGORY_CHOICES = [
        ('handle', 'Handle'),
        ('lock', 'Lock / Latch'),
        ('hinge', 'Hinge'),
        ('roller', 'Roller'),
        ('weatherseal', 'Weather Seal'),
        ('mesh_frame', 'Mesh Frame'),
        ('glass_bead', 'Glass Bead Clip'),
        ('fastener', 'Fastener / Screw'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=150)
    code = models.CharField(max_length=50, unique=True)
    category = models.CharField(max_length=30, choices=HARDWARE_CATEGORY_CHOICES, default='other')
    unit = models.CharField(max_length=20, default='nos', help_text="Unit: nos, meters, set, etc.")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0,
                                     help_text="Price per unit in INR")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.code} - {self.name}"


class HardwareRule(models.Model):
    """
    Defines which hardware items are needed for a given typology,
    with optional mesh-specific hardware.
    
    Quantity formula can use W and H for dimension-based quantities.
    e.g. for weather seal: "(2*W + 2*H) / 1000" gives meters required.
    """
    typology = models.ForeignKey(Typology, on_delete=models.CASCADE, related_name='hardware_rules')
    hardware = models.ForeignKey(HardwareItem, on_delete=models.CASCADE)
    quantity_formula = models.CharField(max_length=200, default='1',
                                        help_text="Formula using W, H or fixed number")
    mesh_only = models.BooleanField(default=False, help_text="Only apply this rule if mesh is selected")
    notes = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.typology} | {self.hardware.name} | qty={self.quantity_formula}"

    def calculate_quantity(self, width_mm: float, height_mm: float) -> float:
        """Evaluate quantity formula."""
        W = width_mm   # noqa: N806
        H = height_mm  # noqa: N806
        try:
            return float(eval(self.quantity_formula, {"__builtins__": {}}, {"W": W, "H": H}))
        except Exception:
            return 0.0


class GlassType(models.Model):
    """Glass specification options for windows/doors."""
    name = models.CharField(max_length=100, unique=True,
                            help_text="e.g. 5mm Clear, 6mm Tinted, 5+5 Laminated")
    thickness = models.FloatField(help_text="Total thickness in mm")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.0,
                                     help_text="Price per sq.ft in INR")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['thickness', 'name']

    def __str__(self):
        return self.name


class FinishType(models.Model):
    """Finish/colour options for aluminium profiles."""
    name = models.CharField(max_length=100, unique=True,
                            help_text="e.g. Powder Coat White, Anodised Silver, Wood Finish")
    price_multiplier = models.FloatField(default=1.0,
                                         help_text="Multiplier applied to base profile cost")
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


# ─── Project & Window/Door Items ────────────────────────────────────────────

class Project(models.Model):
    """
    A customer project / quotation container.
    Groups multiple window/door items under one project for reporting.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('quoted', 'Quoted'),
        ('confirmed', 'Confirmed'),
        ('in_production', 'In Production'),
        ('completed', 'Completed'),
    ]

    project_name = models.CharField(max_length=200)
    customer_name = models.CharField(max_length=200)
    customer_address = models.TextField(blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)
    customer_email = models.EmailField(blank=True)
    site_address = models.TextField(blank=True)
    project_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    notes = models.TextField(blank=True)
    discount_percent = models.FloatField(default=0.0, help_text="Overall project discount %")
    gst_percent = models.FloatField(default=18.0, help_text="GST percentage")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.project_name} - {self.customer_name}"

    def get_total_items(self):
        """Count total number of window/door units in this project."""
        return sum(item.quantity for item in self.items.all())


class WindowDoorItem(models.Model):
    """
    Individual window or door entry within a project.
    Stores all input parameters and links to typology/glass/finish for calculation.
    """
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='items')
    code = models.CharField(max_length=50, help_text="User-defined window/door code e.g. W1, D2")
    width = models.FloatField(help_text="Overall width in mm")
    height = models.FloatField(help_text="Overall height in mm")
    typology = models.ForeignKey(Typology, on_delete=models.PROTECT)
    glass_type = models.ForeignKey(GlassType, on_delete=models.PROTECT)
    finish = models.ForeignKey(FinishType, on_delete=models.PROTECT)
    has_mesh = models.BooleanField(default=False, help_text="Include flyscreen/mesh")
    quantity = models.IntegerField(default=1, help_text="Number of identical units")
    notes = models.CharField(max_length=300, blank=True)
    order = models.IntegerField(default=0, help_text="Display order in reports")

    class Meta:
        ordering = ['order', 'code']
        unique_together = [['project', 'code']]

    def __str__(self):
        return f"{self.code} | {self.typology} | {self.width}x{self.height}mm"

    def get_glass_area_sqft(self) -> float:
        """Calculate glass area in sq.ft (standard billing unit in India)."""
        # Small deductions for frame overlap (approx 40mm each side)
        glass_w = (self.width - 80) / 304.8   # convert mm to ft
        glass_h = (self.height - 80) / 304.8
        return round(max(glass_w * glass_h, 0), 3)

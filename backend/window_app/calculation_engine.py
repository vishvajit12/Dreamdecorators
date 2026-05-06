"""
calculation_engine.py
─────────────────────
Core business logic for the Window & Door Fabrication Software.

Responsibilities:
1. BOQ (Bill of Quantities) generation  - profiles & hardware per item
2. Bar optimisation                      - minimise material waste using First-Fit Decreasing
3. Glass sizing                          - area and cost calculations
4. Quotation totalling                   - material + labour + glass + hardware + GST

All functions are pure (no DB writes) and accept model instances or plain dicts.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Dict, Tuple
import math


# ─── Data Transfer Objects ───────────────────────────────────────────────────

@dataclass
class CutPiece:
    """A single profile piece to be cut."""
    profile_name: str
    profile_id: int
    length_mm: float
    quantity: int
    source_code: str     # Window/Door code this piece belongs to
    direction: str       # horizontal / vertical
    bar_length: float    # standard bar length for this profile


@dataclass
class BarAllocation:
    """Represents a single bar with its cut pieces assigned to it."""
    bar_number: int
    profile_name: str
    bar_length: float
    cuts: List[Tuple[str, float]] = field(default_factory=list)   # (label, length)
    waste_mm: float = 0.0
    kerf_mm: float = 3.0   # saw blade kerf per cut

    @property
    def used_mm(self) -> float:
        """Total used length including kerf losses."""
        return sum(length for _, length in self.cuts) + len(self.cuts) * self.kerf_mm

    @property
    def remaining_mm(self) -> float:
        return self.bar_length - self.used_mm

    def can_fit(self, length_mm: float) -> bool:
        return self.remaining_mm >= (length_mm + self.kerf_mm)

    def add_cut(self, label: str, length_mm: float):
        self.cuts.append((label, length_mm))
        self.waste_mm = self.remaining_mm


@dataclass
class BOQLine:
    """Single line in a Bill of Quantities."""
    item_code: str
    description: str
    profile_id: int | None
    hardware_id: int | None
    category: str          # 'profile' | 'hardware' | 'glass'
    cut_length_mm: float
    quantity: int
    total_length_mm: float
    unit_price: float
    total_price: float
    notes: str = ''


@dataclass
class BarOptimisationResult:
    """Full optimisation output for one profile type."""
    profile_name: str
    profile_id: int
    bar_length: float
    bars: List[BarAllocation]
    total_bars: int
    total_cut_length_mm: float
    total_used_mm: float
    total_waste_mm: float
    efficiency_percent: float


@dataclass
class QuotationSummary:
    """Final quotation totals."""
    project_id: int
    project_name: str
    customer_name: str
    subtotal_profiles: float
    subtotal_hardware: float
    subtotal_glass: float
    subtotal_labour: float
    subtotal_before_discount: float
    discount_amount: float
    subtotal_after_discount: float
    gst_amount: float
    grand_total: float
    gst_percent: float
    discount_percent: float


# ─── BOQ Generator ───────────────────────────────────────────────────────────

def generate_boq(project) -> Tuple[List[BOQLine], List[BOQLine], List[BOQLine]]:
    """
    Generate complete BOQ for a project.

    Args:
        project: Project model instance (with prefetched items and rules)

    Returns:
        Tuple of (profile_lines, hardware_lines, glass_lines)
    """
    from window_app.models import CuttingRule, HardwareRule

    profile_lines: List[BOQLine] = []
    hardware_lines: List[BOQLine] = []
    glass_lines: List[BOQLine] = []

    for item in project.items.select_related('typology', 'glass_type', 'finish').all():
        W = item.width
        H = item.height
        qty = item.quantity

        # ── Profile cuts ──────────────────────────────────────────────────
        cutting_rules = CuttingRule.objects.filter(
            typology=item.typology
        ).select_related('profile')

        for rule in cutting_rules:
            cut_len = rule.calculate_length(W, H)
            pieces = rule.get_quantity()
            total_len = cut_len * pieces * qty
            line_price = float(rule.profile.unit_price) * (total_len / 1000.0)

            profile_lines.append(BOQLine(
                item_code=item.code,
                description=f"{rule.profile.name} ({rule.direction})",
                profile_id=rule.profile.id,
                hardware_id=None,
                category='profile',
                cut_length_mm=round(cut_len, 1),
                quantity=pieces * qty,
                total_length_mm=round(total_len, 1),
                unit_price=float(rule.profile.unit_price),
                total_price=round(line_price, 2),
                notes=rule.notes,
            ))

        # ── Hardware ──────────────────────────────────────────────────────
        hardware_rules = HardwareRule.objects.filter(
            typology=item.typology
        ).select_related('hardware')

        for rule in hardware_rules:
            # Skip mesh hardware if mesh not selected
            if rule.mesh_only and not item.has_mesh:
                continue

            hw_qty = math.ceil(rule.calculate_quantity(W, H)) * qty
            line_price = float(rule.hardware.unit_price) * hw_qty

            hardware_lines.append(BOQLine(
                item_code=item.code,
                description=rule.hardware.name,
                profile_id=None,
                hardware_id=rule.hardware.id,
                category='hardware',
                cut_length_mm=0,
                quantity=hw_qty,
                total_length_mm=0,
                unit_price=float(rule.hardware.unit_price),
                total_price=round(line_price, 2),
                notes=rule.notes,
            ))

        # ── Glass ─────────────────────────────────────────────────────────
        glass_area_sqft = item.get_glass_area_sqft() * qty
        glass_price = float(item.glass_type.unit_price) * glass_area_sqft

        glass_lines.append(BOQLine(
            item_code=item.code,
            description=f"{item.glass_type.name} | {item.finish.name}",
            profile_id=None,
            hardware_id=None,
            category='glass',
            cut_length_mm=0,
            quantity=qty,
            total_length_mm=glass_area_sqft,   # repurpose field for area
            unit_price=float(item.glass_type.unit_price),
            total_price=round(glass_price, 2),
            notes='',
        ))

    return profile_lines, hardware_lines, glass_lines


# ─── Bar Optimiser ───────────────────────────────────────────────────────────

def optimise_bars(project, kerf_mm: float = 3.0) -> List[BarOptimisationResult]:
    """
    Run First-Fit Decreasing (FFD) bin-packing algorithm on all profile cuts
    in a project to minimise the number of bars required.

    Algorithm:
    1. Collect all cut pieces grouped by profile type.
    2. Sort pieces descending by length (FFD heuristic).
    3. For each piece, find the first bar it fits in; otherwise open a new bar.
    4. Compute waste and efficiency.

    Args:
        project: Project model instance
        kerf_mm: Saw blade kerf loss per cut in mm (default 3mm)

    Returns:
        List of BarOptimisationResult, one per profile type used.
    """
    from window_app.models import CuttingRule

    # Step 1: Collect all individual cut pieces
    all_pieces: List[CutPiece] = []

    for item in project.items.select_related('typology').all():
        rules = CuttingRule.objects.filter(
            typology=item.typology
        ).select_related('profile')

        for rule in rules:
            cut_len = rule.calculate_length(item.width, item.height)
            total_qty = rule.get_quantity() * item.quantity

            for _ in range(total_qty):
                all_pieces.append(CutPiece(
                    profile_name=rule.profile.name,
                    profile_id=rule.profile.id,
                    length_mm=cut_len,
                    quantity=1,
                    source_code=item.code,
                    direction=rule.direction,
                    bar_length=rule.profile.bar_length,
                ))

    # Step 2: Group by profile type
    from itertools import groupby
    profile_groups: Dict[int, List[CutPiece]] = {}
    for piece in all_pieces:
        profile_groups.setdefault(piece.profile_id, []).append(piece)

    results: List[BarOptimisationResult] = []

    for profile_id, pieces in profile_groups.items():
        if not pieces:
            continue

        bar_length = pieces[0].bar_length
        profile_name = pieces[0].profile_name

        # Step 3: Sort descending (FFD)
        sorted_pieces = sorted(pieces, key=lambda p: p.length_mm, reverse=True)

        bars: List[BarAllocation] = []

        for piece in sorted_pieces:
            placed = False
            for bar in bars:
                if bar.can_fit(piece.length_mm):
                    bar.add_cut(
                        f"{piece.source_code} ({piece.direction[:1].upper()})",
                        piece.length_mm
                    )
                    placed = True
                    break
            if not placed:
                new_bar = BarAllocation(
                    bar_number=len(bars) + 1,
                    profile_name=profile_name,
                    bar_length=bar_length,
                    kerf_mm=kerf_mm,
                )
                new_bar.add_cut(
                    f"{piece.source_code} ({piece.direction[:1].upper()})",
                    piece.length_mm
                )
                bars.append(new_bar)

        total_cut = sum(p.length_mm for p in pieces)
        total_used = sum(b.used_mm for b in bars)
        total_bar_length = len(bars) * bar_length
        total_waste = total_bar_length - total_cut
        efficiency = (total_cut / total_bar_length * 100) if total_bar_length > 0 else 0

        results.append(BarOptimisationResult(
            profile_name=profile_name,
            profile_id=profile_id,
            bar_length=bar_length,
            bars=bars,
            total_bars=len(bars),
            total_cut_length_mm=round(total_cut, 1),
            total_used_mm=round(total_used, 1),
            total_waste_mm=round(total_waste, 1),
            efficiency_percent=round(efficiency, 1),
        ))

    return sorted(results, key=lambda r: r.profile_name)


# ─── Quotation Builder ────────────────────────────────────────────────────────

def build_quotation_summary(project, labour_rate_per_sqft: float = 150.0) -> QuotationSummary:
    """
    Compute final quotation with all cost components.

    Args:
        project: Project model instance
        labour_rate_per_sqft: Labour charge per sq.ft of window area (INR)

    Returns:
        QuotationSummary dataclass
    """
    profile_lines, hardware_lines, glass_lines = generate_boq(project)

    subtotal_profiles = sum(l.total_price for l in profile_lines)
    subtotal_hardware = sum(l.total_price for l in hardware_lines)
    subtotal_glass = sum(l.total_price for l in glass_lines)

    # Labour: based on total glazed area
    total_sqft = sum(l.total_length_mm for l in glass_lines)   # area stored in total_length_mm
    subtotal_labour = round(total_sqft * labour_rate_per_sqft, 2)

    subtotal_before_discount = subtotal_profiles + subtotal_hardware + subtotal_glass + subtotal_labour
    discount_amount = round(subtotal_before_discount * project.discount_percent / 100, 2)
    subtotal_after_discount = subtotal_before_discount - discount_amount
    gst_amount = round(subtotal_after_discount * project.gst_percent / 100, 2)
    grand_total = round(subtotal_after_discount + gst_amount, 2)

    return QuotationSummary(
        project_id=project.id,
        project_name=project.project_name,
        customer_name=project.customer_name,
        subtotal_profiles=round(subtotal_profiles, 2),
        subtotal_hardware=round(subtotal_hardware, 2),
        subtotal_glass=round(subtotal_glass, 2),
        subtotal_labour=round(subtotal_labour, 2),
        subtotal_before_discount=round(subtotal_before_discount, 2),
        discount_amount=discount_amount,
        subtotal_after_discount=round(subtotal_after_discount, 2),
        gst_amount=gst_amount,
        grand_total=grand_total,
        gst_percent=project.gst_percent,
        discount_percent=project.discount_percent,
    )

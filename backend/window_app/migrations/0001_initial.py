# Generated migration for window_app models

from django.conf import settings
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ProfileType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Profile name/code e.g. A001-Frame', max_length=100, unique=True)),
                ('description', models.TextField(blank=True)),
                ('category', models.CharField(choices=[('frame','Frame'),('sash','Sash'),('bead','Bead'),('transom','Transom'),('mullion','Mullion'),('track','Track'),('other','Other')], default='frame', max_length=20)),
                ('bar_length', models.FloatField(default=6000.0)),
                ('weight_per_meter', models.FloatField(default=1.0)),
                ('unit_price', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={'ordering': ['category', 'name']},
        ),
        migrations.CreateModel(
            name='Typology',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(choices=[('fixed','Fixed Window'),('sliding_2t','Sliding 2-Track'),('sliding_3t','Sliding 3-Track'),('casement_1l','Casement Single Leaf'),('casement_2l','Casement Double Leaf'),('tilt_turn','Tilt & Turn'),('sliding_door_2t','Sliding Door 2-Track'),('sliding_door_3t','Sliding Door 3-Track'),('french_door','French Door'),('folding_door','Folding Door')], max_length=30, unique=True)),
                ('display_name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('has_mesh_option', models.BooleanField(default=True)),
                ('is_door', models.BooleanField(default=False)),
                ('image', models.ImageField(blank=True, null=True, upload_to='typologies/')),
            ],
            options={'ordering': ['display_name'], 'verbose_name_plural': 'Typologies'},
        ),
        migrations.CreateModel(
            name='GlassType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('thickness', models.FloatField()),
                ('unit_price', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('description', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={'ordering': ['thickness', 'name']},
        ),
        migrations.CreateModel(
            name='FinishType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('price_multiplier', models.FloatField(default=1.0)),
                ('description', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='HardwareItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150)),
                ('code', models.CharField(max_length=50, unique=True)),
                ('category', models.CharField(choices=[('handle','Handle'),('lock','Lock / Latch'),('hinge','Hinge'),('roller','Roller'),('weatherseal','Weather Seal'),('mesh_frame','Mesh Frame'),('glass_bead','Glass Bead Clip'),('fastener','Fastener / Screw'),('other','Other')], default='other', max_length=30)),
                ('unit', models.CharField(default='nos', max_length=20)),
                ('unit_price', models.DecimalField(decimal_places=2, default=0.0, max_digits=10)),
                ('description', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={'ordering': ['category', 'name']},
        ),
        migrations.CreateModel(
            name='CuttingRule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('direction', models.CharField(choices=[('horizontal','Horizontal (Width-based)'),('vertical','Vertical (Height-based)')], max_length=20)),
                ('formula', models.CharField(help_text="Python expression: use W for width, H for height. E.g. 'W - 10'", max_length=200)),
                ('quantity', models.IntegerField(default=1)),
                ('quantity_basis', models.CharField(choices=[('fixed','Fixed count'),('per_leaf','Per Leaf'),('per_track','Per Track')], default='fixed', max_length=20)),
                ('notes', models.CharField(blank=True, max_length=200)),
                ('typology', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cutting_rules', to='window_app.typology')),
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='window_app.profiletype')),
            ],
            options={'ordering': ['typology', 'profile', 'direction']},
        ),
        migrations.CreateModel(
            name='HardwareRule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity_formula', models.CharField(default='1', max_length=200)),
                ('mesh_only', models.BooleanField(default=False)),
                ('notes', models.CharField(blank=True, max_length=200)),
                ('typology', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='hardware_rules', to='window_app.typology')),
                ('hardware', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='window_app.hardwareitem')),
            ],
        ),
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('project_name', models.CharField(max_length=200)),
                ('customer_name', models.CharField(max_length=200)),
                ('customer_address', models.TextField(blank=True)),
                ('customer_phone', models.CharField(blank=True, max_length=20)),
                ('customer_email', models.EmailField(blank=True)),
                ('site_address', models.TextField(blank=True)),
                ('project_date', models.DateField(auto_now_add=True)),
                ('status', models.CharField(choices=[('draft','Draft'),('quoted','Quoted'),('confirmed','Confirmed'),('in_production','In Production'),('completed','Completed')], default='draft', max_length=20)),
                ('notes', models.TextField(blank=True)),
                ('discount_percent', models.FloatField(default=0.0)),
                ('gst_percent', models.FloatField(default=18.0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='WindowDoorItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(help_text='User-defined window/door code e.g. W1, D2', max_length=50)),
                ('width', models.FloatField()),
                ('height', models.FloatField()),
                ('has_mesh', models.BooleanField(default=False)),
                ('quantity', models.IntegerField(default=1)),
                ('notes', models.CharField(blank=True, max_length=300)),
                ('order', models.IntegerField(default=0)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='window_app.project')),
                ('typology', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='window_app.typology')),
                ('glass_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='window_app.glasstype')),
                ('finish', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='window_app.finishtype')),
            ],
            options={'ordering': ['order', 'code'], 'unique_together': {('project', 'code')}},
        ),
    ]

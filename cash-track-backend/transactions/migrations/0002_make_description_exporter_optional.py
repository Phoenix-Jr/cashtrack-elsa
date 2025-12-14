# Generated migration to make description and exporter_fournisseur optional

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='description',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
        migrations.AlterField(
            model_name='transaction',
            name='exporter_fournisseur',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]


# Generated migration to allow null file in Report model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0004_remove_date_field'),
    ]

    operations = [
        migrations.AlterField(
            model_name='report',
            name='file',
            field=models.FileField(blank=True, null=True, upload_to='reports/%Y/%m/%d/'),
        ),
    ]


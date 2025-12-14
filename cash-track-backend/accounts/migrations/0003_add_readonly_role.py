# Generated manually to add readonly role

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_alter_user_role"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.CharField(
                choices=[
                    ("admin", "Administrateur"),
                    ("user", "Utilisateur"),
                    ("readonly", "Lecture seule"),
                ],
                default="user",
                max_length=20,
            ),
        ),
    ]


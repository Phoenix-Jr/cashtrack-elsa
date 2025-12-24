# Generated manually
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_alter_user_options_remove_user_deleted_at'),
        ('transactions', '0007_remove_report_models'),
    ]

    operations = [
        migrations.CreateModel(
            name='TransactionHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_id', models.IntegerField(help_text='ID of the transaction (may not exist if deleted)')),
                ('action', models.CharField(choices=[('created', 'Créé'), ('updated', 'Modifié'), ('deleted', 'Supprimé')], max_length=20)),
                ('transaction_data', models.JSONField(blank=True, help_text='Full transaction data at the time of action (especially for deletions)', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('changes', models.JSONField(blank=True, help_text='For updates: stores what fields were changed (old_value -> new_value)', null=True)),
                ('performed_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='transaction_history_actions', to='accounts.user')),
            ],
            options={
                'verbose_name': 'Historique de transaction',
                'verbose_name_plural': 'Historique des transactions',
                'db_table': 'transaction_history',
                'ordering': ['-created_at'],
            },
        ),
    ]


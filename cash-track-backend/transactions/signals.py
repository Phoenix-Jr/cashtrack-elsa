from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from django.db import transaction as db_transaction
from .models import Transaction, TransactionHistory


@receiver(post_save, sender=Transaction)
def create_transaction_history(sender, instance, created, **kwargs):
    """Create history entry when a transaction is created or updated"""
    # Get the user from the request if available
    # We'll need to pass it through the view
    user = getattr(instance, '_history_user', None)
    
    # Use db_transaction.atomic to ensure data consistency
    with db_transaction.atomic():
        if created:
            # Transaction was created
            TransactionHistory.objects.create(
                transaction_id=instance.id,
                action="created",
                transaction_data={
                    "type": instance.type,
                    "description": instance.description,
                    "amount": str(instance.amount),
                    "ref": instance.ref,
                    "exporter_fournisseur": instance.exporter_fournisseur,
                    "category_id": instance.category_id,
                    "category_name": instance.category.name if instance.category else None,
                },
                performed_by=user or instance.created_by,
            )
        else:
            # Transaction was updated
            # Get the old values from the instance's _old_values if available
            old_values = getattr(instance, '_old_values', {})
            changes = {}
            
            # Track what changed
            for field in ['type', 'description', 'amount', 'ref', 'exporter_fournisseur']:
                old_val = old_values.get(field)
                new_val = getattr(instance, field)
                if old_val != new_val:
                    changes[field] = {
                        "old": str(old_val) if old_val is not None else None,
                        "new": str(new_val) if new_val is not None else None,
                    }
            
            # Track category changes
            old_category_id = old_values.get('category_id')
            if old_category_id != instance.category_id:
                old_category = None
                if old_category_id:
                    try:
                        from categories.models import Category
                        old_category = Category.objects.get(id=old_category_id)
                    except:
                        pass
                
                changes['category'] = {
                    "old": old_category.name if old_category else None,
                    "new": instance.category.name if instance.category else None,
                }
            
            if changes:  # Only create history if something actually changed
                TransactionHistory.objects.create(
                    transaction_id=instance.id,
                    action="updated",
                    transaction_data={
                        "type": instance.type,
                        "description": instance.description,
                        "amount": str(instance.amount),
                        "ref": instance.ref,
                        "exporter_fournisseur": instance.exporter_fournisseur,
                        "category_id": instance.category_id,
                        "category_name": instance.category.name if instance.category else None,
                    },
                    performed_by=user or instance.modified_by,
                    changes=changes,
                )


@receiver(pre_delete, sender=Transaction)
def delete_transaction_history(sender, instance, **kwargs):
    """Create history entry when a transaction is deleted"""
    user = getattr(instance, '_history_user', None)
    
    # Store full transaction data before deletion
    # Use db_transaction.atomic to ensure data consistency
    with db_transaction.atomic():
        TransactionHistory.objects.create(
            transaction_id=instance.id,
            action="deleted",
            transaction_data={
                "type": instance.type,
                "description": instance.description,
                "amount": str(instance.amount),
                "ref": instance.ref,
                "exporter_fournisseur": instance.exporter_fournisseur,
                "category_id": instance.category_id,
                "category_name": instance.category.name if instance.category else None,
                "created_by_id": instance.created_by_id,
                "created_by_name": instance.created_by.name if instance.created_by else None,
                "created_at": instance.created_at.isoformat() if instance.created_at else None,
                "updated_at": instance.updated_at.isoformat() if instance.updated_at else None,
            },
            performed_by=user,
        )


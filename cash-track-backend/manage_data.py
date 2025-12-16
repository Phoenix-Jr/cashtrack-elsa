"""
Script to create initial data for the application
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cash_track_api.settings")
django.setup()

from accounts.models import User
from categories.models import Category

def create_initial_data():
    """Create initial data"""
    
    # Create superuser
    if not User.objects.filter(email="superadmin@example.com").exists():
        superuser = User.objects.create_superuser(
            username="superadmin",
            email="superadmin@example.com",
            password="superadmin123",
            name="Super Admin",
        )
        # Set role and status for superuser
        superuser.role = "admin"
        superuser.status = "active"
        superuser.save()
        print("✓ Superuser created: superadmin@example.com / superadmin123")
    else:
        superuser = User.objects.get(email="superadmin@example.com")
        print("✓ Superuser already exists")
    
    # Create admin user
    if not User.objects.filter(email="admin@example.com").exists():
        admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="admin123",
            name="Admin User",
            role="admin",
            status="active",
        )
        print("✓ Admin user created: admin@example.com / admin123")
    else:
        admin = User.objects.get(email="admin@example.com")
        print("✓ Admin user already exists")
    
    # Create default categories
    categories_data = [
        {"name": "Divers", "type": "both", "color": "#64748B", "icon": "FolderOpen"},
        {"name": "Dépense ELSA", "type": "depense", "color": "#EF4444", "icon": "FileText"},
        {"name": "Dépense Transit", "type": "depense", "color": "#F97316", "icon": "Truck"},
    ]
    
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data["name"],
            defaults=cat_data
        )
        if created:
            print(f"✓ Category created: {cat_data['name']}")
        else:
            print(f"✓ Category already exists: {cat_data['name']}")
    
    # Display summary
    print("\n" + "="*50)
    print("📊 DATA SUMMARY")
    print("="*50)
    print(f"👥 Users: {User.objects.count()}")
    print(f"   - Superusers: {User.objects.filter(is_superuser=True).count()}")
    print(f"   - Admins: {User.objects.filter(role='admin').count()}")
    print(f"📁 Categories: {Category.objects.count()}")
    print("="*50)
    print("\n✅ Initial data created successfully!")

if __name__ == "__main__":
    create_initial_data()

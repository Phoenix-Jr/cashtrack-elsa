"""
Script to create initial data for the application
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "cash_track_api.settings")
django.setup()

from accounts.models import User
from categories.models import Category
from transactions.models import Transaction
from django.utils import timezone
from datetime import timedelta, datetime, date
import random

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
    
    # Create regular user
    if not User.objects.filter(email="user@example.com").exists():
        user = User.objects.create_user(
            username="user",
            email="user@example.com",
            password="user123",
            name="Regular User",
            role="user",
            status="active",
        )
        print("✓ Regular user created: user@example.com / user123")
    else:
        user = User.objects.get(email="user@example.com")
        print("✓ Regular user already exists")
    
    # Create readonly user
    if not User.objects.filter(email="readonly@example.com").exists():
        readonly_user = User.objects.create_user(
            username="readonly",
            email="readonly@example.com",
            password="readonly123",
            name="Readonly User",
            role="readonly",
            status="active",
        )
        print("✓ Readonly user created: readonly@example.com / readonly123")
    else:
        readonly_user = User.objects.get(email="readonly@example.com")
        print("✓ Readonly user already exists")
    
    # Create additional test users
    test_users_data = [
        {"email": "test1@example.com", "name": "Test User 1", "role": "user"},
        {"email": "test2@example.com", "name": "Test User 2", "role": "user"},
        {"email": "viewer@example.com", "name": "Viewer User", "role": "readonly"},
    ]
    
    for user_data in test_users_data:
        if not User.objects.filter(email=user_data["email"]).exists():
            User.objects.create_user(
                username=user_data["email"].split("@")[0],
                email=user_data["email"],
                password="test123",
                name=user_data["name"],
                role=user_data["role"],
                status="active",
            )
            print(f"✓ Test user created: {user_data['email']} / test123")
        else:
            print(f"✓ Test user already exists: {user_data['email']}")
    
    # Create categories
    categories_data = [
        # Recettes
        {"name": "Ventes", "type": "recette", "color": "#10B981", "icon": "ShoppingBag"},
        {"name": "Services", "type": "recette", "color": "#0B74FF", "icon": "Briefcase"},
        {"name": "Encaissements", "type": "recette", "color": "#06B6D4", "icon": "Wallet"},
        {"name": "Prestations", "type": "recette", "color": "#14B8A6", "icon": "Briefcase"},
        # Dépenses
        {"name": "Achats", "type": "depense", "color": "#EF4444", "icon": "Package"},
        {"name": "Frais généraux", "type": "depense", "color": "#F59E0B", "icon": "Home"},
        {"name": "Salaires", "type": "depense", "color": "#8B5CF6", "icon": "Users"},
        {"name": "Loyer", "type": "depense", "color": "#EC4899", "icon": "Home"},
        {"name": "Transport", "type": "depense", "color": "#F97316", "icon": "Truck"},
        {"name": "Maintenance", "type": "depense", "color": "#6366F1", "icon": "Wrench"},
        {"name": "Fournitures", "type": "depense", "color": "#F59E0B", "icon": "Package"},
        # Both
        {"name": "Divers", "type": "both", "color": "#64748B", "icon": "FolderOpen"},
    ]
    
    created_categories = []
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data["name"],
            defaults=cat_data
        )
        created_categories.append(category)
        if created:
            print(f"✓ Category created: {cat_data['name']}")
        else:
            print(f"✓ Category already exists: {cat_data['name']}")
    
    # Create sample transactions for year 2025
    # Option to clear existing transactions (uncomment if needed)
    # Transaction.objects.all().delete()
    # print("✓ Cleared existing transactions")
    
    existing_count = Transaction.objects.count()
    if existing_count > 0:
        print(f"⚠️  {existing_count} transactions already exist. Skipping transaction generation.")
        print("   To regenerate, uncomment the delete line in manage_data.py")
    else:
        descriptions_recette = [
            "Vente de marchandises",
            "Encaissement client",
            "Vente comptoir",
            "Vente en gros",
            "Paiement facture client",
            "Vente export",
            "Prestation de service",
            "Encaissement facture",
            "Vente détail",
            "Commission",
            "Remboursement",
            "Subvention",
        ]
        
        descriptions_depense = [
            "Achat de stock",
            "Loyer mensuel",
            "Facture électricité",
            "Salaires employés",
            "Fournitures bureau",
            "Achat matériel",
            "Frais de transport",
            "Maintenance équipement",
            "Assurance",
            "Publicité",
            "Formation",
            "Frais bancaires",
        ]
        
        exporters = [
            "Exportateur ABC",
            "Exportateur DEF",
            "Client Premium SA",
            "Commerce Plus",
            "Import-Export Global",
            "Client Fidèle SARL",
            "Grossiste International",
            "Distributeur Central",
        ]
        
        fournisseurs = [
            "Fournisseur XYZ",
            "Grossiste Central",
            "Import Global",
            "Fournitures Pro",
            "Matériaux Express",
            "Services Généraux",
            "Équipements SA",
            "Logistique Plus",
        ]
        
        # Get all active users (excluding readonly for creating transactions)
        users = list(User.objects.filter(role__in=["admin", "user"], status="active"))
        if not users:
            users = [admin, user]
        
        recette_categories = [c for c in created_categories if c.type in ["recette", "both"]]
        depense_categories = [c for c in created_categories if c.type in ["depense", "both"]]
        
        # Generate transactions for the entire year 2025
        start_date = date(2025, 1, 1)
        end_date = date(2025, 12, 31)
        total_days = (end_date - start_date).days + 1
        
        # Generate 80-120 transactions per month (960-1440 for the year)
        transactions_per_month = random.randint(80, 120)
        num_transactions = transactions_per_month * 12
        
        print(f"\n📅 Generating {num_transactions} transactions for year 2025...")
        print(f"   From {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
        print(f"   Average: ~{transactions_per_month} transactions per month\n")
        
        balance = 0
        transaction_counter = 0
        
        # Generate transactions month by month
        for month in range(1, 13):
            # Get first and last day of the month
            if month == 12:
                month_start = date(2025, month, 1)
                month_end = date(2025, month, 31)
            else:
                month_start = date(2025, month, 1)
                month_end = date(2025, month + 1, 1) - timedelta(days=1)
            
            month_days = (month_end - month_start).days + 1
            month_transactions = random.randint(80, 120)
            
            print(f"   Generating {month_transactions} transactions for {month_start.strftime('%B %Y')}...")
            
            for i in range(month_transactions):
                # Random day within the month
                day_offset = random.randint(0, month_days - 1)
                transaction_date = month_start + timedelta(days=day_offset)
                
                # 55% recettes, 45% dépenses
                is_recette = random.random() > 0.45
                
                if is_recette:
                    description = random.choice(descriptions_recette)
                    # Montants recettes: 50,000 à 3,000,000 XOF
                    amount = random.randint(50000, 3000000)
                    ref_prefix = "VTE"
                    exporter_fournisseur = random.choice(exporters) if random.random() > 0.2 else None
                    category = random.choice(recette_categories) if recette_categories else None
                else:
                    description = random.choice(descriptions_depense)
                    # Montants dépenses: 20,000 à 1,500,000 XOF
                    amount = -random.randint(20000, 1500000)
                    ref_prefix = "ACH"
                    exporter_fournisseur = random.choice(fournisseurs) if random.random() > 0.3 else None
                    category = random.choice(depense_categories) if depense_categories else None
                
                # Generate reference number with date
                ref_num = str(transaction_counter + 1).zfill(5)
                ref = f"{ref_prefix}-{transaction_date.strftime('%Y%m%d')}-{ref_num}"
                
                created_by = random.choice(users)
                
                # Create transaction with created_at for the specific date
                created_at = timezone.make_aware(
                    datetime.combine(
                        transaction_date,
                        datetime.min.time().replace(
                            hour=random.randint(8, 18),
                            minute=random.randint(0, 59)
                        )
                    )
                )
                
                transaction = Transaction.objects.create(
                    type="recette" if is_recette else "depense",
                    description=description,
                    amount=amount,
                    ref=ref,
                    exporter_fournisseur=exporter_fournisseur,
                    category=category,
                    created_by=created_by,
                )
                
                # Update created_at and updated_at to simulate realistic timing
                transaction.created_at = created_at
                transaction.updated_at = created_at
                transaction.save(update_fields=['created_at', 'updated_at'])
                
                balance += amount
                transaction_counter += 1
        
        print(f"\n✓ Created {transaction_counter} transactions for year 2025")
        print(f"✓ Final balance: {balance:,.0f} XOF")
        
        # Display monthly breakdown
        print("\n📊 Monthly Breakdown:")
        for month in range(1, 13):
            month_start = date(2025, month, 1)
            if month == 12:
                month_end = date(2025, month, 31)
            else:
                month_end = date(2025, month + 1, 1) - timedelta(days=1)
            
            month_start_dt = timezone.make_aware(datetime.combine(month_start, datetime.min.time()))
            month_end_dt = timezone.make_aware(datetime.combine(month_end, datetime.max.time()))
            
            month_transactions = Transaction.objects.filter(
                created_at__gte=month_start_dt,
                created_at__lte=month_end_dt
            )
            
            month_recettes = sum(t.amount for t in month_transactions if t.type == 'recette')
            month_depenses = abs(sum(t.amount for t in month_transactions if t.type == 'depense'))
            month_balance = month_recettes - month_depenses
            
            print(f"   {month_start.strftime('%B'):12} - {month_transactions.count():3} transactions | "
                  f"Recettes: {month_recettes:>12,.0f} XOF | "
                  f"Dépenses: {month_depenses:>12,.0f} XOF | "
                  f"Solde: {month_balance:>12,.0f} XOF")
    
    # Display summary
    print("\n" + "="*50)
    print("📊 DATA SUMMARY")
    print("="*50)
    print(f"👥 Users: {User.objects.count()}")
    print(f"   - Superusers: {User.objects.filter(is_superuser=True).count()}")
    print(f"   - Admins: {User.objects.filter(role='admin').count()}")
    print(f"   - Regular users: {User.objects.filter(role='user').count()}")
    print(f"   - Readonly users: {User.objects.filter(role='readonly').count()}")
    print(f"📁 Categories: {Category.objects.count()}")
    print(f"💰 Transactions: {Transaction.objects.count()}")
    
    if Transaction.objects.count() > 0:
        total_recettes = sum(t.amount for t in Transaction.objects.filter(type='recette'))
        total_depenses = abs(sum(t.amount for t in Transaction.objects.filter(type='depense')))
        balance = total_recettes - total_depenses
        print(f"   - Total recettes: {total_recettes:,.0f} XOF")
        print(f"   - Total dépenses: {total_depenses:,.0f} XOF")
        print(f"   - Solde: {balance:,.0f} XOF")
    
    print("="*50)
    print("\n✅ Initial data created successfully!")

if __name__ == "__main__":
    create_initial_data()


"""
Management command to create sample data for testing.
Run with: python manage.py create_sample_data

This creates:
- Sample menu items (coffees and desserts)
- Test barista account
- Sample loyalty offers
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import User, MenuItem, LoyaltyOffer

class Command(BaseCommand):
    """
    Django management command to populate database with sample data.
    Useful for testing and development.
    """
    
    help = 'Creates sample data for testing the coffee shop app'
    
    def handle(self, *args, **options):
        """Execute the command"""
        
        self.stdout.write('Creating sample data...\n')
        
        # Create barista user
        self.create_barista()
        
        # Create menu items
        self.create_menu_items()
        
        # Create loyalty offers
        self.create_loyalty_offers()
        
        self.stdout.write(self.style.SUCCESS('\n✅ Sample data created successfully!'))
        self.stdout.write('\nYou can now:')
        self.stdout.write('1. Register a customer account via API')
        self.stdout.write('2. Login as barista: username=barista, password=barista123')
        self.stdout.write('3. View menu items and create orders\n')
    
    def create_barista(self):
        """Create a barista test account"""
        
        # Check if barista already exists
        if User.objects.filter(username='barista').exists():
            self.stdout.write('⚠️  Barista account already exists')
            return
        
        # Create barista user
        barista = User.objects.create_user(
            username='barista',
            email='barista@coffeeshop.com',
            password='barista123',
            first_name='John',
            last_name='Barista',
            role=User.UserRole.BARISTA
        )
        
        self.stdout.write(self.style.SUCCESS('✅ Created barista account'))
        self.stdout.write(f'   Username: barista')
        self.stdout.write(f'   Password: barista123')
    
    def create_menu_items(self):
        """Create sample coffee and dessert menu items"""
        
        self.stdout.write('\nCreating menu items...')
        
        # Coffee items with descriptions
        coffees = [
            {
                'title': 'Espresso',
                'description': 'Strong and bold shot of pure coffee',
                'price': 2.50,
                'preparation_time': 2
            },
            {
                'title': 'Cappuccino',
                'description': 'Espresso with steamed milk and foam',
                'price': 4.00,
                'preparation_time': 4
            },
            {
                'title': 'Latte',
                'description': 'Smooth espresso with steamed milk',
                'price': 4.50,
                'preparation_time': 4
            },
            {
                'title': 'Americano',
                'description': 'Espresso with hot water',
                'price': 3.00,
                'preparation_time': 3
            },
            {
                'title': 'Mocha',
                'description': 'Espresso with chocolate and steamed milk',
                'price': 5.00,
                'preparation_time': 5
            },
            {
                'title': 'Flat White',
                'description': 'Espresso with velvety microfoam milk',
                'price': 4.25,
                'preparation_time': 4
            },
            {
                'title': 'Caramel Macchiato',
                'description': 'Vanilla latte with caramel drizzle',
                'price': 5.50,
                'preparation_time': 5
            },
            {
                'title': 'Iced Coffee',
                'description': 'Chilled coffee over ice',
                'price': 3.50,
                'preparation_time': 3
            },
        ]
        
        # Dessert items with descriptions
        desserts = [
            {
                'title': 'Chocolate Chip Cookie',
                'description': 'Freshly baked with premium chocolate chips',
                'price': 2.50,
                'preparation_time': 1
            },
            {
                'title': 'Blueberry Muffin',
                'description': 'Moist muffin loaded with blueberries',
                'price': 3.00,
                'preparation_time': 1
            },
            {
                'title': 'Croissant',
                'description': 'Buttery and flaky French pastry',
                'price': 3.50,
                'preparation_time': 1
            },
            {
                'title': 'Cheesecake Slice',
                'description': 'Creamy New York style cheesecake',
                'price': 5.00,
                'preparation_time': 2
            },
            {
                'title': 'Brownie',
                'description': 'Rich chocolate brownie with walnuts',
                'price': 3.50,
                'preparation_time': 1
            },
            {
                'title': 'Apple Pie',
                'description': 'Classic apple pie with cinnamon',
                'price': 4.50,
                'preparation_time': 2
            },
            {
                'title': 'Tiramisu',
                'description': 'Italian coffee-flavored dessert',
                'price': 5.50,
                'preparation_time': 2
            },
        ]
        
        # Create coffee items
        coffee_count = 0
        for coffee in coffees:
            # Check if item already exists
            if not MenuItem.objects.filter(title=coffee['title']).exists():
                MenuItem.objects.create(
                    title=coffee['title'],
                    description=coffee['description'],
                    item_type=MenuItem.ItemType.COFFEE,
                    price=coffee['price'],
                    preparation_time=coffee['preparation_time'],
                    is_available=True
                )
                coffee_count += 1
        
        self.stdout.write(f'✅ Created {coffee_count} coffee items')
        
        # Create dessert items
        dessert_count = 0
        for dessert in desserts:
            # Check if item already exists
            if not MenuItem.objects.filter(title=dessert['title']).exists():
                MenuItem.objects.create(
                    title=dessert['title'],
                    description=dessert['description'],
                    item_type=MenuItem.ItemType.DESSERT,
                    price=dessert['price'],
                    preparation_time=dessert['preparation_time'],
                    is_available=True
                )
                dessert_count += 1
        
        self.stdout.write(f'✅ Created {dessert_count} dessert items')
    
    def create_loyalty_offers(self):
        """Create sample loyalty offers"""
        
        self.stdout.write('\nCreating loyalty offers...')
        
        # Calculate dates for offers
        now = timezone.now()
        future = now + timedelta(days=90)
        
        # Sample offers
        offers = [
            {
                'title': 'Free Cookie',
                'description': 'Get a Chocolate Chip Cookie for free!',
                'points_required': 20,
            },
            {
                'title': 'Free Coffee',
                'description': 'Get any coffee free!',
                'points_required': 30,
            },
            {
                'title': 'Free Dessert',
                'description': 'Choose any dessert for free!',
                'points_required': 50,
            },
            {
                'title': '20% Off',
                'description': '20% discount on your entire order!',
                'points_required': 75,
            },
        ]
        
        offer_count = 0
        for offer in offers:
            # Check if offer already exists
            if not LoyaltyOffer.objects.filter(title=offer['title']).exists():
                LoyaltyOffer.objects.create(
                    title=offer['title'],
                    description=offer['description'],
                    points_required=offer['points_required'],
                    is_active=True,
                    valid_from=now,
                    valid_until=future
                )
                offer_count += 1
        
        self.stdout.write(f'✅ Created {offer_count} loyalty offers')
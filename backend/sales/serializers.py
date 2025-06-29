from rest_framework import serializers
from .models import Sale, SaleItem

class SaleItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = ['id', 'product_name', 'unit_price', 'quantity', 'total_price']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    
    class Meta:
        model = Sale
        fields = [
            'id', 'sale_id', 'subtotal', 'discount_type', 'discount_value', 
            'discount_amount', 'total_amount', 'payment_received', 'change_amount',
            'payment_status', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        sale = Sale.objects.create(**validated_data)
        
        for item_data in items_data:
            SaleItem.objects.create(sale=sale, **item_data)
        
        return sale

class SaleListSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Sale
        fields = [
            'id', 'sale_id', 'total_amount', 'payment_status', 
            'created_at', 'items_count'
        ]
    
    def get_items_count(self, obj):
        return obj.items.count()

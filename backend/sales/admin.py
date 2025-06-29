from django.contrib import admin
from .models import Sale, SaleItem

class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ['total_price']

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['sale_id', 'total_amount', 'payment_status', 'created_at']
    list_filter = ['payment_status', 'created_at', 'discount_type']
    search_fields = ['sale_id']
    readonly_fields = ['sale_id', 'created_at', 'updated_at']
    inlines = [SaleItemInline]

@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = ['product_name', 'quantity', 'unit_price', 'total_price', 'sale']
    list_filter = ['created_at']
    search_fields = ['product_name', 'sale__sale_id']

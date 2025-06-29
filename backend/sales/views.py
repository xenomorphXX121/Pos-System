from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Sale, SaleItem
from .serializers import SaleSerializer, SaleListSerializer

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SaleListSerializer
        return SaleSerializer
    
    def create(self, request, *args, **kwargs):
        # Generate unique sale ID
        sale_id = f"SALE-{timezone.now().strftime('%Y%m%d%H%M%S')}"
        request.data['sale_id'] = sale_id
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            sale = serializer.save()
            return Response(
                SaleSerializer(sale).data, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def daily_summary(self, request):
        today = timezone.now().date()
        sales_today = Sale.objects.filter(
            created_at__date=today,
            payment_status='completed'
        )
        
        summary = sales_today.aggregate(
            total_sales=Sum('total_amount'),
            total_transactions=Count('id')
        )
        
        return Response({
            'date': today,
            'total_sales': summary['total_sales'] or 0,
            'total_transactions': summary['total_transactions'] or 0,
        })
    
    @action(detail=False, methods=['get'])
    def weekly_summary(self, request):
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=7)
        
        sales_week = Sale.objects.filter(
            created_at__date__range=[start_date, end_date],
            payment_status='completed'
        )
        
        summary = sales_week.aggregate(
            total_sales=Sum('total_amount'),
            total_transactions=Count('id')
        )
        
        return Response({
            'start_date': start_date,
            'end_date': end_date,
            'total_sales': summary['total_sales'] or 0,
            'total_transactions': summary['total_transactions'] or 0,
        })

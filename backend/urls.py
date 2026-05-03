from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings

def debug_settings(request):
    return JsonResponse({
        'CSRF_TRUSTED_ORIGINS': settings.CSRF_TRUSTED_ORIGINS,
        'ALLOWED_HOSTS': settings.ALLOWED_HOSTS,
        'DEBUG': settings.DEBUG,
        'MIDDLEWARE': settings.MIDDLEWARE,
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('jobs.urls')),
    path('debug-settings/', debug_settings),
]
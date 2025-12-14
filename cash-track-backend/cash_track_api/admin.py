"""
Custom admin configuration for CashTrack
"""
from django.contrib import admin
from django.template.response import TemplateResponse
from django.urls import path


class CashTrackAdminSite(admin.AdminSite):
    site_header = "CashTrack Administration"
    site_title = "CashTrack Admin"
    index_title = "Bienvenue dans l'administration CashTrack"

    def each_context(self, request):
        context = super().each_context(request)
        context['site_header'] = self.site_header
        context['site_title'] = self.site_title
        return context

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('custom-css/', self.admin_view(self.custom_css_view), name='custom_css'),
        ]
        return custom_urls + urls

    def custom_css_view(self, request):
        return TemplateResponse(request, 'admin/custom_css.html', {})


# Use the default admin site
admin_site = admin.site

# Override the default admin site attributes
admin.site.site_header = "CashTrack Administration"
admin.site.site_title = "CashTrack Admin"
admin.site.index_title = "Bienvenue dans l'administration CashTrack"


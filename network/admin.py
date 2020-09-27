from django.contrib import admin
from .models import User, Posting, Like

# Register your models here.
admin.site.register(User)
admin.site.register(Posting)
admin.site.register(Like)
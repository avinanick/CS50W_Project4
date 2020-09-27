
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create", views.create_post, name="create_post"),
    path('user/follow', views.follow_user, name="follow_user"),
    path("user/<str:profile_name>", views.profile_view, name="profile"),
    path("posts/<str:type>/<int:page_number>", views.load_posts, name="load_posts")
]

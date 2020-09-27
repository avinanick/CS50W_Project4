from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator
from django.http import JsonResponse
import json

from .models import User, Posting, Like


def index(request):
    return render(request, "network/index.html")

@login_required
def create_post(request):

    # Creating a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    new_post = Posting(
        poster=request.user,
        content=data.get("content",""))

    new_post.save()
    return JsonResponse({"message": "Successfully posted."}, status=201)


@login_required
def follow_user(request):

    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    data = json.loads(request.body)

    if data.get("follow","") :
        request.user.subscriptions.add(User.objects.get(username=data.get("name","")))
        return JsonResponse({"message": "Successfully followed."}, status=201)
    else:
        request.user.subscriptions.remove(User.objects.get(username=data.get("name","")))
        return JsonResponse({"message": "Successfully unfollowed."}, status=201)


def load_posts(request, type, page_number):
    if type == "all":
        print("get all posts")
        postings = Posting.objects.order_by("-timestamp").all()
    elif type == "subscription":
        if request.user.is_authenticated:
            sub_users = request.user.subscriptions.all()
            sub_names = [sub.username for sub in sub_users]
            postings = Posting.objects.order_by("-timestamp").filter(poster__username__in=sub_names)
        else:
            return JsonResponse({"error": "User login required."}, status=400)
    else:
        print("try to find specified user")
        profile_user = User.objects.get(username=type)
        if not profile_user:
            return JsonResponse({"error": "User not found."}, status=400)
        postings = Posting.objects.order_by("-timestamp").filter(poster__username=type)

    p = Paginator(postings, 10)
    if page_number > p.num_pages or page_number < 1:
        return JsonResponse({
            "error": "Invalid page number."
        }, status=400)
    return JsonResponse([[posting.serialize(request.user) for posting in p.page(page_number)], {"number_of_pages": p.num_pages}], safe=False)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def profile_view(request, profile_name):
    viewed_user = User.objects.get(username=profile_name)
    followed = False
    if request.user.subscriptions.filter(username=profile_name).exists():
        followed = True
    return render(request, "network/profile.html", {
        "already_followed": followed,
        "viewed_username": viewed_user.username,
        "viewed_followers": viewed_user.followers.count(),
        "viewed_subscriptions": viewed_user.subscriptions.count()
    }) # TODO: handle case in which user does not exist


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
def subscription_view(request):
    return render(request, "network/subscriptions.html")

@login_required
def toggle_like(request):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)
    
    data = json.loads(request.body)

    post_to_like = Posting.objects.get(id=data.get("id",""))
    if Like.objects.filter(user=request.user, post=post_to_like).exists():
        Like.objects.filter(user=request.user, post=post_to_like).delete()
    else:
        new_like = Like(user=request.user, post=post_to_like)
        new_like.save()
    return JsonResponse({
        "message": "Likes updated.", 
        "likes_count": Posting.objects.get(id=data.get("id","")).likes.count()}, 
        status=201)

@login_required
def update_post(request):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)
    
    data = json.loads(request.body)

    post_to_edit = Posting.objects.get(id=data.get("id",""))
    if post_to_edit.poster != request.user:
        return JsonResponse({"error": "Users can only edit their own posts."}, status=400)

    post_to_edit.content = data.get("content", "")
    post_to_edit.save()
    return JsonResponse({"message": "Post updated."}, status=201)
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
def load_posts(request, type, page_number):
    if type == "all":
        print("get all posts")
        postings = Posting.objects.order_by("-timestamp").all()
    elif type == "subscription":
        postings = Posting.objects.order_by("-timestamp").all()
    else:
        print("try to find specified user")
        sub_users = request.user.subscriptions
        sub_names = [sub.username for sub in sub_users]
        postings = Posting.objects.order_by("-timestamp").filter(poster__username__in=sub_names)

    p = Paginator(postings, 10)
    if page_number > p.num_pages or page_number < 1:
        return JsonResponse({
            "error": "Invalid page number."
        }, status=400)
    return JsonResponse([[posting.serialize() for posting in p.page(page_number)], p.num_pages])

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

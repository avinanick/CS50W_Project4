from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    subscriptions = models.ManyToManyField("User", related_name="followers")

class Posting(models.Model):
    poster = models.ForeignKey("User", on_delete=models.CASCADE, related_name="postings")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        pass # TODO: serialize to json

class Like(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="favorites")
    post = models.ForeignKey("Posting", on_delete=models.CASCADE, related_name="likes")

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    subscriptions = models.ManyToManyField("User", related_name="followers")

class Posting(models.Model):
    poster = models.ForeignKey("User", on_delete=models.CASCADE, related_name="postings")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self, user):
        return {
            "id": self.id,
            "poster": self.poster.username,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %-d %Y, %-I:%M %p"),
            "likes_count": self.likes.count(),
            "from_user": self.poster == user
        }

class Like(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="favorites")
    post = models.ForeignKey("Posting", on_delete=models.CASCADE, related_name="likes")

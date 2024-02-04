---
title: Resize Image on Save in Django Before Sending to Amazon S3 - No Lambda Function Required
subtitle: The Simple Way Using Pillow and a Memory Buffer
description: How to dynamically resize an image on save before uploading it to your AWS S3 bucket. No Lambda function required.
pubDate: 2020-12-26T02:50:00.000Z
heroImage: django-aws.png
tags:
  - post
  - django
  - python
  - pillow
  - resize
  - aws
  - amazon
  - s3
---

I've been leveling-up on my **Django and Python** skills lately, and I ran into a fairly common situation, that I could’t find a definitive solution for.

## The Dilema

I have a **users** app with a simple **Profile model**, and I’m using **django-storages** to manage uploading my **images** and other **static assets** to **Amazon S3**.

**If a users uploads a massive 4K image**, that is never going to be displayed larger than 256px wide, **I don’t want to have to store that**. So I want to **resize the image on save**, before uploading it to AWS.

For storing images locally, I just have to install Pillow and **override the save method** in my Profile model like so:

```python
from PIL import Image

def save(self, *args, **kwargs):
    super().save(*args, **kwargs)

    img = Image.open(self.image.path)
    if img.height > 512 or img.width > 512:
        output_size = (512, 512)
        img.thumbnail(output_size)
        img.save(self.image.path)
```

But it become a bit more complicated when using S3 buckets. I get a

`NotImplementedError`

`Exception Value: This backend doesn't support absolute paths.`

## The Solution

Most of what I found online suggested **removing the Pillow resize and writing an AWS Lambda function** to handle the resize on upload. I initially tried that approach, but according to the AWS docs you shouldn’t use the same bucket for input and output, meaning I had to create a second S3 bucket just for resized images. I couldn’t figure out how to get that setup working with django-storages.

A second approach I found mentioned **using a buffer to save the resized image into**, and then saving that to AWS. The examples of this that I found were either incomplete or used old versions of python. Here is what actually worked for me using **Python 3.8, Django 3.1.3 and Pillow 8.0.1**:

### user/models.py

```python
from app.utils import image_resize

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(default="profile-default.png", upload_to="profile_pics")

    def __str__(self):
        return f"{self.user.username} Profile"

    def save(self, *args, **kwargs):
        image_resize(self.image, 512, 512)
        super().save(*args, **kwargs)
```

### app/utils.py

```python
from django.core.files import File
from pathlib import Path
from PIL import Image
from io import BytesIO

image_types = {
    "jpg": "JPEG",
    "jpeg": "JPEG",
    "png": "PNG",
    "gif": "GIF",
    "tif": "TIFF",
    "tiff": "TIFF",
}


def image_resize(image, width, height):
    # Open the image using Pillow
    img = Image.open(image)
    # check if either the width or height is greater than the max
    if img.width > width or img.height > height:
        output_size = (width, height)
        # Create a new resized “thumbnail” version of the image with Pillow
        img.thumbnail(output_size)
        # Find the file name of the image
        img_filename = Path(image.file.name).name
        # Spilt the filename on “.” to get the file extension only
        img_suffix = Path(image.file.name).name.split(".")[-1]
        # Use the file extension to determine the file type from the image_types dictionary
        img_format = image_types[img_suffix]
        # Save the resized image into the buffer, noting the correct file type
        buffer = BytesIO()
        img.save(buffer, format=img_format)
        # Wrap the buffer in File object
        file_object = File(buffer)
        # Save the new resized file as usual, which will save to S3 using django-storages
        image.save(img_filename, file_object)
```

I’m **overriding the save method** still, and calling a function I’ve placed in utils.py of my main application. The following happens in the **image_resize** function:

The image_function **checks if the image is too wide or tall** and, if it is, saves a resized version first to a memory buffer and then to S3. Back in the save method we call `super().save()` to save the remaining fields. The `super().save()` needs to be called after the `image.save()` or both the original and the resized images will get uploaded to S3.

I hope that was helpful to someone. As always, **thanks for reading and Merry Christmas!**

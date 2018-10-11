# Image Resizer Service
## Introduction
This serverless image resizer service was built by using AWS services S3, Lambda and API Gateway.  
### Request the original raw image
The original images are uploaded in S3 bucket `rawImage` folder. Once uploaded, simply use the S3 static website hosting endpoint to retrieve the original image. 
```
http://BUCKET_WEBSITE_HOST_NAME/rawImage/rawImageName
```
S3 supports to store multiple images with the same name by assigning different version ids. 
### Request the resized image
Resized images are stored in S3 bucket `resizedImage` folder. To request the resized image, the users need to provide the resize option, `width` and `height`, from S3 static website hosting endpoint. This image resizer service supports request scenarios like `width`x`height` , `width`X`height` and `width`*`height`. For example,
```
http://BUCKET_WEBSITE_HOST_NAME/resizedImage/widthxheight/rawImageName 
```
If the resized image does not exist in the S3 bucket, the user’s browser redirects and requests the image resizer via API Gateway, which triggers lambda function to serve the request. The lambda function first downloads the original image from S3 bucket, resizes it to the requested dimensions, and then uploads the new image to S3 bucket `resizedImage` folder. The subsequent requests to the image of same dimensions will be served directly by S3 bucket.
## Resize Image Test
### Images
Three types of images with different aspect ratios and sizes have been uploaded in S3 bucket. Public read access has been granted. 
* earth.jpg, 2000x2000
* seattle.png, 1920x1200
* sun.gif, 1000x1000
### Request the original raw image
```
http://image-resizer-yw.s3-website-us-west-2.amazonaws.com/rawImage/earth.jpg
http://image-resizer-yw.s3-website-us-west-2.amazonaws.com/rawImage/seattle.png
http://image-resizer-yw.s3-website-us-west-2.amazonaws.com/rawImage/sun.gif
```
### Request the resized image examples
```
http://image-resizer-yw.s3-website-us-west-2.amazonaws.com/resizedImage/200x300/earth.jpg
http://image-resizer-yw.s3-website-us-west-2.amazonaws.com/resizedImage/400x200/seattle.png
http://image-resizer-yw.s3-website-us-west-2.amazonaws.com/resizedImage/500x200/sun.gif
```
The image resizer service keeps the original aspect ratio when resizes the images. 

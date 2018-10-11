'use strict';

// require modules
const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  signatureVersion: 'v4'
});
const Sharp = require('sharp');

// reference environment variables in Lambda: 
const BUCKET = process.env.BUCKET;
const URL = process.env.URL;
const RAW = process.env.RAW;

exports.handler = function (event, context, callback) {
  const key = event.queryStringParameters.key;
  console.log(key);
  /* 
   match the key in the following scenarios : 
  '100x100/image.jpg', '100X100/image.jpg', '100*100/image.jpg'
  */
  const paramsMatch = key.match(/(\d+)[xX*](\d+)\/(.*)/);
  console.log(paramsMatch);


  if (paramsMatch) {
    // get new dimension of the image
    const width = parseInt(paramsMatch[1], 10);
    const height = parseInt(paramsMatch[2], 10);
    const srcKey = paramsMatch[3]; 

    // input validation
    if (isNaN(width) || isNaN(height)|| width <= 0 || height <= 0) {
        return context.fail("width and height must be positive integers");
    }
    
    // format validation
    const formatMatch = srcKey.match(/\.([^.]*)$/);
    if (!formatMatch) {
      return context.fail("wrong source key format");
    }

    const format = formatMatch[1];
    if (format != "jpg" && format != "png" && format != "gif") {
      return context.fail("wrong image format");
    }

    // async control flow: download image from S3 -> resize image-> upload new image to S3->redirect
    // retrieve the original image from S3
    const params = {
      Bucket: BUCKET,
      Key: RAW + '/' + srcKey
    };

    S3.getObject(params)
      .promise()
      .then(data => resize(data, width, height)
      )
      .then(buffer => uploadToS3(buffer, params)
      )
      .then(() => redirect()
      )
      .catch(function (err) {
        console.log(err);
      });
  } else {
    context.fail(new Error('invalid request'))
  }
  
  // sharp resize the image
  function resize (data, width, height) {
    return Sharp(data.Body)
          .resize(width,height)
          .max() // keep original aspect ratio
          .toFormat('jpeg')
          .toBuffer()
  }

  // uploading data S3
  function uploadToS3 (data, params) {
    return S3.putObject({
      Bucket: BUCKET,
      Key: key,
      Body: data,
      ContentType: 'image/jpeg',
      ACL: 'public-read'
    })
    .promise()
  }
  // redirect to new created location in S3 
  function redirect () {
    return context.succeed({
          statusCode: '301', //redirect
          headers: {'location': `${URL}/${key}`},
          body: ''
        });
  }
}
 

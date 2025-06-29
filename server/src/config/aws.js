import AWS from 'aws-sdk';
import { logger } from '../utils/logger.js';

let s3Client;

export async function initializeS3() {
  try {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });

    s3Client = new AWS.S3({
      apiVersion: '2006-03-01',
      signatureVersion: 'v4'
    });

    // Test S3 connection
    await s3Client.headBucket({ Bucket: process.env.AWS_S3_BUCKET }).promise();
    logger.info('S3 connection successful');
    
    return s3Client;
  } catch (error) {
    logger.error('Failed to initialize S3:', error);
    throw error;
  }
}

export function getS3Client() {
  if (!s3Client) {
    throw new Error('S3 client not initialized');
  }
  return s3Client;
}

export async function uploadToS3(buffer, key, contentType, metadata = {}) {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata,
      ServerSideEncryption: 'AES256'
    };

    const result = await s3Client.upload(params).promise();
    return result;
  } catch (error) {
    logger.error('S3 upload failed:', error);
    throw error;
  }
}

export async function getSignedUrl(key, expires = 3600) {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: expires
    };

    return s3Client.getSignedUrl('getObject', params);
  } catch (error) {
    logger.error('Failed to generate signed URL:', error);
    throw error;
  }
}

export async function deleteFromS3(key) {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    await s3Client.deleteObject(params).promise();
    return true;
  } catch (error) {
    logger.error('S3 delete failed:', error);
    throw error;
  }
}
import {
  S3Client, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY } from './env.js';

export const s3 = S3_ENDPOINT
  ? new S3Client({
      region: 'us-east-1',          // required by the SDK; ignored by MinIO
      endpoint: S3_ENDPOINT,
      forcePathStyle: true,         // http://host:9000/bucket/key (not bucket.host)
      credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
      // newer SDKs add checksum headers some S3-compatible stores reject
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    })
  : null;

// Dev convenience: create the bucket and make objects publicly readable.
// In production, infrastructure tooling does this, not the app.
export async function ensureBucket() {
  if (!s3) return;

  try {
    await s3.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
  } catch {
    try {
      await s3.send(new CreateBucketCommand({ Bucket: S3_BUCKET }));
    } catch (err) {
      // 3 backend copies start at once; another one may have just created it
      if (!['BucketAlreadyOwnedByYou', 'BucketAlreadyExists'].includes(err.name)) throw err;
    }
  }

  await s3.send(new PutBucketPolicyCommand({
    Bucket: S3_BUCKET,
    Policy: JSON.stringify({
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],                       // read only
        Resource: [`arn:aws:s3:::${S3_BUCKET}/*`],
      }],
    }),
  }));
}
# S3 + CloudFront Deployment

## 1. Build erstellen
```bash
npm run build
```

## 2. S3 Bucket erstellen
```bash
# Bucket erstellen
aws s3 mb s3://your-app-bucket-name --region ${VITE_AWS_REGION}

# Static Website Hosting aktivieren
aws s3 website s3://your-app-bucket-name \
  --index-document index.html \
  --error-document index.html
```

## 3. Build hochladen
```bash
# Alle Dateien hochladen
aws s3 sync dist/ s3://your-app-bucket-name --delete

# Public Read Berechtigung setzen
aws s3api put-bucket-policy \
  --bucket your-app-bucket-name \
  --policy file://bucket-policy.json
```

**bucket-policy.json:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-app-bucket-name/*"
    }
  ]
}
```

## 4. CloudFront Distribution erstellen
```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

**cloudfront-config.json:**
```json
{
  "CallerReference": "cognito-app-$(date +%s)",
  "Comment": "Cognito Key-Value App",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-your-app-bucket-name",
        "DomainName": "your-app-bucket-name.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-your-app-bucket-name",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    }
  },
  "Enabled": true
}
```

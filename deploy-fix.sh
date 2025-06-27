#!/bin/bash

echo "🔧 Deploying DynamoDB Permission Fix..."
echo "📍 This will update the IAM policy condition from StringEquals to StringLike"

# Navigate to infrastructure directory
cd infrastructure

# Deploy the updated CDK stack
echo "🚀 Deploying CDK stack..."
AWS_PROFILE=lanixx npx cdk deploy --require-approval never

if [ $? -eq 0 ]; then
    echo "✅ CDK deployment successful!"
    
    # Go back to main directory
    cd ..
    
    # Update .env file
    echo "🔄 Updating .env file..."
    AWS_PROFILE=lanixx npm run update-env
    
    if [ $? -eq 0 ]; then
        echo "✅ Environment variables updated!"
        echo ""
        echo "🎯 Next steps:"
        echo "   npm run dev"
        echo ""
        echo "🔍 Test the app - DynamoDB permissions should now work!"
    else
        echo "⚠️  .env update failed, but CDK deployment was successful"
        echo "   You can manually update .env or try: AWS_PROFILE=lanixx npm run update-env"
    fi
else
    echo "❌ CDK deployment failed"
    echo "   Please check the error messages above"
fi

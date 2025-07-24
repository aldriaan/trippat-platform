# Admin Dashboard Environment Configuration

The admin dashboard requires environment variables to connect to the backend API.

## Required Environment Variables

Create a `.env.local` file in the `trippat-admin` directory with:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
```

## Production Configuration

For AWS deployment, create `.env.local` with:

```bash
# API Configuration for AWS deployment
NEXT_PUBLIC_API_URL=http://3.72.21.168:5001/api
NEXT_PUBLIC_API_BASE_URL=http://3.72.21.168:5001
```

## Troubleshooting

If you see "Failed to load resource: net::ERR_CONNECTION_REFUSED" errors:

1. Check that the environment variables are set correctly
2. Restart the admin app with `pm2 restart trippat-admin --update-env`
3. Verify the backend API is running on the correct port
# 📡 Sands Club API Documentation

## Overview

Sands Club uses the **Base44 SDK** for backend operations. This document describes the key API endpoints and integration patterns.

## Base44 SDK Integration

### Client Setup

The Base44 client is configured in `src/api/base44Client.js`:

```javascript
import { useBase44Client } from '@base44/sdk';

const client = useBase44Client();
```

## Authentication

### Login

```javascript
// Using Base44 authentication
const { login } = useAuth();
await login(email, password);
```

### Registration

```javascript
const { register } = useAuth();
await register({
  email,
  password,
  username,
  phoneNumber
});
```

### Session Management

```javascript
const { user, isAuthenticated, logout } = useAuth();

// Check authentication status
if (!isAuthenticated) {
  navigate('/login');
}

// Logout
await logout();
```

## Game Operations

### List Games

```javascript
const { data: games } = useQuery({
  queryKey: ['games'],
  queryFn: async () => {
    const client = useBase44Client();
    return await client.entity('GameHall').findMany();
  }
});
```

### Get Game Details

```javascript
const { data: game } = useQuery({
  queryKey: ['game', gameId],
  queryFn: async () => {
    const client = useBase44Client();
    return await client.entity('GameHall').findOne(gameId);
  }
});
```

## Betting Operations

### Place Bet

```javascript
const client = useBase44Client();
const bet = await client.entity('Bet').create({
  userId: user.id,
  gameId: gameId,
  amount: 100,
  selections: [1, 2, 3],
  timestamp: new Date()
});
```

### Get User Bets

```javascript
const { data: userBets } = useQuery({
  queryKey: ['bets', userId],
  queryFn: async () => {
    const client = useBase44Client();
    return await client.entity('Bet')
      .findMany()
      .where('userId', '==', userId);
  }
});
```

## Error Handling

```javascript
try {
  const client = useBase44Client();
  const result = await client.entity('Bet').create(betData);
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    // Handle auth error
    navigate('/login');
  } else if (error.code === 'VALIDATION_ERROR') {
    // Handle validation error
    console.error('Validation error:', error.details);
  } else {
    // Handle other errors
    console.error('Error:', error.message);
  }
}
```

## Best Practices

1. **Use React Query** for data fetching and caching
2. **Implement error boundaries** for error handling
3. **Use loading states** for better UX
4. **Validate data** on client side before sending
5. **Use TypeScript** for type safety
6. **Implement retry logic** for failed requests
7. **Cache responses** appropriately
8. **Monitor API performance** and errors

## Support

- Base44 API Docs: https://docs.base44.com/api
- SDK Reference: https://docs.base44.com/sdk
- Support: https://app.base44.com/support

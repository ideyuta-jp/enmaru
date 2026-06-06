'use client';

import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MuiLink from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

import ErrorAlert from '@/components/ErrorAlert';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO(#7 follow-up): authenticate against the auth backend (Logto), then
    // redirect to the role-specific landing page. UI only for now.
  }

  return (
    <>
      <Box sx={{textAlign: 'center', mb: 3}}>
        <Typography
          variant="h1"
          sx={{fontSize: {xs: '1.5rem', md: '1.75rem'}, mb: 1}}
        >
          ログイン
        </Typography>
        <Typography variant="body2" color="text.secondary">
          えんまーるにログイン
        </Typography>
      </Box>

      <ErrorAlert message={error} />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{display: 'flex', flexDirection: 'column', gap: 2}}
      >
        <TextField
          label="メールアドレス"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          size="small"
          autoComplete="email"
        />
        <TextField
          label="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          size="small"
          autoComplete="current-password"
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{py: 1.25}}
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </Button>
      </Box>

      <Divider sx={{my: 3}} />

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{textAlign: 'center'}}
      >
        まだ登録していない方は{' '}
        <MuiLink
          component={NextLink}
          href="/register"
          color="primary"
          underline="hover"
        >
          新規登録
        </MuiLink>
      </Typography>
    </>
  );
}

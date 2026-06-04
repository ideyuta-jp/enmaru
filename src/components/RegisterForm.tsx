'use client';

import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiLink from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import NextLink from 'next/link';
import {useRouter} from 'next/navigation';

import ErrorAlert from '@/components/ErrorAlert';
import type {UserRole} from '@/types/User';

const ROLE_LANDING: Record<UserRole, string> = {
  SEEKER: '/mypage',
  NURSERY: '/nursery/mypage',
  ADMIN: '/admin/matches',
};

export default function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) {
      setError('登録区分を選択してください');
      return;
    }
    if (!agreed) {
      setError('利用規約に同意してください');
      return;
    }
    setError(null);
    setLoading(true);
    // TODO(#7 follow-up): create the account and sign in via the auth backend.
    // The redirect below is frontend-only so the role areas are reachable by
    // navigation without a backend.
    router.push(ROLE_LANDING[role]);
  }

  return (
    <>
      <Box sx={{textAlign: 'center', mb: 3}}>
        <Typography
          variant="h1"
          sx={{fontSize: {xs: '1.5rem', md: '1.75rem'}, mb: 1}}
        >
          新規登録
        </Typography>
        <Typography variant="body2" color="text.secondary">
          えんまーるへようこそ
        </Typography>
      </Box>

      <ErrorAlert message={error} />

      <Typography variant="body2" sx={{mb: 1.5, fontWeight: 600}}>
        登録区分を選択してください
      </Typography>
      <Box
        sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3}}
      >
        <RoleCard
          selected={role === 'SEEKER'}
          onClick={() => setRole('SEEKER')}
          icon={
            <ChildCareIcon
              sx={{
                fontSize: 36,
                color: role === 'SEEKER' ? '#F4A7B9' : '#AAAAAA',
              }}
            />
          }
          title="保育士"
          description="仕事を探している保育士・保育経験者"
        />
        <RoleCard
          selected={role === 'NURSERY'}
          onClick={() => setRole('NURSERY')}
          icon={
            <ApartmentIcon
              sx={{
                fontSize: 36,
                color: role === 'NURSERY' ? '#F4A7B9' : '#AAAAAA',
              }}
            />
          }
          title="保育園"
          description="スポットサポートを募集している保育施設"
        />
      </Box>

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
          label="パスワード（8文字以上）"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          size="small"
          slotProps={{htmlInput: {minLength: 8}}}
          autoComplete="new-password"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              size="small"
              sx={{color: '#F4A7B9', '&.Mui-checked': {color: '#F4A7B9'}}}
            />
          }
          label={
            <Typography variant="body2">
              <MuiLink
                component={NextLink}
                href="/terms"
                target="_blank"
                color="primary"
                underline="hover"
              >
                利用規約
              </MuiLink>
              に同意します
            </Typography>
          }
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{py: 1.25}}
        >
          {loading ? '登録中...' : '登録する'}
        </Button>
      </Box>

      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor: '#F9F9F9',
          borderRadius: 2,
          border: '1px solid #E0E0E0',
        }}
      >
        <Typography variant="body2" sx={{fontWeight: 600, mb: 0.5}}>
          📱 LINE友だち追加のお願い
        </Typography>
        <Typography variant="caption" color="text.secondary">
          マッチング通知や業務連絡をLINEでお届けします。登録後にLINE公式アカウントを友だち追加してください。
        </Typography>
      </Box>

      <Divider sx={{my: 3}} />

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{textAlign: 'center'}}
      >
        すでにアカウントをお持ちの方は{' '}
        <MuiLink
          component={NextLink}
          href="/login"
          color="primary"
          underline="hover"
        >
          ログイン
        </MuiLink>
      </Typography>
    </>
  );
}

interface RoleCardProps {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const RoleCard = ({
  selected,
  onClick,
  icon,
  title,
  description,
}: RoleCardProps) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      border: '2px solid',
      borderColor: selected ? '#F4A7B9' : '#E0E0E0',
      bgcolor: selected ? '#FFF0F3' : '#FFFFFF',
      transition: 'all 0.15s ease',
      '&:hover': {borderColor: '#F4A7B9'},
    }}
  >
    <CardContent
      sx={{
        textAlign: 'center',
        p: {xs: 1.5, md: 2},
        '&:last-child': {pb: {xs: 1.5, md: 2}},
      }}
    >
      {icon}
      <Typography variant="subtitle2" sx={{mt: 0.5, fontWeight: 700}}>
        {title}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{display: 'block', mt: 0.25, lineHeight: 1.4}}
      >
        {description}
      </Typography>
    </CardContent>
  </Card>
);

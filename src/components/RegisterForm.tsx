'use client';

import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import NextLink from 'next/link';

import ErrorAlert from '@/components/ErrorAlert';
import {registerCurrentUser} from '@/server/user';
import {UserRole, type RegisterRole} from '@/types/User';

// The credential step already happened on Logto; here a signed-in user only
// picks their role (RegisterRole — SEEKER / NURSERY) and agrees to the terms.
export default function RegisterForm() {
  const [role, setRole] = useState<RegisterRole | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
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
    try {
      // On success this redirects, so control does not return here.
      await registerCurrentUser(role);
    } catch {
      setError('登録に失敗しました。時間をおいて再度お試しください。');
      setLoading(false);
    }
  }

  return (
    <>
      <Box sx={{textAlign: 'center', mb: 3}}>
        <Typography
          variant="h1"
          sx={{fontSize: {xs: '1.5rem', md: '1.75rem'}, mb: 1}}
        >
          登録区分の選択
        </Typography>
        <Typography variant="body2" color="text.secondary">
          えんまーるへようこそ。区分を選んで登録を完了してください。
        </Typography>
      </Box>

      <ErrorAlert message={error} />

      <Box
        sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 3}}
      >
        <RoleCard
          selected={role === UserRole.SEEKER}
          onClick={() => setRole(UserRole.SEEKER)}
          icon={
            <ChildCareIcon
              sx={{
                fontSize: 36,
                color: role === UserRole.SEEKER ? '#F4A7B9' : '#AAAAAA',
              }}
            />
          }
          title="保育士"
          description="仕事を探している保育士・保育経験者"
        />
        <RoleCard
          selected={role === UserRole.NURSERY}
          onClick={() => setRole(UserRole.NURSERY)}
          icon={
            <ApartmentIcon
              sx={{
                fontSize: 36,
                color: role === UserRole.NURSERY ? '#F4A7B9' : '#AAAAAA',
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
          {loading ? '登録中...' : '登録を完了する'}
        </Button>
      </Box>
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

'use client';

import {useState} from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';

import NotificationBell from '@/components/NotificationBell';
import {signOut} from '@/server/auth-actions';
import {UserRole} from '@/types/User';

interface NavItem {
  label: string;
  href: string;
}

const SEEKER_NAV: NavItem[] = [
  {label: 'マイページ', href: '/mypage'},
  {label: 'プロフィール', href: '/profile'},
  {label: '書類', href: '/documents'},
  {label: '保育園を探す', href: '/nurseries'},
  {label: '応募履歴', href: '/applications'},
];

const NURSERY_NAV: NavItem[] = [
  {label: 'マイページ', href: '/nursery/mypage'},
  {label: '園プロフィール', href: '/nursery/profile'},
  {label: '募集管理', href: '/nursery/jobs'},
  {label: '応募管理', href: '/nursery/applications'},
];

const ADMIN_NAV: NavItem[] = [
  {label: 'マッチング管理', href: '/admin/matches'},
  {label: '書類確認', href: '/admin/documents'},
  {label: '評価確認', href: '/admin/reviews'},
];

const PUBLIC_NAV: NavItem[] = [
  {label: 'えんまーるとは', href: '/about'},
  {label: '保育園を探す', href: '/nurseries'},
];

function getNavItems(role: UserRole | null): NavItem[] {
  if (role === UserRole.SEEKER) return SEEKER_NAV;
  if (role === UserRole.NURSERY) return NURSERY_NAV;
  if (role === UserRole.ADMIN) return ADMIN_NAV;
  return PUBLIC_NAV;
}

interface Props {
  role?: UserRole | null;
  email?: string | null;
}

export default function Header({role = null, email = null}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navItems = getNavItems(role);

  function handleLogout() {
    // Server Action: ends the Logto session and redirects to the base URL.
    void signOut();
  }

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E0E0E0',
          color: '#333333',
        }}
      >
        <Toolbar sx={{px: {xs: 2, md: 3}, minHeight: {xs: 56, md: 64}}}>
          <Typography
            component={Link}
            href="/"
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#F4A7B9',
              textDecoration: 'none',
              fontSize: {xs: '1rem', md: '1.125rem'},
              flexGrow: 0,
              mr: 3,
            }}
          >
            えんまーる
          </Typography>

          <Box sx={{display: {xs: 'none', md: 'flex'}, gap: 0.5, flexGrow: 1}}>
            {navItems.map((item) => (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                color="inherit"
                size="small"
                sx={{fontSize: '0.875rem', color: '#666666'}}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{flexGrow: {xs: 1, md: 0}}} />

          <Box
            sx={{
              display: {xs: 'none', md: 'flex'},
              gap: 1,
              alignItems: 'center',
            }}
          >
            {role ? (
              <>
                <NotificationBell />
                {email && (
                  <Typography
                    variant="caption"
                    sx={{
                      maxWidth: 180,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {email}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleLogout}
                  sx={{
                    borderColor: '#AAAAAA',
                    color: '#666666',
                    fontSize: '0.8rem',
                  }}
                >
                  ログアウト
                </Button>
              </>
            ) : (
              <>
                <Button
                  component="a"
                  href="/login"
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: '#F4A7B9',
                    color: '#F4A7B9',
                    fontSize: '0.8rem',
                  }}
                >
                  ログイン
                </Button>
                <Button
                  component="a"
                  href="/register"
                  variant="contained"
                  size="small"
                  sx={{fontSize: '0.8rem'}}
                >
                  新規登録
                </Button>
              </>
            )}
          </Box>

          {role && (
            <Box sx={{display: {xs: 'flex', md: 'none'}}}>
              <NotificationBell />
            </Box>
          )}

          <IconButton
            edge="end"
            onClick={() => setDrawerOpen(true)}
            sx={{display: {xs: 'flex', md: 'none'}, color: '#666666'}}
            aria-label="メニューを開く"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{paper: {sx: {width: 260}}}}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{fontWeight: 700, color: '#F4A7B9', fontSize: '1rem'}}
          >
            えんまーる
          </Typography>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            size="small"
            aria-label="メニューを閉じる"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        <List dense>
          {navItems.map((item) => (
            <ListItem key={item.href} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText
                  primary={item.label}
                  slotProps={{primary: {variant: 'body2'}}}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        <Box sx={{p: 2, display: 'flex', flexDirection: 'column', gap: 1}}>
          {role ? (
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setDrawerOpen(false);
                handleLogout();
              }}
              sx={{borderColor: '#AAAAAA', color: '#666666'}}
            >
              ログアウト
            </Button>
          ) : (
            <>
              <Button
                component="a"
                href="/login"
                variant="outlined"
                fullWidth
                onClick={() => setDrawerOpen(false)}
                sx={{borderColor: '#F4A7B9', color: '#F4A7B9'}}
              >
                ログイン
              </Button>
              <Button
                component="a"
                href="/register"
                variant="contained"
                fullWidth
                onClick={() => setDrawerOpen(false)}
              >
                新規登録
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}

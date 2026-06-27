import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import SearchIcon from '@mui/icons-material/Search';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SessionHeader from '@/components/SessionHeader';
import SummaryCard from '@/components/SummaryCard';
import {requireRole} from '@/server/auth';
import {getSeekerDashboard} from '@/server/seeker';
import {UserRole} from '@/types/User';

// Reads the session, so it renders per-request.
export const dynamic = 'force-dynamic';

// Reviews are entered per completed engagement from the application history, so
// there is no standalone "評価を書く" entry here.
const NAV_CARDS = [
  {
    href: '/profile',
    icon: <AccountCircleIcon sx={{fontSize: 36, color: '#F4A7B9'}} />,
    title: 'プロフィール編集',
    description: '自己紹介や希望条件を設定',
  },
  {
    href: '/nurseries',
    icon: <SearchIcon sx={{fontSize: 36, color: '#F4A7B9'}} />,
    title: '保育園を探す',
    description: '保育園・募集を閲覧',
  },
  {
    href: '/applications',
    icon: <AssignmentIcon sx={{fontSize: 36, color: '#F4A7B9'}} />,
    title: '応募履歴',
    description: '応募した募集の状況を確認',
  },
];

export default async function SeekerMypagePage() {
  await requireRole([UserRole.SEEKER]);
  const dashboard = await getSeekerDashboard();

  return (
    <>
      <SessionHeader />
      <PageContainer>
        <Box sx={{mb: 3}}>
          <Typography
            variant="h1"
            sx={{fontSize: {xs: '1.25rem', md: '1.5rem'}, mb: 0.5}}
          >
            {dashboard.displayName
              ? `${dashboard.displayName}さん、こんにちは`
              : 'マイページ'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            えんまーるへようこそ
          </Typography>
        </Box>

        {!dashboard.hasProfile && (
          <Alert severity="info" sx={{mb: 3}}>
            プロフィールを作成すると応募できるようになります。{' '}
            <MuiLink href="/profile" underline="hover">
              プロフィールを作成
            </MuiLink>
          </Alert>
        )}

        {dashboard.hasProfile && dashboard.hasMissingRequiredDocuments && (
          <Alert
            severity="warning"
            icon={<FolderIcon />}
            sx={{mb: 3}}
            action={
              <MuiLink
                href="/documents"
                underline="always"
                variant="caption"
                sx={{color: 'inherit', whiteSpace: 'nowrap'}}
              >
                書類管理へ
              </MuiLink>
            }
          >
            応募には健康診断書・履歴書の認証が必要です。
          </Alert>
        )}

        {dashboard.hasProfile &&
          !dashboard.hasMissingRequiredDocuments &&
          dashboard.hasPendingDocuments && (
            <Alert severity="info" icon={<FolderIcon />} sx={{mb: 3}}>
              書類を確認中です。認証まで少々お待ちください。
            </Alert>
          )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.5,
            mb: 3,
          }}
        >
          <SummaryCard
            label="応募件数"
            value={dashboard.applicationCount}
            unit="件"
          />
          <SummaryCard
            label="進行中のマッチング"
            value={dashboard.activeEngagementCount}
            unit="件"
          />
        </Box>

        <Grid container spacing={1.5}>
          {NAV_CARDS.map((card) => (
            <Grid size={{xs: 6, md: 3}} key={card.href}>
              <Card sx={{height: '100%'}}>
                <CardActionArea
                  href={card.href}
                  sx={{height: '100%', alignItems: 'flex-start'}}
                >
                  <CardContent sx={{p: {xs: 1.5, md: 2}}}>
                    <Box sx={{mb: 1}}>{card.icon}</Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 0.5,
                        fontWeight: 700,
                        fontSize: {xs: '0.8rem', md: '0.875rem'},
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{lineHeight: 1.4}}
                    >
                      {card.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </PageContainer>
      <Footer />
    </>
  );
}

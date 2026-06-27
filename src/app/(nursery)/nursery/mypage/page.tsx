import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BusinessIcon from '@mui/icons-material/Business';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WorkIcon from '@mui/icons-material/Work';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SessionHeader from '@/components/SessionHeader';
import SummaryCard from '@/components/SummaryCard';
import {requireRole} from '@/server/auth';
import {getNurseryDashboard} from '@/server/nursery';
import {UserRole} from '@/types/User';

// Reads the session, so it renders per-request.
export const dynamic = 'force-dynamic';

// Reviews are entered per completed engagement from the application inbox, so
// there is no standalone "評価を書く" entry here.
const NAV_CARDS = [
  {
    href: '/nursery/profile',
    icon: <BusinessIcon sx={{fontSize: 36, color: '#F4A7B9'}} />,
    title: '園プロフィール',
    description: '園の基本情報・コンセプト',
  },
  {
    href: '/nursery/jobs',
    icon: <WorkIcon sx={{fontSize: 36, color: '#F4A7B9'}} />,
    title: '募集管理',
    description: 'スポット募集の作成・管理',
  },
  {
    href: '/nursery/applications',
    icon: <AssignmentIndIcon sx={{fontSize: 36, color: '#F4A7B9'}} />,
    title: '応募管理',
    description: '届いた応募の確認',
  },
];

export default async function NurseryMypagePage() {
  await requireRole([UserRole.NURSERY]);
  const dashboard = await getNurseryDashboard();

  return (
    <>
      <SessionHeader />
      <PageContainer>
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography
              variant="h1"
              sx={{fontSize: {xs: '1.25rem', md: '1.5rem'}, mb: 0.25}}
            >
              {dashboard.nurseryName ?? 'マイページ'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              えんまーる 保育園ダッシュボード
            </Typography>
          </Box>
          <Chip
            label={dashboard.isPublished ? '公開中' : '非公開'}
            size="small"
            sx={{
              bgcolor: dashboard.isPublished ? '#E8F5E9' : '#F9F9F9',
              color: dashboard.isPublished ? '#2E7D32' : '#AAAAAA',
              fontSize: '0.75rem',
            }}
          />
          {dashboard.id && (
            <Button
              href={`/nurseries/${dashboard.id}`}
              variant="outlined"
              size="small"
              startIcon={<VisibilityIcon />}
              sx={{
                ml: {sm: 'auto'},
                borderColor: '#F4A7B9',
                color: '#F4A7B9',
                fontSize: '0.75rem',
              }}
            >
              {dashboard.isPublished
                ? '公開ページを見る'
                : '公開ページをプレビュー'}
            </Button>
          )}
        </Box>

        {!dashboard.hasProfile && (
          <Alert severity="info" sx={{mb: 3}}>
            園プロフィールを作成・公開すると保育士に表示されます。{' '}
            <MuiLink href="/nursery/profile" underline="hover">
              園プロフィールを作成
            </MuiLink>
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
            label="公開中の募集"
            value={dashboard.openJobCount}
            unit="件"
          />
          <SummaryCard
            label="新着応募"
            value={dashboard.newApplicationCount}
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

import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import SecurityIcon from '@mui/icons-material/Security';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'えんまーるとは',
  description:
    'えんまーるは、保育士と保育園をつなぐスポットマッチングプラットフォームです。',
};

// Renders SiteHeader (reads the session), so it renders per-request.
export const dynamic = 'force-dynamic';

const FEATURES = [
  {
    icon: <ChildCareIcon sx={{fontSize: 40, color: '#F4A7B9'}} />,
    title: 'ブランク歓迎',
    body: '育休中・育児中・ブランクあり、どんな状況の保育士でも活躍できます。希望の曜日・時間帯で働けます。',
  },
  {
    icon: <ApartmentIcon sx={{fontSize: 40, color: '#F4A7B9'}} />,
    title: '保育園に合ったサポート',
    body: '単発から継続まで、柔軟なスポットサポートで保育園の人手不足を解消します。',
  },
  {
    icon: <SecurityIcon sx={{fontSize: 40, color: '#F4A7B9'}} />,
    title: '安心のマッチング',
    body: '管理者が仲介するため、個人情報はマッチング成立まで保護されます。LINEで通知も届きます。',
  },
];

const STEPS = [
  {
    step: 1,
    title: '登録',
    body: 'メールアドレスとパスワードで無料登録。保育士・保育園のどちらか選択してください。',
  },
  {
    step: 2,
    title: 'プロフィール設定',
    body: '保育士は希望条件・経験を、保育園はコンセプト・募集内容を入力します。',
  },
  {
    step: 3,
    title: '応募・マッチング',
    body: '保育士が気になる募集に応募。管理者が確認しマッチング成立のお知らせをします。',
  },
  {
    step: 4,
    title: '業務実施',
    body: 'マッチング成立後、保育園と詳細調整。当日は安心して業務に取り組めます。',
  },
  {
    step: 5,
    title: '評価',
    body: '業務完了後、双方が評価を記入。次のマッチングに活かせます。',
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <PageContainer maxWidth="md">
        <Box sx={{mb: 4}}>
          <Typography
            variant="h1"
            sx={{fontSize: {xs: '1.5rem', md: '2rem'}, mb: 1.5}}
          >
            えんまーるとは
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{lineHeight: 1.8}}
          >
            えんまーるは、保育士と保育園をつなぐスポットマッチングプラットフォームです。
            育児や家庭の事情でフルタイムが難しい保育士と、日々の保育サポートを必要とする保育園を、
            安心・安全にマッチングします。
          </Typography>
        </Box>

        <SectionHeading>えんまーるの特徴</SectionHeading>
        <Grid container spacing={{xs: 1.5, md: 2}} sx={{mb: 4}}>
          {FEATURES.map((item) => (
            <Grid size={{xs: 12, md: 4}} key={item.title}>
              <Card sx={{height: '100%'}}>
                <CardContent sx={{p: {xs: 2, md: 3}, textAlign: 'center'}}>
                  <Box sx={{mb: 1.5}}>{item.icon}</Box>
                  <Typography
                    variant="h3"
                    sx={{fontSize: '1rem', fontWeight: 700, mb: 1}}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{lineHeight: 1.7}}
                  >
                    {item.body}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <SectionHeading>利用の流れ</SectionHeading>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mb: 4}}>
          {STEPS.map((item) => (
            <Box
              key={item.step}
              sx={{
                display: 'flex',
                gap: {xs: 1.5, md: 2},
                p: {xs: 1.5, md: 2},
                bgcolor: '#F9F9F9',
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: '#F4A7B9',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                {item.step}
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{fontWeight: 700, mb: 0.25}}
                >
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.body}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </PageContainer>
      <Footer />
    </>
  );
}

import type {Metadata} from 'next';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VerifiedIcon from '@mui/icons-material/Verified';

import Footer from '@/components/Footer';
import SessionHeader from '@/components/SessionHeader';

function SakuraDecoration({
  size,
  opacity,
  rotate,
  position,
}: {
  size: number;
  opacity: number;
  rotate: number;
  position: {top?: number; bottom?: number; left?: number; right?: number};
}) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'absolute',
        ...position,
        width: size,
        opacity,
        transform: `rotate(${rotate}deg)`,
        pointerEvents: 'none',
        zIndex: 1,
        display: {xs: 'none', md: 'block'},
      }}
    >
      <Image src="/kasumin-sakura.png" alt="" width={size} height={size} />
    </Box>
  );
}

export const metadata: Metadata = {
  title: 'えんまーる | 保育士と保育園のスポットマッチング',
  description:
    'えんまーるは、短時間から始められる新しい「復職支援」の形。保育専門のスポットマッチングで、自分に合った働き方を探す保育士と、安心して子どもと向き合いたい保育園を丁寧にサポートします。',
};

// Renders SessionHeader, which reads the session, so it renders per-request
// (still SSR'd for SEO). Needed so a signed-in visitor sees their own header.
export const dynamic = 'force-dynamic';

const FEATURES = [
  {
    icon: <AccessTimeIcon sx={{fontSize: 40, color: '#F4A7B9'}} />,
    title: '柔軟な働き方',
    body: '午前のみ・単発・週1など、ライフスタイルに合わせた働き方が選べます。',
  },
  {
    icon: <VerifiedIcon sx={{fontSize: 40, color: '#F4A7B9'}} />,
    title: '安心の仲介',
    body: '管理者が間に入るため、個人情報はマッチング成立まで守られます。',
  },
  {
    icon: <NotificationsIcon sx={{fontSize: 40, color: '#F4A7B9'}} />,
    title: 'LINE通知',
    body: 'マッチングや業務連絡をLINEでお届け。見逃しがありません。',
  },
];

const STEPS = [
  {
    step: 1,
    title: '無料登録',
    body: 'メールアドレスで簡単登録。保育士か保育園かを選ぶだけ。',
  },
  {
    step: 2,
    title: 'プロフィール設定',
    body: '希望条件・経験などを入力して、プロフィールを完成させましょう。',
  },
  {
    step: 3,
    title: '応募・マッチング',
    body: '気になる募集に応募すると、管理者が確認してマッチングをサポートします。',
  },
  {
    step: 4,
    title: '業務実施',
    body: 'マッチング成立後、保育園と詳細を調整して業務に取り組みます。',
  },
  {
    step: 5,
    title: '評価',
    body: '業務完了後に双方が評価を記入。次のマッチングに活かせます。',
  },
];

const TRUST_POINTS = [
  '本名・連絡先はマッチング成立まで非開示',
  '管理者が全マッチングを確認・承認',
  '評価システムで透明性を確保',
  'LINEで安全に通知',
];

export default function Home() {
  return (
    <>
      <SessionHeader />

      {/* 1. Hero */}
      <Box
        sx={{
          position: 'relative',
          bgcolor: '#FFFFFF',
          minHeight: 'min(76dvh, 660px)',
          pt: '56px',
          pb: '64px',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* background image */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            '& img': {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 30%',
              opacity: 0.26,
              maskImage:
                'radial-gradient(ellipse 82% 86% at 50% 46%, #000 22%, transparent 78%)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(ellipse 62% 58% at 50% 46%, rgba(255,255,255,.78) 0%, rgba(255,255,255,.42) 52%, rgba(255,255,255,0) 100%)',
            },
          }}
        >
          <Image src="/hero.jpg" alt="" fill priority />
        </Box>

        {/* sakura decorations */}
        <SakuraDecoration
          size={190}
          opacity={0.35}
          rotate={12}
          position={{top: 16, right: 24}}
        />
        <SakuraDecoration
          size={150}
          opacity={0.28}
          rotate={-18}
          position={{bottom: 16, left: 24}}
        />

        {/* copy */}
        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            zIndex: 2,
            px: {xs: 2, md: 3},
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '22px',
          }}
        >
          {/* eyebrow label */}
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: '16px',
              py: '7px',
              borderRadius: '24px',
              bgcolor: '#FFF0F3',
              color: '#F4A7B9',
              fontSize: '.8rem',
              fontWeight: 700,
              letterSpacing: '.03em',
            }}
          >
            保育専門のスポットマッチング
          </Box>

          {/* heading */}
          <Typography
            variant="h1"
            sx={{
              fontSize: 'clamp(2rem, 4.4vw, 3.1rem)',
              fontWeight: 700,
              lineHeight: 1.42,
              letterSpacing: '.01em',
              textWrap: 'balance',
              mb: 0,
            }}
          >
            保育士と保育園を
            <br />
            <Box component="span" sx={{color: '#F4A7B9'}}>
              ご縁
            </Box>
            でつなぐ
          </Typography>

          {/* subcopy */}
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: 'clamp(.95rem, 1.15vw, 1.0625rem)',
              lineHeight: 1.95,
              maxWidth: 600,
              mx: 'auto',
              textWrap: 'pretty',
              mb: 0,
            }}
          >
            えんまーるは、短時間から始められる新しい「復職支援」の形。
            <Box component="br" sx={{display: {xs: 'none', sm: 'inline'}}} />
            保育専門のスポットマッチングで、自分に合った働き方を探す保育士と、安心して子どもと向き合いたい保育園を丁寧にサポートします。
          </Typography>

          {/* primary CTA */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Button
              component="a"
              href="/signup"
              variant="contained"
              size="large"
              sx={{
                px: '44px',
                py: '15px',
                fontSize: '1.0625rem',
                boxShadow: '0 6px 18px rgba(244,167,185,.20)',
              }}
            >
              まずは登録してみる
            </Button>
            <Typography variant="caption" sx={{fontSize: '.78rem'}}>
              登録は無料・いつでも退会できます
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* 2. About */}
      <Box sx={{bgcolor: '#FFFFFF', py: {xs: 5, md: 7}}}>
        <Container maxWidth="md" sx={{px: {xs: 2, md: 3}}}>
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontSize: {xs: '1.25rem', md: '1.5rem'},
            }}
          >
            えんまーるとは
          </Typography>
          <Grid container spacing={{xs: 3, md: 5}} sx={{alignItems: 'center'}}>
            <Grid size={{xs: 12, md: 6}}>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{lineHeight: 2, textWrap: 'pretty'}}
              >
                えんまーるは、保育士と保育園をつなぐ保育専門のスポットマッチングサービスです。「また働きたいけど、いきなりフルタイムは不安」そんな声に応えて生まれました。午前のみ・単発・週1など、ライフスタイルに合わせた柔軟な働き方で、あなたにぴったりのご縁を結びます。子ども・保育士・保育園の笑顔がつながる良い循環をえんまーるはサポートします。
              </Typography>
            </Grid>
            <Grid size={{xs: 12, md: 6}}>
              <Image
                src="/about-illustration.png"
                alt="保育士・保育園・相互評価がつながる循環のイラスト"
                width={600}
                height={600}
                style={{width: '100%', height: 'auto'}}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 3. Two audiences */}
      <Box sx={{bgcolor: '#F9F9F9', py: {xs: 5, md: 7}}}>
        <Container maxWidth="md" sx={{px: {xs: 2, md: 3}}}>
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              mb: 3,
              fontSize: {xs: '1.25rem', md: '1.5rem'},
            }}
          >
            あなたはどちらですか？
          </Typography>
          <Grid container spacing={{xs: 1.5, md: 2}}>
            <Grid size={{xs: 12, sm: 6}}>
              <Card
                sx={{
                  height: '100%',
                  border: '2px solid transparent',
                  '&:hover': {borderColor: '#F4A7B9'},
                  transition: 'all 0.2s',
                }}
              >
                <CardContent sx={{p: {xs: 2.5, md: 3}, textAlign: 'center'}}>
                  <ChildCareIcon
                    sx={{fontSize: 48, color: '#F4A7B9', mb: 1.5}}
                  />
                  <Typography
                    variant="h3"
                    sx={{fontSize: '1.125rem', fontWeight: 700, mb: 1}}
                  >
                    保育士・保育補助希望の方
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{mb: 2.5, lineHeight: 1.7}}
                  >
                    午前だけ・週1回から。自分の「好き」や「得意」を活かして、希望のスタイルで働けます。
                  </Typography>
                  <Button
                    component="a"
                    href="/signup"
                    variant="contained"
                    fullWidth
                    sx={{py: 1.25}}
                  >
                    保育士として登録
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <Card
                sx={{
                  height: '100%',
                  border: '2px solid transparent',
                  '&:hover': {borderColor: '#F4A7B9'},
                  transition: 'all 0.2s',
                }}
              >
                <CardContent sx={{p: {xs: 2.5, md: 3}, textAlign: 'center'}}>
                  <ApartmentIcon
                    sx={{fontSize: 48, color: '#F4A7B9', mb: 1.5}}
                  />
                  <Typography
                    variant="h3"
                    sx={{fontSize: '1.125rem', fontWeight: 700, mb: 1}}
                  >
                    保育園・施設運営の方
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{mb: 2.5, lineHeight: 1.7}}
                  >
                    日々の保育や行事の準備、休憩・お休みの確保まで、「保育バディ」がお手伝いします。
                  </Typography>
                  <Button
                    component="a"
                    href="/signup"
                    variant="outlined"
                    fullWidth
                    sx={{py: 1.25, borderColor: '#F4A7B9', color: '#F4A7B9'}}
                  >
                    保育園として登録
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 4. Features */}
      <Box sx={{bgcolor: '#FFFFFF', py: {xs: 5, md: 7}}}>
        <Container maxWidth="lg" sx={{px: {xs: 2, md: 3}}}>
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              mb: 3,
              fontSize: {xs: '1.25rem', md: '1.5rem'},
            }}
          >
            えんまーるの特徴
          </Typography>
          <Grid container spacing={{xs: 1.5, md: 2}}>
            {FEATURES.map((item) => (
              <Grid size={{xs: 12, md: 4}} key={item.title}>
                <Box sx={{textAlign: 'center', p: {xs: 1.5, md: 2}}}>
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
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 5. How it works */}
      <Box sx={{bgcolor: '#F9F9F9', py: {xs: 5, md: 7}}}>
        <Container maxWidth="md" sx={{px: {xs: 2, md: 3}}}>
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              mb: 3,
              fontSize: {xs: '1.25rem', md: '1.5rem'},
            }}
          >
            ご利用の流れ
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
            {STEPS.map((item) => (
              <Box
                key={item.step}
                sx={{
                  display: 'flex',
                  gap: 2,
                  p: {xs: 1.5, md: 2},
                  bgcolor: '#FFFFFF',
                  borderRadius: 2,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
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
                  <Typography variant="subtitle2" sx={{fontWeight: 700}}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.body}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* 6. Trust */}
      <Box sx={{bgcolor: '#FFFFFF', py: {xs: 5, md: 7}}}>
        <Container maxWidth="md" sx={{px: {xs: 2, md: 3}, textAlign: 'center'}}>
          <Typography
            variant="h2"
            sx={{mb: 2, fontSize: {xs: '1.25rem', md: '1.5rem'}}}
          >
            安心してご利用いただけます
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{mb: 3, maxWidth: 480, mx: 'auto', lineHeight: 1.8}}
          >
            えんまーるは、保育士の個人情報をマッチング成立まで保護します。
            管理者が仲介するため、直接のやりとりは成立後のみ。安心して応募・マッチングができます。
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              flexDirection: 'column',
              gap: 1,
              textAlign: 'left',
              bgcolor: '#F9F9F9',
              borderRadius: 3,
              p: {xs: 2, md: 3},
            }}
          >
            {TRUST_POINTS.map((item) => (
              <Box
                key={item}
                sx={{display: 'flex', alignItems: 'center', gap: 1}}
              >
                <VerifiedIcon sx={{fontSize: 18, color: '#F4A7B9'}} />
                <Typography variant="body2">{item}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* 7. CTA */}
      <Box sx={{bgcolor: '#F9F9F9', py: {xs: 5, md: 7}}}>
        <Container maxWidth="sm" sx={{px: {xs: 2, md: 3}, textAlign: 'center'}}>
          <Typography
            variant="h2"
            sx={{mb: 1.5, fontSize: {xs: '1.25rem', md: '1.5rem'}}}
          >
            さあ、始めましょう
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
            登録は無料。いつでも退会できます。
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
            <Button
              component="a"
              href="/signup"
              variant="contained"
              size="large"
              fullWidth
              sx={{py: 1.5, fontSize: '1rem', borderRadius: 3}}
            >
              無料で登録する
            </Button>
            <Button
              href="/nurseries"
              variant="outlined"
              size="large"
              fullWidth
              sx={{
                py: 1.5,
                fontSize: '1rem',
                borderRadius: 3,
                borderColor: '#F4A7B9',
                color: '#F4A7B9',
              }}
            >
              保育園を見てみる
            </Button>
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
}

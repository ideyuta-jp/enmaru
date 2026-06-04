import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageContainer from '@/components/PageContainer';

export const metadata: Metadata = {
  title: '利用規約',
};

const SECTIONS = [
  {
    title: '第1条（適用）',
    body: 'この利用規約（以下「本規約」）は、えんまーる（以下「本サービス」）の利用条件を定めるものです。登録ユーザーの皆さまは、本規約に同意のうえ本サービスをご利用ください。',
  },
  {
    title: '第2条（利用登録）',
    body: '本サービスの利用を希望する方は、本規約に同意のうえ、所定の方法により利用登録を申請してください。登録の承認をもって利用登録が完了します。',
  },
  {
    title: '第3条（個人情報の取り扱い）',
    body: '本サービスは、登録された個人情報をプライバシーポリシーに従い適切に管理します。保育士の本名・連絡先等の情報は、マッチング成立まで保育園に開示されません。',
  },
  {
    title: '第4条（禁止事項）',
    body: '利用者は以下の行為を行ってはなりません。\n・法令または公序良俗に違反する行為\n・詐欺・なりすましなどの不正行為\n・他の利用者への迷惑行為\n・本サービスの運営を妨害する行為\n・その他、運営者が不適切と判断する行為',
  },
  {
    title: '第5条（免責事項）',
    body: '本サービスは、マッチングの場を提供するものであり、マッチング後の雇用・業務に関するトラブルについては責任を負いません。利用者間のトラブルは当事者間で解決してください。',
  },
  {
    title: '第6条（規約の変更）',
    body: '運営者は、必要に応じて本規約を変更することがあります。変更後の規約は本サービス上に掲示した時点で効力を生じます。',
  },
];

export default function TermsPage() {
  return (
    <>
      <Header />
      <PageContainer maxWidth="md">
        <Typography
          variant="h1"
          sx={{fontSize: {xs: '1.375rem', md: '1.75rem'}, mb: 1}}
        >
          利用規約
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{display: 'block', mb: 3}}
        >
          最終更新日：2025年1月1日
        </Typography>

        <Divider sx={{mb: 3}} />

        {SECTIONS.map((section) => (
          <Box key={section.title} sx={{mb: 3}}>
            <Typography variant="subtitle1" sx={{fontWeight: 700, mb: 1}}>
              {section.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{whiteSpace: 'pre-wrap', lineHeight: 1.8}}
            >
              {section.body}
            </Typography>
          </Box>
        ))}
      </PageContainer>
      <Footer />
    </>
  );
}

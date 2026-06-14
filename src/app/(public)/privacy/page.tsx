import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SiteHeader from '@/components/SiteHeader';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
};

// Renders SiteHeader (reads the session), so it renders per-request.
export const dynamic = 'force-dynamic';

const SECTIONS = [
  {
    title: '1. 収集する情報',
    body: '本サービスは、以下の個人情報を収集します。\n・メールアドレス\n・氏名（保育士の場合：表示名・本名）\n・保育施設情報（保育園の場合）\n・利用履歴・評価情報',
  },
  {
    title: '2. 利用目的',
    body: '収集した個人情報は以下の目的で利用します。\n・サービスの提供・運営\n・マッチングの仲介\n・お問い合わせへの対応\n・サービス改善のための分析',
  },
  {
    title: '3. 第三者提供',
    body: '本サービスは、法令に基づく場合を除き、ご本人の同意なく第三者に個人情報を提供しません。ただし、マッチング成立後は、業務遂行に必要な範囲でマッチング相手に情報を開示します。',
  },
  {
    title: '4. 情報の管理',
    body: '収集した個人情報は、不正アクセス・紛失・破壊・改ざん・漏洩を防ぐため、適切なセキュリティ対策を実施します。',
  },
  {
    title: '5. お問い合わせ',
    body: '個人情報の取り扱いに関するお問い合わせは、本サービスのお問い合わせフォームよりご連絡ください。',
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <PageContainer maxWidth="md">
        <Typography
          variant="h1"
          sx={{fontSize: {xs: '1.375rem', md: '1.75rem'}, mb: 1}}
        >
          プライバシーポリシー
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

import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SessionHeader from '@/components/SessionHeader';

export const metadata: Metadata = {
  title: '利用規約（保育士）',
};

export const dynamic = 'force-dynamic';

const SECTIONS = [
  {
    title: '第1条（適用）',
    body: '合同会社KASUMINが提供する保育人材プラットフォーム「えんまーる」（以下「本サービス」）の保育士ユーザー向け利用条件を定めるものです。本サービスを利用するにあたり、本規約に同意のうえご利用ください。',
  },
  {
    title: '第2条（サービス内容）',
    body: '本サービスは、保育施設情報の提供と働き方選択肢の提供を行うプラットフォームです。本サービスは職業紹介事業ではなく、雇用契約の成立を保証するものではありません。',
  },
  {
    title: '第3条（登録）',
    body: '本サービスの利用には、氏名、保有資格、勤務希望条件、連絡先などの情報登録が必要です。登録情報に変更が生じた場合は、速やかに更新してください。',
  },
  {
    title: '第4条（利用料金）',
    body: '保育士ユーザーの本サービス利用は現在無料です。',
  },
  {
    title: '第5条（禁止事項）',
    body: '利用者は以下の行為を行ってはなりません。\n・虚偽情報の登録\n・施設への不適切な対応\n・本サービスを通じて得た情報の無断利用\n・法令または公序良俗に違反する行為\n・その他、運営者が不適切と判断する行為',
  },
  {
    title: '第6条（マッチング後の責任）',
    body: '勤務先施設との契約判断は利用者の自己責任において行われます。勤務開始後のトラブルについて当社は責任を負いません。利用者間のトラブルは当事者間で解決してください。',
  },
  {
    title: '第7条（退会）',
    body: 'いつでも退会することができます。ただし、勤務予定が確定している場合は、原則として1ヶ月前までに申し出てください。',
  },
  {
    title: '第8条（免責事項）',
    body: '本サービスは、マッチングの場を提供するものであり、マッチングの成立や雇用の継続を保証するものではありません。システム障害・第三者による不正アクセス等による損害についても、当社は責任を負いません。',
  },
  {
    title: '第9条（規約の変更）',
    body: '当社は必要に応じて本規約を変更することがあります。変更後の規約は本サービス上に掲示した時点で効力を生じます。',
  },
  {
    title: '第10条（準拠法）',
    body: '本規約は日本法に準拠し、本規約に関する一切の紛争については、当社所在地を管轄する裁判所を専属的合意管轄とします。',
  },
];

export default function SeekerTermsPage() {
  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="md">
        <Typography
          variant="h1"
          sx={{fontSize: {xs: '1.375rem', md: '1.75rem'}, mb: 1}}
        >
          利用規約（保育士）
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{display: 'block', mb: 3}}
        >
          合同会社KASUMIN
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

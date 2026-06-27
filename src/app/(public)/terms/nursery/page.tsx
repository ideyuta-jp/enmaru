import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SessionHeader from '@/components/SessionHeader';

export const metadata: Metadata = {
  title: '利用規約（保育園）',
};

export const dynamic = 'force-dynamic';

const SECTIONS = [
  {
    title: '第1条（定義）',
    body: '本規約において、以下の用語は次の意味で使用します。\n・本サービス：保育施設と保育士をつなぐ情報提供プラットフォーム「えんまーる」\n・施設ユーザー：本サービスに登録した保育施設\n・保育士ユーザー：本サービスに登録した保育士または保育資格保有者\n・マッチング：施設ユーザーと保育士ユーザーが接点を持ち、勤務または業務委託等の関係が成立した状態',
  },
  {
    title: '第2条（サービスの位置付け）',
    body: '本サービスは「特定情報等提供事業」として運営されており、「職業紹介事業」ではありません。雇用の成立を保証するものではなく、契約条件の決定および雇用契約の締結は両者の責任において行われます。',
  },
  {
    title: '第3条（登録）',
    body: '利用希望者は所定の方法で登録申請を行い、当社が審査のうえ登録可否を判断します。登録情報は正確に入力し、変更が生じた場合は速やかに更新してください。',
  },
  {
    title: '第4条（サービス内容）',
    body: '本サービスでは以下を提供します。\n・施設情報の掲載\n・保育士ユーザーへの情報提供\n・マッチング後のコミュニケーション支援\n・働き方の提案・関係構築支援\n・マッチング後の定着支援',
  },
  {
    title: '第5条（利用料金）',
    body: '掲載導入サポート料：無料（実証期間：2026年4月1日〜2027年3月31日。以降継続希望の場合は年額26,400円税込）\n\n本サービスは成功報酬型ではなく、支援サービスの対価として料金を設定しています。',
  },
  {
    title: '第6条（支払方法）',
    body: '請求書に基づく銀行振込とします。支払期限を超過した場合、年14.5％の遅延損害金が発生することがあります。',
  },
  {
    title: '第7条（禁止事項）',
    body: '施設ユーザーは以下の行為を行ってはなりません。\n・法令または公序良俗に違反する行為\n・虚偽情報の掲載\n・保育士ユーザーへの不適切な勧誘\n・本サービスを介さない不正な直接取引\n・当社の運営を妨げる行為',
  },
  {
    title: '第8条（解約）',
    body: '所定の方法により解約することができます。途中解約の場合も既に発生した料金は返金されません。期間満了日の1ヶ月前までに申し出がない場合は自動更新となり、同額の年間利用料が発生します。',
  },
  {
    title: '第9条（免責）',
    body: 'マッチングの成立や雇用の継続を保証するものではありません。施設ユーザーと保育士ユーザー間のトラブルについて当社は責任を負いません。',
  },
  {
    title: '第10条（サービスの変更・停止）',
    body: '当社は必要に応じてサービス内容の変更または停止を行うことができます。これにより生じた損害について当社は責任を負いません。',
  },
  {
    title: '第11条（秘密保持）',
    body: '本サービスを通じて知り得た相手方の情報を、正当な理由なく第三者に開示・漏洩してはなりません。',
  },
  {
    title: '第12条（規約の変更）',
    body: '当社は必要に応じて本規約を変更することができます。変更後は通知または本サービス上への掲載により効力を生じます。',
  },
  {
    title: '第13条（準拠法・管轄）',
    body: '本規約は日本法に準拠します。本規約に関する一切の紛争については、当社所在地を管轄する裁判所を専属的合意管轄とします。',
  },
];

export default function NurseryTermsPage() {
  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="md">
        <Typography
          variant="h1"
          sx={{fontSize: {xs: '1.375rem', md: '1.75rem'}, mb: 1}}
        >
          利用規約（保育園）
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

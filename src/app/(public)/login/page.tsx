import type {Metadata} from 'next';

import LoginForm from '@/components/LoginForm';
import PageContainer from '@/components/PageContainer';

export const metadata: Metadata = {
  title: 'ログイン',
};

export default function LoginPage() {
  return (
    <PageContainer maxWidth="sm">
      <LoginForm />
    </PageContainer>
  );
}

import type {Metadata} from 'next';

import PageContainer from '@/components/PageContainer';
import RegisterForm from '@/components/RegisterForm';

export const metadata: Metadata = {
  title: '新規登録',
};

export default function RegisterPage() {
  return (
    <PageContainer maxWidth="sm">
      <RegisterForm />
    </PageContainer>
  );
}

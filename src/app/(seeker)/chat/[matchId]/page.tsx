import {notFound} from 'next/navigation';

import ChatPanel from '@/components/ChatPanel';
import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SessionHeader from '@/components/SessionHeader';
import {getChatThread} from '@/server/chat';

interface Props {
  params: Promise<{matchId: string}>;
}

export default async function SeekerChatPage({params}: Props) {
  const {matchId} = await params;
  const thread = await getChatThread(matchId);
  if (!thread) notFound();

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="sm">
        <ChatPanel initial={thread} />
      </PageContainer>
      <Footer />
    </>
  );
}

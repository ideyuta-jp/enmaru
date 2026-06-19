import {notFound} from 'next/navigation';

import ChatPanel from '@/components/ChatPanel';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import PageContainer from '@/components/PageContainer';
import {getChatThread} from '@/server/chat';

interface Props {
  params: Promise<{matchId: string}>;
}

export default async function NurseryChatPage({params}: Props) {
  const {matchId} = await params;
  const thread = await getChatThread(matchId);
  if (!thread) notFound();

  return (
    <>
      <Header role="NURSERY" />
      <PageContainer maxWidth="sm">
        <ChatPanel initial={thread} />
      </PageContainer>
      <Footer />
    </>
  );
}

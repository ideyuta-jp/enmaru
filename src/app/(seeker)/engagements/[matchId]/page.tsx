import {notFound} from 'next/navigation';
import Box from '@mui/material/Box';

import ChatPanel from '@/components/ChatPanel';
import Footer from '@/components/Footer';
import MatchDetailSummary from '@/components/MatchDetailSummary';
import PageContainer from '@/components/PageContainer';
import SessionHeader from '@/components/SessionHeader';
import WorkFlowActions from '@/components/WorkFlowActions';
import {getChatThread} from '@/server/chat';
import {getEngagementSummary} from '@/server/engagement';

interface Props {
  params: Promise<{matchId: string}>;
}

export default async function SeekerEngagementPage({params}: Props) {
  const {matchId} = await params;
  const [thread, summary] = await Promise.all([
    getChatThread(matchId),
    getEngagementSummary(matchId),
  ]);
  if (!thread || !summary) notFound();

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="sm">
        <MatchDetailSummary summary={summary} />
        <Box sx={{mb: 3}}>
          <WorkFlowActions
            engagementId={matchId}
            engagementStatus={summary.engagementStatus}
            viewerParty={summary.viewerParty}
            seekerReported={summary.seekerReported}
            nurseryReported={summary.nurseryReported}
          />
        </Box>
        <ChatPanel initial={thread} />
      </PageContainer>
      <Footer />
    </>
  );
}

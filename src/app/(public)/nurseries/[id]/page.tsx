import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {notFound} from 'next/navigation';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import SessionHeader from '@/components/SessionHeader';
import {getNurseryDetailForViewer} from '@/server/nursery';

// Public page (no auth guard), so the header must reflect the actual session
// rather than assume SEEKER. Reads the session, hence force-dynamic.
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{id: string}>;
}

export default async function SeekerNurseryDetailPage({params}: Props) {
  const {id} = await params;
  const result = await getNurseryDetailForViewer(id);

  if (!result) notFound();

  const {detail: nursery, isOwnerPreview} = result;
  const rating = nursery.rating;
  const location = [nursery.prefecture, nursery.city].filter(Boolean).join(' ');

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="md">
        {isOwnerPreview && (
          <Alert severity="info" sx={{mb: 3}}>
            これは未公開のプレビューです。保育士にはまだ表示されていません。公開すると一般に表示されます。
          </Alert>
        )}
        <Box sx={{mb: 3}}>
          <Typography
            variant="h1"
            sx={{fontSize: {xs: '1.375rem', md: '1.75rem'}, mb: 1}}
          >
            {nursery.nurseryName}
          </Typography>
          {location && (
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5}}>
              <LocationOnIcon sx={{fontSize: 16, color: '#AAAAAA'}} />
              <Typography variant="body2" color="text.secondary">
                {location}
              </Typography>
            </Box>
          )}
          {rating && rating.count > 0 && (
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              <Rating
                value={rating.total}
                precision={0.1}
                readOnly
                size="small"
                sx={{
                  '& .MuiRating-iconFilled': {color: '#F4A7B9'},
                  '& .MuiRating-iconEmpty': {color: '#AAAAAA'},
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {rating.total.toFixed(1)} ({rating.count}件)
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{mb: 3}} />

        {nursery.featureTags.length > 0 && (
          <Box sx={{mb: 3}}>
            <SectionHeading>園の特徴</SectionHeading>
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: nursery.featureNote ? 1.5 : 0}}>
              {nursery.featureTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{bgcolor: '#FFF0F3', color: '#F05A22', fontSize: '0.75rem'}}
                />
              ))}
            </Box>
            {nursery.featureNote && (
              <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                {nursery.featureNote}
              </Typography>
            )}
          </Box>
        )}

        {nursery.receptionTags.length > 0 && (
          <Box sx={{mb: 3}}>
            <SectionHeading>一緒に働く先生を受け入れる際に大切にしていること</SectionHeading>
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: nursery.receptionNote ? 1.5 : 0}}>
              {nursery.receptionTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  sx={{bgcolor: '#F0F4FF', color: '#3D5AFE', fontSize: '0.75rem'}}
                />
              ))}
            </Box>
            {nursery.receptionNote && (
              <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                {nursery.receptionNote}
              </Typography>
            )}
          </Box>
        )}

        {nursery.joinReason && (
          <Box sx={{mb: 3}}>
            <SectionHeading>えんまーるに参加した理由</SectionHeading>
            <Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>
              {nursery.joinReason}
            </Typography>
          </Box>
        )}

        {nursery.idealPartner && (
          <Box sx={{mb: 3}}>
            <SectionHeading>こんな方とご縁があれば嬉しい</SectionHeading>
            <Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>
              {nursery.idealPartner}
            </Typography>
          </Box>
        )}

        <Box sx={{mb: 3}}>
          <SectionHeading subtitle={`${nursery.jobPostings.length}件`}>
            現在の募集
          </SectionHeading>
          {nursery.jobPostings.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              現在募集中の求人はありません
            </Typography>
          ) : (
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
              {nursery.jobPostings.map((job) => (
                <Card key={job.id} sx={{border: '1px solid #E0E0E0'}}>
                  <CardContent sx={{p: {xs: 1.5, md: 2}}}>
                    <Typography
                      variant="subtitle2"
                      sx={{fontWeight: 700, mb: 1}}
                    >
                      {job.title}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1.5,
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{display: 'flex', alignItems: 'center', gap: 0.5}}
                      >
                        <CalendarTodayIcon
                          sx={{fontSize: 13, color: '#AAAAAA'}}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(job.workDate).toLocaleDateString('ja-JP')}
                        </Typography>
                      </Box>
                      <Box
                        sx={{display: 'flex', alignItems: 'center', gap: 0.5}}
                      >
                        <AccessTimeIcon sx={{fontSize: 13, color: '#AAAAAA'}} />
                        <Typography variant="caption" color="text.secondary">
                          {job.workTimeStart}〜{job.workTimeEnd}
                        </Typography>
                      </Box>
                      {job.hourlyWage && (
                        <Typography variant="caption" color="text.secondary">
                          時給{job.hourlyWage.toLocaleString()}円
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{mb: 1.5, fontSize: '0.8rem'}}
                    >
                      {job.workContent}
                    </Typography>
                    <Button
                      href={`/applications/new?jobId=${job.id}`}
                      variant="contained"
                      size="small"
                      sx={{fontSize: '0.8rem'}}
                    >
                      この募集に応募する
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{mb: 3}}>
          <SectionHeading subtitle={`${nursery.reviews.length}件`}>
            保育士からの評価
          </SectionHeading>
          {nursery.reviews.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              まだ公開されている評価はありません
            </Typography>
          ) : (
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
              {nursery.reviews.map((review) => (
                <Box
                  key={review.id}
                  sx={{
                    p: {xs: 1.5, md: 2},
                    bgcolor: '#FAFAFA',
                    borderRadius: 2,
                    border: '1px solid #E0E0E0',
                  }}
                >
                  {review.comment ? (
                    <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                      {review.comment}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      （コメントなし）
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{display: 'block', mt: 0.5}}
                  >
                    {new Date(review.reviewedAt).toLocaleDateString('ja-JP')}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </PageContainer>
      <Footer />
    </>
  );
}

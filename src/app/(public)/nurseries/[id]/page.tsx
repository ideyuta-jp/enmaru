import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import MuiLink from '@mui/material/Link';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import XIcon from '@mui/icons-material/X';
import {notFound} from 'next/navigation';

import Footer from '@/components/Footer';
import NurseryPhotoGallery from '@/components/NurseryPhotoGallery';
import PageContainer from '@/components/PageContainer';
import SectionHeading from '@/components/SectionHeading';
import SessionHeader from '@/components/SessionHeader';
import {getNurseryDetailForViewer} from '@/server/nursery';
import {formatTagsWithNote} from '@/types/Job';
import {formatNurseryLocation} from '@/types/Nursery';
import {isHttpUrl} from '@/utils/url';

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
  const location = formatNurseryLocation(nursery);

  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="md">
        {isOwnerPreview && (
          <Alert
            severity="info"
            sx={{mb: 3}}
            action={
              <Button color="inherit" size="small" href="/nursery/profile">
                編集画面に戻る
              </Button>
            }
          >
            これは未公開のプレビューです。保育士にはまだ表示されていません。公開すると一般に表示されます。
          </Alert>
        )}
        {nursery.mainPhotoId && (
          <Box
            component="img"
            src={`/api/nursery-photos/${nursery.mainPhotoId}/file`}
            alt={nursery.nurseryName}
            sx={{
              width: '100%',
              height: {xs: 200, sm: 300},
              objectFit: 'cover',
              display: 'block',
              borderRadius: 2,
              mb: 3,
            }}
          />
        )}

        <Box sx={{mb: 3}}>
          <Typography
            variant="h1"
            sx={{fontSize: {xs: '1.375rem', md: '1.75rem'}, mb: 1}}
          >
            {nursery.nurseryName}
          </Typography>
          {location && (
            <Box
              sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5}}
            >
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

        {nursery.photos.length > 0 && (
          <Box sx={{mb: 3}}>
            <SectionHeading>園の写真</SectionHeading>
            <NurseryPhotoGallery photos={nursery.photos} />
          </Box>
        )}

        {(nursery.featureTags.length > 0 || nursery.featureNote) && (
          <Box sx={{mb: 3}}>
            <SectionHeading>園の特徴</SectionHeading>
            {nursery.featureTags.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.75,
                  mb: nursery.featureNote ? 1.5 : 0,
                }}
              >
                {nursery.featureTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      bgcolor: '#FFF0F3',
                      color: '#F05A22',
                      fontSize: '0.75rem',
                    }}
                  />
                ))}
              </Box>
            )}
            {nursery.featureNote && (
              <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                {nursery.featureNote}
              </Typography>
            )}
          </Box>
        )}

        {(nursery.receptionTags.length > 0 || nursery.receptionNote) && (
          <Box sx={{mb: 3}}>
            <SectionHeading>
              一緒に働く先生を受け入れる際に大切にしていること
            </SectionHeading>
            {nursery.receptionTags.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.75,
                  mb: nursery.receptionNote ? 1.5 : 0,
                }}
              >
                {nursery.receptionTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      bgcolor: '#FFF0F3',
                      color: '#F05A22',
                      fontSize: '0.75rem',
                    }}
                  />
                ))}
              </Box>
            )}
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

        {nursery.additionalNotes && (
          <Box sx={{mb: 3}}>
            <SectionHeading>備考・補足事項</SectionHeading>
            <Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>
              {nursery.additionalNotes}
            </Typography>
          </Box>
        )}

        {(nursery.homepageUrl ||
          nursery.instagramUrl ||
          nursery.twitterUrl ||
          nursery.facebookUrl ||
          nursery.otherSnsUrl) && (
          <Box sx={{mb: 3}}>
            <SectionHeading>ホームページ・SNS</SectionHeading>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.75}}>
              {[
                {
                  label: 'ホームページ',
                  url: nursery.homepageUrl,
                  icon: <LanguageIcon sx={{fontSize: 18, color: '#555555'}} />,
                },
                {
                  label: 'Instagram',
                  url: nursery.instagramUrl,
                  icon: <InstagramIcon sx={{fontSize: 18, color: '#E1306C'}} />,
                },
                {
                  label: 'X（Twitter）',
                  url: nursery.twitterUrl,
                  icon: <XIcon sx={{fontSize: 18, color: '#000000'}} />,
                },
                {
                  label: 'Facebook',
                  url: nursery.facebookUrl,
                  icon: <FacebookIcon sx={{fontSize: 18, color: '#1877F2'}} />,
                },
                {
                  label: 'その他SNS',
                  url: nursery.otherSnsUrl,
                  icon: <LanguageIcon sx={{fontSize: 18, color: '#555555'}} />,
                },
              ]
                // Scheme guard on top of the save-time validation, in case a
                // non-web URL ever reaches the DB through another write path.
                .filter((item) => item.url && isHttpUrl(item.url))
                .map((item) => (
                  <Box
                    key={item.label}
                    sx={{display: 'flex', alignItems: 'center', gap: 0.75}}
                  >
                    {item.icon}
                    <MuiLink
                      href={item.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                      underline="hover"
                    >
                      {item.label}
                    </MuiLink>
                  </Box>
                ))}
            </Box>
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
                      {job.hourlyWage !== null && (
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
                      {formatTagsWithNote(
                        job.workContentTags,
                        job.workContentNote,
                      )}
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

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import type {PublicNursery} from '@/types/Nursery';

interface Props {
  nursery: PublicNursery;
  href: string;
}

export default function NurseryCard({nursery, href}: Props) {
  const rating = nursery.rating;

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#F4A7B9',
          boxShadow: '0 2px 8px rgba(244, 167, 185, 0.2)',
        },
      }}
    >
      <CardActionArea
        href={href}
        sx={{height: '100%', alignItems: 'flex-start'}}
      >
        <CardContent sx={{p: {xs: 2, md: 3}}}>
          <Typography
            variant="h3"
            sx={{fontSize: {xs: '1rem', md: '1.125rem'}, mb: 1}}
          >
            {nursery.nurseryName}
          </Typography>

          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5}}>
            <LocationOnIcon sx={{fontSize: 16, color: '#AAAAAA'}} />
            <Typography variant="body2" color="text.secondary">
              {nursery.area}
            </Typography>
          </Box>

          {nursery.concept && (
            <Typography
              variant="body2"
              sx={{
                mb: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {nursery.concept}
            </Typography>
          )}

          {rating && rating.count > 0 ? (
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
          ) : (
            <Chip
              label="評価なし"
              size="small"
              sx={{bgcolor: '#F9F9F9', color: '#AAAAAA', fontSize: '0.7rem'}}
            />
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import LocationOnIcon from '@mui/icons-material/LocationOn';

import {formatSeekerPreferredArea, type PublicSeeker} from '@/types/Seeker';

interface Props {
  seeker: PublicSeeker;
  href: string;
}

// Nursery-facing browse card for a published seeker. Mirrors NurseryCard's
// layout and palette so the two browse experiences read as one system. Renders
// only the public projection it is handed (PublicSeeker); it has no access to
// private fields by construction.
export default function SeekerCard({seeker, href}: Props) {
  const area = formatSeekerPreferredArea(seeker);

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
            {seeker.displayName}
          </Typography>

          {area && (
            <Box
              sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5}}
            >
              <LocationOnIcon sx={{fontSize: 16, color: '#AAAAAA'}} />
              <Typography variant="body2" color="text.secondary">
                希望エリア: {area}
              </Typography>
            </Box>
          )}

          {seeker.experienceYears && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{mb: seeker.licenses.length > 0 ? 1.5 : 0}}
            >
              保育経験: {seeker.experienceYears}
            </Typography>
          )}

          {seeker.licenses.length > 0 && (
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
              {seeker.licenses.slice(0, 3).map((license) => (
                <Chip
                  key={license}
                  label={license}
                  size="small"
                  sx={{
                    bgcolor: '#FFF0F3',
                    color: '#F05A22',
                    fontSize: '0.7rem',
                  }}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

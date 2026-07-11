import type {Metadata} from 'next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ChildCareIcon from '@mui/icons-material/ChildCare';

import Footer from '@/components/Footer';
import PageContainer from '@/components/PageContainer';
import SessionHeader from '@/components/SessionHeader';

export const metadata: Metadata = {
  title: '利用規約',
};

// Renders SessionHeader (reads the session), so it renders per-request.
export const dynamic = 'force-dynamic';

export default function TermsPage() {
  return (
    <>
      <SessionHeader />
      <PageContainer maxWidth="sm">
        <Typography
          variant="h1"
          sx={{fontSize: {xs: '1.375rem', md: '1.75rem'}, mb: 1}}
        >
          利用規約
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{mb: 3}}>
          ご登録の区分に応じた利用規約をご確認ください。
        </Typography>

        <Divider sx={{mb: 3}} />

        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <Button
            href="/terms/seeker"
            variant="outlined"
            fullWidth
            startIcon={<ChildCareIcon />}
            sx={{
              py: 2,
              justifyContent: 'flex-start',
              borderColor: '#E0E0E0',
              color: '#333333',
              '&:hover': {borderColor: '#F4A7B9'},
            }}
          >
            <Box sx={{textAlign: 'left', ml: 1}}>
              <Typography variant="subtitle2" sx={{fontWeight: 700}}>
                保育士向け利用規約
              </Typography>
              <Typography variant="caption" color="text.secondary">
                保育士・保育経験者として登録される方
              </Typography>
            </Box>
          </Button>

          <Button
            href="/terms/nursery"
            variant="outlined"
            fullWidth
            startIcon={<ApartmentIcon />}
            sx={{
              py: 2,
              justifyContent: 'flex-start',
              borderColor: '#E0E0E0',
              color: '#333333',
              '&:hover': {borderColor: '#F4A7B9'},
            }}
          >
            <Box sx={{textAlign: 'left', ml: 1}}>
              <Typography variant="subtitle2" sx={{fontWeight: 700}}>
                保育園向け利用規約
              </Typography>
              <Typography variant="caption" color="text.secondary">
                保育施設として登録される方
              </Typography>
            </Box>
          </Button>
        </Box>
      </PageContainer>
      <Footer />
    </>
  );
}

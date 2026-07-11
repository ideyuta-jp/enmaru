'use client';

import {useCallback, useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  photos: {id: string}[];
}

export default function NurseryPhotoGallery({photos}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handlePrev = useCallback(() => {
    setOpenIndex((i) =>
      i === null ? null : (i - 1 + photos.length) % photos.length,
    );
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % photos.length));
  }, [photos.length]);

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'Escape') setOpenIndex(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIndex, handlePrev, handleNext]);

  if (photos.length === 0) return null;

  const navButtonSx = {
    bgcolor: 'rgba(0,0,0,0.45)',
    color: '#FFFFFF',
    '&:hover': {bgcolor: 'rgba(0,0,0,0.7)'},
  };

  return (
    <>
      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
        {photos.map((photo, idx) => (
          <ButtonBase
            key={photo.id}
            onClick={() => setOpenIndex(idx)}
            focusRipple
            sx={{
              width: {xs: 'calc(50% - 4px)', sm: 160},
              height: {xs: 140, sm: 120},
              borderRadius: 1,
              border: '1px solid #E0E0E0',
              overflow: 'hidden',
              transition: 'opacity 0.15s',
              '&:hover': {opacity: 0.85},
            }}
          >
            <Box
              component="img"
              src={`/api/nursery-photos/${photo.id}/file`}
              alt="園の写真"
              sx={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
          </ButtonBase>
        ))}
      </Box>

      <Modal
        open={openIndex !== null}
        onClose={() => setOpenIndex(null)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {photos.length > 1 && (
            <IconButton onClick={handlePrev} sx={navButtonSx}>
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          )}

          {openIndex !== null && (
            <Box sx={{position: 'relative'}}>
              <Box
                component="img"
                src={`/api/nursery-photos/${photos[openIndex].id}/file`}
                alt="園の写真"
                sx={{
                  display: 'block',
                  maxWidth: {xs: '70vw', sm: '80vw'},
                  maxHeight: '85vh',
                  objectFit: 'contain',
                  borderRadius: 1,
                }}
              />
              <IconButton
                onClick={() => setOpenIndex(null)}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: '#FFFFFF',
                  '&:hover': {bgcolor: 'rgba(0,0,0,0.7)'},
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              {photos.length > 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0,0,0,0.45)',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    px: 1.5,
                    py: 0.25,
                    borderRadius: 10,
                  }}
                >
                  {openIndex + 1} / {photos.length}
                </Box>
              )}
            </Box>
          )}

          {photos.length > 1 && (
            <IconButton onClick={handleNext} sx={navButtonSx}>
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Modal>
    </>
  );
}

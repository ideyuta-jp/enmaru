'use client';

import {useRef, useState} from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';

import NurseryCropEditor from '@/components/NurseryCropEditor';
import {
  deleteNurseryPhoto,
  uploadNurseryPhoto,
} from '@/server/nursery-photo-actions';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

interface Photo {
  id: string;
  order: number;
}

interface Props {
  nurseryId: string;
  initialPhotos: Photo[];
  isMain?: boolean;
  maxPhotos?: number;
  note?: string;
}

export default function NurseryPhotoUpload({
  nurseryId: _nurseryId,
  initialPhotos,
  isMain = false,
  maxPhotos = 5,
  note,
}: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const thumbnailSize = isMain ? 160 : 80;

  async function doUpload(blob: Blob) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append(
        'file',
        blob instanceof File ? blob : new File([blob], 'photo.jpg', {type: 'image/jpeg'}),
      );
      const result = await uploadNurseryPhoto(formData, isMain);
      if (!result.ok) {
        setError(result.message ?? 'アップロードに失敗しました。');
        return;
      }
      window.location.reload();
    } finally {
      setUploading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;

    if (file.size > MAX_BYTES) {
      setError('1枚あたり5MBまでにしてください。');
      return;
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      setError('画像（JPEG/PNG/WebP）をアップロードしてください。');
      return;
    }

    setError(null);

    if (isMain) {
      // Show crop editor before uploading
      const reader = new FileReader();
      reader.onload = (ev) => setCropSrc(ev.target?.result as string);
      reader.readAsDataURL(file);
      return;
    }

    await doUpload(file);
  }

  async function handleDelete(photoId: string) {
    setError(null);
    const result = await deleteNurseryPhoto(photoId);
    if (!result.ok) {
      setError(result.message ?? '削除に失敗しました。');
      return;
    }
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }

  return (
    <>
      {cropSrc && (
        <NurseryCropEditor
          imageSrc={cropSrc}
          onConfirm={(blob) => {
            setCropSrc(null);
            doUpload(blob);
          }}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 0.75}}>
          {isMain ? '1枚・' : `最大${maxPhotos}枚・`}1枚あたり5MBまで（JPEG/PNG/WebP）
        </Typography>
        {note && (
          <Typography variant="caption" color="text.secondary" sx={{display: 'block', mb: 1.5}}>
            {note}
          </Typography>
        )}

        {error && (
          <Typography variant="caption" color="error" sx={{display: 'block', mb: 1}}>
            {error}
          </Typography>
        )}

        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
          {photos.map((photo) => (
            <Box
              key={photo.id}
              sx={{
                position: 'relative',
                width: thumbnailSize,
                height: thumbnailSize,
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid #E0E0E0',
              }}
            >
              <Box
                component="img"
                src={`/api/nursery-photos/${photo.id}/file`}
                alt="園の写真"
                sx={{width: '100%', height: '100%', objectFit: 'cover'}}
              />
              <IconButton
                size="small"
                onClick={() => handleDelete(photo.id)}
                sx={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: '#FFFFFF',
                  p: 0.25,
                  '&:hover': {bgcolor: 'rgba(0,0,0,0.7)'},
                }}
              >
                <CloseIcon sx={{fontSize: 14}} />
              </IconButton>
            </Box>
          ))}

          {photos.length < maxPhotos && (
            <Box
              component="label"
              sx={{
                width: thumbnailSize,
                height: thumbnailSize,
                border: '2px dashed #E0E0E0',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: uploading ? 'default' : 'pointer',
                '&:hover': {borderColor: uploading ? '#E0E0E0' : '#F4A7B9'},
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{display: 'none'}}
                onChange={handleFileChange}
                disabled={uploading}
              />
              {uploading ? (
                <CircularProgress size={20} sx={{color: '#F4A7B9'}} />
              ) : (
                <AddPhotoAlternateIcon sx={{fontSize: 28, color: '#AAAAAA'}} />
              )}
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}

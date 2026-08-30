'use client';

import {useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';

import ImageCropEditor from '@/components/ImageCropEditor';
import {
  deleteResumePhoto,
  uploadResumePhoto,
} from '@/server/resume-photo-actions';
import {
  ALLOWED_RESUME_PHOTO_MIME_TYPES,
  MAX_RESUME_PHOTO_BYTES,
} from '@/types/Resume';

// 証明写真の慣例 (30mm x 40mm = 縦3:4)。
const OUTPUT_WIDTH = 480;
const OUTPUT_HEIGHT = 640;
const THUMBNAIL_WIDTH = 120;
const THUMBNAIL_HEIGHT = 160;

interface Props {
  hasPhoto: boolean;
}

export default function ResumePhotoUpload({hasPhoto: initialHasPhoto}: Props) {
  const [hasPhoto, setHasPhoto] = useState(initialHasPhoto);
  // The file route is a stable URL (one photo per seeker, no id) — bump this
  // into the query string after any change to bust the browser cache instead
  // of it silently keeping the just-replaced/deleted image.
  const [version, setVersion] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  async function doUpload(blob: Blob) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append(
        'file',
        blob instanceof File
          ? blob
          : new File([blob], 'photo.jpg', {type: 'image/jpeg'}),
      );
      const result = await uploadResumePhoto(formData);
      if (!result.ok) {
        setError(result.message ?? 'アップロードに失敗しました。');
        return;
      }
      setHasPhoto(true);
      setVersion((v) => v + 1);
      // 写真を替えると提出済みPDFが古くなる。その注意書きはサーバ側で
      // 組み立てられる (resume/page.tsx の hasUnpublishedResumeChanges) ので、
      // 再取得しないと次にページを開くまで表示されない。
      router.refresh();
    } catch {
      setError('アップロードに失敗しました。時間をおいて再度お試しください。');
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;

    if (file.size > MAX_RESUME_PHOTO_BYTES) {
      setError('1枚あたり5MBまでにしてください。');
      return;
    }
    if (!ALLOWED_RESUME_PHOTO_MIME_TYPES.includes(file.type)) {
      setError('画像（JPEG/PNG/WebP）をアップロードしてください。');
      return;
    }

    setError(null);
    // The crop editor re-encodes to JPEG regardless of the original format —
    // always shown, unlike NurseryPhotoUpload's sub-photos which skip it.
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleDelete() {
    setError(null);
    try {
      const result = await deleteResumePhoto();
      if (!result.ok) {
        setError(result.message ?? '削除に失敗しました。');
        return;
      }
      setHasPhoto(false);
      setVersion((v) => v + 1);
      // 写真を替えると提出済みPDFが古くなる。その注意書きはサーバ側で
      // 組み立てられる (resume/page.tsx の hasUnpublishedResumeChanges) ので、
      // 再取得しないと次にページを開くまで表示されない。
      router.refresh();
    } catch {
      setError('削除に失敗しました。時間をおいて再度お試しください。');
    }
  }

  return (
    <>
      {cropSrc && (
        <ImageCropEditor
          imageSrc={cropSrc}
          title="証明写真の編集"
          outputWidth={OUTPUT_WIDTH}
          outputHeight={OUTPUT_HEIGHT}
          onConfirm={(blob) => {
            setCropSrc(null);
            doUpload(blob);
          }}
          onCancel={() => setCropSrc(null)}
        />
      )}

      <Box>
        {!hasPhoto && (
          // Required for nursery audits (#167), but the seeker decided a
          // warning should not block saving the rest of the résumé —
          // updates live with local `hasPhoto` state, so it clears the
          // moment an upload succeeds without needing a page reload.
          <Alert severity="warning" sx={{mb: 1.5}}>
            保育園の監査対応に必要です。まだアップロードされていません。
          </Alert>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{display: 'block', mb: 0.75}}
        >
          1枚・1枚あたり5MBまで（JPEG/PNG/WebP）
        </Typography>

        {error && (
          <Typography
            variant="caption"
            color="error"
            sx={{display: 'block', mb: 1}}
          >
            {error}
          </Typography>
        )}

        {hasPhoto ? (
          <Box
            sx={{
              position: 'relative',
              width: THUMBNAIL_WIDTH,
              height: THUMBNAIL_HEIGHT,
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid #E0E0E0',
            }}
          >
            <Box
              component="img"
              src={`/api/resume-photo/file?v=${version}`}
              alt="証明写真"
              sx={{width: '100%', height: '100%', objectFit: 'cover'}}
            />
            <IconButton
              size="small"
              onClick={handleDelete}
              aria-label="証明写真を削除"
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
        ) : (
          <Box
            component="label"
            sx={{
              width: THUMBNAIL_WIDTH,
              height: THUMBNAIL_HEIGHT,
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
              accept={ALLOWED_RESUME_PHOTO_MIME_TYPES.join(',')}
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
    </>
  );
}

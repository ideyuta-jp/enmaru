'use client';

import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from '@mui/material/Modal';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

const OUTPUT_W = 1280;
const OUTPUT_H = 720; // 16:9
const ASPECT = 16 / 9;

// Modal: p:2 (16px each side = 32px), inner box: p:3 (24px each side = 48px)
function computeCropW() {
  return Math.max(0, Math.min(window.innerWidth - 32, 560) - 48);
}

interface Props {
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

export default function NurseryCropEditor({imageSrc, onConfirm, onCancel}: Props) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({x: 0, y: 0});
  const [naturalSize, setNaturalSize] = useState({w: 0, h: 0});
  const [cropW, setCropW] = useState(0);
  const imgElRef = useRef<HTMLImageElement | null>(null);
  const dragging = useRef(false);
  const lastPos = useRef({x: 0, y: 0});

  // Derive crop box dimensions from window width — avoids unstable DOM measurement
  useLayoutEffect(() => {
    function update() {
      setCropW(computeCropW());
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Reset when image changes
  useEffect(() => {
    setZoom(1);
    setOffset({x: 0, y: 0});
    setNaturalSize({w: 0, h: 0});
  }, [imageSrc]);

  const cropH = cropW > 0 ? cropW / ASPECT : 0;
  const ready = naturalSize.w > 0 && cropW > 0;

  const coverScale = ready
    ? Math.max(cropW / naturalSize.w, cropH / naturalSize.h)
    : 1;

  function clamp(ox: number, oy: number, z: number) {
    const dw = naturalSize.w * coverScale * z;
    const dh = naturalSize.h * coverScale * z;
    const maxX = Math.max(0, (dw - cropW) / 2);
    const maxY = Math.max(0, (dh - cropH) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, ox)),
      y: Math.min(maxY, Math.max(-maxY, oy)),
    };
  }

  function handleZoom(_: Event, v: number | number[]) {
    const z = v as number;
    setZoom(z);
    setOffset((prev) => clamp(prev.x, prev.y, z));
  }

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    lastPos.current = {x: e.clientX, y: e.clientY};
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = {x: e.clientX, y: e.clientY};
    setOffset((prev) => clamp(prev.x + dx, prev.y + dy, zoom));
  }
  function onPointerUp() {
    dragging.current = false;
  }

  function handleConfirm() {
    if (!imgElRef.current || !ready) return;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_W;
    canvas.height = OUTPUT_H;
    const ctx = canvas.getContext('2d')!;
    const s = coverScale * zoom;
    const srcW = cropW / s;
    const srcH = cropH / s;
    const srcX = naturalSize.w / 2 - offset.x / s - srcW / 2;
    const srcY = naturalSize.h / 2 - offset.y / s - srcH / 2;
    ctx.drawImage(imgElRef.current, srcX, srcY, srcW, srcH, 0, 0, OUTPUT_W, OUTPUT_H);
    canvas.toBlob((blob) => {
      if (blob) onConfirm(blob);
    }, 'image/jpeg', 0.9);
  }

  const displayW = ready ? naturalSize.w * coverScale * zoom : 0;
  const displayH = ready ? naturalSize.h * coverScale * zoom : 0;
  const imgLeft = ready ? (cropW - displayW) / 2 + offset.x : 0;
  const imgTop = ready ? (cropH - displayH) / 2 + offset.y : 0;

  return (
    <Modal
      open
      onClose={onCancel}
      sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2}}
    >
      <Box
        sx={{bgcolor: '#FFFFFF', borderRadius: 2, p: 3, width: '100%', maxWidth: 560, outline: 'none'}}
      >
        <Typography variant="subtitle1" sx={{fontWeight: 700, mb: 2}}>
          メイン写真の編集
        </Typography>

        {/* Crop frame */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: cropH > 0 ? cropH : 'auto',
            aspectRatio: '16 / 9',
            bgcolor: '#111111',
            borderRadius: 1,
            overflow: 'hidden',
            cursor: ready ? 'grab' : 'default',
            touchAction: 'none',
            '&:active': {cursor: ready ? 'grabbing' : 'default'},
            userSelect: 'none',
          }}
          onPointerDown={ready ? onPointerDown : undefined}
          onPointerMove={ready ? onPointerMove : undefined}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {/* Image — always in DOM so onLoad fires; hidden until ready */}
          <Box
            ref={(el: HTMLImageElement | null) => {
              imgElRef.current = el;
            }}
            component="img"
            src={imageSrc}
            alt=""
            draggable={false}
            onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => {
              setNaturalSize({
                w: e.currentTarget.naturalWidth,
                h: e.currentTarget.naturalHeight,
              });
            }}
            sx={
              ready
                ? {
                    position: 'absolute',
                    width: displayW,
                    height: displayH,
                    left: imgLeft,
                    top: imgTop,
                    pointerEvents: 'none',
                  }
                : {position: 'absolute', opacity: 0, pointerEvents: 'none'}
            }
          />

          {!ready && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress size={24} sx={{color: '#FFFFFF'}} />
            </Box>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{display: 'block', mt: 1, mb: 0.5}}>
          ドラッグで位置を調整できます
        </Typography>

        {/* Zoom slider */}
        <Stack direction="row" spacing={1.5} sx={{mb: 3, alignItems: 'center'}}>
          <ZoomOutIcon sx={{color: '#AAAAAA', fontSize: 20, flexShrink: 0}} />
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.01}
            onChange={handleZoom}
            disabled={!ready}
            sx={{color: '#F05A22'}}
          />
          <ZoomInIcon sx={{color: '#AAAAAA', fontSize: 20, flexShrink: 0}} />
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{justifyContent: 'flex-end'}}>
          <Button variant="outlined" onClick={onCancel}>
            キャンセル
          </Button>
          <Button variant="contained" onClick={handleConfirm} disabled={!ready}>
            確定
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}

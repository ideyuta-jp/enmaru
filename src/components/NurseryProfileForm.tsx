'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import ErrorAlert from '@/components/ErrorAlert';
import NurseryPhotoUpload from '@/components/NurseryPhotoUpload';
import SectionHeading from '@/components/SectionHeading';
import TagSelector from '@/components/TagSelector';
import {saveNurseryProfile} from '@/server/nursery-actions';
import {lookupPostalAddress} from '@/services/address';
import {EMPTY_NURSERY_PROFILE, type NurseryProfileInput} from '@/types/Nursery';

const FEATURE_TAGS = [
  'のびのび保育',
  'モンテッソーリ',
  '自然遊び重視',
  '少人数制',
  '異年齢保育',
  '英語教育',
  '食育重視',
  '音楽・体操',
  '行事が充実',
  'アットホーム',
];

const RECEPTION_TAGS = [
  '事前にしっかりご説明します',
  '疑問には丁寧にお答えします',
  'スタッフ全員でサポートします',
  '初めての方も安心してお越しいただけます',
  'ミスがあっても温かくフォローします',
  '無理なく自分らしく働いていただけます',
  '子どもとの時間を一緒に楽しみます',
  '子どものペースを大切にしています',
  'コミュニケーションを大切にしています',
  '笑顔でお迎えします',
];

interface Props {
  initial: NurseryProfileInput | null;
  nurseryId?: string;
  initialMainPhoto?: {id: string; order: number} | null;
  initialSubPhotos?: {id: string; order: number}[];
}

export default function NurseryProfileForm({
  initial,
  nurseryId,
  initialMainPhoto,
  initialSubPhotos,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<NurseryProfileInput>(
    initial ?? EMPTY_NURSERY_PROFILE,
  );
  const [saving, setSaving] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof NurseryProfileInput>(
    key: K,
    value: NurseryProfileInput[K],
  ) {
    setForm((prev) => ({...prev, [key]: value}));
  }

  async function handlePostalCodeBlur() {
    if (form.postalCode.replace(/-/g, '').length !== 7) return;
    setZipLoading(true);
    try {
      const address = await lookupPostalAddress(form.postalCode);
      if (address) {
        setForm((prev) => ({...prev, ...address}));
      }
    } catch {
      // silently ignore — user can fill in manually
    } finally {
      setZipLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const result = await saveNurseryProfile(form);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError('保存に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <SectionHeading subtitle="作成完了後は公開ボタンを押してください。">
        園プロフィール作成
      </SectionHeading>

      <ErrorAlert message={error} />

      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
      >
        <Alert severity="success" onClose={() => setSaved(false)}>
          保存しました
        </Alert>
      </Snackbar>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{display: 'flex', flexDirection: 'column', gap: 3}}
      >
        <Box>
          <Typography
            variant="subtitle1"
            sx={{fontWeight: 700, mb: 1.5, color: '#666666'}}
          >
            基本情報（公開）
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <TextField
              label="園名"
              value={form.nurseryName}
              onChange={(e) => set('nurseryName', e.target.value)}
              size="small"
              required
            />
            <Box sx={{display: 'flex', gap: 1, alignItems: 'flex-start'}}>
              <TextField
                label="郵便番号"
                value={form.postalCode}
                onChange={(e) => set('postalCode', e.target.value)}
                onBlur={handlePostalCodeBlur}
                size="small"
                placeholder="例：850-0001"
                sx={{width: 160}}
                slotProps={{
                  input: {
                    endAdornment: zipLoading ? (
                      <CircularProgress size={16} sx={{mr: 0.5}} />
                    ) : null,
                  },
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{mt: 1.2}}
              >
                入力すると住所を自動補完します
              </Typography>
            </Box>
            <Box sx={{display: 'flex', gap: 1}}>
              <TextField
                label="都道府県"
                value={form.prefecture}
                onChange={(e) => set('prefecture', e.target.value)}
                size="small"
                sx={{flex: 1}}
              />
              <TextField
                label="市区町村"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                size="small"
                sx={{flex: 2}}
              />
            </Box>
            <TextField
              label="それ以降の住所"
              value={form.addressLine}
              onChange={(e) => set('addressLine', e.target.value)}
              size="small"
              placeholder="例：大手1丁目1番地"
            />
            <TextField
              label="電話番号"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              size="small"
              type="tel"
              placeholder="例：095-123-4567"
            />
            <TextField
              label="担当者名"
              value={form.contactName}
              onChange={(e) => set('contactName', e.target.value)}
              size="small"
              required
            />
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle1"
            sx={{fontWeight: 700, mb: 0.5, color: '#666666'}}
          >
            メイン写真（任意・公開）
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{display: 'block', mb: 1.5}}
          >
            ※保育園一覧のカードに表示されます。１枚のみ設定可能です。推奨サイズ：横16:縦9（例：1280×720px
            以上）
          </Typography>
          <NurseryPhotoUpload
            initialPhotos={initialMainPhoto ? [initialMainPhoto] : []}
            isMain
            maxPhotos={1}
          />
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle1"
            sx={{fontWeight: 700, mb: 0.5, color: '#666666'}}
          >
            サブ写真（任意・公開）
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{display: 'block', mb: 1.5}}
          >
            ※掲載したい写真（園舎、給食、行事の様子など）があれば教えてください。
          </Typography>
          <NurseryPhotoUpload initialPhotos={initialSubPhotos ?? []} />
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle1"
            sx={{fontWeight: 700, mb: 0.5, color: '#666666'}}
          >
            ホームページ・SNSリンク（任意・公開）
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{display: 'block', mb: 1.5}}
          >
            それぞれ個別に入力してください
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <TextField
              label="ホームページURL"
              value={form.homepageUrl}
              onChange={(e) => set('homepageUrl', e.target.value)}
              size="small"
              type="url"
              placeholder="https://"
            />
            <TextField
              label="Instagram"
              value={form.instagramUrl}
              onChange={(e) => set('instagramUrl', e.target.value)}
              size="small"
              placeholder="https://www.instagram.com/..."
            />
            <TextField
              label="X（Twitter）"
              value={form.twitterUrl}
              onChange={(e) => set('twitterUrl', e.target.value)}
              size="small"
              placeholder="https://x.com/..."
            />
            <TextField
              label="Facebook"
              value={form.facebookUrl}
              onChange={(e) => set('facebookUrl', e.target.value)}
              size="small"
              placeholder="https://www.facebook.com/..."
            />
            <TextField
              label="その他SNS"
              value={form.otherSnsUrl}
              onChange={(e) => set('otherSnsUrl', e.target.value)}
              size="small"
              placeholder="https://"
            />
          </Box>
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle1"
            sx={{fontWeight: 700, mb: 0.5, color: '#666666'}}
          >
            園の特徴・大切にしていること（公開）
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{display: 'block', mb: 1.5}}
          >
            最大3つまで選択できます（選択中: {form.featureTags.length}/3）
          </Typography>
          <TagSelector
            tags={FEATURE_TAGS}
            selected={form.featureTags}
            onChange={(v) => set('featureTags', v)}
            max={3}
          />
          <TextField
            label="補足テキスト（任意）"
            value={form.featureNote}
            onChange={(e) => set('featureNote', e.target.value)}
            size="small"
            multiline
            rows={2}
            sx={{mt: 1.5, width: '100%'}}
          />
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle1"
            sx={{fontWeight: 700, mb: 0.5, color: '#666666'}}
          >
            一緒に働く先生を受け入れる際に大切にしていること（公開）
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{display: 'block', mb: 1.5}}
          >
            最大3つまで選択できます（選択中: {form.receptionTags.length}/3）
          </Typography>
          <TagSelector
            tags={RECEPTION_TAGS}
            selected={form.receptionTags}
            onChange={(v) => set('receptionTags', v)}
            max={3}
          />
          <TextField
            label="補足テキスト（任意）"
            value={form.receptionNote}
            onChange={(e) => set('receptionNote', e.target.value)}
            size="small"
            multiline
            rows={2}
            sx={{mt: 1.5, width: '100%'}}
          />
        </Box>

        <Divider />

        <Box>
          <Typography
            variant="subtitle1"
            sx={{fontWeight: 700, mb: 1.5, color: '#666666'}}
          >
            園からのメッセージ（公開）
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
            <TextField
              label="えんまーるに参加した理由"
              value={form.joinReason}
              onChange={(e) => set('joinReason', e.target.value)}
              size="small"
              multiline
              rows={3}
            />
            <TextField
              label="こんな方とご縁があれば嬉しい"
              value={form.idealPartner}
              onChange={(e) => set('idealPartner', e.target.value)}
              size="small"
              multiline
              rows={3}
              placeholder="どんな方とのご縁があると良いか希望をお書きください"
            />
            <TextField
              label="備考・補足事項"
              value={form.additionalNotes}
              onChange={(e) => set('additionalNotes', e.target.value)}
              size="small"
              multiline
              rows={3}
            />
          </Box>
        </Box>

        <Divider />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.isPublished}
              onChange={(e) => set('isPublished', e.target.checked)}
              size="small"
              sx={{color: '#F4A7B9', '&.Mui-checked': {color: '#F4A7B9'}}}
            />
          }
          label={
            <Typography variant="body2">
              プロフィールを公開する（保育士が閲覧できるようになります）
            </Typography>
          }
        />

        <Box sx={{display: 'flex', gap: 1.5, flexWrap: 'wrap'}}>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            sx={{
              py: 1.25,
              flex: {xs: '1 1 auto', md: '0 0 auto'},
              minWidth: {md: 200},
            }}
          >
            {saving ? '保存中...' : '保存する'}
          </Button>
          {nurseryId && (
            <Button
              variant="outlined"
              href={`/nurseries/${nurseryId}`}
              sx={{
                py: 1.25,
                flex: {xs: '1 1 auto', md: '0 0 auto'},
                minWidth: {md: 160},
              }}
            >
              プレビュー
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
}

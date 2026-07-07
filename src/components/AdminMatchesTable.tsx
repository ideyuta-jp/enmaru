'use client';

import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';

import ErrorAlert from '@/components/ErrorAlert';
import SectionHeading from '@/components/SectionHeading';
import StatusChip from '@/components/StatusChip';
import {setEngagementMemo} from '@/server/match-actions';
import type {AdminMatch} from '@/types/Match';

interface Props {
  initialMatches: AdminMatch[];
}

export default function AdminMatchesTable({initialMatches}: Props) {
  const [matches, setMatches] = useState<AdminMatch[]>(initialMatches);
  const [editingMemo, setEditingMemo] = useState<Record<string, string>>({});
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [savingMemoId, setSavingMemoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function startEditMemo(match: AdminMatch) {
    setEditingMemoId(match.id);
    setEditingMemo((prev) => ({...prev, [match.id]: match.adminMemo ?? ''}));
  }

  async function saveMemo(id: string) {
    const memo = editingMemo[id] ?? '';
    setSavingMemoId(id);
    setError(null);
    try {
      const result = await setEngagementMemo(id, memo);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const saved = memo.trim() || null;
      setMatches((prev) =>
        prev.map((m) => (m.id === id ? {...m, adminMemo: saved} : m)),
      );
      setEditingMemoId(null);
    } catch {
      setError('メモの保存に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setSavingMemoId(null);
    }
  }

  return (
    <>
      <SectionHeading subtitle={`${matches.length}件`}>
        マッチング管理
      </SectionHeading>

      <ErrorAlert message={error} />

      {matches.length === 0 ? (
        <Typography color="text.secondary" sx={{py: 4, textAlign: 'center'}}>
          マッチングデータがありません
        </Typography>
      ) : (
        <>
          {/* Mobile: card list */}
          <Box
            sx={{
              display: {xs: 'flex', md: 'none'},
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            {matches.map((match) => (
              <MobileMatchCard
                key={match.id}
                match={match}
                editingMemo={editingMemo[match.id]}
                isEditingMemo={editingMemoId === match.id}
                isSavingMemo={savingMemoId === match.id}
                onStartEditMemo={() => startEditMemo(match)}
                onMemoChange={(v) =>
                  setEditingMemo((prev) => ({...prev, [match.id]: v}))
                }
                onSaveMemo={() => saveMemo(match.id)}
              />
            ))}
          </Box>

          {/* Desktop: table */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              display: {xs: 'none', md: 'block'},
              border: '1px solid #E0E0E0',
              borderRadius: 2,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{bgcolor: '#F9F9F9'}}>
                  <TableCell>保育士</TableCell>
                  <TableCell>保育園</TableCell>
                  <TableCell>募集</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell>管理者メモ</TableCell>
                  <TableCell>応募日</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{fontWeight: 600}}>
                        {match.seekerDisplayName}
                      </Typography>
                      {match.seekerRealName && (
                        <Typography variant="caption" color="text.secondary">
                          （{match.seekerRealName}）
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {match.nurseryName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {match.nurseryCity ?? '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{match.jobTitle}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(match.workDate).toLocaleDateString('ja-JP')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{minWidth: 140}}>
                      <StatusChip
                        engagementStatus={match.engagementStatus}
                        reviewStatus={match.reviewStatus}
                      />
                    </TableCell>
                    <TableCell sx={{minWidth: 180}}>
                      {editingMemoId === match.id ? (
                        <Box sx={{display: 'flex', gap: 0.5}}>
                          <TextField
                            value={editingMemo[match.id] ?? ''}
                            onChange={(e) =>
                              setEditingMemo((prev) => ({
                                ...prev,
                                [match.id]: e.target.value,
                              }))
                            }
                            size="small"
                            multiline
                            maxRows={3}
                            sx={{flex: 1, fontSize: '0.8rem'}}
                          />
                          <IconButton
                            size="small"
                            onClick={() => saveMemo(match.id)}
                            disabled={savingMemoId === match.id}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box
                          sx={{display: 'flex', alignItems: 'center', gap: 0.5}}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{flex: 1}}
                          >
                            {match.adminMemo || '—'}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => startEditMemo(match)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(match.createdAt).toLocaleDateString('ja-JP')}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </>
  );
}

interface MobileMatchCardProps {
  match: AdminMatch;
  editingMemo?: string;
  isEditingMemo: boolean;
  isSavingMemo: boolean;
  onStartEditMemo: () => void;
  onMemoChange: (v: string) => void;
  onSaveMemo: () => void;
}

const MobileMatchCard = ({
  match,
  editingMemo,
  isEditingMemo,
  isSavingMemo,
  onStartEditMemo,
  onMemoChange,
  onSaveMemo,
}: MobileMatchCardProps) => (
  <Box
    sx={{
      p: 1.5,
      bgcolor: '#FAFAFA',
      borderRadius: 2,
      border: '1px solid #E0E0E0',
    }}
  >
    <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
      <Box>
        <Typography variant="subtitle2">{match.seekerDisplayName}</Typography>
        {match.seekerRealName && (
          <Typography variant="caption" color="text.secondary">
            （{match.seekerRealName}）
          </Typography>
        )}
      </Box>
      <StatusChip
        engagementStatus={match.engagementStatus}
        reviewStatus={match.reviewStatus}
      />
    </Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{display: 'block'}}
    >
      {match.nurseryName} / {match.jobTitle}
    </Typography>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{display: 'block', mb: 1.5}}
    >
      {new Date(match.workDate).toLocaleDateString('ja-JP')}
    </Typography>

    {isEditingMemo ? (
      <Box sx={{display: 'flex', gap: 0.5}}>
        <TextField
          value={editingMemo ?? ''}
          onChange={(e) => onMemoChange(e.target.value)}
          size="small"
          fullWidth
          multiline
          maxRows={3}
          placeholder="管理者メモ"
        />
        <Button
          size="small"
          variant="contained"
          onClick={onSaveMemo}
          disabled={isSavingMemo}
          sx={{whiteSpace: 'nowrap'}}
        >
          保存
        </Button>
      </Box>
    ) : (
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
        <Typography variant="caption" color="text.secondary" sx={{flex: 1}}>
          {match.adminMemo ? `メモ: ${match.adminMemo}` : 'メモなし'}
        </Typography>
        <IconButton size="small" onClick={onStartEditMemo}>
          <EditIcon fontSize="small" />
        </IconButton>
      </Box>
    )}
  </Box>
);

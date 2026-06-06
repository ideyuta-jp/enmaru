'use client';

import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
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

import SectionHeading from '@/components/SectionHeading';
import StatusChip from '@/components/StatusChip';
import {MATCH_STATUS_ORDER} from '@/types/Match';
import type {AdminMatch, MatchStatus} from '@/types/Match';

interface Props {
  initialMatches: AdminMatch[];
}

export default function AdminMatchesTable({initialMatches}: Props) {
  const [matches, setMatches] = useState<AdminMatch[]>(initialMatches);
  const [editingMemo, setEditingMemo] = useState<Record<string, string>>({});
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);

  function updateStatus(id: string, status: MatchStatus) {
    // TODO(#7 follow-up): persist the status change to the backend.
    setMatches((prev) => prev.map((m) => (m.id === id ? {...m, status} : m)));
  }

  function startEditMemo(match: AdminMatch) {
    setEditingMemoId(match.id);
    setEditingMemo((prev) => ({...prev, [match.id]: match.adminMemo ?? ''}));
  }

  function saveMemo(id: string) {
    // TODO(#7 follow-up): persist the operator memo to the backend.
    const memo = editingMemo[id] ?? '';
    setMatches((prev) =>
      prev.map((m) => (m.id === id ? {...m, adminMemo: memo} : m)),
    );
    setEditingMemoId(null);
  }

  return (
    <>
      <SectionHeading subtitle={`${matches.length}件`}>
        マッチング管理
      </SectionHeading>

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
                onStatusChange={updateStatus}
                editingMemo={editingMemo[match.id]}
                isEditingMemo={editingMemoId === match.id}
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
                        {match.nurseryArea}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{match.jobTitle}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(match.workDate).toLocaleDateString('ja-JP')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{minWidth: 160}}>
                      <Select
                        value={match.status}
                        size="small"
                        onChange={(e) =>
                          updateStatus(match.id, e.target.value as MatchStatus)
                        }
                        sx={{fontSize: '0.8rem'}}
                        renderValue={(val) => (
                          <StatusChip status={val as MatchStatus} />
                        )}
                      >
                        {MATCH_STATUS_ORDER.map((s) => (
                          <MenuItem key={s} value={s}>
                            <StatusChip status={s} />
                          </MenuItem>
                        ))}
                      </Select>
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
  onStatusChange: (id: string, status: MatchStatus) => void;
  editingMemo?: string;
  isEditingMemo: boolean;
  onStartEditMemo: () => void;
  onMemoChange: (v: string) => void;
  onSaveMemo: () => void;
}

const MobileMatchCard = ({
  match,
  onStatusChange,
  editingMemo,
  isEditingMemo,
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
      <StatusChip status={match.status} />
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

    <Select
      value={match.status}
      size="small"
      onChange={(e) => onStatusChange(match.id, e.target.value as MatchStatus)}
      fullWidth
      sx={{fontSize: '0.8rem', mb: 1}}
    >
      {MATCH_STATUS_ORDER.map((s) => (
        <MenuItem key={s} value={s}>
          <StatusChip status={s} />
        </MenuItem>
      ))}
    </Select>

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

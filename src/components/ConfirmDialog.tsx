import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  destructive?: boolean;
  /** For irreversible actions: the user must type this text to enable the button. */
  typeToConfirm?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmDialog({ open, title, body, confirmLabel = 'Confirm', destructive, typeToConfirm, onConfirm, onClose }: ConfirmDialogProps) {
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const ready = !typeToConfirm || typed === typeToConfirm;
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} aria-labelledby="atlas-confirm-title" aria-describedby="atlas-confirm-body">
      <DialogTitle id="atlas-confirm-title">{title}</DialogTitle>
      <DialogContent>
        <Typography id="atlas-confirm-body" variant="body2">{body}</Typography>
        {typeToConfirm && (
          <TextField sx={{ mt: 3 }} label={`Type "${typeToConfirm}" to confirm`} value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" color={destructive ? 'error' : 'primary'} disabled={!ready || busy}
          onClick={async () => { setBusy(true); try { await onConfirm(); onClose(); } finally { setBusy(false); setTyped(''); } }}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

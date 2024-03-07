import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export function EmptyState({ title, description, action, icon }: { title: string; description?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <Box role="status" sx={{ textAlign: 'center', py: 12, px: 4, color: 'text.secondary' }}>
      {icon && <Box sx={{ fontSize: 40, mb: 2 }} aria-hidden>{icon}</Box>}
      <Typography variant="h3" color="text.primary">{title}</Typography>
      {description && <Typography variant="body2" sx={{ mt: 1 }}>{description}</Typography>}
      {action && <Box sx={{ mt: 4 }}>{action}</Box>}
    </Box>
  );
}

import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { PatientScope, Privilege, User } from "@shared/api-types";
import { AccessEditor } from "./AccessEditor";
import { useUserMutations } from "./api";

// Change what a physiotherapist may do and which patients they see.
export const AccessDialog = ({
  user,
  onClose,
  onSaved,
  onFailed,
}: {
  user: User;
  onClose: () => void;
  onSaved: () => void;
  onFailed: () => void;
}) => {
  const { t } = useTranslation();
  const { access } = useUserMutations();
  const [privileges, setPrivileges] = useState<Privilege[]>(user.privileges);
  const [scope, setScope] = useState<PatientScope>(
    user.patientScope ?? { all: false, patientIds: [] },
  );

  return (
    <Dialog open onClose={access.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("usersAdmin.editAccessFor", { name: user.fullName })}</DialogTitle>
      <DialogContent>
        <AccessEditor
          privileges={privileges}
          scope={scope}
          onPrivilegesChange={setPrivileges}
          onScopeChange={setScope}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={access.isPending}>
          {t("usersAdmin.cancel")}
        </Button>
        <Button
          variant="contained"
          loading={access.isPending}
          onClick={() =>
            access.mutate(
              { id: user.id, input: { privileges, patientScope: scope } },
              { onSuccess: onSaved, onError: onFailed },
            )
          }
        >
          {t("usersAdmin.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

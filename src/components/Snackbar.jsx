import { useCallback } from "react";
import { Alert, Slide, Snackbar as MaterialSnackbar, Typography, CircularProgress } from "@mui/material";
import { shallow } from "zustand/shallow";

import { snackStore } from "../utils/index.js";

const SnackBar = () => {
	const { severity, message, open, setOpen, autoHideDuration } = snackStore(useCallback(((e) => ({
		severity: e.severity,
		message: e.message,
		open: e.open,
		setOpen: e.setOpen,
		autoHideDuration: e.autoHideDuration,
	})), []), shallow);

	const handleClose = useCallback((_, reason) => {
		if (reason !== "clickaway") setOpen(false);
	}, [setOpen]);

	return (
		<MaterialSnackbar
			open={open}
			autoHideDuration={autoHideDuration}
			anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			TransitionComponent={Slide}
			TransitionProps={{ direction: "left" }}
			onClose={handleClose}
		>
			<Alert
				severity={severity}
				{...(!autoHideDuration) && { icon: <CircularProgress size="1.5rem" sx={{ color: "white" }} /> }}
				variant="filled"
				sx={{ alignItems: "center" }}
				onClose={handleClose}
			>
				<Typography>{message}</Typography>
			</Alert>
		</MaterialSnackbar>
	);
};

export default SnackBar;

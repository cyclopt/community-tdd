import { createTheme } from "@mui/material/styles";
import { red, green, deepOrange, yellow } from "@mui/material/colors";

const theme = createTheme({
	palette: {
		primary: {
			main: "#00426e",
			light: "#005792",
			dark: "#003057",
		},
		secondary: {
			main: "#00cbc4",
		},
		third: {
			main: "#d13173",
			dark: "#d53a76",
		},

		success: { main: "#90cb1b" },
		error: { main: "#ff1a22" },
		warning: {
			main: "#ff9f00",
		},

		info: { main: "#006ba4" },

		pink: { main: "#d53a76" },

		cardHeader: { main: "#00426e" },
		cardBackgroundDark: { main: "#ccd9e2" },
		cardBackgroundLight: { main: "#dfeaf1" },

		buttonPrimary: { main: "#005792" },
		buttonSecondary: { main: "#00cbc4" },

		epic: { main: "#ff484e" },
		red,
		green,
		deepOrange,
		yellow,
		grey: {
			dark: "#ccd9e2",
			light: "#dfeaf1",
			transparent: "#f2f7f9",
			blue: "#e6edf3"
		},

		lowVulnerabilityWarning: { main: "#F8C706" },
		moderateVulnerabilityWarning: { main: "#FE8300" },
		highVulnerabilityWarning: { main: "#F8956C" },
		criticalVulnerabilityWarning: { main: "#C23400" },

	},
	tileShadow: "0px 0px 4px -1px rgba(0,0,0,0.2), 0px 0px 5px 0px rgba(0,0,0,0.14), 0px 0px 10px 0px rgba(0,0,0,0.12)",
	popUpsShadows: "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
	typography: {
		h6: {
			fontSize: "1.125rem",
		},
		fontFamily: "Commissioner, Helvetica, Arial, sans-serif",
	},
	shape: {
		borderRadius: 10,
		borderRadiusWide: 20,
	},
	components: {
		MuiButton: {
			defaultProps: {
				disableElevation: true,
			},
			styleOverrides: {
				outlined: {
					border: "1px solid",
				},
			},
		},
		MuiAutocomplete: {
			styleOverrides: {
				popper: {
					boxShadow: "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
					borderRadius: "0.5rem",
				},
			},
		},
		MuiPaper: {
			defaultProps: {
				elevation: 0,
			},
		},
		MuiAppBar: {
			defaultProps: {
				elevation: 0,
			},
		},
	},
});

export default theme;

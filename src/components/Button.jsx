import { forwardRef } from "react";
import { Typography, Button, styled } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import theme from "../theme.js";

const PREFIX = "TCTT-Buttons";

const classes = {
	primaryBackground: `${PREFIX}-primaryBackground`,
	primaryBorder: `${PREFIX}-primaryBorder`,
	secondaryBackground: `${PREFIX}-secondaryBackground`,
	thirdBackground: `${PREFIX}-thirdBackground`
};

const buttonStyles = ({ customTheme }) => ({
	[`&.${classes.primaryBackground}`]: {
		color: "white",
		backgroundColor: customTheme?.palette?.primary?.main || theme?.palette?.primary?.main || "",
		padding: customTheme?.padding || "2px 20px",
		border: `2px solid ${customTheme?.palette?.primary?.main || theme?.palette?.primary?.main || ""}`,
		borderRadius: customTheme?.shape?.borderRadiusWide || theme?.shape?.borderRadiusWide || "5px",
		fontFamily: "inherit",
		"&:hover": {
			color: "white",
			backgroundColor: customTheme?.palette?.primary?.dark || theme?.palette?.primary?.dark || "",
			border: `2px solid ${customTheme?.palette?.primary?.dark || theme?.palette?.primary?.dark || ""}`,
		},
		"&:disabled": {
			color: "white",
			backgroundColor: customTheme?.palette?.grey?.dark || theme?.palette?.grey?.dark || "",
			border: `2px solid ${customTheme?.palette?.grey?.dark || theme?.palette?.grey?.dark || ""}`,
		},
	},
	[`&.${classes.primaryBorder}`]: {
		color: customTheme?.palette?.primary?.main || theme?.palette?.primary?.main || "",
		backgroundColor: "transparent",
		padding: customTheme?.padding || "2px 20px",
		border: `2px solid ${customTheme?.palette?.primary?.main || theme?.palette?.primary?.main || ""}`,
		borderRadius: customTheme?.shape?.borderRadiusWide || theme?.shape?.borderRadiusWide || "5px",
		fontFamily: "inherit",
		"&:hover": {
			color: customTheme?.palette?.primary?.main || theme?.palette?.primary?.main || "",
			backgroundColor: customTheme?.palette?.grey?.light || theme?.palette?.grey?.light || "",
			border: `2px solid ${customTheme?.palette?.primary?.main || theme?.palette?.primary?.main || ""}`,
		},
		"&:disabled": {
			color: "white",
			backgroundColor: customTheme?.palette?.grey?.dark || theme?.palette?.grey?.dark || "",
			border: `2px solid ${customTheme?.palette?.grey?.dark || theme?.palette?.grey?.dark || ""}`,
		},
	},
	[`&.${classes.whiteBorder}`]: {
		color: customTheme?.palette?.white || theme?.palette?.white || "white",
		backgroundColor: "transparent",
		padding: customTheme?.padding || "2px 20px",
		border: `2px solid ${customTheme?.palette?.white || theme?.palette?.white || ""}`,
		borderRadius: customTheme?.shape?.borderRadiusWide || theme?.shape?.borderRadiusWide || "5px",
		fontFamily: "inherit",
		"&:hover": {
			color: customTheme?.palette?.primary?.main || theme?.palette?.primary?.main || "",
			backgroundColor: customTheme?.palette?.grey?.light || theme?.palette?.grey?.light || "",
			border: `2px solid ${customTheme?.palette?.primary?.main || theme?.palette?.primary?.main || ""}`,
		},
		"&:disabled": {
			color: "white",
			backgroundColor: customTheme?.palette?.grey?.dark || theme?.palette?.grey?.dark || "",
			border: `2px solid ${customTheme?.palette?.grey?.dark || theme?.palette?.grey?.dark || ""}`,
		},
	},
	[`&.${classes.secondaryBackground}`]: {
		color: "white",
		backgroundColor: customTheme?.palette?.secondary?.main || theme?.palette?.secondary?.main || "",
		padding: customTheme?.padding || "2px 20px",
		border: `2px solid ${customTheme?.palette?.secondary?.main || theme?.palette?.secondary?.main || ""}`,
		borderRadius: customTheme?.shape?.borderRadiusWide || theme?.shape?.borderRadiusWide || "5px",
		fontFamily: "inherit",
		"&:hover": {
			color: "white",
			backgroundColor: customTheme?.palette?.secondary?.dark || theme?.palette?.secondary?.dark || "",
			border: `2px solid ${customTheme?.palette?.secondary?.dark || theme?.palette?.secondary?.dark || ""}`,
		},
		"&:disabled": {
			color: "white",
			backgroundColor: customTheme?.palette?.grey?.dark || theme?.palette?.grey?.dark || "",
			border: `2px solid ${customTheme?.palette?.grey?.dark || theme?.palette?.grey?.dark || ""}`,
		},
	},
	[`&.${classes.thirdBackground}`]: {
		color: "white",
		backgroundColor: customTheme?.palette?.third?.main || theme?.palette?.third?.main || "",
		padding: customTheme?.padding || "2px 20px",
		border: `2px solid ${customTheme?.palette?.third?.main || theme?.palette?.third?.main || ""}`,
		borderRadius: customTheme?.shape?.borderRadiusWide || theme?.shape?.borderRadiusWide || "5px",
		fontFamily: "inherit",
		"&:hover": {
			color: "white",
			backgroundColor: customTheme?.palette?.third?.dark || theme?.palette?.third?.dark || "",
			border: `2px solid ${customTheme?.palette?.third?.dark || theme?.palette?.third?.dark || ""}`,
		},
		"&:disabled": {
			color: "white",
			backgroundColor: customTheme?.palette?.grey?.dark || theme?.palette?.grey?.dark || "",
			border: `2px solid ${customTheme?.palette?.grey?.dark || theme?.palette?.grey?.dark || ""}`,
		},
	}
})

export const PrimaryBorderButton = forwardRef(({
	id = "primary-border-button",
	type = "button",
	disabled = false,
	className = "",
	titleClassName = "",
	size = "",
	width = "150px",
	height = "40px",
	title = "Button",
	buttonType = "normal",
	startIcon = null,
	customTheme,
	children,
	onClick,
}, ref) => {
	const CustomButton = buttonType === "normal" ? StyledButton : StyledLoadingButton;
	return (
		<CustomButton
			key={id}
			id={id}
			ref={ref}
			type={type}
			disabled={disabled}
			className={`${className} ${classes.primaryBorder}`}
			size={(size || "")}
			style={{ ...(width && { width }), ...(height && { height }) }}
			startIcon={startIcon}
			customTheme={customTheme}
			onClick={onClick}
		>
			<Typography className={titleClassName} style={{ textTransform: "none", fontFamily: "inherit" }}>
				{title}
			</Typography>
			{children}
		</CustomButton>
	)
});

const StyledButton = styled(Button)(buttonStyles);
const StyledLoadingButton = styled(LoadingButton)(buttonStyles);

export const WhiteBorderButton = forwardRef(({
	id = "white-border-button",
	type = "button",
	disabled = false,
	className = "",
	titleClassName = "",
	size = "",
	width = "150px",
	height = "40px",
	title = "Button",
	buttonType = "normal",
	startIcon = null,
	customTheme,
	children,
	onClick,
}, ref) => {
	const CustomButton = buttonType === "normal" ? StyledButton : StyledLoadingButton;
	return (
		<CustomButton
			key={id}
			id={id}
			ref={ref}
			type={type}
			disabled={disabled}
			className={`${className} ${classes.whiteBorder}`}
			size={(size || "")}
			style={{ ...(width && { width }), ...(height && { height }) }}
			startIcon={startIcon}
			customTheme={customTheme}
			onClick={onClick}
		>
			<Typography className={titleClassName} style={{ textTransform: "none", fontFamily: "inherit" }}>
				{title}
			</Typography>
			{children}
		</CustomButton>
	);
});

export const ThirdBackgroundButton = ({
	id = "third-background-button",
	type = "button",
	disabled = false,
	loading = false,
	className = "",
	titleClassName = "",
	size = "",
	width = "150px",
	height = "40px",
	title = "Button",
	startIcon = null,
	buttonType = "normal",
	customTheme,
	onClick,
}) => {
	const CustomButton = buttonType === "normal" ? StyledButton : StyledLoadingButton;
	return (
		<CustomButton
			key={id}
			id={id}
			type={type}
			disabled={disabled}
			loading={loading}
			className={`${className} ${classes.thirdBackground}`}
			size={(size || "")}
			style={{ ...(width && { width }), ...(height && { height }) }}
			startIcon={startIcon}
			customTheme={customTheme}
			onClick={onClick}
		>
			{!loading && (
				<Typography className={titleClassName} style={{ textTransform: "none", fontFamily: "inherit" }}>
					{title}
				</Typography>
			)}
		</CustomButton>
	);
}

export const PinkContainedButton = ({
	id = "proceedButton",
	type = "button",
	loading = false,
	disabled = false,
	className = "",
	title = "",
	titleClassName = "",
	titleColor = "white",
	size = "",
	width = "100px",
	onClick,
}) =>  (
	<LoadingButton
		key={id}
		id={id}
		type={type}
		loading={loading}
		disabled={disabled}
		className={className}
		variant="contained"
		color="pink"
		size={(size || "")}
		style={{ borderRadius: 20,
			...(width && { width }),
			minHeight: "36px" 
		}} // Added minHeight to maintain button height
		onClick={onClick}
	>
		{!loading && (
			<Typography className={titleClassName} sx={{ color: `${titleColor}!important`, fontSize: "small" }} style={{ textTransform: "uppercase" }}>
				<b>
					{title}
				</b>
			</Typography>
		)}
	</LoadingButton>
)

import { memo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { AppBar, Toolbar, MenuItem, Paper, Breadcrumbs, Box, Button, Tooltip, IconButton, Menu, Typography } from "@mui/material";

import { useOrders } from "../api/index.js";

import { Home as HomeIcon, Logout, ExpandMore, ViewList as ViewListIcon } from "@mui/icons-material";
import { WhiteBorderButton } from "./Button.jsx"
import cycloptLogo from "../assets/images/cyclopt_logo_with_text_white.svg";

import { Image } from "mui-image";
import theme from "../theme.js";
import { jwt, capitalize } from "#utils";

const styles = {
	grow: {
		flexBasis: "auto",
		elevation: 0,
	},
	sectionDesktop: {
		display: {
			xs: "none",
			md: "flex",
		},
	},
	sectionMobile: {
		display: {
			xs: "flex",
			md: "none",
		},
	},
	root: {
		width: "100%",
		px: 0,
		py: 1,
		borderRadius: "0px",
		bgcolor: "#ccd9e2",
	},
	icon: {
		mr: 0.5,
		width: 20,
		height: 20,
	},
	expanded: {
		bgcolor: "transparent",
	},
	innerSmallAvatar: {
		color: "common.black",
		fontSize: "inherit",
	},
	anchorOriginBottomRightCircular: {
		".MuiBadge-anchorOriginBottomRightCircular": {
			right: 0,
			bottom: 0,
		},
	},
	avatar: {
		width: "30px",
		height: "30px",
		background: "white",
	},
	iconButton: {
		p: "3px 6px",
	},
	menuItemButton: {
		width: "100%",
		bgcolor: "grey.light",
		"&:hover": {
			bgcolor: "grey.dark",
		},
	},
	menuItemCreateButton: {
		width: "100%",
		bgcolor: "secondary.main",
		"&:hover": {
			bgcolor: "secondary.main",
		},
	},
	grey: {
		color: "grey.500",
	},
	outlinedButton: {
		borderRadius: "20px",
		textTransform: "none!important",
		backgroundColor: "transparent",
		color: "white",
		fontSize: "1rem",
		padding: "2px 20px",
		border: "1px solid white",
		"&:hover": {
			borderColor: theme.palette.primary.dark,
			backgroundColor: theme.palette.grey.dark,
		},
	},
};

const Header = () => {
	const { orders = [], isLoading: isOrdersLoading,  mutate: ordersMutate } = useOrders();
	const location = useLocation();
	const navigate = useNavigate();
	const CrumpLink = styled(Link)(({ theme }) => ({ display: "flex", color: theme.palette.primary.main }));
	
	const [anchorElOrganizations, setAnchorElOrganizations] = useState(null);
	const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

	const handleOrganizationsMenuOpen = (event) => { ordersMutate(); setAnchorElOrganizations(event.currentTarget); };
	const handleMobileMenuClose = () => setMobileMoreAnchorEl(null);

	const isMenuOpenOrganizations = Boolean(anchorElOrganizations);
	const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

	const handleOrganizationsMenuClose = () => { setAnchorElOrganizations(null); handleMobileMenuClose(); };

	const renderMenu = (
		<>
			{orders.length > 0 && (
				<Menu
					keepMounted
					anchorEl={anchorElOrganizations}
					anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
					transformOrigin={{ vertical: "top", horizontal: "right" }}
					open={isMenuOpenOrganizations}
					onClose={handleOrganizationsMenuClose}
					sx={{ position: "absolute" }}
				>
					{[...orders].sort((v) => v.organizationName).map((e) => (
						<MenuItem key={`${e._id}_organizationMenu}`} onClick={handleOrganizationsMenuClose}>
							<Button component={Link} variant="contained" sx={styles.menuItemButton} to={`/reports/organizations/${e.assignments.organization.toString()}`}>
								<Typography noWrap sx={{ maxWidth: 250, color: "primary.main" }}>{e.organizationName}</Typography>
							</Button>
						</MenuItem>
					))}
				</Menu>
			)}
		</>
	);

	const renderMobileMenu = (
		<Menu
			keepMounted
			anchorEl={mobileMoreAnchorEl}
			anchorOrigin={{ vertical: "top", horizontal: "right" }}
			transformOrigin={{ vertical: "top", horizontal: "right" }}
			open={isMobileMenuOpen}
			onClose={handleMobileMenuClose}
			sx={{ position: "absolute" }}
		>
			<MenuItem onClick={orders.length > 0 ? handleOrganizationsMenuOpen : () => { handleMobileMenuClose(); navigate("/organizations"); }}>
				<IconButton color="primary"><ViewListIcon /></IconButton>
				<p>{"Organizations"}</p>
			</MenuItem>
		</Menu>
	);

	const pathnames = location.pathname.split("/").filter(Boolean);
	const crumps = [];
	crumps.push(<CrumpLink to="/home" style={{ textDecoration: "none" }}> <HomeIcon sx={styles.icon} /> {"Home"} </CrumpLink>)
	if (!pathnames.includes("home")) {
		crumps.push(
			pathnames.length === 1
				? (
					<CrumpLink to={`/${pathnames.join("/")}`} style={{ textDecoration: "none" }}>
						{capitalize(pathnames.join("/"))}
					</CrumpLink>
				)
				: (
					<CrumpLink to={`/${pathnames.join("/")}`} style={{ textDecoration: "none" }}>
						{pathnames.join("/")}
					</CrumpLink>
				)
		);
	}

	const atHomePage = pathnames.includes("home");

	return (
		<>
			<AppBar position="static" sx={styles.grow}>
				<Toolbar className="header-container" sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
					<Box component={Link} to="/">
						<Image src={cycloptLogo} alt="Cyclopt" width="10rem" sx={{ my: 1, minWidth: "130px" }} />
					</Box>
					<Box display="flex" flexDirection="row" sx={{ gap: "2rem" }}>
						<WhiteBorderButton
							disabled={isOrdersLoading || orders.length === 0}
							width="auto"
							title={atHomePage ? "Recent Reports" : "Home"}
							onClick={(event) => {
								if (atHomePage) {
									if (orders.length > 0 ){
										handleOrganizationsMenuOpen(event);
									}
								} else {
									navigate("/");
								}
							}}
						>
							{(orders.length > 0 && atHomePage) && <ExpandMore />}
						</WhiteBorderButton>
						<Tooltip  title="Log Out">
							<IconButton color="inherit" onClick={() => {
								jwt.destroyTokens();
								navigate("/");
							}}
							><Logout /></IconButton>
						</Tooltip>
					</Box>
				</Toolbar>
				<Paper elevation={0} sx={styles.root}>
					<Box className="header-container" display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
						<Breadcrumbs>{crumps.map((e, ind) => <div key={`crump_${ind}`}>{e}</div>)}</Breadcrumbs>
					</Box>
				</Paper>
			</AppBar>
			{renderMobileMenu}
			{renderMenu}
		</>
	);
};

export default memo(Header);

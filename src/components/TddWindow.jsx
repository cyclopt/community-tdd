 
import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Grid, Typography, Button, FormControl, Box, TextField,Autocomplete, CircularProgress, Popper, MenuItem, Paper } from "@mui/material";
import { Image } from "mui-image";
import JSZip from "jszip";
import { sendTddFileReport, useRepositories, useCommit, getRepoReport, useTdds, setDefaultOrder } from "../api/index.js"
import Tooltip from "./Tooltip.jsx";

import theme from "../theme.js";
import  { ThirdBackgroundButton, PrimaryBorderButton } from "./Button.jsx";
import { useSnackbar, toBeCompressed } from "#utils";
import OnTheWayIcon from "../assets/images/on_the_way.png";
import Spinner from "./Spinner.jsx";
import { ArrowDropDown } from "@mui/icons-material";

const styles = {
	container: {
		position: "absolute",
		top: "20%",
		right: "10%",
		backgroundColor: "#fff",
		borderRadius: "20px",
		padding: "20px 40px",
		width: "600px",
		margin: "50px auto",
		textAlign: "center",
		boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
	},
	title: {
		color: theme.palette.primary.main,
		fontWeight: "bold",
		fontSize: "2rem",
	},
	subtitle: {
		color: theme.palette.primary.main,
		fontSize: "1.2rem",
	},
	text: {
		color: theme.palette.primary.main,
		fontSize: "1rem",
		textAlign: "left",
		textTransform: "none!important",
	},
	outlinedButton: {
		borderRadius: "20px",
		textTransform: "none!important",
		backgroundColor: "transparent",
		color: theme.palette.primary.main,
		fontSize: "1rem",
		padding: "2px 20px",
		border: `1px solid ${theme.palette.primary.main}`,
		"&:hover": {
			borderColor: theme.palette.primary.dark,
			backgroundColor: theme.palette.grey.light,
		},
	},
	uploadButton: {
		width: "100%",
		height: "40px",
		display: "flex",
		alignItems: "center",
		textTransform: "none!important",
		backgroundColor: "transparent",
		color: theme.palette.primary.main,
		fontSize: "1rem",
		border: "0px",
		margin: "5px 0",
		cursor: "pointer",
		"&:hover": {
			borderColor: theme.palette.primary.dark,
		},
	},
	finalTitle: {
		color: theme.palette.secondary.main,
		fontStyle: "italic",
		fontSize: "1.8rem",
	},
	finalSubtitle: {
		color: theme.palette.primary.main,
		fontSize: "1.2rem",
	},
	error: {
		color: theme.palette.error.main,
		fontWeight: "bold",
		fontSize: "1rem",
		paddingTop: "1rem"
	},
};

const TddWindow = ({ orders, isOrdersLoading, ordersMutate, selectedOrder, setSelectedOrder }) => {
	const { repositories = [], isLoading: isRepositoriesLoading} = useRepositories();
	const { tdds = [], isLoading: tddLoading } = useTdds(orders, selectedOrder);
	const { success, error: snackError } = useSnackbar();
	const [isLoading, setIsLoading]= useState(false);
	const [currentStep, setCurrentStep] = useState(0);
	const [file, setFile] = useState(null);
	const [fileError, setFileError] = useState(false);
	const [customSections, setCustomSections] = useState({ security: false, maintainability: false });
	const [tosAccepted, setTosAccepted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [repo, setRepo] = useState({});
	const [reportNotExistForSpecificSections, setReportNotExistForSpecificSections] = useState(false);
	const { commit = {}, isLoading: commitIsLoading } = useCommit(Object.keys(repo ?? {}).length > 0 ? repo : {});
	const allCommitIds = useMemo(() => {
		if (!tddLoading && !isRepositoriesLoading) {
			return tdds.map((tdd) => ({commitId: tdd.commitId, sections: tdd.customSections}))
		}

		return []
	}, [isRepositoriesLoading, tddLoading, tdds])

	// this checks if report exist for the specific sections on the repos selection
	useEffect(() => {
		if (
			Object.keys(commit ?? {}).length > 0 &&
			!commitIsLoading &&
			!isRepositoriesLoading &&
			Array.isArray(allCommitIds)
		) {
			const matchingCommitId = commit?.commit?.commitId;
	
			const matchingSections = allCommitIds.filter((c) => c.commitId === matchingCommitId);
	
			const results = matchingSections.map(({ sections }) => {
				const { sast, metrics, violations, vulnerabilities } = sections || {};
				const isSecurityExist = sast && violations && vulnerabilities;
				const isMaintainabilityExist = metrics;
	
				const securityMatch = isSecurityExist === customSections.security;
				const maintainabilityMatch = isMaintainabilityExist === customSections.maintainability;
	
				return {
					sectionsAllreadyAnalyzed: securityMatch && maintainabilityMatch
				};
			});
	
			const isSectionDisabled = results.every((r) => r.sectionsAllreadyAnalyzed === false)
			setReportNotExistForSpecificSections(isSectionDisabled)
		} else {
			setReportNotExistForSpecificSections(false);
		}
	}, [allCommitIds, commit, commitIsLoading, customSections, isRepositoriesLoading]);

	const isRepoExist = useMemo(() => {
		if (Object.keys(repo ?? {})?.length > 0) {
			return true
		}

		return false
	}, [repo])

	const userHasSelectedOrder = useMemo(() => {
		if (Object.keys(selectedOrder ?? {}).length > 0) return true;

		return false;
	}, [selectedOrder])

	const handleFileChange = (event) => {
		setIsLoading(true);
		const uploadedFile = event.target.files;

		const acceptedTypes = ["application/x-zip-compressed", "application/zip"]

		if (uploadedFile.length === 1 && acceptedTypes.includes(uploadedFile[0].type)) {
			setFile(uploadedFile[0]);
			setFileError(false);
			setCurrentStep(1);
		} else {
			const folderName = uploadedFile[0].webkitRelativePath.split("/")[0];
			const zip = new JSZip();
			for (const file of uploadedFile) {
				const relativePath = file.webkitRelativePath.replace(`${folderName}/`, "");
				if (relativePath.includes("node_modules") ||
					relativePath.includes("site-packages") ||
					relativePath.includes(".git") ||
					relativePath.includes("__pycache__") ||
					relativePath.includes(".generated.cs")
				) continue;
				if (!toBeCompressed(relativePath)) continue;
				zip.file(file.webkitRelativePath, file);
			}

			zip.generateAsync({ type: "blob" }).then((zippedFile) => {
				const zipFile = new File([zippedFile], folderName, { type: "application/zip" });
				setFile(zipFile);
				setFileError(false);
				setCurrentStep(1);
			}).catch((error) => {
				console.error("Error zipping files:", error);
				setFileError(true);
			});
		}

		event.target.value = "";
		setIsLoading(false);
	};

	const handleFileDelete = () => {
		setFile(null);
		setCurrentStep(0);
	};

	const handleRepoDelete = () => {
		setRepo({})
		setCurrentStep(0);
	}

	const handleSubmit = async (order) => {
		setIsSubmitting(true);
		try {
			const finalSections = {
				sast: customSections?.security ?? false,
				vulnerabilities: customSections?.security ?? false,
				violations: customSections?.security ?? false,
				metrics: customSections?.maintainability ?? false,
			};

			const formData = new FormData();
			formData.append("repository", file);
			formData.append("sections", JSON.stringify(finalSections));
			formData.append("order", JSON.stringify(order._id));
			await sendTddFileReport(formData);
			ordersMutate();
			success("The TDD report will be sent to your email once the analysis is completed.");
			setCurrentStep(2);
		} catch {
			snackError();
		}

		setIsSubmitting(false);
	};

	const handleHome = () => {
		setCurrentStep(0);
		setFile(null);
		setRepo({})
		setFileError(false);
		setCustomSections({ security: false, maintainability: false });
		setTosAccepted(false);
		setIsSubmitting(false);
	};

	const handleRepo = (repoData) => {
		setRepo(repoData);
		setCurrentStep(1);
	};

	const handleRepoReport = async (commitData, repoData, sectionsData, order) => {
		try {
			setIsLoading(true);
			getRepoReport(commitData, repoData, sectionsData, order._id)
			ordersMutate()
			success("The TDD report will be sent to your email once the analysis is completed.");
			setIsLoading(false);
			setCurrentStep(2);
		} catch {
			snackError();
		}
	}

	const orderHasTddReports = useMemo(() => {
		if (orders?.length > 0) {
			return true
		}

		return false

	} , [orders])

	const uploadButtonDisabled = useMemo(() => {
		if (!orderHasTddReports) {
			return true
		}

		if (orderHasTddReports && isRepoExist) {
			return true
		}

		return false
	}, [isRepoExist, orderHasTddReports])

	const anchorRef = useRef(null);
	const popperRef = useRef(null);
	const [open, setOpen] = useState(false);

	const handleClose = () => {
		setOpen(false);
	};
	
	const handleToggle = () => setOpen((prev) => !prev);

	// This is for closing the popper if the user clicks outside the popper
	useEffect(() => {
		const handleClickOutside = (event) => {
			const anchor = anchorRef.current;
			const popper = popperRef.current;

			if (anchor && popper && !anchor.contains(event.target) && !popper.contains(event.target)) {
				setOpen(false);
			}
		};

		if (open) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [open]);

	return ([
		<Box key="main-page" sx={styles.container}>
			<Typography sx={styles.title}>
				{"Technical Due Diligence"}
			</Typography>
			<Typography sx={styles.subtitle}>
				{"In-depth analysis fast & easy"}
			</Typography>
			{(orders?.length === 0 && !isOrdersLoading) && (
				<Typography sx={styles.error}>
					{"You don't have any active subscription with available Tdd reports"}
				</Typography>
			)}
			{currentStep === 0
			&& (
				<Grid container direction="column" alignItems="center" spacing={2} mt={2}>
					{(orders?.length > 1 && Object.keys(selectedOrder ?? {}).length === 0) && (
						<Grid item width="100%">
							<>
								<Typography sx={styles.text}>{"Choose which organization you want to use"}</Typography>
								<FormControl fullWidth>
									<Autocomplete
										loading={isOrdersLoading}
										options={orders}
										getOptionLabel={(option) => {
											const count = option.subscription.services.tdd.remainingReports;
											return `${option.organizationName} (${count} ${count === 1 ? 'report' : 'reports'} remaining)`;
										}}
										renderInput={(params) => (
											<TextField
												{...params}
												label={repo? "Organization" : "Select Organization"}
												error={!isRepositoriesLoading && !repo} // Highlight input with red border if error exists
												helperText={!isRepositoriesLoading && !repo ? 'No repository selected' : ''} // Display error message if error exists	variant="outlined"
												InputProps={{
													...params.InputProps,
													endAdornment: (
														<>
															{isRepositoriesLoading ? (
																<CircularProgress
																	color="secondary"
																	size={20}
																/>
															) : null}
															{params.InputProps.endAdornment}
														</>
													),
												}}
											/>
										)}
										onChange={async (_, value) => {
											setIsLoading(true);
											await setDefaultOrder(value._id);
											setSelectedOrder(value);
											setIsLoading(false);
										}}
									/>
								</FormControl>
							</>
						</Grid>
					)}

					{userHasSelectedOrder && (
						<Grid container>
							<Typography sx={styles.text}>{"Selected organization"}</Typography>
							<Grid
								item
								width="100%"
								display="flex"
								justifyContent="space-between"
								alignItems="center"
									
								sx={{ borderBottom: "1px solid #ccc", paddingBottom: "5px" }}
							>
								<Typography sx={{ display: 'flex', alignItems: 'center' }}>
									<span>{selectedOrder.organizationName}</span>
									<span style={{ marginLeft: 8 }}>
										({selectedOrder?.subscription?.services?.tdd?.remainingReports} remaining)
									</span>
								</Typography>
									
								<Button
									disabled={isSubmitting || orders.length === 1}
									sx={styles.outlinedButton}
									onClick={() => {
										setSelectedOrder({});
										setRepo({});
										setFile(null);
										setCurrentStep(0);
									}}
								>
									{"Change Organization"}
								</Button>
							</Grid>
						</Grid>
					)}
					
					{(userHasSelectedOrder) && (
						<Grid item width="100%">
							<Typography sx={styles.text}>{"Choose Repository"}</Typography>
							<FormControl fullWidth>
								<Tooltip title={orderHasTddReports ? null : "This Organization does not have any available TDD reports"}>
									<Autocomplete
										disabled={!orderHasTddReports}
										loading={isRepositoriesLoading}
										options={repositories}
										getOptionLabel={(option) => (option.root === ".") ? `${option.owner}/${option.name}` : `${option.owner}/${option.name}/${option.root}`}
										renderInput={(params) => (
											<TextField
												{...params}
												label={repo? "Repository" : "Select Repository"}
												error={!isRepositoriesLoading && !repo} // Highlight input with red border if error exists
												helperText={!isRepositoriesLoading && !repo ? 'No repository selected' : ''} // Display error message if error exists	variant="outlined"
												InputProps={{
													...params.InputProps,
													endAdornment: (
														<>
															{isRepositoriesLoading ? (
																<CircularProgress
																	color="secondary"
																	size={20}
																/>
															) : null}
															{params.InputProps.endAdornment}
														</>
													),
												}}
											/>
										)}
										onChange={(_, value) => handleRepo(value)}
									/>
								</Tooltip>
							</FormControl>
						</Grid>
					)}

					{(userHasSelectedOrder && !isRepoExist) && (
						(
							<>
								<Grid
									item
									width="100%"
									display="flex"
									justifyContent="space-between"
									alignItems="center"
								>
									<Typography sx={styles.text}>Upload your source code</Typography>
									<PrimaryBorderButton
										ref={anchorRef}
										title="Upload"
										disabled={uploadButtonDisabled}
										onClick={handleToggle}
									>
										<ArrowDropDown
											sx={{
												transform: open ? "rotate(180deg)" : "rotate(0deg)",
												transition: "transform 0.3s ease",
											}}
										/>
									</PrimaryBorderButton>
									<Popper
										open={open}
										anchorEl={anchorRef.current}
										placement="bottom-start"
										style={{ zIndex: 1300 }}
									>
										<Paper ref={popperRef} sx={{width:  "150px"}}>
											<MenuItem sx={{ width: "150px" }}>
												<Grid component="label" sx={styles.uploadButton}>
													{"Upload zip"}
													<input
														hidden
														type="file"
														accept=".zip"
														onChange={(e) => {
															handleClose();
															handleFileChange(e);
														}}
													/>
												</Grid>
											</MenuItem>
											<MenuItem sx={{ width: "150px" }}>
												<Grid component="label" sx={styles.uploadButton}>
													{ "Upload Folder"}
													<input
														hidden
														type="file"
														webkitdirectory=""
														onChange={(e) => {
															handleClose();
															handleFileChange(e);
														}}
													/>
												</Grid>
											</MenuItem>
										</Paper>
									</Popper>
								</Grid>
								{fileError && (
									<Typography color="error" sx={{ marginBottom: 2 }}>
										{"There was an error uploading the file. Please upload a ZIP file or a smaller folder."}
									</Typography>
								)}
							</>
						) 
					)}
				</Grid>
			)}
			{currentStep === 1
			&& (
				<Grid container direction="column" alignItems="center" spacing={2} mt={2}>
					<Grid item width="100%">
						{userHasSelectedOrder && (
							<Grid container>
								<Typography sx={styles.text}>{"Selected organization"}</Typography>
								<Grid
									item
									width="100%"
									display="flex"
									justifyContent="space-between"
									alignItems="center"
									
									sx={{ borderBottom: "1px solid #ccc", paddingBottom: "5px" }}
								>
									<Typography sx={{ marginRight: 2 }}>{`${selectedOrder.organizationName}`}</Typography>
									
									<Button
										disabled={isSubmitting}
										sx={styles.outlinedButton}
										onClick={() => {
											setSelectedOrder({});
											setRepo({});
											setFile(null);
											setCurrentStep(0);
										}}
									>
										{"Change Organization"}
									</Button>
								</Grid>
							</Grid>
						)}
						{(file || isRepoExist) && (
							<Grid container sx={{paddingTop: 2}}>
								{isRepoExist ? <Typography sx={styles.text}>{"Selected Repo"}</Typography> : <Typography sx={styles.text}>{"Selected File/Folder"}</Typography>}
								<Grid
									item
									width="100%"
									display="flex"
									justifyContent="space-between"
									alignItems="center"
									
									sx={{ borderBottom: "1px solid #ccc", paddingBottom: "5px" }}
								>
									{isRepoExist ? <Typography sx={{ marginRight: 2 }}>{(repo.root === ".") ? `${repo.owner}/${repo.name}` : `${repo.owner}/${repo.name}/${repo.root}`}</Typography> : <Typography sx={{ marginRight: 2 }}>{file.name}</Typography>}
									
									<Button disabled={isSubmitting} sx={styles.outlinedButton} onClick={isRepoExist ? handleRepoDelete : handleFileDelete }>
										{isRepoExist? "Change Repository" : "Change file/folder"}
									</Button>
								</Grid>
							</Grid>
						)}
						<Grid container mt={2}>
							<Typography sx={styles.text}>{"Select Analysis Sections"}</Typography>
							<Grid
								item
								width="100%"
								display="flex"
								justifyContent="space-between"
								alignItems="center"
								mt={1}
							>
								{Object.keys(customSections).map((section) => (
									<Grid item key={section} display="flex" alignItems="center">
										<input
											type="checkbox"
											className="custom-checkbox"
											disabled={isSubmitting}
											checked={customSections[section]}
											onChange={() => setCustomSections({ ...customSections, [section]: !customSections[section] })}
										/>
										<Typography sx={{ marginLeft: 1 }}>{section.charAt(0).toUpperCase() + section.slice(1)}</Typography>
									</Grid>
								))}
							</Grid>
						</Grid>
						<Grid container mt={2}>
							<Grid
								item
								width="100%"
								display="flex"
								justifyContent="center"
								alignItems="center"
							>
								<Grid item display="flex" alignItems="center">
									<input
										type="checkbox"
										className="custom-checkbox"
										disabled={isSubmitting}
										checked={tosAccepted}
										onChange={() => setTosAccepted(!tosAccepted)}
									/>
									<Typography sx={{ marginLeft: 1 }}>{"I have read and accepted the "}</Typography>
									<Link to="https://cyclopt.com/tos" target="_blank">
										<Typography sx={{ marginLeft: 0.5, textDecoration: "underline", color: theme.palette.primary.main }}>
											{"Terms of Service"}
										</Typography>
									</Link>
								</Grid>
							</Grid>
						</Grid>
						<Grid container mt={2}>
							<Grid
								item
								width="100%"
								display="flex"
								justifyContent="center"
								alignItems="center"
							>
								<Tooltip title={(Object.keys(repo).length === 0 || reportNotExistForSpecificSections) ? null : "Report already exist for this hash and section/sections"}>
									<Box display="inline-block">
										{(() => {
											const hasSelectedSections = Object.values(customSections).some(Boolean);
											const hasRepo = Object.keys(repo).length > 0;
											const isDisabled = hasRepo
												? (!tosAccepted || !hasSelectedSections || !reportNotExistForSpecificSections || isSubmitting)
												: (!tosAccepted || !hasSelectedSections || isSubmitting);
												
											return (<ThirdBackgroundButton
												loading={isSubmitting || (isRepoExist && commitIsLoading)}
												disabled={isDisabled}
												title={"Start Analysis"}
												width="200px"
												buttonType="loading"
												onClick={async () => isRepoExist ? await handleRepoReport(commit, repo, customSections, selectedOrder) : await handleSubmit(selectedOrder)}
											/>)
										})()}
										
									</Box>
								</Tooltip>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			)}
			{currentStep === 2
			&& (
				<Grid container direction="column" alignItems="center" spacing={2} mt={2}>
					<Grid item width="100%" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
						<Image src={OnTheWayIcon} alt="OnTheWay" width="100px" />
						<Typography sx={styles.finalTitle} mt={1}>{"Your analysis is on the way!"}</Typography>
						<Typography sx={styles.finalSubtitle} mb={2}>{"You will be informed by email when the report is ready."}</Typography>
						<Button sx={styles.outlinedButton} onClick={handleHome}>
							{"Back to Home"}
						</Button>
					</Grid>
				</Grid>
			)}
		</Box>,
		<Spinner key="spinner" open={isLoading || isOrdersLoading} />
	]);
};

TddWindow.propTypes = {
	orders: PropTypes.array,
	isOrdersLoading: PropTypes.bool,
	ordersMutate: PropTypes.func,
	selectedOrder: PropTypes.object,
	setSelectedOrder: PropTypes.func,
};

export default TddWindow;

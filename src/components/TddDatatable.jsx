import { memo, useMemo, useState } from "react";
import { Grid, Button, Box, Typography } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PropTypes from "prop-types";
import { dayjs, useSnackbar } from "#utils";
import { downloadReport, useTdds} from "../api/index.js";

import DataTable from "../components/DataTable.jsx"

const TddDataTable = ({ orders, isOrdersLoading, selectedOrder, userId }) => {
	const { tdds = [], isLoading: tddLoading } = useTdds(orders, selectedOrder);
	const [isLoading, setIsLoading] = useState(false)
	const { error: snackError } = useSnackbar();

	const downloadPdfReport = async (pdfCloudPath) => {
		setIsLoading(true);
		try {
			const blob = await downloadReport(pdfCloudPath);
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "report.pdf";
			document.body.append(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (error) {
			snackError(error);
		}

		setIsLoading(false);
	};

	const userIsAdmin = useMemo(() => userId.toString() === selectedOrder?.user, [selectedOrder, userId])

	const tableColumns = useMemo(() => [
		{
			field: "File Name",
			minWidth: 200,
			flex: 1,
			valueGetter: ({ row }) => row?.fileName,
			renderCell: ({ value}) => (
				<Box sx={{ display: "block" }}>
					{value ? (<Typography>{value}</Typography>) : (<Typography>{"-"}</Typography>)}
				</Box>
			),
		},
		{
			field: "Repo Name",
			minWidth: 200,
			flex: 1,
			valueGetter: ({ row }) => row?.repoOwner ? `${row?.repoOwner}/${row?.repoName}` : null,
			renderCell: ({ value}) => (
				<Box sx={{ display: "block" }}>
					{value ? (<Typography>{value}</Typography>) : (<Typography>{"-"}</Typography>)}
				</Box>
			),
		},
		...(userIsAdmin ? [
			{
				field: "Email",
				minWidth: 200,
				flex: 1,
				valueGetter: ({ row }) => row.email,
				renderCell: ({ value }) => (
					<Box sx={{ display: "block" }}>
						<Typography>{value || "-"}</Typography>
					</Box>
				),
			}
		] : []),
		{
			field: "Created at",
			minWidth: 200,
			flex: 1,
			valueGetter: ({ row }) => row.createdAt,
			renderCell: ({ value}) => (
				<Box sx={{ display: "block" }}>
					<Typography>{dayjs(value).format("DD/MM/YYYY")}</Typography>
				</Box>
			),
		},
		{
			field: "Download Report",
			minWidth: 200,
			flex: 1,
			valueGetter: ({ row }) => row.pdfCloudPath,
			renderCell: ({value }) => (
				<Button onClick={async () => await downloadPdfReport(value)}>
					<FileDownloadIcon />
				</Button>
			),
		},
	], [userIsAdmin]);

	const finalLoadingValue = useMemo(() => {
		if (isOrdersLoading) return false;
		if (!orders?.length) return false;

		const hasSelectedOrder = Object.keys(selectedOrder ?? {}).length > 0;

		if (orders.length === 1 || (orders.length > 1 && hasSelectedOrder)) {
			return tddLoading || isLoading;
		}

		return false;
	}, [isLoading, isOrdersLoading, orders?.length, selectedOrder, tddLoading]);

	return (
		<Grid container className="item" sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
			<DataTable
				rows={tdds}
				loading={(finalLoadingValue)}
				columns={tableColumns}
				initialState={{ sorting: { sortModel: [{ field: "Last Active", sort: "desc" }] }, pagination: { paginationModel: { page: 0 } } }}
			/>
		</Grid>	
	)
}

TddDataTable.propTypes = {
	orders: PropTypes.array,
	isOrdersLoading: PropTypes.bool,
	selectedOrder: PropTypes.object,
	userId: PropTypes.string,
};

export default memo(TddDataTable);
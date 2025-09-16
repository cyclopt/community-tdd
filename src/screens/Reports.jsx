import { memo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Grid, Typography, LinearProgress } from "@mui/material";
import { useSnackbar, jwt } from "#utils";
import { PinkContainedButton } from "../components/Button.jsx";
import TddDatatable from "../components/TddDatatable.jsx";
import { useOrders } from "../api/index.js"

const Reports = () => {
	const { organizationId } = useParams();
	const { id: userId } = jwt.decode();
	const { error } = useSnackbar();
	const navigate = useNavigate();

	const { orders = [], isLoading: isOrdersLoading} = useOrders();
	const [selectedOrder, setSelectedOrder] = useState({})

	// select the order if there is only one available
	useEffect(() => {
		if (isOrdersLoading || !orders?.length) return;

		const matchingOrder = orders.find((order) => order.assignments.organization.toString() === organizationId);

		if (matchingOrder) {
			setSelectedOrder(matchingOrder);
		} else {
			error();
			navigate("/");
		}
	}, [error, isOrdersLoading, navigate, orders, organizationId]);

	return (
		<>
			{isOrdersLoading && (<LinearProgress />)}
			<Grid container className="header-container" display="flex" direction="column">
				<Grid container display="flex" direction="column" sx={{ py: "2rem"}}>
					<Grid display="flex" justifyContent="space-between" alignItems="center">
						<Typography variant="h4">{"RECENT REPORTS"}</Typography>
						<PinkContainedButton
							width="auto"
							disabled={isOrdersLoading}
							title="Start new Analysis"
							onClick={() => navigate("/")}
						>
						</PinkContainedButton>
					</Grid>
					<Grid item display="flex">
						<Typography variant="h6">{`Remaining: ${selectedOrder?.subscription?.services?.tdd?.remainingReports}/${selectedOrder?.subscription?.services?.tdd?.reports}`}</Typography>
					</Grid>
				</Grid>
				<Grid container sx={{paddingTop: 5, paddingLeft:5, paddingRight: 5}}>
					<TddDatatable orders={orders} isOrdersLoading={isOrdersLoading} selectedOrder={selectedOrder} userId={userId} />
				</Grid>
			</Grid>
		</>
	);
}

export default memo(Reports);
import { memo, useEffect, useState } from "react";
import { Grid, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

import BackgroundImage from "../assets/images/background.jpg"
import TddWindow from "../components/TddWindow.jsx";
import { useOrders, setDefaultOrder, useUserDefaultInfo } from "../api/index.js"

const classes = {
	root: "Home-root",
	mainPage: "Home-mainPage",
};

const StyledGrid = styled(Grid)(() => ({
	[`&.${classes.root}`]: {
		alignItems: "center",
		justifyContent: "center",
		width: "100vw",
		height: "calc(100vh - 104px)" // decrease minHeight by header and footer heights
	},
	[`& .${classes.mainPage}`]: {
		flexGrow: 1,
		height: "100%",
		backgroundImage: `url(${BackgroundImage})`,
		backgroundSize: "cover",
		backgroundPosition: "center",
		backgroundRepeat: "no-repeat",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
	},
}));

const Home = () => {
	const isLoading = false;
	const { orders = [], isLoading: isOrdersLoading, mutate: ordersMutate} = useOrders();
	const { user = {}, isLoading: isUserLoading} = useUserDefaultInfo();
	const [selectedOrder, setSelectedOrder] = useState({})

	// assign the user's only order as their default if none is set
	useEffect(() => {
		if (orders.length === 1 && !user?.defaultTddOrder && !isUserLoading && !isOrdersLoading) {
			(async () => { await setDefaultOrder(orders[0]._id); })();
		}
	}, [isOrdersLoading, isUserLoading, orders, user]);

	// select the order if there is only one available
	useEffect(() => {
		if (isUserLoading || isOrdersLoading || !orders?.length) return;

		const defaultOrderId = user?.defaultTddOrder;
		const matchingOrder = orders.find(order => order._id === defaultOrderId);

		if (matchingOrder) {
			setSelectedOrder(matchingOrder);
		} else if (orders.length === 1) {
			setSelectedOrder(orders[0]);
		}
	}, [isOrdersLoading, isUserLoading, orders, user]);

	return isLoading ? (
		<Grid item container xs={12} justifyContent="center" alignItems="center" mt={4}>
			<CircularProgress color="secondary" />
		</Grid>
	) : (
		<>
			<StyledGrid container display="flex" direction="row" className={classes.root}>
				<Grid item className={classes.mainPage}>
					<TddWindow orders={orders} isOrdersLoading={isOrdersLoading} ordersMutate={ordersMutate} selectedOrder={selectedOrder} setSelectedOrder={setSelectedOrder} />
				</Grid>
			</StyledGrid>
		</>
	);
    
}

export default memo(Home);

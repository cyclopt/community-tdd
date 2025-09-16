/* global globalThis */

import useSWR from "swr";
import ky from "ky";
import queryString from "query-string";
import constructUrl from "@iamnapo/construct-url";

import { jwt } from "#utils";

const kyInstance = ky.extend({
	timeout: false,
	prefixUrl: constructUrl(import.meta.env.VITE_MAIN_SERVER_URL),
	retry: {
		statusCodes: [401, 408, 413, 429, 502, 503, 504],
		limit: 2,
		methods: ["get", "post", "put", "head", "delete", "options", "trace"],
	},
	hooks: {
		beforeRequest: [(request) => {
			const token = jwt.getToken();
			const refreshToken = jwt.getRToken();
			if (token) request.headers.set("x-access-token", token);
			if (refreshToken) request.headers.set("x-refresh-token", refreshToken);
		}],
	},
	...(import.meta.env.VITE_SENTRY_ENVIRONMENT === "develop" ? { cache: "no-store" } : {}), // This disables caching
});

const rootApi = kyInstance.extend({
	hooks: {
		beforeRetry: [
			async ({ request: { method }, error }) => {
				if (error?.response?.status === 401) {
					const res = await kyInstance.extend({ throwHttpErrors: false, retry: 0 }).get("api/refresh");
					if (res.status === 401) {
						jwt.destroyTokens();
						globalThis.location.href = "/";
					} else {
						const { token } = await res.json();
						jwt.setToken(token);
					}
				} else if (method === "POST") {
					throw error;
				}
			},
		],
	},
});

const api = {
	get: (path, searchParams) => rootApi.get(path, { searchParams: queryString.stringify(searchParams) }).json(),
	post: (path, json, searchParams) => rootApi.post(path, { json, searchParams }).json(),
	put: (path, json, searchParams) => rootApi.put(path, { json, searchParams }).json(),
	patch: (path, json, searchParams) => rootApi.patch(path, { json, searchParams }).json(),
	delete: (path, json, searchParams) => rootApi.delete(path, { json, searchParams }).json(),
	postFormData: async (path, formData) => {
		const response = await rootApi.post(path, { body: formData });
		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}

		return response.json();
	},
	postBlob: async (path, json) => {
		const response = await ( rootApi).post(path, { json });
		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}

		const blob = await response.blob();
		return blob;
	},
};

export default api;

const is = (data, error) => ({ isLoading: !error && !data, isError: Boolean(error) });

// * ------------------------------------- GET Requests using SWR -------------------------------------

export const useRepositories = () => {
	const url = "api/tdd-reports/report/repositories";
	const { data, error, mutate } = useSWR(url);
	return { repositories: data, ...is(data, error), mutate };
};

export const useOrders = () => {
	const url = `api/tdd-reports/report/orders`;
	const { data, error, mutate } = useSWR(url);
	return { orders: data, ...is(data, error), mutate };
};

export const useCommit = (repository = {}) => {
	const url = `api/tdd-reports/report/latest-analyses`;
	const { data, error, mutate } = useSWR(
		repository?.name && repository?.name ? [JSON.stringify(repository)] : null,
		() => api.get(url, { ...repository }),
	);
	return { commit: data, ...is(data, error), mutate };
};

export const useUserDefaultInfo = (field = "defaultTddOrder") => {
	const url = "api/panorama/users/defaults";
	const { data, error, mutate } = useSWR(url, () => api.get(url, { field }));
	return { user: data, ...is(data, error), mutate };
};

export const useTdds = (orders, selectedOrder) => {
	let url = null;
	const hasSelectedOrder = Object.keys(selectedOrder ?? {}).length > 0;

	if (orders?.length === 1) {
		url = `api/tdd-reports/report/order/${orders[0]?._id}/tdd-history`;
	} else if (orders?.length > 1 && hasSelectedOrder) {
		url = `api/tdd-reports/report/order/${selectedOrder?._id}/tdd-history`;
	}

	const { data, error, mutate } = useSWR(url);
	return {tdds: data, ...is(data, error), mutate };
}

// * ---------------------------------------------------------------------------------------------------

// * ------------------------------------------ POST Requests ------------------------------------------

export const registerJourney = ({ pageKey, group }) => api.post("api/panorama/users/register-journey", { pageKey, group });

export const sendTddFileReport = (data) => api.postFormData("api/tdd-reports/report/upload-zip-file", data);
export const downloadReport = (data) => api.postBlob("api/tdd-reports/report/download-report", { internalId: data });
export const getRepoReport = (commitData, repository, sections, orderId) => api.post("api/tdd-reports/report/repo-report", { commitData, repository, customSections: sections, orderId });
export const setDefaultOrder = (orderId) => api.post("api/panorama/users/set-default", { orgId: "", orderId, service: "tdd" });

// * --------------------------------------------------------------------------------------------------

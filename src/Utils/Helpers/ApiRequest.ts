import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import constants from './constants';
import Store from '../../Redux/Store';
import { logoutSuccess, refreshRequest, tokenSuccess } from '../../Redux/Reducers/AuthReducer';
import { clearProfile } from '../../Redux/Reducers/ProfileReducer';
import { clearHomeData } from '../../Redux/Reducers/HomeReducer';
import { clearBundleFlowState, clearMockTestData, clearPaymentSession } from '../../Redux/Reducers/MockTestReducer';
import Toast from 'react-native-toast-message';

const normalizeUrl = (url: string) => url.replace(/^\/+/, '');

const axiosInstance = axios.create({
    baseURL: constants.BASE_URL,
});

let refreshPromise: Promise<string | null> | null = null;
let autoLogoutTriggered = false;

const getAccessToken = (response: any) =>
    response?.data?.accessToken ||
    response?.data?.data?.accessToken ||
    response?.data?.token ||
    response?.data?.data?.token ||
    null;

const refreshAccessToken = async () => {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const storedRefreshToken = await AsyncStorage.getItem(constants.REFRESH_TOKEN);
            if (!storedRefreshToken) {
                return null;
            }

            const startingStatus = Store.getState().AuthReducer.status;

            const nextToken = await new Promise<string | null>((resolve) => {
                const unsubscribe = Store.subscribe(() => {
                    const authState = Store.getState().AuthReducer;
                    if (authState.status === startingStatus) {
                        return;
                    }

                    if (authState.status === 'Auth/refreshSuccess') {
                        const response = authState.refreshResponse || {};
                        const accessToken = getAccessToken(response);
                        resolve(accessToken || null);
                        unsubscribe();
                        return;
                    }

                    if (authState.status === 'Auth/refreshFailure') {
                        resolve(null);
                        unsubscribe();
                    }
                });

                Store.dispatch(refreshRequest({ refreshToken: storedRefreshToken }));

                setTimeout(() => {
                    unsubscribe();
                    resolve(null);
                }, 15000);
            });

            return nextToken;
        })().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
};

const performAutoLogout = async () => {
    if (autoLogoutTriggered) {
        return;
    }

    autoLogoutTriggered = true;

    try {
        await AsyncStorage.multiRemove([
            constants.TOKEN,
            constants.REFRESH_TOKEN,
            constants.USER_DATA,
            constants.SAVED_EMAIL,
            constants.SAVED_PASSWORD,
        ]);
        await AsyncStorage.setItem(constants.REMEMBER_PASSWORD, 'false');
    } catch {
        // Ignore storage cleanup errors during logout.
    }

    Store.dispatch(tokenSuccess(null));
    Store.dispatch(logoutSuccess('logout'));
    Store.dispatch(clearProfile());
    Store.dispatch(clearHomeData());
    Store.dispatch(clearPaymentSession());
    Store.dispatch(clearBundleFlowState());
    Store.dispatch(clearMockTestData());
    Toast.show({ type: 'error', text1: 'Session expired. Please login again.' });
};

axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const netState = await NetInfo.fetch();
            if (!netState.isConnected) {
                return Promise.reject(new Error('No Internet Connection'));
            }

            if (!config.headers) config.headers = {} as any;
            const token = await AsyncStorage.getItem(constants.TOKEN);
            if (token) {
                autoLogoutTriggered = false;
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch {
            // Ignore
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response Interceptor for Refresh Token Handling
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config || {};
        const isRefreshRequest = String(originalRequest.url || '').includes('auth/refresh');
        const statusCode = error.response?.status;

        if (statusCode === 401 && isRefreshRequest) {
            await performAutoLogout();
            return Promise.reject(error);
        }

        if (statusCode === 401 && originalRequest._retry) {
            await performAutoLogout();
            return Promise.reject(error);
        }

        if (statusCode === 401 && !originalRequest._retry && !isRefreshRequest) {
            originalRequest._retry = true;
            try {
                const newAccessToken = await refreshAccessToken();
                if (newAccessToken) {
                    if (!originalRequest.headers) {
                        originalRequest.headers = {};
                    }
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axiosInstance(originalRequest);
                }

                await performAutoLogout();
                return Promise.reject(error);
            } catch (refreshError: any) {
                await performAutoLogout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export async function getApi(url: string, header: any = {}) {
    const reqHeaders: any = {
        Accept: header.Accept || 'application/json',
        'Content-Type': header.contenttype || 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        ...(header.authorization ? { Authorization: `Bearer ${header.authorization}` } : {}),
    };
    const normalizedUrl = normalizeUrl(url);

    console.log(`[GET] Requesting URL: ${constants.BASE_URL}/${normalizedUrl}`);

    return axiosInstance.get(normalizedUrl, { headers: reqHeaders });
}

export async function postApi(url: string, payload: any, header: any = {}) {
    const reqHeaders: any = {
        Accept: header.Accept || 'application/json',
        'Content-Type': header.contenttype || 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        ...(header.authorization ? { Authorization: `Bearer ${header.authorization}` } : {}),
        ...(header.IPADDRESS ? { IPADDRESS: header.IPADDRESS } : {}),
    };
    const normalizedUrl = normalizeUrl(url);

    console.log(`[POST] Requesting URL: ${constants.BASE_URL}/${normalizedUrl}`, reqHeaders);

    return axiosInstance.post(normalizedUrl, payload, { headers: reqHeaders });
}

export async function patchApi(url: string, payload: any, header: any = {}) {
    const reqHeaders: any = {
        Accept: header.Accept || 'application/json',
        'Content-Type': header.contenttype || 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        ...(header.authorization ? { Authorization: `Bearer ${header.authorization}` } : {}),
        ...(header.IPADDRESS ? { IPADDRESS: header.IPADDRESS } : {}),
    };
    const normalizedUrl = normalizeUrl(url);

    console.log(`[PATCH] Requesting URL: ${constants.BASE_URL}/${normalizedUrl}`, reqHeaders);

    return axiosInstance.patch(normalizedUrl, payload, { headers: reqHeaders });
}

export async function deleteApi(url: string, payload?: any, header: any = {}) {
    const reqHeaders: any = {
        Accept: header.Accept || 'application/json',
        'Content-Type': header.contenttype || 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        ...(header.authorization ? { Authorization: `Bearer ${header.authorization}` } : {}),
        ...(header.IPADDRESS ? { IPADDRESS: header.IPADDRESS } : {}),
    };
    const normalizedUrl = normalizeUrl(url);

    console.log(`[DELETE] Requesting URL: ${constants.BASE_URL}/${normalizedUrl}`, reqHeaders);

    return axiosInstance.delete(normalizedUrl, { headers: reqHeaders, data: payload });
}

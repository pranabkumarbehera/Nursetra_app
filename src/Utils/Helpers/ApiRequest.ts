import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import constants from './constants';
import Store from '../../Redux/Store';
import { logoutSuccess, tokenSuccess } from '../../Redux/Reducers/AuthReducer';
import { clearProfile } from '../../Redux/Reducers/ProfileReducer';
import { clearHomeData } from '../../Redux/Reducers/HomeReducer';
import { clearBundleFlowState, clearMockTestData, clearPaymentSession } from '../../Redux/Reducers/MockTestReducer';
import { reset as resetNavigation } from '../../Navigation/NavigationService';
import { ROUTES } from '../../Navigation/RouteNames';
import Toast from 'react-native-toast-message';

const normalizeUrl = (url: string) => url.replace(/^\/+/, '');
const isAuthEndpoint = (url: string) => {
    const requestUrl = normalizeUrl(url).toLowerCase();

    return [
        'login',
        'register',
        'forgot-password',
        'verify-otp',
        'reset-password',
        'auth/logout',
        'auth/refresh',
    ].some(path => requestUrl.includes(path));
};

const axiosInstance = axios.create({
    baseURL: constants.BASE_URL,
});

let isLoggingOut = false;

const performAutoLogout = async () => {
    if (isLoggingOut) {
        return;
    }

    isLoggingOut = true;

    // Immediately remove token from Redux to prevent concurrent logout triggers
    Store.dispatch(tokenSuccess(null));

    try {
        await (AsyncStorage as any).multiRemove([
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

    Store.dispatch(logoutSuccess('logout'));
    Store.dispatch(clearProfile());
    Store.dispatch(clearHomeData());
    Store.dispatch(clearPaymentSession());
    Store.dispatch(clearBundleFlowState());
    Store.dispatch(clearMockTestData());
    Toast.show({ type: 'error', text1: 'Session expired. Please login again.' });
    resetNavigation({
        index: 0,
        routes: [
            {
                name: ROUTES.AUTH_STACK,
                state: {
                    index: 0,
                    routes: [{ name: ROUTES.LOGIN }],
                },
            },
        ],
    });
    
    setTimeout(() => {
        isLoggingOut = false;
    }, 1000);
};

axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            if (!config.headers) config.headers = {} as any;
            const token = await AsyncStorage.getItem(constants.TOKEN);
            const requestUrl = String(config.url || '');
            if (token && !isAuthEndpoint(requestUrl)) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch {
            // Ignore
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response Interceptor for Token Handling
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const statusCode = error.response?.status;
        const message = error.response?.data?.message?.toLowerCase() || '';
        const requestUrl = String(error.config?.url || '');
        const isAuthRequest = isAuthEndpoint(requestUrl);

        if (!isAuthRequest && (statusCode === 401 || statusCode === 403 || message.includes('invalid') || message.includes('unauthorized') || message.includes('expired'))) {
            await performAutoLogout();
            return Promise.reject(error);
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

import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext, NextPageContext, PreviewData } from 'next';
import Router from 'next/router';
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { ParsedUrlQuery } from 'querystring';

type Request = {
  onSuccess: (token: string) => void;
  onFailure: (err: AxiosError) => void;
};

let isRefreshing = false;
let failedRequestsQueue: Request[] = [];

export function signOut() {
  destroyCookie(undefined, '@jwtauth.token');
  destroyCookie(undefined, '@jwtauth.refreshToken');
  Router.push('/');
}

export function setUpApiClient(ctx?: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
      Authorization: `Bearer ${cookies['@jwtauth.token']}`,
    },
  });

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (error.response.data.code === 'token.expired') {
          cookies = parseCookies(ctx);

          const { '@jwtauth.refreshToken': refreshToken } = cookies;
          const originalConfig = error.config;

          if (!isRefreshing) {
            isRefreshing = true;

            api
              .post('/refresh', {
                refreshToken,
              })
              .then((response) => {
                const { token } = response.data;

                setCookie(ctx, '@jwtauth.token', token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: '/',
                });
                setCookie(ctx, '@jwtauth.refreshToken', response.data.refreshToken, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: '/',
                });

                // @ts-ignore: Unreachable code error
                api.defaults.headers['Authorization'] = `Bearer ${token}`;

                failedRequestsQueue.forEach((request) => request.onSuccess(token));
                failedRequestsQueue = [];
              })
              .catch((err) => {
                failedRequestsQueue.forEach((request) => request.onFailure(err));
                failedRequestsQueue = [];

                if (process.browser) {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSuccess: (token: string) => {
                // @ts-ignore: Unreachable code error
                originalConfig.headers['Authorization'] = `Bearer ${token}`;

                resolve(api(originalConfig));
              },
              onFailure: (err: AxiosError) => {
                reject(err);
              },
            });
          });
        } else {
          if (process.browser) {
            signOut();
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
}

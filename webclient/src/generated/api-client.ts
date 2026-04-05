/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface CreateRunPlayerDto {
  /**
   * @maxLength 32
   * @example "PlayerOne"
   */
  nickname: string;
  /**
   * @min 0
   * @example 12000
   */
  points: number;
  /**
   * @min 0
   * @example 340
   */
  zombieKills: number;
  /**
   * @min 0
   * @example 1800
   */
  goldCollected: number;
  /**
   * @min 0
   * @example 2
   */
  deaths: number;
}

export interface CreateRunDto {
  /** @example "1.4.2" */
  version: string;
  /**
   * @min 1
   * @max 4
   * @example 4
   */
  playerCount: number;
  /**
   * @min 0
   * @example 23
   */
  wavesSurvived: number;
  /**
   * Duration in seconds
   * @min 0
   * @example 1520
   */
  duration: number;
  /**
   * @min 0
   * @example 48000
   */
  totalPoints: number;
  /**
   * @maxItems 4
   * @minItems 1
   */
  players: CreateRunPlayerDto[];
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Shadow Infection Leaderboard API
 * @version 1.0
 * @contact
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags App
   * @name AppControllerGetHello
   * @request GET:/
   */
  appControllerGetHello = (params: RequestParams = {}) =>
    this.request<string, any>({
      path: `/`,
      method: "GET",
      format: "json",
      ...params,
    });

  runs = {
    /**
     * No description
     *
     * @tags Runs
     * @name RunsControllerCreateZombieRun
     * @summary Submit a zombie run from game client
     * @request POST:/runs/zombie
     */
    runsControllerCreateZombieRun: (
      data: CreateRunDto,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/runs/zombie`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Runs
     * @name RunsControllerGetRunById
     * @summary Get run detail with full per-player stats
     * @request GET:/runs/{id}
     */
    runsControllerGetRunById: (id: number, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/runs/${id}`,
        method: "GET",
        ...params,
      }),
  };
  leaderboards = {
    /**
     * No description
     *
     * @tags Leaderboards
     * @name LeaderboardsControllerGetTopRuns
     * @summary Top zombie runs filtered by game version
     * @request GET:/leaderboards
     */
    leaderboardsControllerGetTopRuns: (
      query: {
        /**
         * @min 1
         * @max 200
         * @default 50
         */
        limit?: number;
        /**
         * @min 0
         * @default 0
         */
        offset?: number;
        /** @example "1.4.2" */
        version: string;
        /**
         * @min 1
         * @max 5
         * @example 5
         */
        playerCount?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/leaderboards`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Leaderboards
     * @name LeaderboardsControllerGetUserRuns
     * @summary All zombie runs for one username in a version
     * @request GET:/leaderboards/users
     */
    leaderboardsControllerGetUserRuns: (
      query: {
        /**
         * @min 1
         * @max 200
         * @default 50
         */
        limit?: number;
        /**
         * @min 0
         * @default 0
         */
        offset?: number;
        /** @example "1.4.2" */
        version: string;
        /** @example "PlayerOne" */
        username: string;
        /**
         * @min 1
         * @max 5
         * @example 5
         */
        playerCount?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/leaderboards/users`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Leaderboards
     * @name LeaderboardsControllerGetVersions
     * @summary List all available game versions for filters
     * @request GET:/leaderboards/versions
     */
    leaderboardsControllerGetVersions: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/leaderboards/versions`,
        method: "GET",
        ...params,
      }),
  };
  gameVersions = {
    /**
     * No description
     *
     * @tags Game Versions
     * @name GameVersionsControllerGetGameVersions
     * @summary List game versions with default latest version
     * @request GET:/game-versions
     */
    gameVersionsControllerGetGameVersions: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/game-versions`,
        method: "GET",
        ...params,
      }),
  };
}

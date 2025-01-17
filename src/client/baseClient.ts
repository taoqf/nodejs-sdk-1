'use strict';
/**
 * Copyright (c) 2017 Baidu.com, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 * @file baseClient
 * @author baiduAip
 */

import DevAuth from '../auth/devAuth';
import DevAuthToken from '../auth/devAuthToken';
import RequestInfo from './requestInfo';
import HttpClient from '../http/httpClient';

/**
 * 无授权判断状态
 *
 * @const
 * @type {number}
 */
const AUTHTYPE_INIT = 0;

/**
 * 确定为云用户
 *
 * @const
 * @type {number}
 */
const AUTHTYPE_BCE = 1;

/**
 * 确定为开发者用户（手动输入token模式,以及token中包含了正确的scope）
 *
 * @const
 * @type {number}
 */
const AUTHTYPE_DEV = 2;

/**
 * 获取开发者token成功用户
 *
 * @const
 * @type {number}
 */
const AUTHTYPE_DEV_OR_BCE = 3;


/**
 * 初始状态
 *
 * @const
 * @type {number}
 */
const STATUS_INIT = 0;

/**
 * 获取开发者token中
 *
 * @const
 * @type {number}
 */
const STATUS_AUTHTYPE_REQESTING = 1;

/**
 * 获取开发者token成功，或者确定为云用户
 *
 * @const
 * @type {number}
 */
const STATUS_READY = 2;

/**
 * 非法ak，sk
 *
 * @const
 * @type {number}
 */
const STATUS_ERROR = -1;

/**
 * BaseClient类
 * 各具体接口类基类，处理鉴权逻辑等
 *
 * @constructor
 * @param {string} appid appid.
 * @param {string} ak The access key.
 * @param {string} sk The security key.
 */
export default class BaseClient {
	protected appId = 0 as 0 | string;
	protected authType = AUTHTYPE_INIT;
	protected status = STATUS_INIT;
	protected pms!: Promise<DevAuthToken>;
	protected devAccessToken = null as null | DevAuthToken;
	protected devAuth: DevAuth;
	constructor(appId: string, protected ak: string, protected sk: string, protected options = {} as { isSkipScopeCheck: boolean;[key: string]: any; }) {
		this.appId = 0;

		this.devAuth = new DevAuth(this.ak, this.sk);

		this.authTypeReq();
	}
	protected setAccessToken(token: string, expireTime?: number) {
		const et = expireTime || DevAuthToken.DEFAULT_EXPIRE_DURATION;
		this.devAccessToken = new DevAuthToken(token, et, null as unknown as string);
		this.authType = AUTHTYPE_DEV;
		this.status = STATUS_READY;
	}
	private async authTypeReq() {
		// 请求access_token服务
		this.status = STATUS_AUTHTYPE_REQESTING;
		try {
			const token = await this.devAuth.getToken();
			return this.gotDevAuthSuccess(token);
		} catch (error) {
			try {
				this.gotDevAuthFail(error);
			} catch {
				// 初始化client对象后立即发生的第一次异常，如果没有立即调用具体请求接口的话（必须有promise catch）
				// 将无法被捕获获取token的request网络异常，为了避免UnhandledPromiseRejectionWarning
				// 此处直接catch住,待代用具体接口时候再返回获取token时的异常，减少程序复杂度
			}
		}
	}
	private gotDevAuthSuccess(token: DevAuthToken) {
		// 如果用户没有手动调用setAccessToken设置access_token
		if (this.authType !== AUTHTYPE_DEV) {
			this.devAccessToken = token;
			this.authType = AUTHTYPE_DEV_OR_BCE;
		}
		this.status = STATUS_READY;
	}
	private gotDevAuthFail(err: any) {
		// 获取token时鉴权服务器返回失败信息
		if (err.errorType === DevAuth.EVENT_ERRTYPE_NORMAL) {
			// 可能是百度云的ak，sk
			this.authType = AUTHTYPE_BCE;
			this.status = STATUS_READY;
			return;
		}

		// 获取token时发生了网络错误
		// 或者是发生了服务器返回数据格式异常
		if (err.errorType === DevAuth.EVENT_ERRTYPE_NETWORK
			|| err.errorType === DevAuth.EVENT_ERRTYPE_ILLEGAL_RESPONSE) {
			this.status = STATUS_ERROR;
			throw err;
		}
	}
	protected async doRequest(requestInfo: RequestInfo, httpClient: HttpClient) {
		// 如果获取token失败
		if (this.status === STATUS_ERROR) {
			await this.authTypeReq();
		}

		// 预检函数，返回是否token过期
		const isTokenExpired = this.preRequest(requestInfo);

		if (isTokenExpired === false) {
			// 鉴权方式确定，请求接口
			return httpClient.postWithInfo(requestInfo)
		} else {
			// 如果token过期了，说明是需要重新获取access_token
			// 待重新获取完后继续请求接口
			this.preRequest(requestInfo);
			return httpClient.postWithInfo(requestInfo);
		}
	}
	protected checkDevPermission(requestInfo: RequestInfo) {
		// 是否跳过这个检查（从speech.baidu.com创建的应用，调用语音接口需要跳过）
		if (this.options.isSkipScopeCheck === true) {
			return true;
		}
		// 检查是否拥有AI平台接口权限
		return this.devAccessToken!.hasScope(requestInfo.scope);
	}
	protected preRequest(requestInfo: RequestInfo) {

		// 获取access_token失败，使用百度云签名方式调用
		if (this.authType === AUTHTYPE_BCE) {
			requestInfo.makeBceOptions(this.ak, this.sk);
			return false;
		}

		// 获取access_token成功，或者调用setAccessToken设置的access_token
		if (this.authType === AUTHTYPE_DEV_OR_BCE || this.authType === AUTHTYPE_DEV) {
			// 拥有AI平台接口权限
			if (this.checkDevPermission(requestInfo) || this.authType === AUTHTYPE_DEV) {
				// 判断access_token是否过期
				if (!this.devAccessToken!.isExpired()) {
					requestInfo.makeDevOptions(this.devAccessToken!);
					return false;
				}
				// access_token过期重新获取
				this.authTypeReq();
				return true;
			} else {
				// 使用百度云签名方式访问调用
				requestInfo.makeBceOptions(this.ak, this.sk);
			}
		}
		return false;
	}
}

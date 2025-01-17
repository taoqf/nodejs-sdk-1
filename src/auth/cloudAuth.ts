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
 * @file cloudAuth
 * @author baiduAip
 */
import BceAuth from './bceAuth/auth';

/**
* CloudAuth类
*
* 百度云鉴权签名类，依赖百度云签名实现(bceAuth目录)
* @see https://github.com/baidubce/bce-sdk-js
* @see http://gollum.baidu.com/AuthenticationMechanism#生成CanonicalQueryString
* @constructor
* @param {string} ak The access key.
* @param {string} sk The security key.
*/
export default class CloudAuth {
	private authProxy: BceAuth;
	constructor(protected ak: string, protected sk: string) {
		this.authProxy = new BceAuth(ak, sk);
	}
	public getAuthorization(method: 'GET' | 'POST' | 'DELETE' | 'PUT', uri: string, params: { [key: string]: string; }, headers: { [key: string]: string; }, time: number) {
		return this.authProxy.generateAuthorization(method, uri, params, headers, time / 1000);
	}
}

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
 * @file AipImageProcess.js
 * @author baidu aip
 */

import BaseClient from './client/baseClient';
import RequestInfo from './client/requestInfo';
import HttpClient from './http/httpClient';
import { merge } from './util/objectTools';

const METHOD_POST = 'POST';

const IMAGE_QUALITY_ENHANCE_PATH = '/rest/2.0/image-process/v1/image_quality_enhance';
const DEHAZE_PATH = '/rest/2.0/image-process/v1/dehaze';
const CONTRAST_ENHANCE_PATH = '/rest/2.0/image-process/v1/contrast_enhance';
const COLOURIZE_PATH = '/rest/2.0/image-process/v1/colourize';
const STRETCH_RESTORE_PATH = '/rest/2.0/image-process/v1/stretch_restore';


/**
 * AipImageProcess类
 *
 * @class
 * @extends BaseClient
 * @constructor
 * @param {string} appid appid.
 * @param {string} ak  access key.
 * @param {string} sk  security key.
 */
export default class AipImageProcess extends BaseClient {
	constructor(appId: string, ak: string, sk: string) {
		super(appId, ak, sk);
	}
	private commonImpl(param: any) {
		let httpClient = new HttpClient();
		let apiUrl = param.targetPath;
		delete param.targetPath;
		let requestInfo = new RequestInfo(apiUrl,
			param, METHOD_POST);
		return this.doRequest(requestInfo, httpClient);
	}

	/**
	 * 图像无损放大接口
	 *
	 * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
	 * @param {Object} options - 可选参数对象，key: value都为string类型
	 * @description options - options列表:
	 * @return {Promise} - 标准Promise对象
	 */
	public imageQualityEnhance(image: string, options: { [key: string]: string; }) {
		const param = {
			image,
			targetPath: IMAGE_QUALITY_ENHANCE_PATH
		};
		return this.commonImpl(merge(param, options));
	}

	/**
	 * 图像去雾接口
	 *
	 * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
	 * @param {Object} options - 可选参数对象，key: value都为string类型
	 * @description options - options列表:
	 * @return {Promise} - 标准Promise对象
	 */
	public dehaze(image: string, options: { [key: string]: string; }) {
		const param = {
			image,
			targetPath: DEHAZE_PATH
		};
		return this.commonImpl(merge(param, options));
	}

	/**
	 * 图像对比度增强接口
	 *
	 * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
	 * @param {Object} options - 可选参数对象，key: value都为string类型
	 * @description options - options列表:
	 * @return {Promise} - 标准Promise对象
	 */
	public contrastEnhance(image: string, options: { [key: string]: string; }) {
		const param = {
			image,
			targetPath: CONTRAST_ENHANCE_PATH
		};
		return this.commonImpl(merge(param, options));
	}

	/**
	 * 黑白图像上色接口
	 *
	 * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
	 * @param {Object} options - 可选参数对象，key: value都为string类型
	 * @description options - options列表:
	 * @return {Promise} - 标准Promise对象
	 */
	public colourize(image: string, options: { [key: string]: string; }) {
		const param = {
			image,
			targetPath: COLOURIZE_PATH
		};
		return this.commonImpl(merge(param, options));
	}

	/**
	 * 拉伸图像恢复接口
	 *
	 * @param {string} image - 图像数据，base64编码，要求base64编码后大小不超过4M，最短边至少15px，最长边最大4096px,支持jpg/png/bmp格式
	 * @param {Object} options - 可选参数对象，key: value都为string类型
	 * @description options - options列表:
	 * @return {Promise} - 标准Promise对象
	 */
	public stretchRestore(image: string, options: { [key: string]: string; }) {
		const param = {
			image,
			targetPath: STRETCH_RESTORE_PATH
		};
		return this.commonImpl(merge(param, options));
	}
}

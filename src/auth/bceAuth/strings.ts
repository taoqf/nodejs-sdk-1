/**
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
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
 * @file strings.js
 * @author leeight
 */

const kEscapedMap = {
	'!': '%21',
	'\'': '%27',
	'(': '%28',
	')': '%29',
	'*': '%2A'
} as { [key: string]: string; };

export function normalize(str: string, encodingSlash?: boolean) {
	let result = encodeURIComponent(str);
	result = result.replace(/[!'\(\)\*]/g, function ($1) {
		return kEscapedMap[$1];
	});

	if (encodingSlash === false) {
		result = result.replace(/%2F/gi, '/');
	}

	return result;
};

export function trim(str: string) {
	return (str || '').replace(/^\s+|\s+$/g, '');
};


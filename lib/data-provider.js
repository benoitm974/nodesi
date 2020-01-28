'use strict';

const goodGuyLib = require('good-guy-http');
const url = require('url');
const { PerformanceObserver, performance } = require('perf_hooks');
const defaultHeaders = {
    Accept: 'text/html, application/xhtml+xml, application/xml'
};

module.exports = function DataProvider(config) {
    config = config || {};

    const baseUrl = config.baseUrl || '';
    const goodGuy = config.httpClient || goodGuyLib({
        cache: config.cache,
        timeout: config.timeout
    });

    function extendRequestOptions(src, baseOptions) {
        return {
            url: toFullyQualifiedURL(src, baseOptions),
            headers: Object.assign({}, defaultHeaders, baseOptions.headers)
        };
    }

    function toFullyQualifiedURL(urlOrPath, baseOptions) {
        if(urlOrPath.indexOf('http') === 0) {
            return urlOrPath;
        } else {
            const base = baseOptions ? baseOptions.baseUrl || baseUrl : baseUrl;
            return url.resolve(base, urlOrPath.substring(1));
        }
    }

    function get(src, baseOptions) {
        const options = extendRequestOptions(src, baseOptions || {});
        options.gzip = true; // For backwards-compatibility, response compression is not supported by default
        var start = performance.now(); //TODO
        return goodGuy.get(options)
            .then(response => {
                if(response.statusCode >= 400) {
                    throw new Error(response.statusCode);
                }
                return {
                    body: response.body,
                    response: response,
                    timing: (performance.now()-start),
                    esipath: src
                };
            });
    }

    return {toFullyQualifiedURL, get};
};
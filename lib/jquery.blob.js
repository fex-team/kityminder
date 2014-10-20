(function($) {
    /**
     * 让 jQuery 支持 Blob 类型
     */
    $.ajaxTransport('+*', function(options, originalOptions, jqXHR) {

        if (window.FormData && ((options.dataType &&
            (options.dataType === 'blob' || options.dataType === 'arraybuffer')) ||
            (options.data && ((window.Blob && options.data instanceof Blob) ||
                (window.ArrayBuffer && options.data instanceof ArrayBuffer)))
        )) {
            return {
                /**
                 * Return a transport capable of sending and/or receiving blobs - in this case, we instantiate
                 * a new XMLHttpRequest and use it to actually perform the request, and funnel the result back
                 * into the jquery complete callback (such as the success function, done blocks, etc.)
                 *
                 * @param headers
                 * @param completeCallback
                 */
                send: function(headers, completeCallback) {
                    var xhr = new XMLHttpRequest(),
                        url = options.url || window.location.href,
                        type = options.type || 'GET',
                        dataType = options.dataType || 'text',
                        data = options.data || null,
                        async = options.async || true,
                        key;

                    xhr.addEventListener('load', function() {
                        var response = {},
                            status, isSuccess;

                        isSuccess = xhr.status >= 200 && xhr.status < 300 || xhr.status === 304;

                        if (isSuccess) {
                            response[dataType] = xhr.response;
                        } else {
                            // In case an error occured we assume that the response body contains
                            // text data - so let's convert the binary data to a string which we can
                            // pass to the complete callback.
                            response.text = String.fromCharCode.apply(null, new Uint8Array(xhr.response));
                        }

                        completeCallback(xhr.status, xhr.statusText, response, xhr.getAllResponseHeaders());
                    });

                    xhr.open(type, url, async);
                    xhr.responseType = dataType;

                    for (key in headers) {
                        if (headers.hasOwnProperty(key)) xhr.setRequestHeader(key, headers[key]);
                    }
                    xhr.send(data);
                },
                abort: function() {
                    jqXHR.abort();
                }
            };
        }
    });
})(window.jQuery);
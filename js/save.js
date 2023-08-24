
class Save {
    static getId() {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        if (urlParams.has('id'))
            return urlParams.get('id')
        else
            return undefined;
    }



    static setId(id) {
        /**
         * http://stackoverflow.com/a/10997390/11236
         */
        function updateURLParameter(url, param, paramVal) {
            var newAdditionalURL = "";
            var tempArray = url.split("?");
            var baseURL = tempArray[0];
            var additionalURL = tempArray[1];
            var temp = "";
            if (additionalURL) {
                tempArray = additionalURL.split("&");
                for (var i = 0; i < tempArray.length; i++) {
                    if (tempArray[i].split('=')[0] != param) {
                        newAdditionalURL += temp + tempArray[i];
                        temp = "&";
                    }
                }
            }

            var rows_txt = temp + "" + param + "=" + paramVal;
            return baseURL + "?" + newAdditionalURL + rows_txt;
        }

        var newURL = updateURLParameter(window.location.href, 'locId', 'newLoc');
        newURL = updateURLParameter(newURL, 'resId', 'newResId');

        window.history.replaceState('', '', updateURLParameter(window.location.href, "id", id));
    }


    static save(txt) {
        localStorage.setItem("save: " + Save.getId(), txt);
    }

    static load() {
        return localStorage.getItem("save: " + Save.getId());
    }


    static exists(id) {
        return localStorage.getItem("save: " + id);
    }
}

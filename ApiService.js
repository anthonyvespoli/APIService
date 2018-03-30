function getTokenFromCookie() {
    const cookie = document.cookie.match('auth-token'); /* rename auth token to whatever you named the cookie to store it */
    if (cookie) {
        return cookie[1]
    }
}

const apiBase = '/api/'; /* EDIT YOUR API BASE URL HERE */
const token = getTokenFromCookie();

export default class ApiService{
     static _processStatus = function (response) {
        // status "0" to handle local files fetching (e.g. Cordova/Phonegap etc.)
        if (response.status === 200 || response.status === 0) {
            return Promise.resolve(response)
        } else {
            /* We parse the JSON first to get the error message given to us from the server.
               If we don't process the json first then the only useful information we can pass as
               an error would be the generic http code error texts
            */
            return response.json().then(err => { throw err; });
        }
    };

    //url is a string, params must be a flat object if a get request, method is get, post, etc
    static _handleFetch(url, params = {}, method="GET"){
        url = apiBase + url;
        let queryString = "";

        if(method === 'GET'){ //builds query string based on params object
            queryString = '?' + Object.keys(params)
                .map(function(k){
                    return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
                }).join('&');
        }
        return fetch(url + queryString, {
            method: method,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Token': token
            },
            body: (method === 'GET' ? null : JSON.stringify(params))
        })
            /* fetch only throws an error to our catch
                block if the server doesn't respond. So a 500 response
                from the server will still resolve in your promises 
                success. The processStatus function handles that for us.
            */
            .then(ApiService._processStatus)
            .then(res => res.text()) // Sometimes servers return 200 with no response, we convert to text and make sure it has length or we return an empty object
            .then(response => response.length ? JSON.parse(response) : {})
            .catch((err)=>{
                throw err;
            });

    }

    /* 
        ~~~ Example Method ~~~ (Most likely keep all Api call functions in this file)
        
        static getUsers(params){
            return ApiService._handleFetch('v1/users', params, 'GET');
        }


        Now we can import this class into whatever component we need to 
        make an api call:

        import ApiService from "path/to/ApiService";


        ApiService.getUsers().then((resp)=>{
            console.log('success! ', resp);
        }).catch((err)=>{
            console.log('oh no there was an error ', err);
        })

    */



}


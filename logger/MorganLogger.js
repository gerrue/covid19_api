const morgan = require('morgan');
const ipware = require('ipware')();
const geoip = require('geoip-lite');

morgan.token('host', function(req, res) {
    return Private.getRealIp(req);
});

morgan.token('geo-loc', function(req, res) {
    return Private.getGeoIpLocation(req);
});

morgan.token('param', function(req, res, param) {
    return req.params[param];
});

let Private = {
    getRealIp: req => {
        let ip_info =  ipware.get_ip(req);
        return ipware.is_loopback_ip(ip_info.clientIp) ?
            Private.getLoopBackIp(req) : ip_info.clientIp;
    },
    getLoopBackIp : req => {
        let lookBackIp = '127.0.0.1';
        req['clientIp'] = lookBackIp;
        return lookBackIp;
    },
    getGeoIpLocation: req => {
        let ip = req.clientIp || Private.getRealIp(req);
        let geoInfo = geoip.lookup(ip);
        // return JSON.stringify(geoInfo, null, 6)
        return geoInfo ? `${geoInfo.country}-${geoInfo.region}, ${geoInfo.city}, [${geoInfo.ll[0]}, ${geoInfo.ll[1]}]` : '';
    },

};

module.exports.logFormat = JSON.stringify({
    ip: ':host',
    location: ':geo-loc',
    method: ':method',
    url: ':url',
    status: ':status',
    response_time: ':response-time ms'
}, null, 4);
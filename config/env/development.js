'use strict'


module.exports = {
    name: 'bb-bulk-importer',
    version: '0.0.1',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 8080,
    base_url: process.env.BASE_URL || 'http://nsut-dev-nodejs01.nsuok.edu:8080',
    db: {
        uri: 'mongodb://nsut-dev-nodejs01.nsuok.edu:27017/bb-bulk-dev',
    },
    //Used to for Google OAuth. Get these settgins from Google Dev Console
    //See for more options https://developers.google.com/admin-sdk/reports/v1/guides/push
    bbConfig: {
        client_key: "db5c6a6b-6820-4be0-85f9-23a688dbac02",
        client_secret: "PNi3rl37msZziybykTUSwLK6sNnazRbF",
        token_dir: (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/',
        token_path: (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/' + 'bb-bulk-impoter-token.json',
        //used to temp http server for google OAuth Callback
        port: 8081,
        redirect_uris: [
            // urn for command line prompt or nsut-dev-nodejs01.nsuok.edu for web callback
            "http://nsut-dev-nodejs01.nsuok.edu:8081/googlecallback" //"urn:ietf:wg:oauth:2.0:oob"
        ],
        scopes: [
            "https://www.googleapis.com/auth/admin.reports.audit.readonly",
            "https://www.googleapis.com/auth/admin.reports.usage.readonly"
        ]
    }
}
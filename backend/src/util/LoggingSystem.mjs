import fs from "fs";
import path from "path";
export default class LoggingSystem {

    static _instance = null;

    /**
     * @returns {LoggingSystem} LoggingSystem singleton instance
     */
    static get singleton() {
        if(LoggingSystem._instance == null)
            LoggingSystem._instance = new LoggingSystem();
        return LoggingSystem._instance;
    }

    constructor() {
        let current = new Date();
        let date = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
        this._loggingFolder = "logs/"
        this._loggingFile = date + ".log";
        this._loggingPath = path.resolve( this._loggingFolder + this._loggingFile);
    }

    async _appendToFile(content) {
        if(!fs.existsSync(this._loggingFolder)) {
            fs.mkdirSync(this._loggingFolder);
        }

        fs.appendFile(this._loggingPath, content, 
            {
                encoding: "utf-8",
                flag: "a+"
            }, (err) => {
                if(err) throw err;
            });
    }

    /**
     * @readonly
     * @returns {String} Log message date prefix. Ex.: Sun, 20 Mar 2022 20:19:35 GMT
     */
    get date_prefix() {
        return new Date().toGMTString();
    }

    /**
     * Creates a log entry
     * @param {String} caller - Message prefix
     * @param {String} content - Log message 
     */
    log(caller,content) {
        let message = this.date_prefix + " " + caller + " " + content;
        this._appendToFile(message + "\n");
    }

}
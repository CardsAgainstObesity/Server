import fs from "fs";
import path from "path";
export default class LoggingSystem {

    static _instance = null;

    static get singleton() {
        if(LoggingSystem._instance == null)
            LoggingSystem._instance = new LoggingSystem();
        return LoggingSystem._instance;
    }

    constructor() {
        let current = new Date();
        let date = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
        this._loggingFile = path.resolve("logs/" + date + ".log");
    }

    _appendToFile(content) {
        fs.appendFile(this._loggingFile, content, 
            {
                encoding: "utf-8",
                flag: "a+"
            }, (err) => {
                if(err) throw err;
            });
    }

    /**
     * @readonly
     * @returns {String} Log message prefix
     */
    get prefix() {
        return "["+new Date().toGMTString()+"] ";
    }

    /**
     * Creates a log entry
     * @param {String} content - Log message 
     */
    log(content) {
        let message = this.prefix + content;
        this._appendToFile(message + "\n");
    }

}
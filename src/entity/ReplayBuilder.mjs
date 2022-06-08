import LoggingSystem from "../util/LoggingSystem.mjs";
import Room from "./Room.mjs";
import fs from "fs";
import path from "path";

/**
 * @typedef {Object} Snapshot
 * @property {string} roomId
 * @property {import("./Room.mjs").RoomStatus} status
 * @property {string} czarId
 * @property {number} goalObesity
 * @property {string} createdById
 * @property {string} lastWinnerId
 * @property {number} maxPlayers
 * @property {number} minPlayers
 * @property {string[]} cardpacks
 */

export default class ReplayBuilder {

    constructor(room) {
        if (!(room instanceof Room)) throw new Error("TypeError: room must be an instance of Room")
        this._logs = {};
        this.room = room;

        let identifier = room.__createdBy.id + '-' + room.roomId;
        this._replayFolder = "replays/"
        this._replayFile = identifier + ".json";
        this._replayPath = path.resolve(this._replayFolder + this._replayFile);

        this._lastTimestamp = undefined;
    }

    /**
     * Logs an action with the current timestamp
     * @param {Snapshot} snapshot 
     * @param {boolean} fillPrepared - Should this snapshot fill preapred snapshots?
     */
    _log(snapshot, fillPrepared) {
        const lastSnapshot = this._lastTimestamp ? this._logs[this._lastTimestamp] : undefined;

        if (!this._lastTimestamp || !fillPrepared || lastSnapshot) {
            const timestamp = Date.now();
            this._logs[timestamp] = snapshot;
            this._lastTimestamp = timestamp;
        } else {
            this._logs[this._lastTimestamp] = snapshot;
        }
    }

    get replay() {
        return this._logs;
    }

    /**
     * Creates a snapshot and logs it
     * @param {boolean} fillPrepared - Should this snapshot fill preapred snapshots?
     */
    createSnapshot(fillPrepared) {
        /**
         * @type {Snapshot}
         */
        const snapshot = {
            endTimestamp: Date.now(),
            roomId: this.room.roomId,
            status: this.room.status,
            czarId: this.room.czar.id,
            maxPlayers: this.room.maxPlayers,
            minPlayers: this.room.minPlayers,
            goalObesity: this.room.goalObesity,
            cardpacks: this.room.lobby.cardPacksNames,
            createdById: this.room.__createdBy.id,
            lastWinnerId: this.room.__lastWinner ? this.room.__lastWinner.id : undefined,
            players: this.room.toJSON().players
        }
        this._log(snapshot, fillPrepared);
    }

    /**
     * Created an empty timestamp
     */
    prepareSnapshot() {
        this._log(undefined, false);
    }

    /**
     * Saves the replay to a file
     */
    saveReplay() {
        if (!fs.existsSync(this._replayFolder)) {
            fs.mkdirSync(this._replayFolder);
        }

        LoggingSystem.singleton.log("[ReplaySystem]", "Saving replay to: " + this._replayPath);

        fs.writeFile(this._replayPath, JSON.stringify(this.replay),
            {
                encoding: "utf-8",
                flag: "w+"
            }, (err) => {
                if (err) throw err;
            });
    }

    clearReplay() {
        this._logs = {};
        this._lastTimestamp = undefined;
    }

}
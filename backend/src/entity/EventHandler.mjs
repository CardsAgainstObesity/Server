 class CEvent {

    /**
     * Method to build an event instance
     * @param {String} name - Event name
     */
    constructor(name) {
        this.__name = name; 
        /**
         * @type {Map<String,function>}
         */
        this.__listeners = new Map();
    }

    /**
     * Method to add a listener to the
     * event
     * @param {function} callback - Function to be called
     *                              when event is emited 
     * @returns Listener's identifier
     */
    addListener(callback) {
        var identifier = this.__listeners.size();
        this.__listeners.set(identifier,callback);
        return identifier;
    }

    /**
     * Method to emit the event with 
     * given parameters. Emitting the
     * event will call every listener's
     * callback function
     * @param {*} params - Parameters for listener's callback function
      */
    emit(params) {
        this.__listeners.forEach(listener => {

            listener(params);

        });
    }

    /**
     * Method to remove a listener
     * from the event's listeners
     * list.
     * @param {String} listener - Listener's identifier
     */
    unSubscribe(listener) {
        this.__listeners.delete(listener);
    }
}


/**
 * Class representing an EventHandler
 */
class EventHandler {

    /**
     * Method to build an EventHandler instance
     */
    constructor() {

        /**
         * @type {Map<String,CEvent>}
         */
        this.__events = new Map();

    }

    /**
     * Adds a listener for given event
     * @param {String} event - Event name to listen 
     * @param {function} callback - Function to run when event emits
     */
    on(event, callback) {
        // If the EventHandler already handles this event
        // then just add a new listener to it
        if(this.__events.has(event)) {
            this.__events.get(event).addListener(callback);
        } else {
            // In case the EventHandler is not handling
            // this event, start handling it and add
            // the listener to the new event
            var newEvent = new CEvent(event);
            newEvent.addListener(callback);
            this.__events.set(event,newEvent);
        }
    }
    /**
     * Emits given event name with given
     * params. Calling every listener with
     * those params
     * 
     * @param {String} event - Event name
     * @param {*} params - Parameters to call listeners with
     */
    emit(event,params) {
        if(this.__events.has(event)) {
            // Only emit if the event is being handled
            this.__events.get(event).emit(params);
        }
    }
}

export default EventHandler;
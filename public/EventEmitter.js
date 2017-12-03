class EventEmitter {
	constructor() {
		this._listeners = {}	//["create"=>[f1,f2,f3],"cancel"=>[f1,f2,f3]]
	}
	addListener(event_type, callback) {
		if (this._listeners[event_type] === undefined)
			this._listeners[event_type] = []
		this._listeners[event_type].push(callback)
	}
	removeListener(event_type, callback) {
		let remove = this._listeners[event_type].indexOf(callback)
		if (remove > -1)
			this._listeners[event_type].splice(remove, 1);
	}
	_emit(event_type, ...args) {
		let lis = this._listeners[event_type]
		if (lis === undefined || lis.length == 0)
			return

		lis.forEach((listeners) => {
			listeners.apply(window, args)
		})
	}
}
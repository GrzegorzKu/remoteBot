class WSocketEngine {
	constructor(address, connect = true) {
		this._address = address || "ws://localhost:3001/"
		this._frequency = 30 // 30ms
		this._interface_version = 0.1

		this._accelerate = 0
		this._direction = 0
		this._websocket = null
		this._toSend = false

		if (connect)
			this._connect()
		this._loop()
	}

	connect() {
		if (this._websocket === null)
			this._connect()
	}
	disconnect() {
		this._websocket.close()
	}

	_connect() {
		try {
			this._websocket = new WebSocket(this._address);
			this._websocket.onopen = this._onOpen.bind(this)
			this._websocket.onclose = this._onClose.bind(this)
			this._websocket.onmessage = this._onMessage.bind(this)
			this._websocket.onerror = this._onError.bind(this)
		} catch (e) {
			console.alert("Error on WebSocket connection!")
			this._websocket = null
		}
	}
	_onOpen(e) {

	}
	_onClose(e) {
		console.log("websocket connection was closed")
	}
	_onMessage(e) {
		//console.log(e.data, " received")
	}
	_onError(e) {
		alert("Error in WebSocket system:\n" + e.data)
		this.disconnect()
	}
	_prepare_message() {
		return JSON.stringify(
			{
				accelerate: this.accelerate,
				direction: this.direction,
				interface_version: this._interface_version,
			})
	}
	_loop() {
		if (this._toSend) {
			if (this._websocket !== null) {
				let mes = this._prepare_message()
				this._websocket.send(mes)
				this._toSend = false
				console.log(mes, " was sent")
			}
		}

		setTimeout(this._loop.bind(this), this._frequency)
	}

	get accelerate() { return this._accelerate }
	set accelerate(a) { this._accelerate = a; this._toSend = true }
	get direction() { return this._direction }
	set direction(d) { this._direction = d; this._toSend = true }
}
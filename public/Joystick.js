class Joystick extends EventEmitter {
	/*
		Simple joystick controller for touch devices
	*/
	constructor(ctx, x, y, size) {
		super()
		this.ctx = /** @type {CanvasRenderingContext2D} */ (ctx)

		this._cx = x || 0
		this._cy = y || 0
		this._size = size || 0

		this._min = 0
		this._max = 1
		this._resetValueX = this._min + (this._max - this._min) / 2
		this._resetValueY = this._min + (this._max - this._min) / 2

		this._color = "#ccccff"
		this._stroke = "white"
		this._strokeWidth = 2

		this._vx = 0
		this._vy = 0
		this._clicked = false
		this._touchID = -1

		this._debug = true

		this._atachMouseEvents()
		this._atachTouchEvents()
	}
	//public methods
	draw() {
		let ctx = this.ctx

		ctx.lineWidth = this.strokeWidth
		ctx.fillStyle = this.color
		ctx.strokeStyle = this.stroke

		ctx.beginPath()
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
		ctx.fill()
		ctx.stroke()

		if (this._debug)
			this._drawValue()
	}

	//private methods
	_onDown(e) {
		if (this._distance(this.x, this.y, e.clientX, e.clientY) > this.size)
			return

		if (!this._clicked) {
			this._clicked = true
			this._emitState(true)

			let [x, y] = this._calculate_value(e.clientX, e.clientY)

			if (this._vx != x || this._vy != y) {
				this._vx = x
				this._vy = y
				this._emitChange(x, y)
			}
		}
	}
	_onUp(e) {
		if (this._clicked) {
			this._clicked = false
			this._emitState(false)

			this._vx = this._resetValueX
			this._vy = this._resetValueY
			this._emitChange()
		}
	}
	_onMove(e) {
		if (!this._clicked)
			return

		let [x, y] = this._calculate_value(e.clientX, e.clientY)

		if (this._vx != x || this._vy != y) {
			this._vx = x
			this._vy = y
			this._emitChange()
		}
	}
	_calculate_value(cursor_x, cursor_y) {
		//calculate distance between cursor and center of joystick
		let x = cursor_x - this.x
		let y = this.y - cursor_y

		//map result to range <min,max>
		let vx = this._map_values(-this._size, this._size, this.min, this.max, x)
		let vy = this._map_values(-this._size, this._size, this.min, this.max, y)

		//clamp answer to min and max
		vx = Math.max(this.min, vx)
		vy = Math.max(this.min, vy)
		vx = Math.min(this.max, vx)
		vy = Math.min(this.max, vy)

		return [vx, vy]
	}
	//map value from range <input_start,input_end> to <output_start,output_end>
	_map_values(input_start, input_end, output_start, output_end, value) {
		return output_start + ((output_end - output_start) / (input_end - input_start)) * (value - input_start)
	}
	//calculate distance from p1=(x1,y1) to p2=(x2,y2)
	_distance(x1, y1, x2, y2) {
		return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
	}
	//debug method, draw point where mouse cursor is
	_drawValue() {
		if (!this._clicked)
			return

		let ctx = this.ctx

		ctx.lineWidth = 1
		ctx.fillStyle = "red"
		ctx.strokeStyle = "black"

		let x = this._map_values(this.min, this.max, -this.size, this.size, this._vx)
		let y = this._map_values(this.min, this.max, -this.size, this.size, this._vy)

		ctx.beginPath()
		ctx.arc(this.x + x, this.y - y, this.size * 0.05, 0, Math.PI * 2)
		ctx.fill()
		ctx.stroke()
	}

	_atachMouseEvents() {
		let self = this
		this.ctx.canvas.addEventListener("mousedown", self._onDown.bind(self))
		this.ctx.canvas.addEventListener("mouseup", self._onUp.bind(self))
		this.ctx.canvas.addEventListener("mousemove", self._onMove.bind(self))
	}
	_atachTouchEvents() {
		let self = this
		this.ctx.canvas.addEventListener("touchstart", (e) => {
			//let t = self._nearestTouch(e.touches)
			this._touchID = e.touches.length - 1
			let t = e.touches[this._touchID]

			var mouseEvent = new MouseEvent("mousedown", {
				clientX: t.clientX,
				clientY: t.clientY
			})
			if (e.touches.length > 1)
				console.log(e)
			self._onDown.bind(self, mouseEvent)()
		}, false)

		this.ctx.canvas.addEventListener("touchend", (e) => {
			var mouseEvent = new MouseEvent("mouseup", {})
			self._onUp.bind(self, mouseEvent)()
		}, false)

		this.ctx.canvas.addEventListener("touchmove", (e) => {
			//let t = self._nearestTouch(e.touches)
			let t = e.touches[this._touchID]
			var mouseEvent = new MouseEvent("mousemove", {
				clientX: t.clientX,
				clientY: t.clientY
			})
			self._onMove.bind(self, mouseEvent)()
		}, false)
	}
	_emitChange() {
		this._emit("changeValue", this._vx, this._vy)
	}
	_emitState(state) {
		this._emit("changeState", state)
	}
	_nearestTouch(touches) {
		let min = Infinity, minId = -1
		for (let i = 0; i < touches.length; i++) {
			let c = this._distance(this.x, this.y, touches[i].clientX, touches[i].clientY)
			if (c < min) {
				min = c
				minId = i
			}
		}
		if (minId == -1)
			throw "Cant find properly touch"
		else
			return touches[minId]
	}

	//getter setter
	get x() { return this._cx }
	set x(x) { this._cx = x }
	get y() { return this._cy }
	set y(y) { this._cy = y }
	//get [x,y]
	get position() { return [this.x, this.y] }
	//set [x,y]
	set position(p) { [this.x, this.y] = p }
	get size() { return this._size }
	set size(s) { this._size = s }
	get min() { return this._min }
	set min(m) { this._min = m }
	get max() { return this._max }
	set max(m) { this._max = m }
	get color() { return this._color }
	set color(c) { this._color = c }
	get stroke() { return this._stroke }
	set stroke(s) { this._stroke = s }
	get strokeWidth() { return this._strokeWidth }
	set strokeWidth(sw) { this._strokeWidth = sw }
	//get value of joystick
	get value() { return [this._vx, this._vy] }
	get resetValueX() { return this._resetValueX }
	set resetValueX(v) { this._resetValueX = v }
	get resetValueY() { return this._resetValueY }
	set resetValueY(v) { this._resetValueY = v }
}
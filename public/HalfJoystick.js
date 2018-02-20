class HorrizontalJoystick extends Joystick {
	constructor(ctx, x, y, size) {
		super(ctx, x, y, size)

		this._color2 = "#aaaadd"
	}
	draw() {
		let ctx = this.ctx

		ctx.lineWidth = this.strokeWidth
		ctx.fillStyle = this.color
		ctx.strokeStyle = this.stroke

		ctx.beginPath()
		ctx.arc(this.x, this.y, this.size, -Math.PI / 2, Math.PI / 2)
		ctx.fill()
		ctx.stroke()

		ctx.fillStyle = this.color2
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.size, Math.PI / 2, 3 * Math.PI / 2)
		ctx.fill()
		ctx.stroke()

		if (this._debug)
			this._drawValue()
	}

	_drawValue() {
		if (!this._clicked)
			return

		let ctx = this.ctx

		ctx.lineWidth = 1
		ctx.fillStyle = "red"
		ctx.strokeStyle = "black"

		let x = this._map_values(this.min, this.max, -this.size, this.size, this._vx)

		ctx.beginPath()
		ctx.arc(this.x + x, this.y, this.size * 0.05, 0, Math.PI * 2)
		ctx.fill()
		ctx.stroke()
	}
	_calculate_value(cursor_x, cursor_y) {
		//calculate distance between cursor and center of joystick
		let x = cursor_x - this.x

		//map result to range <min,max>
		let vx = this._map_values(-this._size, this._size, this.min, this.max, x)

		//clamp answer to min and max
		vx = Math.max(this.min, vx)
		vx = Math.min(this.max, vx)

		let vy = null

		return [vx, vy]
	}
	_emitChange() {
		this._emit("changeValue", this._vx)
	}

	get value() { return this._vx }
	get color2() { return this._color2 }
	set color2(c) { this._color2 = c }
	get resetValue() {return this._resetValueX}
	set resetValue(v) {this._resetValueX = v}
}

class VerticalJoystick extends Joystick {
	constructor(ctx, x, y, size) {
		super(ctx, x, y, size)

		this._color2 = "#aaaadd"
	}
	draw() {
		let ctx = this.ctx

		ctx.lineWidth = this.strokeWidth
		ctx.fillStyle = this.color
		ctx.strokeStyle = this.stroke

		ctx.beginPath()
		ctx.arc(this.x, this.y, this.size, 0, Math.PI)
		ctx.fill()
		ctx.stroke()

		ctx.fillStyle = this.color2
		ctx.beginPath()
		ctx.arc(this.x, this.y, this.size, Math.PI, Math.PI * 2)
		ctx.fill()
		ctx.stroke()

		if (this._debug)
			this._drawValue()
	}

	_drawValue() {
		if (!this._clicked)
			return

		let ctx = this.ctx

		ctx.lineWidth = 1
		ctx.fillStyle = "red"
		ctx.strokeStyle = "black"

		let y = this._map_values(this.min, this.max, -this.size, this.size, this._vy)

		ctx.beginPath()
		ctx.arc(this.x, this.y - y, this.size * 0.05, 0, Math.PI * 2)
		ctx.fill()
		ctx.stroke()
	}
	_calculate_value(cursor_x, cursor_y) {
		//calculate distance between cursor and center of joystick
		let y = this.y - cursor_y

		//map result to range <min,max>
		let vx = null
		let vy = this._map_values(-this._size, this._size, this.min, this.max, y)

		//clamp answer to min and max
		vy = Math.max(this.min, vy)
		vy = Math.min(this.max, vy)

		return [vx, vy]
	}
	_emitChange() {
		this._emit("changeValue", this._vy)
	}

	get value() { return this._vy }
	get color2() { return this._color2 }
	set color2(c) { this._color2 = c }
	get resetValue() {return this._resetValueY}
	set resetValue(v) {this._resetValueY = v}
}
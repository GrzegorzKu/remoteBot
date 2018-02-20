function roundTo(n, p) {
	p = 10 ** p
	return Math.round(n * p) / p
}

function main() {
	var canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("mainCanv"))
	var ctx = canvas.getContext("2d")

	canvas.width = window.innerWidth
	canvas.height = window.innerHeight

	var accelerate = new VerticalJoystick(ctx,
		canvas.width / 4,
		canvas.height - canvas.width / 4 * 0.4,
		canvas.width / 4 * 0.3)
	accelerate.min = -1
	accelerate.max = 1
	accelerate.resetValue = 0


	var direction = new HorrizontalJoystick(ctx,
		3 * canvas.width / 4,
		canvas.height - canvas.width / 4 * 0.4,
		canvas.width / 4 * 0.3)

	var wsocketEngine = new WSocketEngine("ws://" + window.location.hostname + ":3001")
	//var wsocketEngine = new WSocketEngine("ws://10.10.10.198:3001")
	//var wsocketEngine = new WSocketEngine("ws://localhost:3001")

	var acc_v = 0
	var dir_v = 0.5

	wsocketEngine.accelerate = acc_v
	wsocketEngine.direction = dir_v

	function draw() {
		ctx.fillStyle = "blue"
		ctx.beginPath()
		ctx.rect(0, 0, canvas.width, canvas.height)
		ctx.fill()

		ctx.font = 'normal 40px Arial';
		ctx.fillStyle = "#000000"

		ctx.beginPath()
		ctx.fillText("accelerate: " + roundTo(acc_v, 3), 5, 45)
		ctx.fillText("direction: " + roundTo(dir_v, 3), 5, 80)

		accelerate.draw()
		direction.draw()
		requestAnimationFrame(draw)
	}

	accelerate.addListener("changeValue", (x) => {
		acc_v = x
		wsocketEngine.accelerate = x
	})

	direction.addListener("changeValue", (x) => {
		dir_v = x
		wsocketEngine.direction = x
	})

	draw()

}

window.addEventListener("load", main, false);
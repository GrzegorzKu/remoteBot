import SimpleHTTPServer
import SocketServer
import os
import threading
import time
import json
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
from pyA20.gpio import gpio, port
from orangepwm import *

www_port = 3000
ws_port = 3001

run_www = True
run_ws = True

www_server = None
ws_server = None

# pin numbers
right_enable = port.PA1  # 0
left_enable = port.PC0  # 12

right_a = port.PA0  # 2
right_b = port.PA3  # 3
left_a = port.PC1  # 13
left_b = port.PC2  # 14

# speed values
rangemax = 100
forward_speed = 100
backward_speed = 100
turn_speed = 100
forward_speed = 100

connected = False

pwm_la = None
pwm_lb = None
pwm_ra = None
pwm_lb = None

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler


class SimpleEcho(WebSocket):

    def handleMessage(self):
        # echo message back to client
        # self.sendMessage(self.data)
        parseddata = json.loads(self.data)

        speed = parseddata["accelerate"]
        rotation = parseddata["direction"]
        # print speed, type(speed)
        Drive(speed, rotation)

    def handleConnected(self):
        print(self.address, 'connected')
        connected = True

    def handleClose(self):
        print(self.address, 'closed')

        connected = False
        stop()


def WWWServer_thandler(lock):
    global www_server, www_port, Handler
    pwd = os.getcwd()
    try:
        with(lock):
            os.chdir("public")  # or any path you like
            www_server = SocketServer.TCPServer(("", www_port), Handler)
            print "Serving files at port", www_port
        www_server.serve_forever()
    except KeyboardInterrupt:
        with(lock):
            print "WWW server was stopped"
    finally:
        os.chdir(pwd)


def WSServer_thandler(lock):
    global ws_server, ws_port
    ws_server = SimpleWebSocketServer('', ws_port, SimpleEcho)

    with(lock):
        print "Listening at ws connetions at port", ws_port

    try:
        ws_server.serveforever()
    except UnboundLocalError:
        # prevent display call stack when shutdown thread
        pass


def shutdown():
    if run_www:
        print "Shutdown WWW server"
        www_server.shutdown()

    if run_ws:
        print "Shutdown WS server"
        ws_server.close()


def setupPins():
    gpio.init()

    for x in [right_enable, left_enable]:
        gpio.setcfg(x, gpio.OUTPUT)

    pwm_la = OrangePwm(100, left_a)
    pwm_lb = OrangePwm(100, left_b)
    pwm_ra = OrangePwm(100, right_a)
    pwm_ra = OrangePwm(100, right_b)

    for x in [pwm_la, pwm_lb, pwm_ra, pwm_rb]:
        x.start(0)


def Drive(speed, rotation):
    print speed, rotation

    gpio.output(left_enable, gpio.HIGH)
    gpio.output(right_enable, gpio.HIGH)

    if speed == 0:
        # full rotate
        if rotation < 0.5:
            print "Left"
            power = int((rotation-0.5) * -2 * turn_speed)

            pwm_la.changeDutyCycle(0)
            pwm_lb.changeDutyCycle(power)
            pwm_ra.changeDutyCycle(power)
            pwm_rb.changeDutyCycle(0)

        elif rotation > 0.5:
            print "Right"
            power = int((rotation - 0.5) * 2 * turn_speed)

            pwm_la.changeDutyCycle(power)
            pwm_lb.changeDutyCycle(0)
            pwm_ra.changeDutyCycle(0)
            pwm_rb.changeDutyCycle(power)

        # just stop
        else:
            Stop()
        return

    speed = int(speed * forward_speed)

    print "Speed"

    # left
    if rotation < 0.5:
        print "Left"
        if speed > 0:
            pwm_la.changeDutyCycle(int(speed * 0.3))
            pwm_lb.changeDutyCycle(0)
            pwm_ra.changeDutyCycle(speed)
            pwm_rb.changeDutyCycle(0)
        else:
            pwm_la.changeDutyCycle(0)
            pwm_lb.changeDutyCycle(-int(speed * 0.3))
            pwm_ra.changeDutyCycle(0)
            pwm_rb.changeDutyCycle(-speed)
    # right
    elif rotation > 0.5:
        print "Right"
        if speed > 0:
            pwm_la.changeDutyCycle(speed)
            pwm_lb.changeDutyCycle(0)
            pwm_ra.changeDutyCycle(int(speed * 0.3))
            pwm_rb.changeDutyCycle(0)
        else:
            
            pwm_la.changeDutyCycle(0)
            pwm_lb.changeDutyCycle(-speed)
            pwm_ra.changeDutyCycle(0)
            pwm_rb.changeDutyCycle(-int(speed * 0.3))
    # straight
    else:
        print "Straight"
        if speed > 0:
            print "GO", speed
            pwm_la.changeDutyCycle(speed)
            pwm_lb.changeDutyCycle(0)
            pwm_ra.changeDutyCycle(speed)
            pwm_rb.changeDutyCycle(0)
        else:
            print "BACK", speed
            pwm_la.changeDutyCycle(0)
            pwm_lb.changeDutyCycle(-speed)
            pwm_ra.changeDutyCycle(0)
            pwm_rb.changeDutyCycle(-speed)


def Stop():
    gpio.output(left_enable, gpio.LOW)
    gpio.output(right_enable, gpio.LOW)


def main():
    setupPins()
    lock = threading.Lock()

    if run_www:
        wwwthread = threading.Thread(target=WWWServer_thandler, args=(lock,))
        print "WWW thread starting"
        wwwthread.start()

    if run_ws:
        wsthread = threading.Thread(target=WSServer_thandler, args=(lock,))
        print "WS thread starting"
        wsthread.start()

    try:
        while True:
            pass
    except KeyboardInterrupt:
        shutdown()


if __name__ == "__main__":
    main()

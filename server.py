import SimpleHTTPServer
import SocketServer
import os
import threading
import time
import json
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
from wiringpi import *

www_port = 3000
ws_port = 3001

www_server = None
ws_server = None

run_www = True
run_ws = True

#pin numbers
right_enable = 17
right_a = 27
right_b = 22
left_enable = 10
left_a = 9
left_b = 11

#speed values
rangemax = 100
forward_speed = 100
backward_speed = 100
turn_speed = 100#speed values
forward_speed = 100


Handler = SimpleHTTPServer.SimpleHTTPRequestHandler


class SimpleEcho(WebSocket):

    def handleMessage(self):
        # echo message back to client
        #self.sendMessage(self.data)
        parseddata = json.loads(self.data)

        speed = parseddata["accelerate"]
        rotation = parseddata["direction"]
        #print speed, type(speed)
        Drive(speed, rotation)
        

    def handleConnected(self):
        print(self.address, 'connected')

    def handleClose(self):
        print(self.address, 'closed')


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
    wiringPiSetupGpio()
    pinMode(left_enable, OUTPUT)
    pinMode(left_a, OUTPUT)
    pinMode(left_b, OUTPUT)
    pinMode(right_enable, OUTPUT)
    pinMode(right_a, OUTPUT)
    pinMode(right_b, OUTPUT)
    
    softPwmCreate(left_a, 0, rangemax)
    softPwmCreate(left_b, 0, rangemax)
    softPwmCreate(right_a, 0, rangemax)
    softPwmCreate(right_b, 0, rangemax)

def Drive(speed, rotation):
    digitalWrite(left_enable, HIGH)
    digitalWrite(right_enable, HIGH)

    #stop
    if speed == 0:
        Stop()
        return

    #left
    if rotation < 0:
        r = rotation * -1
        #left forward
        if speed > 0:
            s = forward_speed * speed
            softPwmWrite(left_a, int(s * (1-r)))
            softPwmWrite(left_b, 0)
            softPwmWrite(right_a, int(s * r))
            softPwmWrite(right_b, 0)
        #left backward
        elif speed < 0:
            s = forward_speed * speed * -1
            softPwmWrite(left_a, 0)
            softPwmWrite(left_b, int(s * (1-r)))
            softPwmWrite(right_a, 0)
            softPwmWrite(right_b, int(s * r))
    #right
    elif rotation > 0:
        r = rotation
        #right forward
        if speed > 0:
            s = forward_speed * speed
            softPwmWrite(left_a, int(s * r))
            softPwmWrite(left_b, 0)
            softPwmWrite(right_a, int(s * (1-r)))
            softPwmWrite(right_b, 0)
        #right backward
        elif speed < 0:
            s = forward_speed * speed * -1
            softPwmWrite(left_a, 0)
            softPwmWrite(left_b, int(s * r))
            softPwmWrite(right_a, 0)
            softPwmWrite(right_b, int(s * (1-r)))
    #middle
    else:
        # forward
        if speed > 0:
            s = forward_speed * speed
            softPwmWrite(left_a, int(s))
            softPwmWrite(left_b, 0)
            softPwmWrite(right_a, int(s))
            softPwmWrite(right_b, 0)
        # backward
        elif speed < 0:
            s = forward_speed * speed * -1
            softPwmWrite(left_a, 0)
            softPwmWrite(left_b, int(s))
            softPwmWrite(right_a, 0)
            softPwmWrite(right_b, int(s))
        
        
def Stop():
    digitalWrite(left_enable, LOW)
    digitalWrite(right_enable, LOW)

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

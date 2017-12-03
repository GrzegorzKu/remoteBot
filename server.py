import SimpleHTTPServer
import SocketServer
import os
import threading
import time
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket

www_port = 3000
ws_port = 3001

www_server = None
ws_server = None

run_www = True
run_ws = True


Handler = SimpleHTTPServer.SimpleHTTPRequestHandler


class SimpleEcho(WebSocket):

    def handleMessage(self):
        # echo message back to client
        self.sendMessage(self.data)
        print self.data

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


def main():
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

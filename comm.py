import app
import logging
import queue


app_queue = queue.Queue()   # GUI is sending requests or data to the app
gui_queue = queue.Queue()   # App is sending info or data to the web based GUI

def checkAppQueue():
    '''Process message from GUI (add logic to react to GUI events).'''
    try:                
        incoming = app_queue.get_nowait()
        receiveMessage(incoming)
    except queue.Empty:
        incoming = None

# Event handler 
def receiveMessage(msg):
    '''Message handler from app queue (gui->app).'''
    logging.info(f"received: {msg}")
    match msg:
        case {'message A': data}:
            sendMessage({'message B': data})   # return message to GUI for no good reason

def sendMessage(msg):
    '''Message handler to gui queue (app->gui).'''
    logging.info(f"sending: {msg}")
    gui_queue.put(msg)
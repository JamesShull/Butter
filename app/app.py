import app.comm as comm
from app.state import State
import os
import logging
import threading
import time

version = '0.0.1'
state = State()
# ###################################### #  
#           Main App Loop
# ###################################### # 
def appMain(exit: threading.Event):
    '''App main loop'''
    initApp()

    # Main event loop
    while True:
        if exit.is_set():   # Exit if needed
            logging.info('App is exiting')
            break     

        # Process message from GUI (add logic to react to GUI events)
        comm.checkAppQueue()

        backgroundTasks()

        # App logic goes here

    return      #end of appMain (should never get here)

thread_exit = threading.Event()
thread = threading.Thread(target=appMain, args=[thread_exit], name='App')

def initApp():
    '''App initialization hook'''
    state.add('cwd', os.getcwd())
    state.add('backgroundTaskTimeout', time.time() + 60)
    logging.info('App is initialized.')
    return

def backgroundTasks():
    if time.time() >= state.get('backgroundTaskTimeout'):
        state.set('backgroundTaskTimeout', time.time() + 60)
        logging.info('App is running background tasks.')

        
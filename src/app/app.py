import app.comm as comm
import app.background as bg
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

        # Run background thread for background tasks
        backgroundThread()

        # App logic goes here

    return      #end of appMain (should never get here)

thread_exit = threading.Event()
thread = threading.Thread(target=appMain, args=[thread_exit], name='App')

def initApp():
    '''App initialization hook'''
    logging.info('App is initializing.')
    state.add('cwd', os.getcwd())
    state.add('backgroundTaskTimeout', time.time() + 60)
    comm.sendMessage(state.cache)
    logging.info('App is done initializing.')
    return

def backgroundThread():
    if time.time() >= state.get('backgroundTaskTimeout'):
        state.set('backgroundTaskTimeout', time.time() + 60)
        logging.info('App is starting background tasks.')
        threading.Thread(target=bg.tasks, daemon=True, name='Backgound_Tasks')
        logging.info('App is done with background tasks.')

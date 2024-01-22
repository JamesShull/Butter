import comm
import logging
import threading

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

        # App logic goes here

    return      #end of appMain (should never get here)

thread_exit = threading.Event()
thread = threading.Thread(target=appMain, args=[thread_exit], name='App')

def initApp():
    '''App initialization hook'''
    logging.info('App is initialized.')
    return

        
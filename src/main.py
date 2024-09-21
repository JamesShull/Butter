import app.app as app
import app.serverConfig as serverConfig
import argparse
import colorama
import logging
from starlette.applications import Starlette
import traceback
import uvicorn

parser = argparse.ArgumentParser(description='Addie Main')
parser.add_argument('--port', type=int, default=5000, help='port number of local server for GUI (default 5000)')
parser.add_argument('--debug', type=bool, default=False, help='')
args = parser.parse_args()

server =  Starlette(debug=args.debug, 
                    routes=serverConfig.routes,
                    on_startup=serverConfig.startup, 
                    on_shutdown=serverConfig.shutdown)

if __name__ == '__main__':
    ''' Main App entry for <App Name>
    
    Starts Starlette server & api based on serverConfig and starts App in another thread.
    '''
    if args.debug == True:
        serverConfig.setupLogging()     # Application logging
        colorama.init()                 # Coloring in cmd or powershell
    app.thread.start()                  # Start backend on another thread

    try:
        # Start server with setting from serverConfig, block until ctrl-c
        uvicorn.run("main:server", port=args.port, log_level="info") 
    except Exception as e:
        # Logging maybe not established, so printing to stdout
        print('api server exception: ' + str(e))
        print('--- traceback ---')
        print(traceback.format_exc(), level=logging.WARNING)
        print('-----------------')
    finally:
        app.thread_exit.set()           # stop app thread on exception or exit
        print('exiting server')

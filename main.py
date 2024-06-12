import app.app as app
import colorama
import logging
import app.serverConfig as serverConfig
from starlette.applications import Starlette
import traceback
import uvicorn

server =  Starlette(debug=serverConfig.debug, 
                    routes=serverConfig.routes,
                    on_startup=serverConfig.startup, 
                    on_shutdown=serverConfig.shutdown)

if __name__ == '__main__':
    ''' Main App entry for <App Name>
    
    Starts Starlette server & api based on serverConfig and starts app in another thread.
    '''
    if serverConfig.debug == True:
        serverConfig.setupLogging()     # Application logging
        colorama.init()                 # coloring in cmd or powershell
    app.thread.start()                  # Start backend on another thread

    try:
        # Start server with setting from serverConfig, block until ctrl-c
        uvicorn.run("main:server", port=serverConfig.port, log_level="info") 
    except Exception as e:
        # Logging maybe not established, so printing to stdout
        print('api server exception: ' + str(e))
        print('--- traceback ---')
        print(traceback.format_exc(), level=logging.WARNING)
        print('-----------------')
    finally:
        app.thread_exit.set()           # stop app thread on exception or exit
        print('exiting server')

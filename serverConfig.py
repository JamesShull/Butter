import app
import asyncio
import comm
import json
import logging
from queue import Empty
from starlette.routing import Route, Mount
from starlette.staticfiles import StaticFiles
from starlette.responses import JSONResponse
from sse_starlette import EventSourceResponse
import time

api_version = '0.0.1'       # API version
refreshDelay = 0.1          # sleep for refreshDelay seconds in onPublish() loop
debug = True                # Allow more logging and terminal colors
port = 5000                 # Port number for server

async def versions(request):
    '''GUI requested API version.'''
    return JSONResponse({'api_version': str(api_version),
                        'app_version': str(app.version)})

async def onMessage(request):
    '''Receive a message from GUI'''
    requestJson = await request.json()
    if 'message' in requestJson:
        comm.app_queue.put(requestJson['message'])
        return JSONResponse({'ack': 'success'})
    else:
        return JSONResponse({'ack': 'error'})

async def onPublish(request):
    '''onPublish pushes data from app to GUI client subscription to endpoint'''
    async def guiUpdate():
        while True:
            if await request.is_disconnected():
                break

            try:
                gui_object = comm.gui_queue.get(False)
            except Empty:
                gui_object = None
                await asyncio.sleep(refreshDelay)                

            if gui_object is not None:
                yield json.dumps(gui_object, indent=2)
    return EventSourceResponse(guiUpdate())

routes = [  # Map the routes available (list of callbacks)
    Route('/api/version', versions),
    Route('/api/v'+api_version+'/message', onMessage, methods=["POST"]),
    Route('/api/v'+api_version+'/subscribe', onPublish),
    Mount('/', StaticFiles(directory="static", html=True), name='/')]

def startup():
    '''Startup hook called by Starlette. '''
    pass

def shutdown():
    '''Shutdown hook called by Starlette. Shutdown services'''
    app.thread_exit.set()           # stop app thread on exception or exit

startup = [startup]
shutdown = [shutdown]

def setupLogging():
    logging.basicConfig(filename=f"logs\\App_{time.strftime('%Y-%m-%d_%H-%M-%S')}.log",
                        format='%(asctime)s > %(message)s',
                        datefmt='%m/%d/%Y %H:%M:%S',
                        level=logging.INFO
                        )
    logging.info('~~~~~~~~ Logging Setup at App Start ~~~~~~~~')
let current_version = '0.0.1'; // later get from server and store 
let guiUpdateEvent = new EventSource('/api/v'+current_version+'/subscribe');  // Server Sent Event (update GUI from Starlette (python) server)
let root = document.querySelector(':root');
let initialBackgroundColor = getComputedStyle(root).getPropertyValue('--root-bg-color');
//let timer = 0;      // count down timer
let testTimer;      // timer for how long test has been running
let runOrSingle = 'go';
let lastFocused = '';
let played = false;
let darkMode = false;
//import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"


// Export to global namespace so test steps can call on these functions
window.sendMessage = sendMessage;
window.sendReason = sendReason;
window.goToPicture = goToPicture;
load();

// Add event listeners
//document.getElementsByTagName('body')[0].addEventListener('load',load);
// Menu event listeners
document.getElementById('user').addEventListener('click', login);
document.getElementById('singleStep').addEventListener('click', single);
document.getElementById('addComment').addEventListener('click', addComment);
document.getElementById('repeat').addEventListener('click', setRepeat);
document.getElementById('mode').addEventListener('click', showModes);
document.getElementById('submitRev').addEventListener('click', setRevision);
document.getElementById('updateApp').addEventListener('click', updateApp);
document.getElementById('resetApp').addEventListener('click', function(){sendMessage({'resetTest': 'True'});});
// light-dark mode
document.getElementById('AppTitle').addEventListener('click', toggleDarkMode);
// hidden forms (user login and sequence rev submission, run mode selection)
document.getElementById('userSubmit').addEventListener('click', sendPassword);
document.getElementById('revSubmit').addEventListener('click', sendRevision);
document.getElementById('normalModeButton').addEventListener('click', function(){setMode('stopOnFail');});
document.getElementById('pauseModeButton').addEventListener('click', function(){setMode('pauseOnFail');});
document.getElementById('continueModeButton').addEventListener('click', function(){setMode('continueOnFail');});
// Sequence and Select combo box events
document.getElementById('sequence').addEventListener('change', selectedSequence);
document.getElementById('step').addEventListener('change', selectedStep);
document.getElementById('playButton').addEventListener('click', go);
document.getElementById('cancelButton').addEventListener('click', function(){sendMessage({'action':'cancel'});});
// Part Number, Rev and Serial Number fields
document.getElementById('partNumber').addEventListener('change', function(){sendMessage({'pn':this.value});});
document.getElementById('partNumber').addEventListener('focus', function(){this.value='';})
document.getElementById('rev').addEventListener('change', function(){sendMessage({'rev':this.value});});
document.getElementById('rev').addEventListener('focus', function(){this.value='';})
document.getElementById('serialNumber').addEventListener('change', function(){sendMessage({'sn':this.value});});
document.getElementById('serialNumber').addEventListener('focus', function(){this.value='';})
// Create printable report
document.getElementById('stepHistoryTitle').addEventListener('click', createReport);

async function sendMessage(message, actionOnComplete=null) {
    console.log(message);
    let r = await fetch('/api/v' + current_version + '/message',
        {
            method: "POST",
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ 'message': message })
        }
    );
    let rj = await r.json();
    console.log(rj);
}
function enableSpace() {
    window.addEventListener('keydown', (e) => {
        if ((e.key == " " || e.code == "Space") && e.target == document.body) {
            e.preventDefault();
            go();
        }
        if ((e.key == 'Escape' || e.code == 'Escape') && e.target == document.body) {
            e.preventDefault();
            if (document.getElementById('fail-button'))
                document.getElementById('fail-button').click()      
        }
    });
}
const compareArrays = (a, b) => 
    a.length === b.length && a.every((element, index) => element === b[index]);

async function getVersionAndHost(){
    // get api version
    let response = await fetch("/api/version");
    let data = await response.json();
    if (data['execVersion'] != null){
        document.getElementById('execVersion').innerHTML = 'APP ' + data['execVersion'];
        console.log('App Version: ' + data['execVersion']);
    }
    if (data['api-version'] != null) {
        current_version = data['api-version'];
        console.log('api current_version: ' + current_version);
    }
    if (data['hostname'] != null) {
        document.getElementById('stationId').innerHTML = data['hostname'];
    }
}
function storeArray(key, array){
    let arrayString = JSON.stringify(array);
    sessionStorage.setItem(key,arrayString);
}
function getStoredArray(key){
   let val = sessionStorage.getItem(key);
   if (val === null || val === undefined){
       val = [''];
   }
   return JSON.parse(val);
}
function toggleDarkMode(){
    darkMode = !darkMode;
}

function load() {
    getVersionAndHost();
    
    // set date and time
    let now = new Date();
    document.getElementById('statusDate').innerHTML = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    document.getElementById('statusTime').innerHTML = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    // todo set timer to update every minute, first timer should be moduls seconds left of current minute
    window.setTimeout(timeKeeper, (1000 * (60 - now.getSeconds())));

    // disable step control - only for techs
    document.getElementById('step').disabled = true;

    //  Enter should loose focus on some text boxes
    document.getElementById('partNumber').addEventListener('keyup', function (e) {
        if (e.key == "Enter") {
            this.blur();
            document.getElementById('rev').focus();
        }
    });
    document.getElementById('rev').addEventListener('keyup', function (e) {
        if (e.code == "Enter") {
            this.blur();
            document.getElementById('serialNumber').focus();
        }
    });
    document.getElementById('serialNumber').addEventListener('keyup', function (e) {
        if (e.code == "Enter") this.blur();
    });

    enableSpace();  // Space bar to start a test

    sendMessage({ 'getState': '' });    // refresh state on page load
    sendMessage({ 'getLog': '' });      // refresh detailed log
    // refresh sequence list
}
function timeKeeper() { // keep date time for title bar
    let now = new Date();
    document.getElementById('statusDate').innerHTML = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }); 
    document.getElementById('statusTime').innerHTML = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    window.setTimeout(timeKeeper, 60000)
}
function minAndSecsToString(time){
    let timeFloat = parseFloat(time);
    let timeMinutes = Math.floor(timeFloat/60);
    let timeText = '';
    if (timeFloat > 60){
        timeText = timeMinutes + ' min, ';
    }
    timeText += (timeFloat-(60*timeMinutes)).toFixed(2) + ' secs';
    return timeText;
}
function updateTestTime(start){
    let startInt = parseInt(Date.parse(start));
    let now = (new Date()).getTime();
    let testTime = (now - startInt)/1000;          // time difference in seconds
    let timeText = minAndSecsToString(testTime);
    document.getElementById('testTime').innerText = timeText;
    testTimer = window.setTimeout(updateTestTime,300, start);
}
function manageTestTimer(start, duration, status){
    if (duration != 0){ // non-zero duration means test is complete, keep time up for passed and failed results
        let timeText = minAndSecsToString(duration);
        document.getElementById('testTime').innerText = timeText;
        if (testTimer != null){
            window.clearTimeout(testTimer);
            testTimer = null;
        }
        return;
    }
    if (testTimer == null && start != 0) {
        updateTestTime(start);              // kick off test timer
    }
    if (start == 0 && duration == 0){
        document.getElementById('testTime').innerText = ''; // clear time if no time information
        if (testTimer != null){
            window.clearTimeout(testTimer);
            testTimer = null;
        }
    }
}
function flipHistory(picExists) {
    let history = document.getElementById('history');
    let tempPicture = document.getElementById('tempPicture');
    if (picExists) {
        history.classList.add('hidden');
        tempPicture.classList.remove('hidden');
    } else {
        history.classList.remove('hidden');
        tempPicture.classList.remove('hidden');
    }
}
// Actions sent to server
function single(){
    if (runOrSingle == 'go'){
        runOrSingle = 'single'
        document.getElementById('singleStep').firstElementChild.innerText = 'Run Mode'
    } else {
        runOrSingle = 'go'
        document.getElementById('singleStep').firstElementChild.innerText = 'Single Step'
    }
}
async function go() {
    let button = document.getElementById('playButton');
    if (button.classList.contains('pause')) {
        await sendMessage({ 'action': 'pause' });
    } else {
        if (runOrSingle == 'go') {
            await sendMessage({ 'action': runOrSingle });
        } else if ((document.getElementById('statusBox').innerHTML != '<h1>Stepping</h1>') && !(played)) {
            await sendMessage({ 'action': runOrSingle });
            played = true; // need to set to false elsewhere once stepping
        }
        
    }
}
function selectedSequence() {
    let sequence = document.getElementById("sequence").value;
    sendMessage({ 'seq': sequence });
}
function selectedStep() {
    let step = document.getElementById("step").value;
    sendMessage({ 'step': step });
}
function login(){
    document.getElementById('passwordEntry').style.display='flex';
}
async function sendPassword(){
    let pass = document.getElementById('passInput').value;
    let user = document.getElementById('userInput').value;
    sendMessage({'user': user,'pw': pass});
    document.getElementById('passwordEntry').style.display='none';
}
async function addComment() {
    let maxLength = 255;
    let userComment = window.prompt('Add comment to test', 'DEBUG');
    if (userComment == null || userComment == "") return;
    if (userComment > maxLength - 3) {
        userComment = userComment.substring(0, maxLength - 3) + '...';
    }
    //send userComment
    await sendMessage({ 'testComment': userComment });
    // added to GUI by receiving from exec.state
    return
}
async function setRepeat() {
    let input = window.prompt('Set repeat test', '10');
    let repeatCount = parseInt(input);
    if (repeatCount != NaN && repeatCount > 0 && repeatCount <= 1000) {
        await sendMessage({ 'repeatTest': repeatCount });
    } else {
        window.alert('I was expecting an int');
    }
    return;
}
async function setRevision() {
    document.getElementById('seqRevisionEntry').style.display='flex';
    await sendMessage({'getSequences': 'sequences'});   // get list of sequences from sequences folder
}
function showModes(){
    document.getElementsByClassName('modeEntry')[0].style.display = 'flex';
}
async function setMode(mode){
    document.getElementsByClassName('modeEntry')[0].style.display = 'none';
    await sendMessage({'failMode': mode});
}
async function sendRevision(){
    let selectBox = document.getElementById('submitSeqName');
    let index = selectBox.selectedIndex;
    let rev = selectBox.options[index].value;
    let name = selectBox.options[index].text.replace(' ' + rev, '');
    if (rev == 'select folder'){
        await sendMessage({'getSequences': name});
    } else {
        await sendMessage({ 'seqName': name, 'seqRev': rev});
        document.getElementById('seqRevisionEntry').style.display='none';
    }
}
async function updateApp(){
    await sendMessage({'requestUpdate':''});
}
async function sendReason() {
    let reasons = document.querySelectorAll('input[name=\"failReason\"]:checked');
    let message = '';
    reasons.forEach(reas => {message += String(reas.value);});
    if (message != '') {
        await sendMessage({'operatorInput': message});
    }
}

// View Updates
function updateSeqFileList(list) {
    if (!list['files']) return;
    // Clear existing options in the list
    let selectElement = document.getElementById('submitSeqName');
    let selectOptions = selectElement.options;
    while (selectOptions.length > 0) { selectElement.remove(0); }
    // Populate with new list
    list['files'].forEach(file => {
        //make option element
        var opt = document.createElement('option');
        opt.setAttribute('value', file['rev']);
        opt.appendChild(document.createTextNode(file['name'] + ' ' + file['rev']));
        selectElement.appendChild(opt);     //add to submitSeqName
    });
    selectElement.options.selectedIndex = 0;
}
function updateUser(state){
    document.getElementById('currentUser').innerText = state['user'];
    if (state['user'] == 'operator' || state['user'] == 'fs'){
        document.getElementById('singleStep').style.display = 'none';
        document.getElementById('repeat').style.display = 'none';
        document.getElementById('mode').style.display = 'none';
        document.getElementById('submitRev').style.display = 'none';
        document.getElementById('updateApp').style.display = 'none';
        //document.getElementById('sequence').disabled = true;
        //document.getElementById('step').disabled = true;
        runOrSingle = 'go';
        if (state['sequencesLocked'] == false){
            if (document.getElementById('sequence').disabled != false){
                document.getElementById('sequence').disabled = false;
                document.getElementById('step').disabled = false;
            }
        }else{
            if (document.getElementById('sequence').disabled != true){
                document.getElementById('sequence').disabled = true;
                document.getElementById('step').disabled = true;
            }
        }
    }
    if (state['user']=='tech'){
        document.getElementById('singleStep').style.display = 'block';
        document.getElementById('repeat').style.display = 'block';
        document.getElementById('mode').style.display = 'block';
        document.getElementById('submitRev').style.display = 'block'
        document.getElementById('updateApp').style.display = 'block'
        document.getElementById('sequence').disabled = true;
        document.getElementById('step').disabled = true;
    }
    if (state['user']=='admin'){
        document.getElementById('singleStep').style.display = 'block';
        document.getElementById('repeat').style.display = 'block';
        document.getElementById('mode').style.display = 'block';
        document.getElementById('submitRev').style.display = 'block'
        document.getElementById('updateApp').style.display = 'block'
        document.getElementById('sequence').disabled = false;
        document.getElementById('step').disabled = false;
    }
}
function updateStatus(state) {
    var statusClass = '';
    if (state['status'].toLowerCase() == 'idle'){
        statusClass = 'statusIdle';
    } else if (state['status'].toLowerCase() == 'pass') {
        statusClass = 'statusRun';
    } else if (['running','stepping', 'pausing'].includes(state['status'].toLowerCase())) {
        statusClass = 'statusRun';
    } else {
        statusClass = 'statusFail'
    }

    // Update status box
    let status = document.getElementById('statusBox');
    // Set text and style to status box
    status.innerHTML = '<h1>' + state['status'] + '</h1>';
    status.className = statusClass;
    
    // Change background color to strongly denote status (green for pass, red for fail or cancel)
    if (state['status'] == 4) {
        root.style.setProperty('--root-bg-color', '#E0FFCD');   // Very clear passing green
        root.style.setProperty('--root-color', '#000000');   // Back to normal light contrast
        root.style.setProperty('--root-shadow', 'rgba(0,0,0,0.2)');   // Back to normal dark contrast
    } else if (state['status'] == 5 || state['status'] == 3) {
        root.style.setProperty('--root-bg-color', '#F95959');   // Very clear failing or cancelled
        root.style.setProperty('--root-color', '#000000');   // Back to normal light contrast
        root.style.setProperty('--root-shadow', 'rgba(0,0,0,0.2)');   // Back to normal dark contrast
    } else {
        if (darkMode == true){
            root.style.setProperty('--root-bg-color', '#1A1A1A');   // Back to normal dark
            root.style.setProperty('--root-color', '#E5E5E5');   // Back to normal dark contrast
            root.style.setProperty('--root-shadow', 'rgba(229,229,229,0.2)');   // Back to normal dark contrast
        } else {
            root.style.setProperty('--root-bg-color', '#E5E5E5');   // Back to normal light
            root.style.setProperty('--root-color', '#000000');   // Back to normal light contrast
            root.style.setProperty('--root-shadow', 'rgba(0,0,0,0.2)');   // Back to normal dark contrast
        }
    }
    
    // Change in status has some side effects
    statusSideEffects(state);
}
function statusSideEffects(state){
    let statusBox = document.getElementById('statusBox');
    // used to avoid excessive stepping on rapid clicks
    if (statusBox.innerHTML == '<h1>Stepping</h1>') {
        played = false;
    }
    // Allow techs and admins to pause
    let canPause = (state['user']=='tech' || state['user']=='admin');
    if (state['status'] == 1 && canPause == true) {
        document.getElementById('playButton').classList.add('pause');
    } else {
        document.getElementById('playButton').classList.remove('pause');
    }
    // Update timer
    manageTestTimer(state['testStartTime'], state['testDuration'], state['status']);
    
    // Re-enable serial number text field to allow scan to start
    if (state['status'] == 0 || (3 <= state['status'] && state['status'] <= 5 )){
        document.getElementById('serialNumber').disabled = false;
    } else {
        document.getElementById('serialNumber').disabled = true;
    }
}
function updateSequence(state) {
    if (!state['sequenceList']) return;
    // Get both arrays (sequence list from python server and sequence list from drop down element)
    let seqArray = state['sequenceList'];
    let seqSelectElement = document.getElementById('sequence');
    let seqOptionsCollection = seqSelectElement.options;
    let seqSelectList = [];
    for (let i=0; i < seqOptionsCollection.length; i++){
        seqSelectList.push(seqOptionsCollection[i].value);
    }

    // If no change, then don't update
    if (compareArrays(seqArray, seqSelectList)) {
        if (seqSelectElement.selectedIndex < 0) 
            seqSelectElement.value = state['sequenceSelected'];
        return;
    }

    while (seqOptionsCollection.length > 0) { seqSelectElement.remove(0); }
    // Populate with new list
    seqArray.forEach(seq => {
        //make option element
        var opt = document.createElement('option');
        opt.setAttribute('value', seq);
        opt.appendChild(document.createTextNode(seq));
        seqSelectElement.appendChild(opt);     //add to seqSelect
    });
    seqSelectElement.value = state['sequenceSelected'];
    //eqSelectElement.selectedIndex = state['sequenceSelected'];
}
function updateStepSelect(state) {
    if (!state['stepList']) return;
    
    if (state['stepList'].length > 0) {
        // Clear drop down if sequences were found
        let stepSelect = document.getElementById('step');
        while (step.options.length > 0) { stepSelect.remove(0); }
        // Populate with new list
        state['stepList'].forEach(step => {
            //make option element
            var opt = document.createElement('option');
            opt.setAttribute('value', step);
            opt.appendChild(document.createTextNode(step));
            stepSelect.appendChild(opt);     //add to seqSelect
        });
        //console.log('state:' + state['stepIndex']);
        stepSelect.selectedIndex = state['stepIndex'];
    }
}
function updateCurrentStep(state) {
    document.getElementById('currentNumber').innerHTML = state['stepNumber'];
    document.getElementById('currentName').innerHTML = state['stepName'];
}
function updateDUT(state) {
    // if not the current element in focus then update from what the server has
    let active = document.activeElement;
    let pn = document.getElementById('partNumber');
    let r = document.getElementById('rev');
    let sn = document.getElementById('serialNumber');
    if (active != pn) {
        pn.value = state['partNumber'];
    }
    if (active != r) {
        r.value = state['rev'];
    }
    if (active != sn) {
        sn.value = state['serialNumber'];
    }
}
function updateHistory(state) {
    // Treat function like object to hold a static variable (retains value between function calls)
    if (typeof updateHistory.previous == 'undefined') {
        updateHistory.previous = 0; // It has not... perform the initialization
    }
    // Clear if empty
    if (state['stepHistory'].length == 0) {
        if (updateHistory.previous != 0) {
            document.getElementById('testHistoryBody').innerHTML = ''
        }
        updateHistory.previous = 0;
        return;
    }
    // Update new rows
    if (state['stepHistory'].length > updateHistory.previous) {
        // add step history to table
        let histBody = document.getElementById('testHistoryBody');
        state['stepHistory'].forEach((step, index) => {
            if ((index + 1) > updateHistory.previous) {  //add new row if data is new
                let newRow = histBody.insertRow(-1);
                step.forEach((field, index) => {
                    if (index < 9) { // don't show start time or comments for each row, see step.toStepHistory()
                        let newCell = newRow.insertCell(index);
                        if(3 <= index && index <= 5){
                            if (!isNaN(+field) && field.includes('.')){
                                // limit float precision for numbers with a '.', 6 digits of precision without adding trailing 0's
                                field = parseFloat(parseFloat(field).toFixed(6));
                            }
                        }
                        if (index == 8){    //status p/f
                            if (String(field).toLowerCase() == 'pass'){
                                newCell.style.color = 'white';
                                newCell.style.backgroundColor = '#008500';
                            }   
                            else if (String(field).toLowerCase() == 'fail'){
                                newCell.style.color = 'white';
                                newCell.style.backgroundColor = '#c00000';
                            }
                        }
                        if (String(field).includes('<-vector')){
                            const chartWidth=240;
                            const chartHeight = 80;
                            const vectorString = String(field)
                            const chartType = vectorString.replace('<-','').replace('->','').split(':')[1];
                            let sparkline = createSparkline(state['stepVectors'], step[1], chartWidth, chartHeight, chartType);
                            if (sparkline == null) {
                                newCell.appendChild(document.createTextNode(field));
                            } else {
                                let chartSVG = document.createElementNS('http://www.w3.org/2000/svg','svg');
                                chartSVG.setAttribute('width', chartWidth);
                                chartSVG.setAttribute('height', chartHeight);
                                newCell.appendChild(chartSVG);
                                chartSVG.appendChild(sparkline);
                            }
                            
                            // ToDo: detect errors and do whatever is needed to get previous to updateHistory.previous
                        }else {
                            newCell.appendChild(document.createTextNode(field));
                        }

                    }
                });
                updateHistory.previous++;

            }
        });
        // scroll to bottom
        let hist = document.getElementById('testHistoryDiv');
        let histTable = document.getElementById('testHistoryTable');
        if (histTable.clientHeight > hist.style.maxHeight) {
            hist.scroll({ top: histTable.clientHeight - hist.clientHeight, behavior: 'auto' });
        }
    }
}
function createSparkline(stepVectors, number, chartWidth, chartHeight, chartType){
    const width = chartWidth;
    const height = chartHeight;
    const margin = {top: 3, right: 3, bottom: 3, left: 3};
    const type = chartType;
    // Find the relevant vector data based on step number
    let vectorsAvailable = stepVectors;
    let data = [];
    for (let i=0; i<vectorsAvailable.length;i++){
        if ( parseFloat(vectorsAvailable[i]['number']) == number) {
            data = vectorsAvailable[i]['dataPoints'];
            break;
        }
    }
    if (data == []) return null;

    const yMin = Math.min(d3.min(data, d=>d['yAxisMeas']), d3.min(data, d=>d['yAxisLL']));
    const yMax = Math.max(d3.max(data, d=>d['yAxisMeas']), d3.max(data, d=>d['yAxisUL']));
    var xScale = d3.scaleLinear().domain(d3.extent(data, d=>d['xAxis'])).range([0, (width-margin.left-margin.right)]);
    if (type == 'log'){
        xScale = d3.scaleLog().domain(d3.extent(data, d=>d['xAxis'])).range([0, (width-margin.left-margin.right)]);
    }
    //const xLinear = d3.scaleLinear().domain(d3.extent(data, d=>d['xAxis'])).range([0, (width-margin.left-margin.right)]);
    //const xLogrithmic = d3.scaleLog().domain(d3.extent(data, d=>d['xAxis'])).range([0, (width-margin.left-margin.right)]);
    const yLinear = d3.scaleLinear().domain([yMin, yMax]).range([height-margin.top-margin.bottom, 0]);
    // Create SVG
    let svg = d3.create('svg:svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'sparklines')
        .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    // Create line function (template to draw lines)
    const line = d3.line()
        //.x((d)=> xLinear(d['xAxis']))
        .x((d)=> xScale(d['xAxis']))
        .y(d => yLinear(d['yAxisMeas']));
    // Update line with data to actually draw the path
    svg.append('path').datum(data)
        .attr('fill','none')
        .attr('stroke', 'blue')
        .attr('stroke-width', 1)
        .attr('d', line);
    svg.append('path').datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 1)
        .attr('d', d3.line()
            //.x(d=>xLinear(d['xAxis']))
            .x(d=>xScale(d['xAxis']))
            .y(d=>yLinear(d['yAxisLL']))
            .defined(d=>d['yAxisLL'])
        );
    svg.append('path').datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 1)
        .attr('d', d3.line()
            //.x(d=>xLinear(d['xAxis']))
            .x(d=>xScale(d['xAxis']))
            .y(d=>yLinear(d['yAxisUL']))
            .defined(d=>d['yAxisUL'])
        );
    return svg.node();
}
function updateInstruction(state) {
    let instructions = String(state['instructions']).trim();
    let instElement = document.getElementById('instruction');
    if (instructions.startsWith('<')) {
        if (instructions.length != instElement.innerHTML.length) {
            instElement.innerHTML = instructions;
        }
    } else {
        instElement.innerHTML = '<p>' + instructions + '</p>';
    }
}
function updateIndicators(state) {
    let rly = document.getElementById('RLY');
    let net = document.getElementById('NET');
    let sql = document.getElementById('SQL');
    rly.checked = state['indicators']['RLY'];
    net.checked = state['indicators']['NET'];
    sql.checked = state['indicators']['SQL'];
}
function updateProgress(state) {
    let prog = document.getElementById('testProgress');
    if (state['progress'] == 0) {
        prog.hidden = true;
    } else {
        prog.hidden = false;
        prog.value = state['progress'];
    }

}
function updateTestComment(state) {
    let comment = document.getElementById('testComment');
    if (state['testComment'] == '' && state['repeatCount'] == 1) {
        comment.hidden = true;
    } else {
        comment.hidden = false;
    }
    if (comment.innerText != state['testComment'])
        comment.innerText = state['testComment'];
}
function updateTestWarning(state){
    let comment = document.getElementById('testWarning');
    if (state['testWarning'] == '') {
        comment.hidden = true;
    } else {
        comment.hidden = false;
    }
    if (comment.innerText != state['testWarning'])
        comment.innerText = state['testWarning'];  
}
function updateGetAttention(state){
    if ('getAttention' in state && state['getAttention'] != ''){
        let body = document.getElementsByTagName('body')[0];
        body.classList.add("getAttention");
        body.addEventListener('mousemove', removeAttention);
    }
}
function removeAttention(){
    let body = document.getElementsByTagName('body')[0];
    body.classList.remove("getAttention");
    body.removeEventListener('mousemove', removeAttention);
}
function showPic(execMessage) {
    let picturePath = execMessage['showPicture'];
    let tempPicture = document.getElementById('tempPicture');
    if (picturePath[0] == '') {
        sessionStorage.removeItem('picturePaths')
        tempPicture.innerHTML = '';
        flipHistory(false);
    } else {
        if (tempPicture.innerHTML.length == 0){
            storeArray('picturePaths', picturePath);
            let html = "<h4>Click for larger image</h4><div id='pictureGrid'>";
            let htmlEnd = '</div>';
            let width = 'oneThird';
            if (picturePath.length == 1) {
                width = 'oneFull';
            }
            if (picturePath.length == 2){
                width = 'oneHalf';
            }
            picturePath.forEach( (pic, i) =>{ 
                if (pic.includes('.jp') || pic.includes('.png') || pic.includes('.gif')){
                    html +=  "<img src='" + pic +  "' class='" + width + "' onclick=\"goToPicture("+i+", true);\" />";
                } else if (pic.includes('.mp4')) {
                    html += "<video class='" + width + "' controls autoplay onclick=\"goToPicture("+i+", true);\"><source src='" + pic + "'  type=\"video/mp4\"></video>";
                }
            });
            tempPicture.innerHTML = html + htmlEnd;       
            flipHistory(true);
        }
    }
    return;
}
function clickablePictureFrame(){
    let pictureIndex = sessionStorage.getItem('pictureIndex');
    let picturePaths = getStoredArray('picturePaths');
    if (pictureIndex === null || pictureIndex === undefined){
        pictureIndex = 0;
    }else{
        pictureIndex = parseInt(pictureIndex);
    }
    if (picturePaths === null || picturePaths === undefined){
        picturePaths[''];
    }

    // Show pass, fail buttons on last step only
    if (pictureIndex == picturePaths.length - 1){
        document.getElementById('pass-button-top').style.display = "block";
        document.getElementById('fail-button-top').style.display = "block";
    } else {
        document.getElementById('pass-button-top').style.display = "none";
        document.getElementById('fail-button-top').style.display = "none";
    }

    // Update pageOfIndicator (current pic of # of pics between pass and fail)
    document.getElementById('pageOfIndicator').innerText = (pictureIndex + 1) + ' of ' + picturePaths.length;

    // Determine prev and next images to be shown
    let prev = (pictureIndex > 1) ? pictureIndex - 1 : 0;
    let next = (pictureIndex < picturePaths.length - 1) ? pictureIndex + 1 : pictureIndex;
    let leftDisabled = (pictureIndex == 0) ? ' disabled' : '';
    let html = '<div id="navLeft" class="picNav' + leftDisabled + '" onclick="goToPicture(' + prev + ')">&larr;</div>';
    let pic = picturePaths[pictureIndex];
    if (pic.includes('.jp') || pic.includes('.png') || pic.includes('.gif')){
        html +=  "<img src='" + pic +  "' />";
    } else if (pic.includes('.mp4')) {
        html += "<video controls autoplay><source src='" + pic + "'  type=\"video/mp4\"></video>";
    }
    let rightDisabled = (pictureIndex == picturePaths.length - 1) ? ' disabled' : '';
    let htmlEnd = '<div id="navRight" class="picNav' + rightDisabled + '" onclick="goToPicture(' + next + ')">&rarr;</div>';
    document.getElementById('pictureFrame').innerHTML = html + htmlEnd;
    
    // Add left / right arrow navigation
    window.addEventListener('keydown', (e) => {
          if ((e.key == "ArrowLeft" || e.code == "ArrowLeft") && e.target == document.body) {
            e.preventDefault();
            document.getElementById('navLeft').click();
          }else if ((e.key == "ArrowRight" || e.code == "ArrowRight") && e.target == document.body) {
            e.preventDefault();
            document.getElementById('navRight').click();
          }
      });
}
function goToPicture(i, newTab=false){
    sessionStorage.setItem('pictureIndex', i);
    (newTab) ? window.open('pictures.html','_blank') : window.open('pictures.html','_self');    // reload with new picture index
}
function focusOn(execMessage) {
    // Focus on text field (all dark except text field)
    if ('serialNumber' == execMessage['focus']) {
        root.style.setProperty('--root-bg-color', '#aaa');
        document.getElementById('serialNumber').style.backgroundColor = 'white';
        document.getElementById('serialNumber').disabled = false;
    } else if ('partNumber' == execMessage['focus']) {
        root.style.setProperty('--root-bg-color', '#aaa');
        document.getElementById('partNumber').style.backgroundColor = 'white';
        document.getElementById('partNumber').disabled = false;
    }
    let el = document.getElementById(execMessage['focus']);
    if (el != null) {
        setTimeout(function () { el.focus() }, 10); // js focus workaround
        if (el.id == 'inputField' && document.activeElement != el){                 // allow enter
            el.addEventListener('keypress', function enterHandler(e) {
                e.stopImmediatePropagation();   // prevent trigger 2x (we added our own event plus doc event that is bu)
                if (e.key === 'Enter') {
                    sendMessage({'operatorInput': el.value});
                }
            });
        }
    }
    
}
function focusOff() {
    document.getElementById('serialNumber').style.backgroundColor = 'var(--root-bg-color)';
    // locks out changes to field until python says to to focus on serialNumber
    document.getElementById('serialNumber').disabled = true;        
    document.getElementById('partNumber').style.backgroundColor = 'var(--root-bg-color)';
    // locks out changes to field until python says to to focus on partNumber
    document.getElementById('partNumber').disabled = true;
    root.style.setProperty('--root-bg-color', initialBackgroundColor);
    document.activeElement.blur();
}
function clearLog() {
    let dL = document.getElementById('detailedLog');
    dL.innerHTML = '';
}
function updateLog(execMessage) {
    if ('updateDetailedLog' in execMessage) {
        let dL = document.getElementById('detailedLog');
        let logText = execMessage['updateDetailedLog']
        dL.innerHTML = logText;
        dL.scrollTop = dL.scrollHeight;
    }
    //let data = await fetch('files/detailed.log');
    //let text = await data.text();
    //dL.innerHTML = text;

    // scroll to bottom
    //dL.scrollTop = dL.scrollHeight;
}
function countDownTimer(timeRemaining){
    let minutes = Math.floor(timeRemaining/60);
    let seconds = timeRemaining - (minutes * 60);
    if (document.getElementById('countdown')){
        document.getElementById('countdown').innerHTML = '<h1>'+ String(minutes).padStart(2,'0') +
                                                        ':'+ String(seconds).padStart(2,'0') +'</h1>';
    }
    let status = document.getElementById('statusBox');
    if (timeRemaining > 0 && status.innerHTML != "<h1>CANCEL</h1>") {
        window.setTimeout(countDownTimer, 1000, timeRemaining - 1);
    } else {
        sendMessage({'timerExpired': true});
    }
}

/* Server Side Event handling   */
guiUpdateEvent.onmessage = e => {
    let execMessage = JSON.parse(e.data);
    if ('updateDetailedLog' in execMessage) updateLog(execMessage);
    if ('clearDetailedLog' in execMessage) clearLog();
    if ('files' in execMessage) updateSeqFileList(execMessage);
    // 'status' is a key known to be in exec.state
    if ('status' in execMessage) {  
        updateUser(execMessage);
        updateCurrentStep(execMessage);
        updateSequence(execMessage);
        updateStatus(execMessage);
        updateStepSelect(execMessage);
        updateDUT(execMessage);
        updateProgress(execMessage);
        updateInstruction(execMessage);
        showPic(execMessage);
        updateHistory(execMessage);
        updateIndicators(execMessage);
        updateTestComment(execMessage);
        updateTestWarning(execMessage);
        updateGetAttention(execMessage);
        /* Recover GUI from state if reloaded */
        // recalculate timer countdown and start from appropiate time left
        if (parseInt(execMessage['countDownExpiration']) > (Date.now() / 1000)){
            countDownTimer(parseInt(execMessage['countDownExpiration'] - (Date.now() / 1000)) + 1);
        }
        // resume proper focus (but don't focusOff cause operator might be interacting with a menu or something in GUI)
        if (execMessage['focus'] != '') {
            focusOn(execMessage);
            lastFocused = execMessage['focus'];
        } else {
            if (lastFocused != '' || document.activeElement.id == 'sn' || document.activeElement.id == 'pn'){
                focusOff();       //focus of other things is lost frequently w/GUI update
                lastFocused = '';
            }
        }
    }

}
guiUpdateEvent.onerror = e => {
    console.log('error: ' + e);
}

// Create report (to print to pdf)
function createReport() {
    let htmlStart = '                       \
        <!DOCTYPE html>                     \
        <html lang="en">                    \
          <head>                            \
            <title>Test Report</title>      \
            <meta charset="utf-8" />        \
            <link rel="icon" type="image/x-icon" href="favicon.ico" />\
            <meta name="viewport" content="width=device-width, initial-scale=1" />\
            <link rel="stylesheet" href="global.css" />\
            <script>setTimeout(()=>{window.print();}, 500);</script>  \
            </head>                         \
            <body>                          \
            ';
    let table = document.getElementById('testHistoryDiv').innerHTML;
    let htmlEnd = '</body></html>';
    let htmlAll = htmlStart + table + htmlEnd;
    var tab = window.open('', '_blank');
    tab.document.write(htmlAll);
}

import {selectedServer, selectedMenu, consoleWindow, setSelectedMenu} from '../index.js';

const addServerButton = document.getElementById('addServerButton');
const powerButton = document.getElementById('powerButton');
export function handleDOMEvents() {
    handleDropdowns();
    handleConsoleInput();
    handleServerActions();
    handlePowerButtons();
}

function handlePowerButtons() {
    document.getElementById('powerStart').addEventListener('click', () => {
        fetch(`http://${location.hostname}:5010/start/${selectedServer}/`, { method: 'post' });
    });
    
    document.getElementById('powerFStop').addEventListener('click', () => {
        fetch(`http://${location.hostname}:5010/stop/${selectedServer}/force`, { method: 'post' });
    });
    
    document.getElementById('powerStop').addEventListener('click', () => {
        fetch(`http://${location.hostname}:5010/stop/${selectedServer}/`, { method: 'post' });
    });
}

function handleDropdowns() {
    powerButton.addEventListener('click', () => { document.getElementById('powerMenu').classList.toggle('hidden'); });
    addServerButton.addEventListener('click', () => { document.getElementById('addServerMenu').classList.toggle('hidden'); });
}

function handleConsoleInput() {
    document.getElementById('console-input').addEventListener('keypress', (key) => {
        if (key.key == 'Enter') {
            const command = document.getElementById('console-input').value;
    
            fetch(`http://${location.hostname}:5010/command/${selectedServer}/`,
                {
                    body: JSON.stringify({ 'command': command }),
                    method: 'post',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });
            // console.log(command);
            document.getElementById('console-input').value = '';
            consoleWindow.scrollTo(0, consoleWindow.scrollHeight);
        }
    });
}

function handleServerActions() {
    document.getElementById('actionsMenu').childNodes.forEach((el) => {
        el.onclick = async () => {
            console.log(el.id);
            if (selectedMenu !== 'menuNone') {
                document.getElementById(selectedMenu).classList.remove('selected');
            }
            document.getElementById(selectedMenu + 'Col').classList.add('hidden');
            setSelectedMenu(el.id);
            document.getElementById('playerListCol').classList.add('hidden');
            switch(selectedMenu){
                case 'menuConsole': {
                    document.getElementById('playerListCol').classList.remove('hidden');
                    break;
                }
                case 'menuStatus': {
                    break;
                }
            }
            document.getElementById(selectedMenu).classList.add('selected');
            document.getElementById(selectedMenu + 'Col').classList.remove('hidden');
        };
    });
}